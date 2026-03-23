import { Plus, Users, UserCheck, TrendingUp, BarChart3 } from "lucide-react";
import { formatILS } from "@/lib/money";

/* ── Demo data (no DB table yet) ────────────────────────── */
const DEMO_CLIENTS = [
  { name: "קבוצת לוי", contact: "יוסי לוי", revenue: 1200000, projects: 3, status: "active" },
  { name: "אחזקות כהן", contact: "דניאל כהן", revenue: 850000, projects: 2, status: "active" },
  { name: 'נדל"ן ישראל', contact: "שרה ישראלי", revenue: 2100000, projects: 1, status: "active" },
  { name: "משפחת דוד", contact: "אברהם דוד", revenue: 1500000, projects: 4, status: "active" },
  { name: "קבוצת אברהם", contact: "משה אברהם", revenue: 450000, projects: 1, status: "inactive" },
  { name: "השקעות שלום", contact: "רחל שלום", revenue: 680000, projects: 2, status: "active" },
];

const totalClients = DEMO_CLIENTS.length;
const activeClients = DEMO_CLIENTS.filter((c) => c.status === "active").length;
const totalRevenue = DEMO_CLIENTS.reduce((sum, c) => sum + c.revenue, 0);
const avgRevenue = Math.round(totalRevenue / totalClients);

const KPI_CARDS = [
  { label: 'סה"כ לקוחות', value: totalClients.toString(), icon: Users },
  { label: "לקוחות פעילים", value: activeClients.toString(), icon: UserCheck },
  { label: "הכנסות מצטברות", value: formatILS(totalRevenue * 100), icon: TrendingUp },
  { label: "ממוצע ללקוח", value: formatILS(avgRevenue * 100), icon: BarChart3 },
];

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            לקוחות
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            ניהול לקוחות ופרויקטים
          </p>
        </div>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          לקוח חדש
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="card-base elev-1"
            style={{
              padding: 18,
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-sm)",
                background: "var(--accent-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <kpi.icon size={20} style={{ color: "var(--accent)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                {kpi.label}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {kpi.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Client Cards Grid ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {DEMO_CLIENTS.map((client) => {
          const initial = client.name.charAt(0);
          const isActive = client.status === "active";
          return (
            <div
              key={client.name}
              className="card-base elev-1"
              style={{
                padding: 18,
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                cursor: "pointer",
              }}
            >
              {/* Top: Avatar + Name + Contact */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-full)",
                    background: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    {client.name}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {client.contact}
                  </span>
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>הכנסות</span>
                  <span
                    dir="ltr"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--success)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatILS(client.revenue * 100)}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>פרויקטים</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {client.projects}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span
                style={{
                  alignSelf: "flex-start",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: "var(--radius-full)",
                  background: isActive ? "var(--success-subtle)" : "var(--bg-muted)",
                  color: isActive ? "var(--success)" : "var(--text-muted)",
                }}
              >
                {isActive ? "פעיל" : "לא פעיל"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
