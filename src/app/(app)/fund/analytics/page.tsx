import { getFundHoldings, getFundSummary } from "@/lib/actions/fund";
import { STATUS_LABELS, PLATFORM_LABELS } from "@/db/schema/fund";
import type { FundHolding } from "@/db/schema/fund";
import { AnalyticsCharts } from "../_components/AnalyticsCharts";

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        padding: "20px 24px",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: accent ? "var(--accent)" : "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default async function FundAnalyticsPage() {
  const [holdingsResult, summaryResult] = await Promise.all([
    getFundHoldings(),
    getFundSummary(),
  ]);

  if (holdingsResult.error || summaryResult.error) {
    return (
      <div style={{ color: "var(--text-muted)", padding: 32, textAlign: "center" }}>
        Failed to load analytics data.
      </div>
    );
  }

  const holdings = holdingsResult.data;
  const summary = summaryResult.data;

  // Recovery range across all active positions
  const recoveryLow = summary.totalEstimateLow;
  const recoveryHigh = summary.totalEstimateHigh;
  const recoveryRate =
    summary.totalCostBasis > 0
      ? (((recoveryLow + recoveryHigh) / 2 / summary.totalCostBasis) * 100).toFixed(0)
      : "—";

  // Status chart data
  const statusData = Object.entries(summary.byStatus)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status,
      value: count,
      status,
    }))
    .sort((a, b) => b.value - a.value);

  // Platform chart data
  const platformData = Object.entries(summary.byPlatform).map(
    ([platform, { costBasis, count }]) => ({
      name: PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] ?? platform,
      costBasis: Math.round(costBasis / 100),
      count,
      platform,
    })
  );

  // Per-holding recovery waterfall — only positions with estimates
  const waterfallData: {
    id: string;
    label: string;
    costBasis: number;
    low: number;
    high: number;
    platform: string;
    status: string;
  }[] = holdings
    .filter(
      (h: FundHolding) =>
        h.liquidationEstimateLow != null || h.costBasisApex != null
    )
    .map((h: FundHolding) => ({
      id: h.id,
      label:
        h.propertyAddress
          ? h.propertyAddress.split(",")[0]
          : h.city
          ? `${h.city}, ${h.state ?? ""}`
          : h.offeringId,
      costBasis: Math.round((h.costBasisApex ?? h.currentPrincipal ?? 0) / 100),
      low: Math.round((h.liquidationEstimateLow ?? 0) / 100),
      high: Math.round((h.liquidationEstimateHigh ?? 0) / 100),
      platform: h.platform,
      status: h.status,
    }))
    .sort((a, b) => b.costBasis - a.costBasis)
    .slice(0, 18); // cap for readability

  // Stale positions (>90 days since last update)
  const today = new Date();
  const stale = holdings.filter((h: FundHolding) => {
    if (!h.lastUpdateDate) return true;
    const diff =
      (today.getTime() - new Date(h.lastUpdateDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff > 90;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KpiCard
          label="Total Cost Basis"
          value={usd(summary.totalCostBasis)}
          sub={`${summary.activeCount} active positions`}
          accent
        />
        <KpiCard
          label="Recovery Est. (Low)"
          value={usd(recoveryLow)}
          sub="Conservative scenario"
        />
        <KpiCard
          label="Recovery Est. (High)"
          value={usd(recoveryHigh)}
          sub="Optimistic scenario"
        />
        <KpiCard
          label="Avg Recovery Rate"
          value={`${recoveryRate}%`}
          sub="Mid of low/high range"
        />
        <KpiCard
          label="Resolved"
          value={String(summary.resolvedCount)}
          sub="Settled or written off"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        statusData={statusData}
        platformData={platformData}
        waterfallData={waterfallData}
      />

      {/* Stale positions */}
      {stale.length > 0 && (
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid rgba(234,179,8,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#ca8a04",
              marginBottom: 12,
            }}
          >
            ⚠ {stale.length} position{stale.length > 1 ? "s" : ""} with no update in 90+ days
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stale.map((h: FundHolding) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", minWidth: 120 }}>
                  {h.offeringId}
                </span>
                <span>{h.city ? `${h.city}, ${h.state}` : "—"}</span>
                <span style={{ color: "var(--text-muted)" }}>
                  {h.lastUpdateDate ?? "never updated"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
