import { getInvestorQAData } from "@/lib/actions/investors";
import type { QAInvestorRow } from "@/lib/actions/investors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Check({ ok, warn }: { ok: boolean; warn?: boolean }) {
  if (ok) return <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>;
  if (warn) return <span style={{ color: "#eab308", fontSize: 14 }}>⚠</span>;
  return <span style={{ color: "#ef4444", fontSize: 14 }}>✗</span>;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#22c55e" : score >= 70 ? "#eab308" : "#ef4444";
  const label = score >= 90 ? "Good" : score >= 70 ? "Needs attention" : "Action required";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {score}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
          QA Score
        </div>
        <div style={{ fontSize: 13, color, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

function CoverageBar({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = pct === 100 ? "#22c55e" : pct >= 85 ? "#eab308" : "#ef4444";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color }}>
          {value}/{total}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function IssuePill({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 4,
        background: "rgba(239,68,68,0.12)",
        color: "#ef4444",
        whiteSpace: "nowrap",
        marginInlineEnd: 4,
        marginBottom: 2,
      }}
    >
      {text}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 100,
        background: isActive ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
        color: isActive ? "#22c55e" : "#6b7280",
      }}
    >
      {status}
    </span>
  );
}

// ─── Issues Table ─────────────────────────────────────────────────────────────

function IssuesTable({ rows }: { rows: QAInvestorRow[] }) {
  const withIssues = rows.filter((r) => r.issues.length > 0);

  if (withIssues.length === 0) {
    return (
      <div
        style={{
          padding: "32px 24px",
          textAlign: "center",
          color: "#22c55e",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        ✓ No issues found — data is clean
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-elevated)" }}>
            {["Investor", "Partner ID", "Issues", "Status", "Last Position"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: "start",
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
          {withIssues.map((row) => (
            <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{row.nameEn}</div>
                {row.nameHe && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", direction: "rtl", textAlign: "start" }}>
                    {row.nameHe}
                  </div>
                )}
              </td>
              <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
                {row.partnerId ?? <span style={{ color: "#ef4444" }}>—</span>}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {row.issues.map((issue) => (
                    <IssuePill key={issue} text={issue} />
                  ))}
                </div>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <StatusPill status={row.status} />
              </td>
              <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
                {row.lastPositionDate ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Full Completeness Matrix ─────────────────────────────────────────────────

function CompletenessMatrix({ rows }: { rows: QAInvestorRow[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-elevated)" }}>
            {["Investor", "Partner ID", "Heb. Name", "Email", "Nov '25", "Status", "# Positions", "Last Date"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 12px",
                  textAlign: "start",
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
          {rows.map((row) => (
            <tr
              key={row.id}
              style={{
                borderBottom: "1px solid var(--border)",
                background: row.issues.length > 0 ? "rgba(239,68,68,0.03)" : undefined,
              }}
            >
              <td style={{ padding: "8px 12px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                  {row.nameEn}
                </div>
                {row.nameHe && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", direction: "rtl", textAlign: "start" }}>
                    {row.nameHe}
                  </div>
                )}
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                <Check ok={row.hasPartnerIdFlag} />
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                <Check ok={row.hasNameHeFlag} />
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                <Check ok={row.hasEmailFlag} warn={!row.hasEmailFlag} />
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                {row.status === "inactive"
                  ? <span style={{ fontSize: 12, color: "var(--text-muted)" }}>n/a</span>
                  : <Check ok={row.hasNov25Position} />
                }
              </td>
              <td style={{ padding: "8px 12px" }}>
                <StatusPill status={row.status} />
              </td>
              <td style={{ padding: "8px 12px", textAlign: "end", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)", fontFamily: "monospace" }}>
                {row.positionCount}
              </td>
              <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                {row.lastPositionDate ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvestorQAPage() {
  const result = await getInvestorQAData();

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

  const { investors: rows, summary, latestImportDate } = result.data;
  const issueCount = rows.filter((r) => r.issues.length > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Data Quality — Investor Register
          {latestImportDate && (
            <span style={{ marginInlineStart: 8, fontFamily: "monospace" }}>
              · latest data: {latestImportDate}
            </span>
          )}
        </div>
      </div>

      {/* Score + Coverage */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

        {/* Score card */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            gap: 32,
            flex: "0 0 auto",
          }}
        >
          <ScoreBadge score={summary.score} />
          <div style={{ width: 1, height: 48, background: "var(--border)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{summary.total}</span> total investors
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>{summary.active}</span> active
              {summary.inactive > 0 && (
                <span style={{ color: "#6b7280" }}> · {summary.inactive} inactive</span>
              )}
            </div>
            {issueCount > 0 && (
              <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
                ⚠ {issueCount} investor{issueCount !== 1 ? "s" : ""} with issues
              </div>
            )}
          </div>
        </div>

        {/* Coverage bars */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            padding: "20px 24px",
            flex: 1,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>
            Field Coverage
          </div>
          <CoverageBar value={summary.hasPartnerId} total={summary.total} label="Partner ID (APEX key)" />
          <CoverageBar value={summary.hasNameEn} total={summary.total} label="English name" />
          <CoverageBar value={summary.hasNameHe} total={summary.total} label="Hebrew name" />
          <CoverageBar value={summary.hasEmail} total={summary.total} label="Email address" />
          <CoverageBar value={summary.hasNov25} total={summary.active} label="Nov 2025 position data" />
        </div>
      </div>

      {/* Issues */}
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: issueCount > 0 ? "1px solid rgba(239,68,68,0.3)" : "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: issueCount > 0 ? "#ef4444" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {issueCount > 0 ? `⚠ ${issueCount} Investors Need Attention` : "✓ Issues"}
        </div>
        <IssuesTable rows={rows} />
      </div>

      {/* Full completeness matrix */}
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
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
          }}
        >
          Full Register — Completeness Matrix
        </div>
        <CompletenessMatrix rows={rows} />
      </div>

    </div>
  );
}
