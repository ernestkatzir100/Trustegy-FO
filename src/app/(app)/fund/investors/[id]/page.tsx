import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvestorDetail } from "@/lib/actions/investors";
import { NavChart } from "./_components/NavChart";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtMoney = (cents: number | null | undefined, currency = "ILS") => {
  if (cents == null) return "—";
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
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        gap: 16,
      }}
    >
      <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text-primary)", textAlign: "end" }}>{value}</span>
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
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

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
    return (
      <div style={{ color: "#ef4444", fontSize: 13 }}>{result.error.message}</div>
    );
  }

  const inv = result.data;
  const currency = inv.currencyClass;
  const latest = inv.latestPosition;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back + header */}
      <div>
        <Link
          href="/fund/investors"
          style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}
        >
          ← All Investors
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginTop: 12,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {inv.displayName}
            </h1>
            {inv.nameHe && inv.nameEn && inv.nameHe !== inv.displayName && (
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                {inv.nameHe !== inv.displayName ? inv.nameHe : inv.nameEn}
              </div>
            )}
            {inv.partnerId && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 4 }}>
                {inv.partnerId}
              </div>
            )}
          </div>
          <Link
            href={`/fund/investors/email?ids=${inv.id}`}
            style={{
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            ✉ Send Email
          </Link>
        </div>
      </div>

      {/* Top row: NAV chart + key stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* NAV history chart */}
        <Card style={{ flex: 2, minWidth: 300 }}>
          <SectionTitle>NAV History ({currency})</SectionTitle>
          <NavChart positions={inv.positions} currency={currency} />
          {latest && (
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
                { label: "Net MTD", value: <ReturnCell bps={latest.netMtdBps} /> },
                { label: "Net YTD", value: <ReturnCell bps={latest.netYtdBps} /> },
                { label: "Net ITD", value: <ReturnCell bps={latest.netItdBps} /> },
                {
                  label: "Current NAV",
                  value: (
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {fmtMoney(currency === "USD" ? latest.navUsd : latest.navNis, currency)}
                    </span>
                  ),
                },
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

        {/* Investor details */}
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
        </Card>
      </div>

      {/* Fees from latest position */}
      {latest && (
        <Card>
          <SectionTitle>Fees — Latest Period ({latest.dataDate})</SectionTitle>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "Mgmt Fee Total", value: fmtMoney(latest.mgmtFeeTotal, "ILS") },
              { label: "Perf Fee (Monthly)", value: fmtMoney(latest.monthlyPerfFee, "ILS") },
              { label: "Perf Fee (Cumulative)", value: fmtMoney(latest.cumulativePerfFee, "ILS") },
              { label: "Redemption Fee Payable", value: fmtMoney(latest.redemptionFeePayable, "ILS") },
              { label: "Volume Fee Payable", value: fmtMoney(latest.volumeFeePayable, "ILS") },
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

      {/* Positions history table */}
      {inv.positions.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <SectionTitle>Monthly Positions ({inv.positions.length} snapshots)</SectionTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Class", "NAV", "Orig. Inv.", "Net MTD", "Net YTD", "Net ITD", "Mgmt Fee"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 14px",
                        textAlign: h === "Date" || h === "Class" ? "start" : "end",
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
                {inv.positions.slice(0, 36).map((pos) => {
                  const nav = currency === "USD" ? pos.navUsd : pos.navNis;
                  return (
                    <tr key={pos.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 14px", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                        {pos.dataDate}
                      </td>
                      <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>
                        {pos.className ?? "—"}
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end", fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {fmtMoney(nav, currency)}
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        {fmtMoney(pos.originalInvestmentNis, "ILS")}
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end" }}>
                        <ReturnCell bps={pos.netMtdBps} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end" }}>
                        <ReturnCell bps={pos.netYtdBps} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end" }}>
                        <ReturnCell bps={pos.netItdBps} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "end", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        {fmtMoney(pos.mgmtFeeTotal, "ILS")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {inv.positions.length > 36 && (
              <div style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                Showing 36 of {inv.positions.length} snapshots
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Redemptions */}
      {inv.allRedemptions.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <SectionTitle>Redemptions / Distributions ({inv.allRedemptions.length})</SectionTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Currency", "Amount", "Investment Amt", "Distribution", "Status", "Source"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 14px",
                        textAlign: h === "Date" || h === "Currency" || h === "Status" || h === "Source" ? "start" : "end",
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
                    <td style={{ padding: "8px 14px", color: "var(--text-secondary)" }}>
                      {fmtDate(r.date)}
                    </td>
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>{r.currency}</td>
                    <td style={{ padding: "8px 14px", textAlign: "end", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", fontWeight: 600 }}>
                      {r.currency === "USD"
                        ? fmtMoney(r.amountUsd, "USD")
                        : fmtMoney(r.amountNis, "ILS")}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "end", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {r.currency === "USD"
                        ? fmtMoney(r.investmentAmountUsd, "USD")
                        : fmtMoney(r.investmentAmountNis, "ILS")}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "end", color: "#22c55e", fontVariantNumeric: "tabular-nums" }}>
                      {fmtMoney(r.distributionUsd, "USD")}
                    </td>
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>{r.status ?? "—"}</td>
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)", fontSize: 11 }}>
                      {r.sourceBoardName ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Email history */}
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
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: log.status === "sent" ? "#22c55e" : "#ef4444",
                    fontWeight: 700,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                >
                  {log.status === "sent" ? "✓" : "✗"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {log.subject}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
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
