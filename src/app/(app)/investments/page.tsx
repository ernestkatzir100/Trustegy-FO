import { Wallet, TrendingUp, Banknote, Building2 } from "lucide-react";
import { formatILS } from "@/lib/money";

/* ── Demo data ──────────────────────────────────────────── */
const DEMO_PROPERTIES = [
  { name: "דירה ברוטשילד 42, ת\"א", type: "מגורים", value: 3200000, monthlyIncome: 12000, occupancy: 100, appreciation: 8.2 },
  { name: "משרד בהרצליה פיטואח", type: "מסחרי", value: 2800000, monthlyIncome: 18000, occupancy: 95, appreciation: 5.4 },
  { name: "חנות במרכז הכרמל", type: "מסחרי", value: 1500000, monthlyIncome: 8000, occupancy: 100, appreciation: 3.1 },
];

const DEMO_PORTFOLIO = [
  { name: "קרן אג\"ח ממשלתי", category: "אג\"ח", value: 450000, allocation: 15, returnYtd: 4.2 },
  { name: "מניות ת\"א 35", category: "מניות", value: 680000, allocation: 22, returnYtd: 12.8 },
  { name: "קרן ריט USA", category: "נדל\"ן", value: 520000, allocation: 17, returnYtd: 8.5 },
  { name: "פיקדון בנק מזרחי", category: "פיקדון", value: 300000, allocation: 10, returnYtd: 3.8 },
  { name: "קרן גידור גלובלית", category: "אלטרנטיבי", value: 750000, allocation: 25, returnYtd: 15.2 },
  { name: "מטבעות דיגיטליים", category: "קריפטו", value: 180000, allocation: 6, returnYtd: -8.4 },
];

/* ── Helpers ─────────────────────────────────────────────── */
/** Convert ILS to agorot for formatILS */
function fmtILS(val: number): string {
  return formatILS(val * 100);
}

/* ── KPI definitions ─────────────────────────────────────── */
const KPI_CARDS = [
  { label: "שווי תיק", value: fmtILS(8500000), icon: Wallet, color: "#6366f1", bg: "rgba(99,102,241,0.12)", trend: null },
  { label: "תשואה שנתית", value: "+12.4%", icon: TrendingUp, color: "#0d9488", bg: "rgba(13,148,136,0.12)", trend: "+2.1%" },
  { label: "הכנסה חודשית", value: fmtILS(35000), icon: Banknote, color: "#eab308", bg: "rgba(234,179,8,0.12)", trend: null },
  { label: "מספר נכסים", value: "12", icon: Building2, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", trend: null },
];

/* ── Cell styles ─────────────────────────────────────────── */
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

/* ── Page component ──────────────────────────────────────── */
export default function InvestmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
          השקעות
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          ניהול נכסים ותיק השקעות
        </p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="card-base elev-1"
              style={{ padding: "20px 22px", borderRadius: "var(--radius-lg)" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: kpi.bg,
                  marginBottom: 14,
                }}
              >
                <Icon style={{ width: 18, height: 18, color: kpi.color }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                {kpi.label}
              </p>
              <div className="flex items-end gap-2">
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </span>
                {kpi.trend && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0d9488",
                      background: "rgba(13,148,136,0.1)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {kpi.trend}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Real Estate Section ─────────────────────────── */}
      <div>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 14,
          }}
        >
          {"נכסי נדל\"ן"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_PROPERTIES.map((prop) => (
            <div
              key={prop.name}
              className="card-base elev-1"
              style={{ padding: "20px 22px", borderRadius: "var(--radius-lg)" }}
            >
              {/* Name + type badge */}
              <div className="flex items-start justify-between gap-2" style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                  {prop.name}
                </p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: prop.type === "מגורים" ? "#6366f1" : "#3b82f6",
                    background: prop.type === "מגורים" ? "rgba(99,102,241,0.1)" : "rgba(59,130,246,0.1)",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {prop.type}
                </span>
              </div>

              {/* Value */}
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                  marginBottom: 14,
                }}
              >
                {fmtILS(prop.value)}
              </p>

              {/* Details row */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>הכנסה חודשית</span>
                  <span
                    dir="ltr"
                    style={{ fontSize: 13, fontWeight: 600, color: "var(--success)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtILS(prop.monthlyIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>תפוסה</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {prop.occupancy}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>עליית ערך</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0d9488",
                      background: "rgba(13,148,136,0.1)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    +{prop.appreciation}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial Portfolio Table ───────────────────── */}
      <div>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 14,
          }}
        >
          תיק השקעות פיננסי
        </h2>
        <div
          className="card-base elev-1"
          style={{ borderRadius: "var(--radius-lg)", overflow: "auto" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, minWidth: 160 }}>שם הנכס</th>
                <th style={{ ...headerCell, minWidth: 90 }}>קטגוריה</th>
                <th style={{ ...headerCell, minWidth: 110 }}>שווי</th>
                <th style={{ ...headerCell, minWidth: 160 }}>הקצאה %</th>
                <th style={{ ...headerCell, minWidth: 100 }}>תשואה YTD</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PORTFOLIO.map((asset) => (
                <tr key={asset.name} style={{ borderBottom: "1px solid var(--border)" }}>
                  {/* Name */}
                  <td style={{ ...cellBase, fontWeight: 600, color: "var(--text-primary)" }}>
                    {asset.name}
                  </td>

                  {/* Category badge */}
                  <td style={cellBase}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        background: "var(--bg-tint)",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {asset.category}
                    </span>
                  </td>

                  {/* Value */}
                  <td
                    dir="ltr"
                    style={{ ...cellBase, fontWeight: 600, color: "var(--text-primary)", textAlign: "start" }}
                  >
                    {fmtILS(asset.value)}
                  </td>

                  {/* Allocation with progress bar */}
                  <td style={cellBase}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          background: "var(--bg-tint)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${asset.allocation}%`,
                            height: "100%",
                            borderRadius: 3,
                            background: "var(--accent, #0d9488)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          fontVariantNumeric: "tabular-nums",
                          minWidth: 30,
                        }}
                      >
                        {asset.allocation}%
                      </span>
                    </div>
                  </td>

                  {/* Return YTD */}
                  <td style={cellBase}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: asset.returnYtd >= 0 ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {asset.returnYtd >= 0 ? "+" : ""}{asset.returnYtd}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
