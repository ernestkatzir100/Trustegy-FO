import { getFundHoldings } from "@/lib/actions/fund";
import { getLastScrapeByPlatform, getScrapeHistory } from "@/lib/actions/scrape";
import { PLATFORM_LABELS, STATUS_LABELS } from "@/db/schema/fund";
import type { FundHolding } from "@/db/schema/fund";
import { ScrapeNowButton } from "./_components/ScrapeNowButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USD = (cents: number | null | undefined) =>
  cents == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(cents / 100);

const ACTIVE_STATUSES = new Set([
  "PERFORMING",
  "LATE_PAYMENT",
  "LOSS_MITIGATION",
  "FORECLOSURE_EARLY",
  "FORECLOSURE_MID",
  "FORECLOSURE_LATE",
  "REO",
  "REO_LISTED",
  "REO_UNDER_CONTRACT",
  "BORROWER_WORKOUT",
  "PAYOFF_EXPECTED",
  "BANKRUPTCY",
  "TITLE_ISSUE",
  "NOTE_SALE",
  "PARTIAL_RECOVERY",
]);

// Confidence that money will be received, by status
const RECEIPT_CONFIDENCE: Record<string, "high" | "medium" | "low" | "none"> = {
  PAYOFF_EXPECTED: "high",
  REO_UNDER_CONTRACT: "high",
  BORROWER_WORKOUT: "medium",
  REO_LISTED: "medium",
  NOTE_SALE: "medium",
  PARTIAL_RECOVERY: "medium",
  REO: "low",
  FORECLOSURE_LATE: "low",
  FORECLOSURE_MID: "low",
  PERFORMING: "none", // regular interest, not tracked here as a lump sum
  FORECLOSURE_EARLY: "low",
  LOSS_MITIGATION: "low",
  LATE_PAYMENT: "low",
  BANKRUPTCY: "low",
  TITLE_ISSUE: "low",
  SETTLED: "none",
  WRITTEN_OFF: "none",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high: "var(--color-green-500, #22c55e)",
  medium: "var(--color-yellow-400, #facc15)",
  low: "var(--color-orange-400, #fb923c)",
  none: "var(--text-muted)",
};

function expectedReceiptDate(h: FundHolding): string | null {
  if (h.liquidationTimelineMonths) {
    const d = new Date();
    d.setMonth(d.getMonth() + h.liquidationTimelineMonths);
    return d.toISOString().split("T")[0];
  }
  // Rough defaults if no timeline set
  const defaults: Record<string, number> = {
    PAYOFF_EXPECTED: 1,
    REO_UNDER_CONTRACT: 2,
    BORROWER_WORKOUT: 6,
    REO_LISTED: 4,
    NOTE_SALE: 3,
    REO: 9,
    FORECLOSURE_LATE: 6,
    FORECLOSURE_MID: 12,
  };
  const months = defaults[h.status];
  if (!months) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function quarterLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} '${String(d.getFullYear()).slice(2)}`;
}

function daysStale(dateStr: string | null | undefined): number {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MonitorPage() {
  const [holdingsResult, lastScrapeResult, historyResult] = await Promise.all([
    getFundHoldings(),
    getLastScrapeByPlatform(),
    getScrapeHistory(5),
  ]);

  const all = holdingsResult.data ?? [];
  const lastScrape = lastScrapeResult.data ?? {};
  const recentRuns = historyResult.data ?? [];

  const active = all.filter((h) => ACTIVE_STATUSES.has(h.status));
  const stale = active.filter((h) => daysStale(h.lastUpdateDate) > 60);

  // ── Totals ──────────────────────────────────────────────────────────────
  const totalPrincipal = active.reduce((s, h) => s + (h.currentPrincipal ?? h.originalInvestment ?? 0), 0);
  const estimateLow = active.reduce((s, h) => s + (h.liquidationEstimateLow ?? 0), 0);
  const estimateHigh = active.reduce((s, h) => s + (h.liquidationEstimateHigh ?? 0), 0);

  // ── Build quarterly timeline ─────────────────────────────────────────────
  interface TimelineEntry {
    holding: FundHolding;
    expectedDate: string;
    quarter: string;
    amountLow: number;
    amountHigh: number;
    confidence: "high" | "medium" | "low" | "none";
  }

  const timeline: TimelineEntry[] = active
    .map((h) => {
      const expectedDate = expectedReceiptDate(h);
      if (!expectedDate) return null;
      const confidence = RECEIPT_CONFIDENCE[h.status] ?? "low";
      if (confidence === "none") return null;
      return {
        holding: h,
        expectedDate,
        quarter: quarterLabel(expectedDate),
        amountLow: h.liquidationEstimateLow ?? Math.round((h.currentPrincipal ?? 0) * 0.5),
        amountHigh: h.liquidationEstimateHigh ?? (h.currentPrincipal ?? 0),
        confidence,
      } as TimelineEntry;
    })
    .filter((e): e is TimelineEntry => e !== null)
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));

  // Group by quarter
  const byQuarter = new Map<string, TimelineEntry[]>();
  for (const entry of timeline) {
    const existing = byQuarter.get(entry.quarter) ?? [];
    existing.push(entry);
    byQuarter.set(entry.quarter, existing);
  }

  // ── Latest AI brief from most recent successful scrape ───────────────────
  const latestBrief = recentRuns.find((r) => r.aiSummary)?.aiSummary ?? null;

  // ── Per-platform last scrape status ─────────────────────────────────────
  const platforms = ["upright", "sharestates", "upgrade"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>NPL Monitor</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Live status of all portfolio loans · {active.length} active positions across 3 platforms
          </p>
        </div>
        <ScrapeNowButton />
      </div>

      {/* ── Platform status strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {platforms.map((p) => {
          const run = lastScrape[p];
          const staleDays = run?.completedAt ? daysStale(run.completedAt) : 9999;
          const platformHoldings = active.filter((h) => h.platform === p);
          return (
            <div
              key={p}
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{PLATFORM_LABELS[p]}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: run?.status === "success" ? "rgba(34,197,94,0.12)" : run?.status === "running" ? "rgba(99,102,241,0.12)" : "rgba(251,146,60,0.12)",
                    color: run?.status === "success" ? "#22c55e" : run?.status === "running" ? "#6366f1" : "#fb923c",
                  }}
                >
                  {run?.status === "success" ? "✓ Up to date" : run?.status === "running" ? "⟳ Running…" : run ? "⚠ Error" : "Never scraped"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {platformHoldings.length} active loans
                {run?.completedAt && ` · last run ${staleDays}d ago`}
              </div>
              {run?.aiSummary && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 4, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  {run.aiSummary.slice(0, 160)}…
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Principal", value: USD(totalPrincipal), sub: `${active.length} active loans` },
          { label: "Recovery Est. Low", value: USD(estimateLow), sub: "Conservative" },
          { label: "Recovery Est. High", value: USD(estimateHigh), sub: "Optimistic" },
          { label: "Stale Loans", value: String(stale.length), sub: "No update in 60+ days", warn: stale.length > 0 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--surface-card)",
              border: `1px solid ${kpi.warn ? "rgba(251,146,60,0.4)" : "var(--border)"}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: kpi.warn ? "#fb923c" : "var(--foreground)" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AI Weekly Brief ── */}
      {latestBrief && (
        <div
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 10,
            padding: "16px 20px",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            AI Weekly Brief
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "var(--foreground)" }}>
            {latestBrief}
          </p>
        </div>
      )}

      {/* ── Incoming Money Timeline ── */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
          Expected Incoming Money
        </h2>

        {byQuarter.size === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>
            No recovery estimates set yet. Run the scraper or set estimates manually in the portfolio.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Array.from(byQuarter.entries()).map(([quarter, entries]) => {
              const qTotalLow = entries.reduce((s, e) => s + e.amountLow, 0);
              const qTotalHigh = entries.reduce((s, e) => s + e.amountHigh, 0);
              return (
                <div key={quarter}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 60 }}>{quarter}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {USD(qTotalLow)} – {USD(qTotalHigh)} expected · {entries.length} loan{entries.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {entries.map(({ holding: h, amountLow, amountHigh, confidence, expectedDate }) => (
                      <div
                        key={h.id}
                        style={{
                          background: "var(--surface-card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          display: "grid",
                          gridTemplateColumns: "1fr auto auto auto auto",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        {/* Property */}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {h.propertyAddress ?? h.offeringId}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {[h.city, h.state].filter(Boolean).join(", ")} · {PLATFORM_LABELS[h.platform]}
                          </div>
                        </div>

                        {/* Status */}
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>
                          {STATUS_LABELS[h.status]}
                        </div>

                        {/* Expected date */}
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", whiteSpace: "nowrap" }}>
                          ~{expectedDate}
                        </div>

                        {/* Amount range */}
                        <div style={{ fontSize: 13, fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>
                          {USD(amountLow)} – {USD(amountHigh)}
                        </div>

                        {/* Confidence */}
                        <div
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: `${CONFIDENCE_COLOR[confidence]}20`,
                            color: CONFIDENCE_COLOR[confidence],
                            whiteSpace: "nowrap",
                          }}
                        >
                          {confidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── All Active Loans Table ── */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
          All Active Positions ({active.length})
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Platform", "Loan ID", "Property", "Status", "Principal", "Recovery Est.", "Last Update", "Stale?"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign: "left",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {active
                .sort((a, b) => {
                  // Sort: near-resolution first, then by principal descending
                  const confA = RECEIPT_CONFIDENCE[a.status] ?? "none";
                  const confB = RECEIPT_CONFIDENCE[b.status] ?? "none";
                  const order = ["high", "medium", "low", "none"];
                  const orderDiff = order.indexOf(confA) - order.indexOf(confB);
                  if (orderDiff !== 0) return orderDiff;
                  return (b.currentPrincipal ?? 0) - (a.currentPrincipal ?? 0);
                })
                .map((h) => {
                  const staleFlag = daysStale(h.lastUpdateDate) > 60;
                  const conf = RECEIPT_CONFIDENCE[h.status] ?? "none";
                  return (
                    <tr
                      key={h.id}
                      style={{ borderBottom: "1px solid var(--border)", opacity: h.status === "WRITTEN_OFF" ? 0.4 : 1 }}
                    >
                      <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>
                        {PLATFORM_LABELS[h.platform]}
                      </td>
                      <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{h.offeringId}</td>
                      <td style={{ padding: "8px 10px", maxWidth: 200 }}>
                        <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.propertyAddress ?? "—"}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                          {[h.city, h.state].filter(Boolean).join(", ")}
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 7px",
                            borderRadius: 99,
                            background: `${CONFIDENCE_COLOR[conf]}18`,
                            color: CONFIDENCE_COLOR[conf],
                            whiteSpace: "nowrap",
                          }}
                        >
                          {STATUS_LABELS[h.status]}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                        {USD(h.currentPrincipal)}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right", whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                        {h.liquidationEstimateLow || h.liquidationEstimateHigh
                          ? `${USD(h.liquidationEstimateLow)} – ${USD(h.liquidationEstimateHigh)}`
                          : "—"}
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {h.lastUpdateDate ?? "—"}
                        {h.lastUpdateSource === "web_scrape" && (
                          <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>web</span>
                        )}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        {staleFlag && (
                          <span style={{ fontSize: 11, color: "#fb923c" }}>
                            ⚠ {daysStale(h.lastUpdateDate)}d
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Scrape run history ── */}
      {recentRuns.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Recent Scrape Runs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentRuns.map((run) => (
              <div
                key={run.id}
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "grid",
                  gridTemplateColumns: "80px 100px 1fr auto",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 12,
                }}
              >
                <span style={{ fontWeight: 600 }}>{PLATFORM_LABELS[run.platform]}</span>
                <span
                  style={{
                    color: run.status === "success" ? "#22c55e" : run.status === "running" ? "#6366f1" : "#fb923c",
                  }}
                >
                  {run.status}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {run.meta
                    ? `${run.meta.holdingsFound} found · ${run.meta.inserted} new · ${run.meta.updated} updated`
                    : run.errorMessage ?? "—"}
                </span>
                <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {run.startedAt.slice(0, 16).replace("T", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
