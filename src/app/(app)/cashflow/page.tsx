import { formatILS } from "@/lib/money";
import { CashflowChart } from "./_components/CashflowChart";

/* ── Demo data ──────────────────────────────────────────── */
const DEMO_CASHFLOW = [
  { month: "ינואר", recognition: 225000, actual: 210000, expenses: 105000 },
  { month: "פברואר", recognition: 240000, actual: 195000, expenses: 98000 },
  { month: "מרץ", recognition: 228000, actual: 250000, expenses: 115000 },
  { month: "אפריל", recognition: 265000, actual: 230000, expenses: 105000 },
  { month: "מאי", recognition: 257000, actual: 245000, expenses: 115000 },
  { month: "יוני", recognition: 266000, actual: 260000, expenses: 101000 },
  { month: "יולי", recognition: 247000, actual: 235000, expenses: 111000 },
  { month: "אוגוסט", recognition: 290000, actual: 280000, expenses: 102000 },
  { month: "ספטמבר", recognition: 310000, actual: 295000, expenses: 105000 },
  { month: "אוקטובר", recognition: 305000, actual: 275000, expenses: 113000 },
  { month: "נובמבר", recognition: 283000, actual: 260000, expenses: 99000 },
  { month: "דצמבר", recognition: 333000, actual: 320000, expenses: 127000 },
];

const YEARS = ["2024", "2025", "2026"];

/* ── Helpers ────────────────────────────────────────────── */
/** Convert ILS to agorot for formatILS */
function fmtILS(val: number): string {
  return formatILS(val * 100);
}

/* ── Computed totals ────────────────────────────────────── */
const totals = DEMO_CASHFLOW.reduce(
  (acc, row) => ({
    recognition: acc.recognition + row.recognition,
    actual: acc.actual + row.actual,
    expenses: acc.expenses + row.expenses,
  }),
  { recognition: 0, actual: 0, expenses: 0 }
);
const totalsNet = totals.actual - totals.expenses;

/* ── Cell styles ────────────────────────────────────────── */
const cellBase: React.CSSProperties = {
  fontSize: 13,
  fontVariantNumeric: "tabular-nums",
  padding: "10px 12px",
  whiteSpace: "nowrap",
};

const headerCell: React.CSSProperties = {
  ...cellBase,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  borderBottom: "2px solid var(--border)",
  textAlign: "start",
};

export default function CashflowPage() {
  let cumulative = 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
          תזרים מזומנים
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          מעקב תזרים חודשי
        </p>
      </div>

      {/* ── Year selector ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 4 }}>
        {YEARS.map((year) => (
          <button
            key={year}
            style={{
              padding: "6px 18px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border)",
              background: year === "2026" ? "var(--accent)" : "var(--surface-card)",
              color: year === "2026" ? "#fff" : "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* ── Cashflow Table ────────────────────────────── */}
      <div
        className="card-base elev-1"
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, minWidth: 90 }}>חודש</th>
              <th style={{ ...headerCell, minWidth: 110, color: "#3b82f6" }}>הכרה</th>
              <th style={{ ...headerCell, minWidth: 110, color: "var(--success)" }}>בפועל</th>
              <th style={{ ...headerCell, minWidth: 110, color: "var(--danger)" }}>הוצאות</th>
              <th style={{ ...headerCell, minWidth: 110 }}>נטו</th>
              <th style={{ ...headerCell, minWidth: 110 }}>מצטבר</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_CASHFLOW.map((row) => {
              const net = row.actual - row.expenses;
              cumulative += net;
              return (
                <tr
                  key={row.month}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ ...cellBase, fontWeight: 600, color: "var(--text-primary)" }}>
                    {row.month}
                  </td>
                  <td dir="ltr" style={{ ...cellBase, color: "#3b82f6", textAlign: "start" }}>
                    {fmtILS(row.recognition)}
                  </td>
                  <td dir="ltr" style={{ ...cellBase, color: "var(--success)", textAlign: "start" }}>
                    {fmtILS(row.actual)}
                  </td>
                  <td dir="ltr" style={{ ...cellBase, color: "var(--danger)", textAlign: "start" }}>
                    {fmtILS(row.expenses)}
                  </td>
                  <td
                    dir="ltr"
                    style={{
                      ...cellBase,
                      fontWeight: 700,
                      color: net >= 0 ? "var(--success)" : "var(--danger)",
                      textAlign: "start",
                    }}
                  >
                    {net < 0 ? `(${fmtILS(Math.abs(net))})` : fmtILS(net)}
                  </td>
                  <td
                    dir="ltr"
                    style={{
                      ...cellBase,
                      fontWeight: 700,
                      color: cumulative >= 0 ? "var(--success)" : "var(--danger)",
                      textAlign: "start",
                    }}
                  >
                    {cumulative < 0 ? `(${fmtILS(Math.abs(cumulative))})` : fmtILS(cumulative)}
                  </td>
                </tr>
              );
            })}

            {/* ── Total row ───────────────────────────── */}
            <tr
              style={{
                borderTop: "2px solid var(--border-strong)",
                background: "var(--bg-subtle)",
              }}
            >
              <td style={{ ...cellBase, fontWeight: 700, color: "var(--text-primary)" }}>
                {'סה"כ'}
              </td>
              <td dir="ltr" style={{ ...cellBase, fontWeight: 700, color: "#3b82f6", textAlign: "start" }}>
                {fmtILS(totals.recognition)}
              </td>
              <td dir="ltr" style={{ ...cellBase, fontWeight: 700, color: "var(--success)", textAlign: "start" }}>
                {fmtILS(totals.actual)}
              </td>
              <td dir="ltr" style={{ ...cellBase, fontWeight: 700, color: "var(--danger)", textAlign: "start" }}>
                {fmtILS(totals.expenses)}
              </td>
              <td
                dir="ltr"
                style={{
                  ...cellBase,
                  fontWeight: 700,
                  color: totalsNet >= 0 ? "var(--success)" : "var(--danger)",
                  textAlign: "start",
                }}
              >
                {totalsNet < 0 ? `(${fmtILS(Math.abs(totalsNet))})` : fmtILS(totalsNet)}
              </td>
              <td
                dir="ltr"
                style={{
                  ...cellBase,
                  fontWeight: 700,
                  color: cumulative >= 0 ? "var(--success)" : "var(--danger)",
                  textAlign: "start",
                }}
              >
                {fmtILS(cumulative)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cashflow Chart */}
      <CashflowChart data={DEMO_CASHFLOW} />
    </div>
  );
}
