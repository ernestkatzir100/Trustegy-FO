import Link from "next/link";
import { getInvestors, getInvestorImportStatus } from "@/lib/actions/investors";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtMoney = (cents: number | null | undefined, currency: string) => {
  if (cents == null) return "—";
  const amount = cents / 100;
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
};

const fmtBps = (bps: number | null | undefined) => {
  if (bps == null) return "—";
  const pct = bps / 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          fontSize: 26,
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

function StatusPill({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const color = lower === "active"
    ? "#22c55e"
    : lower === "review_needed"
    ? "#eab308"
    : lower === "exited" || lower === "closed"
    ? "#6b7280"
    : "var(--text-secondary)";
  const label = lower === "review_needed" ? "Review" : status;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 100,
        background: `${color}20`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function ReturnPill({ bps }: { bps: number | null | undefined }) {
  if (bps == null) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const pct = bps / 100;
  const color = pct >= 0 ? "#22c55e" : "#ef4444";
  return (
    <span style={{ color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
      {fmtBps(bps)}
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "64px 32px",
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40 }}>👥</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
        No investors yet
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 400, margin: 0 }}>
        Import your Monday.com investor register to populate this module. The import is a
        one-time migration — Shefa becomes the system of record going forward.
      </p>
      <Link
        href="/fund/investors/import"
        style={{
          background: "var(--accent)",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "var(--radius-md)",
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Import Investors →
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function FundInvestorsPage() {
  const [statusResult, investorsResult] = await Promise.all([
    getInvestorImportStatus(),
    getInvestors(),
  ]);

  // Not imported yet
  if (!statusResult.error && !statusResult.data.imported) {
    return <EmptyState />;
  }

  if (investorsResult.error) {
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
        {investorsResult.error.message}
      </div>
    );
  }

  const list = investorsResult.data;

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const activeCount = list.filter((i) => i.status === "active").length;
  const reviewCount = list.filter((i) => i.dedupStatus === "review_needed").length;

  // NAV totals (split by currency class)
  const totalNavIls = list.reduce((s, i) => {
    if (i.currencyClass !== "ILS") return s;
    return s + (i.latestPosition?.navNis ?? 0);
  }, 0);
  const totalNavUsd = list.reduce((s, i) => {
    if (i.currencyClass !== "USD") return s;
    return s + (i.latestPosition?.navUsd ?? 0);
  }, 0);

  // Sort: active first, then by displayName
  const sorted = [...list].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (b.status === "active" && a.status !== "active") return 1;
    return a.displayName.localeCompare(b.displayName, "he");
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {list.length} limited partners · {activeCount} active
          {reviewCount > 0 && (
            <span style={{ color: "#eab308", marginInlineStart: 8 }}>
              · {reviewCount} need review
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/fund/investors/email"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✉ Email Investors
          </Link>
          <Link
            href="/fund/investors/import"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ↑ Re-import
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KpiCard
          label="Active LPs"
          value={String(activeCount)}
          sub={`of ${list.length} total`}
          accent
        />
        <KpiCard
          label="Total NAV (ILS)"
          value={fmtMoney(totalNavIls, "ILS")}
          sub="NIS-class investors"
        />
        <KpiCard
          label="Total NAV (USD)"
          value={fmtMoney(totalNavUsd, "USD")}
          sub="USD-class investors"
        />
        <KpiCard
          label="Redemptions"
          value={String(list.reduce((s, i) => s + i.redemptionCount, 0))}
          sub="total distribution events"
        />
      </div>

      {/* LP table */}
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
          }}
        >
          LP Register
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface-elevated)",
                }}
              >
                {[
                  { label: "#", align: "end" as const },
                  { label: "Investor", align: "start" as const },
                  { label: "Distributor", align: "start" as const },
                  { label: "Currency", align: "start" as const },
                  { label: "Orig. Investment", align: "end" as const },
                  { label: "Current NAV", align: "end" as const },
                  { label: "Net MTD", align: "end" as const },
                  { label: "Net YTD", align: "end" as const },
                  { label: "Redemptions", align: "end" as const },
                  { label: "Status", align: "start" as const },
                ].map((h) => (
                  <th
                    key={h.label}
                    style={{
                      padding: "10px 16px",
                      textAlign: h.align,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv, idx) => {
                const pos = inv.latestPosition;
                const currency = inv.currencyClass;
                const nav = currency === "USD" ? pos?.navUsd : pos?.navNis;
                const origInv = pos?.originalInvestmentNis;

                return (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "end",
                        fontSize: 11,
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link
                        href={`/fund/investors/${inv.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--accent)",
                          }}
                        >
                          {inv.displayName}
                        </div>
                        {inv.email && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                            {inv.email}
                          </div>
                        )}
                        {inv.partnerId && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              fontFamily: "monospace",
                            }}
                          >
                            {inv.partnerId}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>
                      {inv.distributor?.name ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: currency === "USD" ? "rgba(99,102,241,0.12)" : "rgba(34,197,94,0.12)",
                          color: currency === "USD" ? "#818cf8" : "#22c55e",
                        }}
                      >
                        {currency}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "end",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {fmtMoney(origInv, "ILS")}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "end",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {fmtMoney(nav, currency)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "end" }}>
                      <ReturnPill bps={pos?.netMtdBps} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "end" }}>
                      <ReturnPill bps={pos?.netYtdBps} />
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "end",
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {inv.redemptionCount > 0 ? inv.redemptionCount : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusPill status={inv.dedupStatus === "review_needed" ? "review_needed" : inv.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
