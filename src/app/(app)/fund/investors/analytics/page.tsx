import { getInvestorAnalytics } from "@/lib/actions/investor-analytics";
import { DistributionsChart } from "./_components/DistributionsChart";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtNis = (agorot: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(agorot / 100);

const fmtUsd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  valueUsd,
  valueNis,
  accent,
}: {
  label: string;
  valueUsd?: number | null;
  valueNis?: number | null;
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
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--text-muted)",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {valueUsd != null && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: accent ? "var(--accent)" : "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtUsd(valueUsd)}
        </div>
      )}
      {valueNis != null && (
        <div
          style={{
            fontSize: valueUsd != null ? 14 : 22,
            fontWeight: valueUsd != null ? 600 : 900,
            letterSpacing: "-0.02em",
            color: valueUsd != null ? "var(--text-secondary)" : (accent ? "var(--accent)" : "var(--text-primary)"),
            fontVariantNumeric: "tabular-nums",
            marginTop: valueUsd != null ? 4 : 0,
          }}
        >
          {fmtNis(valueNis)}
        </div>
      )}
    </div>
  );
}

function SingleKpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
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
        minWidth: 140,
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
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvestorAnalyticsPage() {
  const result = await getInvestorAnalytics();

  if (result.error) {
    return (
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(239,68,68,0.3)",
          padding: 24,
          fontSize: 13,
          color: "#ef4444",
        }}
      >
        {result.error.message}
      </div>
    );
  }

  const { kpis, quarterlyDistributions, latestDataDate } = result.data;

  // Total distributions across both currencies (for display)
  const totalDistNis = kpis.totalDistributionsNis;
  const totalDistUsd = kpis.totalDistributionsUsd;

  // Sum quarterly for period totals
  const qNisTotal = quarterlyDistributions.reduce((s, q) => s + q.amountNis, 0);
  const qUsdTotal = quarterlyDistributions.reduce((s, q) => s + q.amountUsd, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          מבט משקיע — Investor Overview
          {latestDataDate && (
            <span style={{ marginInlineStart: 8, fontFamily: "monospace" }}>
              · data as of {latestDataDate}
            </span>
          )}
        </div>
      </div>

      {/* LP count KPIs */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <SingleKpi
          label="Total Investors"
          value={kpis.totalInvestors}
          sub={`${kpis.activeInvestors} active`}
          accent
        />
        <SingleKpi
          label="Active LPs"
          value={kpis.activeInvestors}
          sub={`${kpis.totalInvestors > 0 ? Math.round((kpis.activeInvestors / kpis.totalInvestors) * 100) : 0}% of register`}
        />
      </div>

      {/* Financial KPI row 1 — matching Monday dashboard top row */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 12,
          }}
        >
          Capital Overview
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <KpiCard
            label="סכום השקעה מקורי — Original Investment"
            valueNis={kpis.totalOriginalInvestmentNis || null}
            accent
          />
          <KpiCard
            label="יתרה בקרן — Current Fund Balance (NAV)"
            valueUsd={kpis.totalNavUsd || null}
            valueNis={kpis.totalNavNis || null}
          />
          <KpiCard
            label="סה״כ חלוקות — Total Distributions (all time)"
            valueUsd={totalDistUsd || null}
            valueNis={totalDistNis || null}
          />
          <KpiCard
            label="חלוקות מתוך היקף — Distributions from quarterly data"
            valueUsd={qUsdTotal || null}
            valueNis={qNisTotal || null}
          />
        </div>
      </div>

      {/* Quarterly distributions chart */}
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          חלוקות לאורך כל תקופת ההשקעה — Distributions by Quarter
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
          NIS (blue) vs USD (green) distributions per quarter
        </div>
        <DistributionsChart data={quarterlyDistributions} />
      </div>

      {/* Bottom balance cards — matching Monday bottom row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            padding: "20px 24px",
            flex: 1,
            minWidth: 200,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>
            יתרה בקרן — ש״ח
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
            {fmtNis(kpis.totalNavNis)}
          </div>
        </div>
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(99,102,241,0.4)",
            padding: "20px 24px",
            flex: 1,
            minWidth: 200,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>
            יתרה בקרן — $
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
            {fmtUsd(kpis.totalNavUsd)}
          </div>
        </div>
      </div>
    </div>
  );
}
