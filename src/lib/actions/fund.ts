"use server";

import { eq, and, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { fundHoldings } from "@/db/schema/fund";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import { withAudit } from "@/lib/audit";
import {
  updateHoldingSchema,
  insertHoldingSchema,
  listHoldingsSchema,
  type UpdateHolding,
  type InsertHolding,
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

export type ImportResult = {
  inserted: number;
  updated: number;
  skipped: number;
  affectedIds: string[];
};

/**
 * Upsert parsed holdings from an Excel/CSV import.
 * Matches on (platform, offeringId):
 *  - New positions are inserted.
 *  - Existing positions have financial/status fields updated; manual
 *    estimates and notes are preserved unless explicitly overridden.
 */
export async function importFundHoldings(
  holdings: InsertHolding[]
): Promise<ActionResult<ImportResult>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  if (!holdings || holdings.length === 0) {
    return actionError("VALIDATION", "No holdings to import");
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const affectedIds: string[] = [];

  for (const raw of holdings) {
    const parsed = insertHoldingSchema.safeParse(raw);
    if (!parsed.success) {
      skipped++;
      continue;
    }

    const data = parsed.data;

    // Check for existing holding by (platform, offeringId)
    const [existing] = await db
      .select()
      .from(fundHoldings)
      .where(
        and(
          eq(fundHoldings.platform, data.platform),
          eq(fundHoldings.offeringId, data.offeringId)
        )
      )
      .limit(1);

    if (!existing) {
      // Insert new holding
      const newRecord = await withAudit(
        { userId, action: "create", tableName: "fund_holdings" },
        async () => {
          const [result] = await db
            .insert(fundHoldings)
            .values({ ...data, lastUpdateSource: "excel_upload" })
            .returning();
          return { result, recordId: result.id, previousValue: null, newValue: result };
        }
      );
      affectedIds.push(newRecord.id);
      inserted++;
    } else {
      // Update only the fields sourced from the Excel report.
      // Preserve manually-set recovery estimates and notes unless they're
      // explicitly included in the parsed data (which they won't be from
      // platform parsers).
      const updatePayload: Partial<typeof fundHoldings.$inferInsert> = {
        status: data.status,
        subStatus: data.subStatus,
        currentPrincipal: data.currentPrincipal,
        apr: data.apr ?? existing.apr,
        maturityDate: data.maturityDate ?? existing.maturityDate,
        lastUpdateDate: data.lastUpdateDate,
        lastUpdateSource: "excel_upload",
        lastUpdateText: data.lastUpdateText ?? existing.lastUpdateText,
        updatedAt: new Date(),
      };

      // Only update address if not already set manually
      if (!existing.propertyAddress && data.propertyAddress) {
        updatePayload.propertyAddress = data.propertyAddress;
      }
      if (!existing.city && data.city) updatePayload.city = data.city;
      if (!existing.state && data.state) updatePayload.state = data.state;
      if (!existing.arv && data.arv) updatePayload.arv = data.arv;
      if (!existing.loanToArv && data.loanToArv) updatePayload.loanToArv = data.loanToArv;

      await withAudit(
        { userId, action: "update", tableName: "fund_holdings" },
        async () => {
          const [result] = await db
            .update(fundHoldings)
            .set(updatePayload)
            .where(eq(fundHoldings.id, existing.id))
            .returning();
          return {
            result,
            recordId: existing.id,
            previousValue: existing,
            newValue: result,
          };
        }
      );
      affectedIds.push(existing.id);
      updated++;
    }
  }

  revalidatePath("/fund");
  revalidatePath("/fund/portfolio");

  return actionSuccess({ inserted, updated, skipped, affectedIds });
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export type AiAnalysisResult = {
  holdingId: string;
  status: string;
  confidence: string;
  reasoning: string;
  nextAction: string;
  recoveryNotes?: string;
  statusChanged: boolean;
};

/** Classify a single holding using Claude AI. */
export async function analyzeHolding(
  holdingId: string
): Promise<ActionResult<AiAnalysisResult>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const [holding] = await db
    .select()
    .from(fundHoldings)
    .where(eq(fundHoldings.id, holdingId))
    .limit(1);

  if (!holding) return actionError("NOT_FOUND", "Holding not found");

  try {
    const { classifyHolding } = await import("@/lib/ai/classify-holding");
    const result = await classifyHolding(holding);
    return actionSuccess({
      holdingId,
      status: result.status,
      confidence: result.confidence,
      reasoning: result.reasoning,
      nextAction: result.nextAction,
      recoveryNotes: result.recoveryNotes,
      statusChanged: result.status !== holding.status,
    });
  } catch (err) {
    return actionError(
      "AI_ERROR",
      err instanceof Error ? err.message : "AI classification failed"
    );
  }
}

/** Classify all active (non-resolved) holdings in batch. */
export async function analyzeBatchHoldings(
  holdingIds: string[]
): Promise<ActionResult<AiAnalysisResult[]>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  if (!holdingIds.length) return actionSuccess([]);

  const filtered = await db
    .select()
    .from(fundHoldings)
    .where(inArray(fundHoldings.id, holdingIds));

  if (!filtered.length) return actionSuccess([]);

  try {
    const { classifyBatch } = await import("@/lib/ai/classify-holding");
    const resultMap = await classifyBatch(filtered);

    const results: AiAnalysisResult[] = [];
    for (const holding of filtered) {
      const r = resultMap.get(holding.id);
      if (!r) continue;
      if ("error" in r) {
        // Include error stub so caller knows which ones failed
        results.push({
          holdingId: holding.id,
          status: holding.status,
          confidence: "low",
          reasoning: `Analysis failed: ${r.error}`,
          nextAction: "Retry or classify manually",
          statusChanged: false,
        });
      } else {
        results.push({
          holdingId: holding.id,
          status: r.status,
          confidence: r.confidence,
          reasoning: r.reasoning,
          nextAction: r.nextAction,
          recoveryNotes: r.recoveryNotes,
          statusChanged: r.status !== holding.status,
        });
      }
    }

    return actionSuccess(results);
  } catch (err) {
    return actionError(
      "AI_ERROR",
      err instanceof Error ? err.message : "Batch analysis failed"
    );
  }
}
