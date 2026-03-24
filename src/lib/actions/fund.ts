"use server";

import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { fundHoldings } from "@/db/schema/fund";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import { withAudit } from "@/lib/audit";
import {
  updateHoldingSchema,
  listHoldingsSchema,
  type UpdateHolding,
  type ListHoldingsFilter,
} from "@/lib/validations/fund";
import type { ActionResult } from "@/types";
import type { FundHolding } from "@/db/schema/fund";

export async function getFundHoldings(
  filter?: ListHoldingsFilter
): Promise<ActionResult<FundHolding[]>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const parsed = listHoldingsSchema.safeParse(filter ?? {});
  if (!parsed.success) {
    return actionError("VALIDATION", parsed.error.issues[0].message);
  }

  const conditions = [];
  if (parsed.data.platform) {
    conditions.push(eq(fundHoldings.platform, parsed.data.platform));
  }
  if (parsed.data.status) {
    conditions.push(eq(fundHoldings.status, parsed.data.status));
  }

  const rows = await db
    .select()
    .from(fundHoldings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(fundHoldings.platform), asc(fundHoldings.offeringId));

  return actionSuccess(rows);
}

export async function getFundHolding(
  id: string
): Promise<ActionResult<FundHolding>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const [holding] = await db
    .select()
    .from(fundHoldings)
    .where(eq(fundHoldings.id, id))
    .limit(1);

  if (!holding) {
    return actionError("NOT_FOUND", "Holding not found");
  }

  return actionSuccess(holding);
}

export async function updateFundHolding(
  id: string,
  data: UpdateHolding
): Promise<ActionResult<FundHolding>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const parsed = updateHoldingSchema.safeParse(data);
  if (!parsed.success) {
    return actionError("VALIDATION", parsed.error.issues[0].message);
  }

  const [existing] = await db
    .select()
    .from(fundHoldings)
    .where(eq(fundHoldings.id, id))
    .limit(1);

  if (!existing) {
    return actionError("NOT_FOUND", "Holding not found");
  }

  const updated = await withAudit(
    { userId, action: "update", tableName: "fund_holdings" },
    async () => {
      const [result] = await db
        .update(fundHoldings)
        .set({
          ...parsed.data,
          // Always stamp manual updates
          lastUpdateSource: parsed.data.lastUpdateSource ?? "manual",
          lastUpdateDate:
            parsed.data.lastUpdateDate ?? new Date().toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(fundHoldings.id, id))
        .returning();
      return { result, recordId: id, previousValue: existing, newValue: result };
    }
  );

  revalidatePath("/fund");
  revalidatePath("/fund/portfolio");
  return actionSuccess(updated);
}

/** Portfolio summary metrics for the dashboard */
export async function getFundSummary(): Promise<
  ActionResult<{
    totalCostBasis: number;
    totalMarketValue: number;
    totalOriginalInvestment: number;
    activeCount: number;
    resolvedCount: number;
    totalEstimateLow: number;
    totalEstimateHigh: number;
    byPlatform: Record<string, { costBasis: number; count: number }>;
    byStatus: Record<string, number>;
  }>
> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const rows = await db.select().from(fundHoldings);

  const resolvedStatuses = new Set(["SETTLED", "WRITTEN_OFF"]);

  let totalCostBasis = 0;
  let totalMarketValue = 0;
  let totalOriginalInvestment = 0;
  let activeCount = 0;
  let resolvedCount = 0;
  let totalEstimateLow = 0;
  let totalEstimateHigh = 0;
  const byPlatform: Record<string, { costBasis: number; count: number }> = {};
  const byStatus: Record<string, number> = {};

  for (const row of rows) {
    totalCostBasis += row.costBasisApex ?? 0;
    totalMarketValue += row.marketValueApex ?? 0;
    totalOriginalInvestment += row.originalInvestment ?? 0;
    totalEstimateLow += row.liquidationEstimateLow ?? 0;
    totalEstimateHigh += row.liquidationEstimateHigh ?? 0;

    if (resolvedStatuses.has(row.status)) {
      resolvedCount++;
    } else {
      activeCount++;
    }

    if (!byPlatform[row.platform]) {
      byPlatform[row.platform] = { costBasis: 0, count: 0 };
    }
    byPlatform[row.platform].costBasis += row.costBasisApex ?? 0;
    byPlatform[row.platform].count++;

    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
  }

  return actionSuccess({
    totalCostBasis,
    totalMarketValue,
    totalOriginalInvestment,
    activeCount,
    resolvedCount,
    totalEstimateLow,
    totalEstimateHigh,
    byPlatform,
    byStatus,
  });
}
