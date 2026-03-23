import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { formatILS } from "@/lib/money";

/* ── Demo data (no DB table yet) ────────────────────────── */
const DEMO_PROJECTS = [
  { name: "בניין רוטשילד 42", client: "קבוצת לוי", budget: 2500000, progress: 65, status: "active" },
  { name: "פרויקט השקעות צפון", client: "אחזקות כהן", budget: 1800000, progress: 30, status: "proposal" },
  { name: 'מגדל עזריאלי - קומה 40', client: 'נדל"ן ישראל', budget: 4200000, progress: 100, status: "completed" },
  { name: "תיק השקעות גלובלי", client: "משפחת דוד", budget: 3500000, progress: 85, status: "active" },
  { name: "ליווי עסקה דרום", client: "קבוצת אברהם", budget: 950000, progress: 15, status: "lead" },
  { name: "מימון פרויקט מרכז", client: "השקעות שלום", budget: 1200000, progress: 0, status: "cancelled" },
];

const COLUMNS: { key: string; label: string; color: string }[] = [
  { key: "lead", label: "ליד", color: "var(--text-muted)" },
  { key: "proposal", label: "הצעה", color: "var(--warning)" },
  { key: "active", label: "פעיל", color: "var(--accent)" },
  { key: "completed", label: "הושלם", color: "var(--success)" },
  { key: "cancelled", label: "בוטל", color: "var(--danger)" },
];

/* ── Badge color helper ─────────────────────────────────── */
function badgeStyle(status: string) {
  const map: Record<string, { bg: string; fg: string }> = {
    lead: { bg: "var(--bg-muted)", fg: "var(--text-muted)" },
    proposal: { bg: "var(--warning-subtle)", fg: "var(--warning)" },
    active: { bg: "var(--accent-subtle)", fg: "var(--accent)" },
    completed: { bg: "var(--success-subtle)", fg: "var(--success)" },
    cancelled: { bg: "var(--danger-subtle)", fg: "var(--danger)" },
  };
  return map[status] ?? map.lead;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    lead: "ליד",
    proposal: "הצעה",
    active: "פעיל",
    completed: "הושלם",
    cancelled: "בוטל",
  };
  return map[status] ?? status;
}

export default async function ProjectsPage() {
  void (await getTranslations("modules"));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            פרויקטים
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            ניהול פרויקטים ועסקאות
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
          פרויקט חדש
        </button>
      </div>

      {/* ── Kanban Board ────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          minHeight: 400,
        }}
      >
        {COLUMNS.map((col) => {
          const cards = DEMO_PROJECTS.filter((p) => p.status === col.key);
          return (
            <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Column header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  borderBottom: `2px solid ${col.color}`,
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    background: "var(--bg-muted)",
                    borderRadius: "var(--radius-full)",
                    padding: "2px 8px",
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              {cards.map((project) => {
                const badge = badgeStyle(project.status);
                return (
                  <div
                    key={project.name}
                    className="card-base elev-1"
                    style={{
                      padding: 14,
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    {/* Project name */}
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {project.name}
                    </span>

                    {/* Client */}
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {project.client}
                    </span>

                    {/* Budget */}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                      {formatILS(project.budget * 100)}
                    </span>

                    {/* Progress bar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div
                        style={{
                          width: "100%",
                          height: 4,
                          borderRadius: "var(--radius-full)",
                          background: "var(--bg-muted)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${project.progress}%`,
                            height: "100%",
                            borderRadius: "var(--radius-full)",
                            background: "var(--accent)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "start" }}>
                        {project.progress}%
                      </span>
                    </div>

                    {/* Status badge */}
                    <span
                      style={{
                        alignSelf: "flex-start",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 10px",
                        borderRadius: "var(--radius-full)",
                        background: badge.bg,
                        color: badge.fg,
                      }}
                    >
                      {statusLabel(project.status)}
                    </span>
                  </div>
                );
              })}

              {cards.length === 0 && (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  אין פרויקטים
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
