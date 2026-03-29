"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { scrapeRuns } from "@/db/schema/scrape-runs";
import { fundHoldings } from "@/db/schema/fund";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import { importFundHoldings } from "@/lib/actions/fund";
import type { ActionResult } from "@/types";
import type { ScrapeRun } from "@/db/schema/scrape-runs";

// ─── Get scrape history ───────────────────────────────────────────────────────

export async function getScrapeHistory(
  limit = 20
): Promise<ActionResult<ScrapeRun[]>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const rows = await db
    .select()
    .from(scrapeRuns)
    .orderBy(desc(scrapeRuns.createdAt))
    .limit(limit);

  return actionSuccess(rows);
}

export async function getLastScrapeByPlatform(): Promise<
  ActionResult<Record<string, ScrapeRun | null>>
> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const platforms = ["upright", "sharestates", "upgrade"] as const;
  const result: Record<string, ScrapeRun | null> = {};

  for (const platform of platforms) {
    const [run] = await db
      .select()
      .from(scrapeRuns)
      .where(eq(scrapeRuns.platform, platform))
      .orderBy(desc(scrapeRuns.createdAt))
      .limit(1);
    result[platform] = run ?? null;
  }

  return actionSuccess(result);
}

// ─── Trigger Upright scrape ───────────────────────────────────────────────────

export async function triggerUprightScrape(): Promise<
  ActionResult<{ runId: string; inserted: number; updated: number; aiSummary: string | null }>
> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const startedAt = new Date().toISOString();

  // Create a "running" record so we can see it in the UI immediately
  const [runRecord] = await db
    .insert(scrapeRuns)
    .values({
      platform: "upright",
      status: "running",
      startedAt,
    })
    .returning();

  try {
    // Run the scraper
    const { scrapeUpright } = await import("@/lib/scrapers/upright");
    const { holdings, errors } = await scrapeUpright();

    if (holdings.length === 0) {
      await db
        .update(scrapeRuns)
        .set({
          status: "failed",
          completedAt: new Date().toISOString(),
          errorMessage: "Scraper returned 0 holdings — check selectors or login",
          meta: { holdingsFound: 0, inserted: 0, updated: 0, skipped: 0, errors, durationMs: Date.now() - new Date(startedAt).getTime() },
        })
        .where(eq(scrapeRuns.id, runRecord.id));
      return actionError("SCRAPE_EMPTY", "No holdings returned — verify Upright selectors");
    }

    // Upsert into fund_holdings (reuses existing import logic)
    const importResult = await importFundHoldings(holdings);
    const importData = importResult.data ?? { inserted: 0, updated: 0, skipped: 0, affectedIds: [] };

    // Run AI analysis on changed loans to generate insights
    let aiSummary: string | null = null;
    const changedIds = importData.affectedIds ?? [];

    if (changedIds.length > 0) {
      try {
        aiSummary = await generateScrapeNarrative(changedIds, importData);
      } catch (aiErr) {
        console.error("[scrape] AI narrative failed (non-fatal):", aiErr);
      }
    }

    const meta = {
      holdingsFound: holdings.length,
      inserted: importData.inserted,
      updated: importData.updated,
      skipped: importData.skipped,
      errors,
      durationMs: Date.now() - new Date(startedAt).getTime(),
    };

    await db
      .update(scrapeRuns)
      .set({
        status: errors.length > 0 && importData.inserted + importData.updated === 0 ? "failed" : errors.length > 0 ? "partial" : "success",
        completedAt: new Date().toISOString(),
        meta,
        aiSummary,
      })
      .where(eq(scrapeRuns.id, runRecord.id));

    revalidatePath("/fund");
    revalidatePath("/fund/portfolio");
    revalidatePath("/fund/monitor");

    return actionSuccess({
      runId: runRecord.id,
      inserted: importData.inserted,
      updated: importData.updated,
      aiSummary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db
      .update(scrapeRuns)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
        errorMessage: msg.slice(0, 500),
        meta: { holdingsFound: 0, inserted: 0, updated: 0, skipped: 0, errors: [msg], durationMs: 0 },
      })
      .where(eq(scrapeRuns.id, runRecord.id));

    return actionError("SCRAPE_FAILED", msg.slice(0, 300));
  }
}

// ─── AI narrative ─────────────────────────────────────────────────────────────

async function generateScrapeNarrative(
  changedIds: string[],
  summary: { inserted: number; updated: number; skipped: number }
): Promise<string> {
  const changed = await db
    .select({
      offeringId: fundHoldings.offeringId,
      status: fundHoldings.status,
      subStatus: fundHoldings.subStatus,
      currentPrincipal: fundHoldings.currentPrincipal,
      city: fundHoldings.city,
      state: fundHoldings.state,
      lastUpdateText: fundHoldings.lastUpdateText,
      liquidationEstimateHigh: fundHoldings.liquidationEstimateHigh,
      liquidationTimelineMonths: fundHoldings.liquidationTimelineMonths,
    })
    .from(fundHoldings)
    .where(
      changedIds.length > 0
        ? // only look at changed loans
          eq(fundHoldings.platform, "upright")
        : eq(fundHoldings.platform, "upright")
    )
    .limit(50);

  const { Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const prompt = `You are analyzing a weekly scrape of the Upright NPL loan portfolio.

Scrape summary:
- New loans found: ${summary.inserted}
- Updated loans: ${summary.updated}
- Total loans in database: ${changed.length}

Portfolio snapshot (key loans):
${changed
  .slice(0, 20)
  .map(
    (h) =>
      `• Loan ${h.offeringId} (${h.city ?? "?"}, ${h.state ?? "?"}) — Status: ${h.status}${h.subStatus ? ` / ${h.subStatus}` : ""}` +
      (h.currentPrincipal ? ` — Principal: $${(h.currentPrincipal / 100).toLocaleString()}` : "") +
      (h.lastUpdateText ? ` — Note: "${h.lastUpdateText.slice(0, 100)}"` : "") +
      (h.liquidationEstimateHigh && h.liquidationTimelineMonths
        ? ` — Expected recovery: $${(h.liquidationEstimateHigh / 100).toLocaleString()} in ~${h.liquidationTimelineMonths}mo`
        : "")
  )
  .join("\n")}

Write a concise 3-5 sentence weekly briefing for the portfolio manager covering:
1. What changed this week (new loans, status changes)
2. Most important active NPL situations requiring attention
3. Expected near-term cash receipts (payoffs, REO sales under contract)
4. Any concerns or red flags

Be direct and professional. Use dollar amounts where available.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}
