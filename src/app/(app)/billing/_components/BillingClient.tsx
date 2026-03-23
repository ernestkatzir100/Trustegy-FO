"use client";

import { useState } from "react";
import { formatILS } from "@/lib/money";

/* ── Types ──────────────────────────────────────────────── */
export type MilestoneStatus = "paid" | "billed" | "pending" | "cancelled";

export interface Milestone {
  project: string;
  stage: string;
  date: string;
  amount: number;      // ILS (not agorot)
  vat: number;         // ILS
  status: MilestoneStatus;
  invoice: string | null;
}

/* ── Status helpers ─────────────────────────────────────── */
const STATUS_CONFIG: Record<MilestoneStatus, { label: string; bg: string; fg: string }> = {
  pending:   { label: "ממתין", bg: "var(--warning-subtle)", fg: "var(--warning)" },
  billed:    { label: "חויב",  bg: "rgba(59,130,246,0.12)", fg: "#3b82f6" },
  paid:      { label: "שולם",  bg: "var(--success-subtle)", fg: "var(--success)" },
  cancelled: { label: "בוטל",  bg: "var(--danger-subtle)",  fg: "var(--danger)" },
};

const TABS: { key: "all" | MilestoneStatus; label: string }[] = [
  { key: "all",     label: "הכל" },
  { key: "pending", label: "ממתין" },
  { key: "billed",  label: "חויב" },
  { key: "paid",    label: "שולם" },
];

/* ── Component ──────────────────────────────────────────── */
export function BillingClient({ milestones }: { milestones: Milestone[] }) {
  const [activeTab, setActiveTab] = useState<"all" | MilestoneStatus>("all");

  const filtered = activeTab === "all"
    ? milestones
    : milestones.filter((m) => m.status === activeTab);

  /* KPI calculations */
  const totalPending = milestones
    .filter((m) => m.status === "pending")
    .reduce((s, m) => s + m.amount + m.vat, 0);
  const totalBilled = milestones
    .filter((m) => m.status === "billed")
    .reduce((s, m) => s + m.amount + m.vat, 0);
  const totalPaid = milestones
    .filter((m) => m.status === "paid")
    .reduce((s, m) => s + m.amount + m.vat, 0);

  const countByStatus = (key: "all" | MilestoneStatus) =>
    key === "all" ? milestones.length : milestones.filter((m) => m.status === key).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Tabs ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", padding: 3 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                background: isActive ? "var(--surface-card)" : "transparent",
                border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: "var(--radius-full)",
                  background: isActive ? "var(--accent-subtle)" : "var(--bg-muted)",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {countByStatus(tab.key)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── KPI Cards ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {/* Pending */}
        <div
          className="card-base elev-1"
          style={{ padding: 18, borderRadius: "var(--radius-md)", borderInlineStart: "3px solid var(--warning)" }}
        >
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>סה&quot;כ ממתין</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--warning)", margin: "6px 0 0" }}>
            {formatILS(totalPending * 100)}
          </p>
        </div>

        {/* Billed */}
        <div
          className="card-base elev-1"
          style={{ padding: 18, borderRadius: "var(--radius-md)", borderInlineStart: "3px solid #3b82f6" }}
        >
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>סה&quot;כ חויב</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#3b82f6", margin: "6px 0 0" }}>
            {formatILS(totalBilled * 100)}
          </p>
        </div>

        {/* Paid */}
        <div
          className="card-base elev-1"
          style={{ padding: 18, borderRadius: "var(--radius-md)", borderInlineStart: "3px solid var(--success)" }}
        >
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>סה&quot;כ שולם</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--success)", margin: "6px 0 0" }}>
            {formatILS(totalPaid * 100)}
          </p>
        </div>
      </div>

      {/* ── Data Table ───────────────────────────────── */}
      <div
        className="card-base elev-1"
        style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-subtle)" }}>
              {["פרויקט", "שלב", "תאריך", "סכום", 'מע"מ', 'סה"כ', "סטטוס", "חשבונית"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textAlign: "start",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => {
              const cfg = STATUS_CONFIG[m.status];
              const total = m.amount + m.vat;
              return (
                <tr
                  key={`${m.project}-${m.stage}-${i}`}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {m.project}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                    {m.stage}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)", direction: "ltr", unicodeBidi: "embed" }}>
                    {new Date(m.date).toLocaleDateString("he-IL")}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {formatILS(m.amount * 100)}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                    {formatILS(m.vat * 100)}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {formatILS(total * 100)}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 10px",
                        borderRadius: "var(--radius-full)",
                        background: cfg.bg,
                        color: cfg.fg,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: m.invoice ? "var(--accent)" : "var(--text-muted)", fontWeight: 500 }}>
                    {m.invoice ?? "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}
                >
                  אין רשומות להצגה
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
