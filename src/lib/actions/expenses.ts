"use server";

import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { expenses, type Expense } from "@/db/schema/expenses";
import { entities } from "@/db/schema/entities";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import { withAudit } from "@/lib/audit";
import {
  insertExpenseSchema,
  updateExpenseSchema,
  type InsertExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validations/expense";
import { toAgorot } from "@/lib/money";
import type { ActionResult } from "@/types";

export type ExpenseWithEntity = Expense & { entityName: string | null };

interface ExpenseFilters {
  category?: string;
  year?: number;
  month?: number;
  search?: string;
  recurringOnly?: boolean;
}

interface ExpenseSummary {
  totalYear: number;
  thisMonth: number;
  recurringMonthly: number;
  topCategory: string | null;
}

export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<ActionResult<{ expenses: ExpenseWithEntity[]; summary: ExpenseSummary }>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const conditions = [eq(expenses.ownerId, userId)];

  if (filters.category) {
    conditions.push(
      sql`${expenses.category} = ${filters.category}` as ReturnType<typeof eq>
    );
  }
  if (filters.year) {
    conditions.push(
      sql`EXTRACT(YEAR FROM ${expenses.date}::date) = ${filters.year}` as ReturnType<typeof eq>
    );
  }
  if (filters.month) {
    conditions.push(
      sql`EXTRACT(MONTH FROM ${expenses.date}::date) = ${filters.month}` as ReturnType<typeof eq>
    );
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      sql`(${expenses.description} ILIKE ${term} OR ${expenses.vendorName} ILIKE ${term})` as ReturnType<typeof eq>
    );
  }
  if (filters.recurringOnly) {
    conditions.push(eq(expenses.isRecurring, true));
  }

  const rows = await db
    .select({
      id: expenses.id,
      ownerId: expenses.ownerId,
      category: expenses.category,
      subcategory: expenses.subcategory,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      vendorName: expenses.vendorName,
      entityId: expenses.entityId,
      isRecurring: expenses.isRecurring,
      importSource: expenses.importSource,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      entityName: entities.name,
    })
    .from(expenses)
    .leftJoin(entities, eq(expenses.entityId, entities.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.date));

  // Summary for the current year
  const currentYear = filters.year || new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const summaryRows = await db
    .select({
      totalYear: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
      thisMonth: sql<number>`COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM ${expenses.date}::date) = ${currentMonth} AND EXTRACT(YEAR FROM ${expenses.date}::date) = ${currentYear} THEN ${expenses.amount} END), 0)`,
      recurringMonthly: sql<number>`COALESCE(SUM(CASE WHEN ${expenses.isRecurring} = true THEN ${expenses.amount} END), 0) / 12`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.ownerId, userId),
        sql`EXTRACT(YEAR FROM ${expenses.date}::date) = ${currentYear}` as ReturnType<typeof eq>
      )
    );

  // Top category
  const topCatRows = await db
    .select({
      category: expenses.category,
      total: sql<number>`SUM(${expenses.amount})`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.ownerId, userId),
        sql`EXTRACT(YEAR FROM ${expenses.date}::date) = ${currentYear}` as ReturnType<typeof eq>
      )
    )
    .groupBy(expenses.category)
    .orderBy(sql`SUM(${expenses.amount}) DESC`)
    .limit(1);

  const summary: ExpenseSummary = {
    totalYear: Number(summaryRows[0]?.totalYear ?? 0),
    thisMonth: Number(summaryRows[0]?.thisMonth ?? 0),
    recurringMonthly: Number(summaryRows[0]?.recurringMonthly ?? 0),
    topCategory: topCatRows[0]?.category ?? null,
  };

  return actionSuccess({ expenses: rows, summary });
}

export async function getCategoryBreakdown(
  year: number
): Promise<
  ActionResult<
    { category: string; total: number; count: number; months: Record<number, number> }[]
  >
> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const rows = await db
    .select({
      category: expenses.category,
      month: sql<number>`EXTRACT(MONTH FROM ${expenses.date}::date)`,
      total: sql<number>`SUM(${expenses.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.ownerId, userId),
        sql`EXTRACT(YEAR FROM ${expenses.date}::date) = ${year}` as ReturnType<typeof eq>
      )
    )
    .groupBy(expenses.category, sql`EXTRACT(MONTH FROM ${expenses.date}::date)`);

  // Aggregate into per-category with monthly breakdown
  const map = new Map<
    string,
    { category: string; total: number; count: number; months: Record<number, number> }
  >();

  for (const row of rows) {
    const cat = row.category;
    if (!map.has(cat)) {
      map.set(cat, { category: cat, total: 0, count: 0, months: {} });
    }
    const entry = map.get(cat)!;
    entry.total += Number(row.total);
    entry.count += Number(row.count);
    entry.months[Number(row.month)] = Number(row.total);
  }

  const result = Array.from(map.values()).sort((a, b) => b.total - a.total);
  return actionSuccess(result);
}

export async function createExpense(
  data: InsertExpenseInput
): Promise<ActionResult<Expense>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const parsed = insertExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return actionError("VALIDATION", parsed.error.issues[0].message);
  }

  const created = await withAudit(
    { userId, action: "create", tableName: "expenses" },
    async () => {
      const [result] = await db
        .insert(expenses)
        .values({
          ...parsed.data,
          amount: toAgorot(parsed.data.amount),
          ownerId: userId,
          importSource: parsed.data.importSource ?? "MANUAL",
          isRecurring: parsed.data.isRecurring ?? false,
        })
        .returning();
      return { result, recordId: result.id, newValue: result };
    }
  );

  revalidatePath("/expenses");
  return actionSuccess(created);
}

export async function updateExpense(
  id: string,
  data: UpdateExpenseInput
): Promise<ActionResult<Expense>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const parsed = updateExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return actionError("VALIDATION", parsed.error.issues[0].message);
  }

  const [existing] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.ownerId, userId)))
    .limit(1);

  if (!existing) {
    return actionError("NOT_FOUND", "ההוצאה לא נמצאה");
  }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.amount !== undefined) {
    updateData.amount = toAgorot(parsed.data.amount);
  }

  const updated = await withAudit(
    { userId, action: "update", tableName: "expenses" },
    async () => {
      const [result] = await db
        .update(expenses)
        .set(updateData)
        .where(eq(expenses.id, id))
        .returning();
      return {
        result,
        recordId: id,
        previousValue: existing,
        newValue: result,
      };
    }
  );

  revalidatePath("/expenses");
  return actionSuccess(updated);
}

export async function deleteExpense(
  id: string
): Promise<ActionResult<null>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const [existing] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.ownerId, userId)))
    .limit(1);

  if (!existing) {
    return actionError("NOT_FOUND", "ההוצאה לא נמצאה");
  }

  await withAudit(
    { userId, action: "delete", tableName: "expenses" },
    async () => {
      await db.delete(expenses).where(eq(expenses.id, id));
      return { result: null, recordId: id, previousValue: existing };
    }
  );

  revalidatePath("/expenses");
  return actionSuccess(null);
}

export async function importExpenses(
  rows: {
    date: string;
    description: string;
    vendor_name: string;
    amount: number;
    category: string;
    source: string;
  }[]
): Promise<ActionResult<{ imported: number; duplicates: number }>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  let imported = 0;
  let duplicates = 0;

  for (const row of rows) {
    const amountAgorot = toAgorot(row.amount);

    // Check for duplicate
    const existing = await db
      .select({ id: expenses.id })
      .from(expenses)
      .where(
        and(
          eq(expenses.ownerId, userId),
          eq(expenses.date, row.date),
          eq(expenses.description, row.description),
          sql`ABS(${expenses.amount} - ${amountAgorot}) < 100` as ReturnType<typeof eq>
        )
      )
      .limit(1);

    if (existing.length > 0) {
      duplicates++;
      continue;
    }

    await db.insert(expenses).values({
      ownerId: userId,
      category: row.category as Expense["category"],
      description: row.description,
      amount: amountAgorot,
      date: row.date,
      vendorName: row.vendor_name,
      isRecurring: false,
      importSource: (row.source || "GENERIC") as Expense["importSource"],
    });

    imported++;
  }

  revalidatePath("/expenses");
  return actionSuccess({ imported, duplicates });
}
