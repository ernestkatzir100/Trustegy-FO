import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvestorDetail } from "@/lib/actions/investors";
import { NavChart } from "./_components/NavChart";
import { InvestorDistributionsChart } from "./_components/InvestorDistributionsChart";
import type { QuarterlyDist } from "./_components/InvestorDistributionsChart";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtMoney = (cents: number | null | undefined, currency = "ILS") => {
  if (cents == null || cents === 0) return "—";
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const fmtBps = (bps: number | null | undefined) => {
  if (bps == null) return "—";
  const pct = bps / 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
};

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "var(--text-muted)",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function DashboardKpi({
  label,
  labelHe,
  primaryValue,
  secondaryValue,
  accent,
}: {
  label: string;
  labelHe?: string;
  primaryValue: string;
  secondaryValue?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        padding: "18px 22px",
        flex: 1,
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--text-muted)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      {labelHe && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 10,
            direction: "rtl",
            textAlign: "start",
          }}
        >
          {labelHe}
        </div>
      )}
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: accent ? "var(--accent)" : "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
        }}
      >
        {primaryValue}
      </div>
      {secondaryValue && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-secondary)",
            fontVariantNumeric: "tabular-nums",
            marginTop: 4,
          }}
        >
          {secondaryValue}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 0",
        borderBottom: "1px solid var(--border)",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text-primary)", textAlign: "end" }}>{value}</span>
    </div>
  );
}

function ReturnCell({ bps }: { bps: number | null | undefined }) {
  if (bps == null) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const color = bps >= 0 ? "#22c55e" : "#ef4444";
  return <span style={{ color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtBps(bps)}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvestorDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getInvestorDetail(id);

  if (result.error) {
    if (result.error.code === "NOT_FOUND") notFound();
    return <div style={{ color: "#ef4444", fontSize: 13 }}>{result.error.message}</div>;
  }

  const inv = result.data;
  const currency = inv.currencyClass;
  const positions = inv.positions;

  // ── Aggregate positions across tranches ─────────────────────────────────────
  // Positions can have multiple rows per date (one per investment tranche)
  const posByDate = new Map<string, { navNis: number; navUsd: number; origNis: number; netMtdBps: number | null; netYtdBps: number | null; netItdBps: number | null }>();
  for (const p of positions) {
    const existing = posByDate.get(p.dataDate);
    if (existing) {
      existing.navNis += p.navNis ?? 0;
      existing.navUsd += p.navUsd ?? 0;
      existing.origNis += p.originalInvestmentNis ?? 0;
      // Take the weighted average of bps from latest tranche (just use first occurrence)
    } else {
      posByDate.set(p.dataDate, {
        navNis: p.navNis ?? 0,
        navUsd: p.navUsd ?? 0,
        origNis: p.originalInvestmentNis ?? 0,
        netMtdBps: p.netMtdBps,
        netYtdBps: p.netYtdBps,
        netItdBps: p.netItdBps,
      });
    }
  }

  const sortedDates = Array.from(posByDate.keys()).sort();
  const latestDate = sortedDates[sortedDates.length - 1] ?? null;
  const earliestDate = sortedDates[0] ?? null;
  const latestAgg = latestDate ? posByDate.get(latestDate) : null;
  const earliestAgg = earliestDate ? posByDate.get(earliestDate) : null;

  // Aggregated positions array for NAV chart (one point per date)
  const aggPositions = sortedDates.map((date) => {
    const d = posByDate.get(date)!;
    return {
      id: date,
      investorId: inv.id,
      dataDate: date,
      className: null,
      currencyClass: currency,
      managementFeeClass: null,
      originalInvestmentNis: d.origNis,
      navNis: d.navNis,
      navUsd: d.navUsd,
      beginningNav: null,
      endingNav: null,
      exchangeRate: null,
      grossMtdBps: null,
      netMtdBps: d.netMtdBps,
      netYtdBps: d.netYtdBps,
      netItdBps: d.netItdBps,
      monthlyPerfFee: null,
      cumulativePerfFee: null,
      mgmtFeeTotal: null,
      redemptionFeePayable: null,
      perfFeePayable: null,
      volumeFeePayable: null,
      fundAllocationBps: null,
      apexSource: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // ── Key metrics ─────────────────────────────────────────────────────────────
  const currentNavNis = latestAgg?.navNis ?? 0;
  const currentNavUsd = latestAgg?.navUsd ?? 0;
  const originalInvNis = earliestAgg?.origNis ?? 0;
  const totalDistNis = inv.allRedemptions.reduce((s, r) => s + (r.amountNis ?? 0), 0);
  const totalDistUsd = inv.allRedemptions.reduce((s, r) => s + (r.amountUsd ?? 0), 0);

  // Latest per-tranche performance (use the first tranche's bps as representative)
  const repPosition = positions.find((p) => p.dataDate === latestDate && p.netMtdBps != null);

  // ── Quarterly distributions ─────────────────────────────────────────────────
  const quarterMap = new Map<string, QuarterlyDist>();
  for (const r of inv.allRedemptions) {
    if (!r.date) continue;
    const d = new Date(r.date);
    const q = `Q${Math.ceil((d.getMonth() + 1) / 3)} '${String(d.getFullYear()).slice(2)}`;
    const existing = quarterMap.get(q);
    if (existing) {
      existing.amountNis += r.amountNis ?? 0;
      existing.amountUsd += r.amountUsd ?? 0;
    } else {
      quarterMap.set(q, { quarter: q, amountNis: r.amountNis ?? 0, amountUsd: r.amountUsd ?? 0 });
    }
  }
  const quarterlyDist: QuarterlyDist[] = Array.from(quarterMap.values());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Back + header ──────────────────────────────────────────────────── */}
      <div>
        <Link href="/fund/investors" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>
          ← All Investors
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginTop: 10,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {inv.displayName}
            </h1>
            {inv.nameHe && inv.nameHe !== inv.displayName && (
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2, direction: "rtl", textAlign: "start" }}>
                {inv.nameHe}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
              {inv.partnerId && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", background: "var(--surface-elevated)", padding: "2px 8px", borderRadius: 4 }}>
                  {inv.partnerId}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 100,
                  background: currency === "USD" ? "rgba(99,102,241,0.12)" : "rgba(34,197,94,0.12)",
                  color: currency === "USD" ? "#818cf8" : "#22c55e",
                }}
              >
                {currency}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 100,
                  background: inv.status === "active" ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                  color: inv.status === "active" ? "#22c55e" : "#6b7280",
                }}
              >
                {inv.status}
              </span>
              {latestDate && (
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Data as of <strong>{latestDate}</strong>
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/fund/investors/email?ids=${inv.id}`}
            style={{
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            ✉ Send Email
          </Link>
        </div>
      </div>

      {/* ── KPI tiles — Row 1 (matching Monday top row) ───────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <DashboardKpi
          label="Original Investment"
          labelHe="סכום השקעה מקורי"
          primaryValue={currency === "USD" ? fmtMoney(originalInvNis ? null : currentNavUsd, "USD") : fmtMoney(originalInvNis, "ILS")}
          secondaryValue={currency === "ILS" && currentNavUsd > 0 ? fmtMoney(currentNavUsd, "USD") : undefined}
        />
        <DashboardKpi
          label="Current Fund Balance"
          labelHe="יתרה בקרן"
          primaryValue={currency === "USD" ? fmtMoney(currentNavUsd, "USD") : fmtMoney(currentNavNis, "ILS")}
          secondaryValue={
            currency === "ILS" && currentNavUsd > 0
              ? fmtMoney(currentNavUsd, "USD")
              : currency === "USD" && currentNavNis > 0
              ? fmtMoney(currentNavNis, "ILS")
              : undefined
          }
          accent
        />
        <DashboardKpi
          label="Total Distributions (all time)"
          labelHe="סה״כ חלוקות לאורך כל התקופה"
          primaryValue={totalDistNis > 0 ? fmtMoney(totalDistNis, "ILS") : totalDistUsd > 0 ? fmtMoney(totalDistUsd, "USD") : "—"}
          secondaryValue={totalDistNis > 0 && totalDistUsd > 0 ? fmtMoney(totalDistUsd, "USD") : undefined}
        />
        <DashboardKpi
          label="Net Return ITD"
          labelHe="תשואה ממועד ההצטרפות"
          primaryValue={fmtBps(repPosition?.netItdBps)}
          secondaryValue={repPosition ? `MTD ${fmtBps(repPosition.netMtdBps)}` : undefined}
        />
      </div>

      {/* ── Distributions chart ────────────────────────────────────────────── */}
      <Card>
        <SectionTitle>חלוקות לאורך כל תקופת ההשקעה — Distributions by Quarter</SectionTitle>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          NIS (blue) · USD (green) per quarter · {inv.allRedemptions.length} total events
        </div>
        <InvestorDistributionsChart data={quarterlyDist} />
      </Card>

      {/* ── NAV chart + Investor details ──────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card style={{ flex: 2, minWidth: 300 }}>
          <SectionTitle>NAV History — {currency}</SectionTitle>
          <NavChart positions={aggPositions} currency={currency} />
          {latestAgg && (
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Net MTD", value: <ReturnCell bps={repPosition?.netMtdBps} /> },
                { label: "Net YTD", value: <ReturnCell bps={repPosition?.netYtdBps} /> },
                { label: "Net ITD", value: <ReturnCell bps={repPosition?.netItdBps} /> },
                {
                  label: "Current NAV",
                  value: (
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {fmtMoney(currency === "USD" ? currentNavUsd : currentNavNis, currency)}
                    </span>
                  ),
                },
                ...(currentNavNis > 0 && currentNavUsd > 0
                  ? [
                      {
                        label: currency === "USD" ? "NAV (NIS)" : "NAV (USD)",
                        value: (
                          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                            {fmtMoney(currency === "USD" ? currentNavNis : currentNavUsd, currency === "USD" ? "ILS" : "USD")}
                          </span>
                        ),
                      },
                    ]
                  : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ flex: 1, minWidth: 240 }}>
          <SectionTitle>Investor Details</SectionTitle>
          <DetailRow label="Email" value={inv.email ?? "—"} />
          <DetailRow label="Phone" value={inv.phoneMobile ?? inv.phoneLandline ?? "—"} />
          <DetailRow label="Type" value={inv.investorType ?? "—"} />
          <DetailRow label="Currency Class" value={currency} />
          <DetailRow label="Fee Class" value={inv.managementFeeClass ?? "—"} />
          <DetailRow label="Distributor" value={inv.distributor?.name ?? "—"} />
          <DetailRow label="Qualified" value={inv.isQualified ? "✓ Yes" : "No"} />
          <DetailRow label="Join Date" value={fmtDate(inv.joinDate)} />
          <DetailRow label="Interest Accrual" value={fmtDate(inv.interestAccrualDate)} />
          {inv.bankName && (
            <DetailRow
              label="Bank"
              value={`${inv.bankName}${inv.bankBranch ? ` / ${inv.bankBranch}` : ""}`}
            />
          )}
          <DetailRow label="Tranches" value={String(positions.filter((p) => p.dataDate === latestDate).length)} />
          <DetailRow label="Monthly Snapshots" value={String(sortedDates.length)} />
        </Card>
      </div>

      {/* ── Fees ──────────────────────────────────────────────────────────── */}
      {repPosition && (
        <Card>
          <SectionTitle>Fees — Latest Period ({latestDate})</SectionTitle>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "Mgmt Fee Total", value: fmtMoney(repPosition.mgmtFeeTotal, "ILS") },
              { label: "Perf Fee (Monthly)", value: fmtMoney(repPosition.monthlyPerfFee, "ILS") },
              { label: "Perf Fee (Cumulative)", value: fmtMoney(repPosition.cumulativePerfFee, "ILS") },
              { label: "Redemption Fee Payable", value: fmtMoney(repPosition.redemptionFeePayable, "ILS") },
              { label: "Volume Fee Payable", value: fmtMoney(repPosition.volumeFeePayable, "ILS") },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 15, fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", fontWeight: 600 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Positions table ────────────────────────────────────────────────── */}
      {sortedDates.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <SectionTitle>Monthly Positions — Aggregated ({sortedDates.length} months)</SectionTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {["Date", "NAV", "Orig. Investment", "Net MTD", "Net YTD", "Net ITD"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 14px",
                        textAlign: h === "Date" ? "start" : "end",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...sortedDates].reverse().slice(0, 36).map((date) => {
                  const agg = posByDate.get(date)!;
                  const nav = currency === "USD" ? agg.navUsd : agg.navNis;
                  return (
                    <tr key={date} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 14px", fontFamily: "monospace", color: "var(--text-secondary)" }}>{date}</td>
                      <td style={{ padding: "8px 14px", textAlign: "end", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {fmtMoney(nav, currency)}
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        {fmtMoney(agg.origNis, "ILS")}
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end" }}>
                        <ReturnCell bps={agg.netMtdBps} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end" }}>
                        <ReturnCell bps={agg.netYtdBps} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end" }}>
                        <ReturnCell bps={agg.netItdBps} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedDates.length > 36 && (
              <div style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                Showing 36 of {sortedDates.length} months
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Redemptions ─────────────────────────────────────────────────────── */}
      {inv.allRedemptions.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <SectionTitle>
              Redemptions / Distributions ({inv.allRedemptions.length}) ·{" "}
              {totalDistNis > 0 && <span style={{ color: "#3b82f6" }}>{fmtMoney(totalDistNis, "ILS")} NIS</span>}
              {totalDistNis > 0 && totalDistUsd > 0 && " · "}
              {totalDistUsd > 0 && <span style={{ color: "#22c55e" }}>{fmtMoney(totalDistUsd, "USD")} USD</span>}
            </SectionTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Currency", "Amount", "Distribution (USD)", "Status", "Source"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 14px",
                        textAlign: ["Date", "Currency", "Status", "Source"].includes(h) ? "start" : "end",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inv.allRedemptions.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 14px", color: "var(--text-secondary)" }}>{fmtDate(r.date)}</td>
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>{r.currency}</td>
                    <td style={{ padding: "8px 14px", textAlign: "end", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", fontWeight: 600 }}>
                      {r.currency === "USD" ? fmtMoney(r.amountUsd, "USD") : fmtMoney(r.amountNis, "ILS")}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "end", color: "#22c55e", fontVariantNumeric: "tabular-nums" }}>
                      {r.distributionUsd ? fmtMoney(r.distributionUsd, "USD") : "—"}
                    </td>
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>{r.status ?? "—"}</td>
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)", fontSize: 11 }}>{r.sourceBoardName ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Email history ───────────────────────────────────────────────────── */}
      {inv.emailHistory.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <SectionTitle>Email History ({inv.emailHistory.length})</SectionTitle>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {inv.emailHistory.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: 11, color: log.status === "sent" ? "#22c55e" : "#ef4444", fontWeight: 700, marginTop: 2, flexShrink: 0 }}>
                  {log.status === "sent" ? "✓" : "✗"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{log.subject}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
