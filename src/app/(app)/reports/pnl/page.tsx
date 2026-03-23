import { formatILS } from "@/lib/money";

/* ── Demo data (values in thousands ILS) ────────────────── */
const MONTHS = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצ"];

const DEMO_PNL = {
  revenue: {
    consulting: [120, 135, 110, 145, 130, 140, 125, 150, 160, 155, 145, 170],
    investments: [80, 75, 90, 85, 95, 88, 92, 98, 105, 110, 100, 115],
    fees: [25, 30, 28, 35, 32, 38, 30, 42, 45, 40, 38, 48],
  },
  expenses: {
    salary: [65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65],
    office: [12, 10, 15, 11, 13, 10, 14, 12, 11, 13, 10, 15],
    professional: [20, 18, 25, 22, 28, 20, 24, 19, 22, 25, 18, 30],
    other: [8, 5, 10, 7, 9, 6, 8, 5, 7, 10, 6, 12],
  },
};

const YEARS = ["2024", "2025", "2026"];

/* ── Helpers ────────────────────────────────────────────── */
function sumRow(row: number[]): number {
  return row.reduce((a, b) => a + b, 0);
}

function sumRows(...rows: number[][]): number[] {
  return rows[0].map((_, i) => rows.reduce((sum, row) => sum + row[i], 0));
}

/** Format thousands of ILS — values are already in ₪K, so multiply by 1000 * 100 for agorot */
function fmt(val: number): string {
  return formatILS(val * 1000 * 100);
}

function fmtNeg(val: number): string {
  if (val < 0) return `(${formatILS(Math.abs(val) * 1000 * 100)})`;
  return formatILS(val * 1000 * 100);
}

/* ── Computed rows ──────────────────────────────────────── */
const totalRevenue = sumRows(DEMO_PNL.revenue.consulting, DEMO_PNL.revenue.investments, DEMO_PNL.revenue.fees);
const totalExpenses = sumRows(DEMO_PNL.expenses.salary, DEMO_PNL.expenses.office, DEMO_PNL.expenses.professional, DEMO_PNL.expenses.other);
const grossProfit = totalRevenue.map((r, i) => r - totalExpenses[i]);
const taxes = grossProfit.map((g) => Math.round(g * 0.3));
const netProfit = grossProfit.map((g, i) => g - taxes[i]);

/* ── Cell style helpers ─────────────────────────────────── */
const cellBase: React.CSSProperties = {
  fontSize: 13,
  fontVariantNumeric: "tabular-nums",
  padding: "8px 10px",
  textAlign: "start",
  whiteSpace: "nowrap",
};

const headerCell: React.CSSProperties = {
  ...cellBase,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border)",
};


/* ── Component ──────────────────────────────────────────── */
export default function PnlReportPage() {
  function renderRow(
    label: string,
    data: number[],
    opts?: { bold?: boolean; color?: string; large?: boolean; separator?: boolean }
  ) {
    const total = sumRow(data);
    const color = opts?.color ?? "var(--text-primary)";
    return (
      <tr
        style={
          opts?.separator
            ? { borderTop: "2px solid var(--border-strong)" }
            : undefined
        }
      >
        <td
          style={{
            ...cellBase,
            fontWeight: opts?.bold ? 700 : 500,
            fontSize: opts?.large ? 15 : 13,
            color,
            paddingInlineStart: opts?.bold ? 10 : 22,
            position: "sticky",
            insetInlineStart: 0,
            background: "var(--surface-card)",
            zIndex: 1,
          }}
        >
          {label}
        </td>
        {data.map((val, i) => (
          <td
            key={i}
            dir="ltr"
            style={{
              ...cellBase,
              fontWeight: opts?.bold ? 700 : 400,
              fontSize: opts?.large ? 15 : 13,
              color: val < 0 ? "var(--danger)" : color,
            }}
          >
            {val < 0 ? fmtNeg(val) : fmt(val)}
          </td>
        ))}
        <td
          dir="ltr"
          style={{
            ...cellBase,
            fontWeight: 700,
            fontSize: opts?.large ? 15 : 13,
            color: total < 0 ? "var(--danger)" : color,
            background: "var(--bg-subtle)",
          }}
        >
          {total < 0 ? fmtNeg(total) : fmt(total)}
        </td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
          דוח רווח והפסד
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          סיכום פיננסי שנתי
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

      {/* ── P&L Table ─────────────────────────────────── */}
      <div
        className="card-base elev-1"
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              <th
                style={{
                  ...headerCell,
                  position: "sticky",
                  insetInlineStart: 0,
                  background: "var(--surface-card)",
                  zIndex: 2,
                  minWidth: 140,
                }}
              />
              {MONTHS.map((m) => (
                <th key={m} style={{ ...headerCell, minWidth: 80 }}>
                  {m}
                </th>
              ))}
              <th style={{ ...headerCell, minWidth: 100, background: "var(--bg-subtle)" }}>
                {'סה"כ'}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ── Revenue section ───────────────────────── */}
            <tr>
              <td
                colSpan={14}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                  padding: "12px 10px 6px",
                  background: "var(--accent-subtle)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                הכנסות
              </td>
            </tr>
            {renderRow("שירותי ייעוץ", DEMO_PNL.revenue.consulting)}
            {renderRow("ניהול השקעות", DEMO_PNL.revenue.investments)}
            {renderRow("עמלות", DEMO_PNL.revenue.fees)}
            {renderRow('סה"כ הכנסות', totalRevenue, { bold: true, color: "var(--accent)" })}

            {/* ── Expenses section ──────────────────────── */}
            <tr>
              <td
                colSpan={14}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  padding: "12px 10px 6px",
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                הוצאות
              </td>
            </tr>
            {renderRow("משכורות", DEMO_PNL.expenses.salary)}
            {renderRow("משרד", DEMO_PNL.expenses.office)}
            {renderRow("מקצועי", DEMO_PNL.expenses.professional)}
            {renderRow("אחר", DEMO_PNL.expenses.other)}
            {renderRow('סה"כ הוצאות', totalExpenses, { bold: true })}

            {/* ── Profit rows ───────────────────────────── */}
            {renderRow("רווח גולמי", grossProfit, { bold: true, color: "var(--success)", separator: true })}
            {renderRow("מיסים (30%)", taxes)}
            {renderRow("רווח נקי", netProfit, { bold: true, color: "var(--success)", large: true, separator: true })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
