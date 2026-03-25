"use server";

import { db } from "@/db";
import { investors, investorPositions, redemptions } from "@/db/schema/investors";
import { sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import type { ActionResult } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvestorKpis {
  // USD class
  totalOriginalInvestmentUsd: number;
  totalNavUsd: number;
  totalDistributionsUsd: number;
  // ILS class
  totalOriginalInvestmentNis: number;
  totalNavNis: number;
  totalDistributionsNis: number;
  // Counts
  totalInvestors: number;
  activeInvestors: number;
}

export interface QuarterlyDistribution {
  quarter: string; // "Q3'23"
  amountNis: number; // agorot
  amountUsd: number; // cents
}

export interface InvestorAnalyticsData {
  kpis: InvestorKpis;
  quarterlyDistributions: QuarterlyDistribution[];
  latestDataDate: string | null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function getInvestorAnalytics(): Promise<
  ActionResult<InvestorAnalyticsData>
> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    // ── KPIs from latest position per investor ──────────────────────────────
    const posResult = await db.execute(sql`
      WITH latest AS (
        SELECT DISTINCT ON (investor_id)
          investor_id,
          nav_nis,
          nav_usd,
          original_investment_nis,
          data_date,
          currency_class
        FROM investor_positions
        ORDER BY investor_id, data_date DESC
      )
      SELECT
        COALESCE(SUM(CASE WHEN currency_class = 'USD' THEN nav_usd ELSE 0 END), 0)               AS total_nav_usd,
        COALESCE(SUM(CASE WHEN currency_class = 'ILS' THEN nav_nis ELSE 0 END), 0)               AS total_nav_nis,
        COALESCE(SUM(CASE WHEN currency_class = 'ILS' THEN original_investment_nis ELSE 0 END),0) AS total_orig_nis,
        MAX(data_date)                                                                             AS latest_date
      FROM latest
    `);
    const posAgg = posResult.rows[0] as Record<string, unknown>;

    const invResult = await db.execute(sql`
      SELECT
        COUNT(*)                                          AS total_investors,
        COUNT(*) FILTER (WHERE status = 'active')        AS active_investors
      FROM investors
    `);
    const invAgg = invResult.rows[0] as Record<string, unknown>;

    // ── Redemptions / distributions aggregated by quarter ──────────────────
    const quarterlyResult = await db.execute(sql`
      SELECT
        TO_CHAR(date::date, 'Q''YY')      AS quarter_label,
        DATE_TRUNC('quarter', date::date) AS quarter_start,
        COALESCE(SUM(amount_nis), 0)      AS amount_nis,
        COALESCE(SUM(amount_usd), 0)      AS amount_usd
      FROM redemptions
      WHERE date IS NOT NULL
        AND date != '1970-01-01'
      GROUP BY quarter_label, quarter_start
      ORDER BY quarter_start ASC
    `);

    // ── Total distributions ─────────────────────────────────────────────────
    const distResult = await db.execute(sql`
      SELECT
        COALESCE(SUM(amount_usd), 0) AS total_usd,
        COALESCE(SUM(amount_nis), 0) AS total_nis
      FROM redemptions
    `);
    const distAgg = distResult.rows[0] as Record<string, unknown>;

    const kpis: InvestorKpis = {
      totalOriginalInvestmentUsd: 0, // not tracked separately in USD class — use NAV as proxy
      totalNavUsd: Number((posAgg as Record<string, unknown>).total_nav_usd ?? 0),
      totalDistributionsUsd: Number((distAgg as Record<string, unknown>).total_usd ?? 0),
      totalOriginalInvestmentNis: Number((posAgg as Record<string, unknown>).total_orig_nis ?? 0),
      totalNavNis: Number((posAgg as Record<string, unknown>).total_nav_nis ?? 0),
      totalDistributionsNis: Number((distAgg as Record<string, unknown>).total_nis ?? 0),
      totalInvestors: Number((invAgg as Record<string, unknown>).total_investors ?? 0),
      activeInvestors: Number((invAgg as Record<string, unknown>).active_investors ?? 0),
    };

    const quarterlyDistributions: QuarterlyDistribution[] = (
      quarterlyResult.rows as Array<Record<string, unknown>>
    ).map((row) => ({
      quarter: formatQuarterLabel(String(row.quarter_label ?? "")),
      amountNis: Number(row.amount_nis ?? 0),
      amountUsd: Number(row.amount_usd ?? 0),
    }));

    return actionSuccess({
      kpis,
      quarterlyDistributions,
      latestDataDate: String((posAgg as Record<string, unknown>).latest_date ?? "") || null,
    });
  } catch (err) {
    return actionError(
      "DB_ERROR",
      err instanceof Error ? err.message : "Failed to load analytics"
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert Postgres TO_CHAR format "Q'YY" → "Q3'23" */
function formatQuarterLabel(raw: string): string {
  // TO_CHAR with 'Q''YY' gives e.g. "3'23" — prefix with Q
  if (!raw) return "";
  if (raw.startsWith("Q")) return raw;
  return `Q${raw}`;
}
