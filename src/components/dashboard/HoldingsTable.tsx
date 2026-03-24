"use client";

import { formatILS } from "@/lib/money";

export interface Holding {
  name: string;
  category: string;
  value: number;
  returnPercent: number;
  status: "active" | "pending" | "watching";
}

interface HoldingsTableProps {
  holdings: Holding[];
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "פעיל", bg: "var(--accent-teal-subtle)", color: "var(--accent)" },
  pending: { label: "בהמתנה", bg: "var(--status-amber-bg)", color: "#f59e0b" },
  watching: { label: "במעקב", bg: "var(--bg-muted)", color: "#94a3b8" },
};

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="card-base elev-1 overflow-hidden xl:col-span-3">
      <div
        className="flex justify-between items-center"
        style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          פירוט החזקות
        </h3>
        <button
          type="button"
          className="flex items-center gap-1 transition-colors"
          style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}
        >
          צפה בכל הנכסים ←
        </button>
      </div>

      <table className="w-full text-start" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg-subtle)" }}>
            {["שם הנכס", "קטגוריה", "שווי נוכחי", "תשואה כוללת", "סטטוס"].map((header) => (
              <th
                key={header}
                style={{
                  padding: "12px 24px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.5px",
                  textAlign: "start",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, i) => {
            const st = statusConfig[holding.status];
            return (
              <tr
                key={i}
                className="transition-colors"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
                  {holding.name}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {holding.category}
                </td>
                <td className="num" dir="ltr" style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
                  {formatILS(holding.value)}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span
                    dir="ltr"
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: holding.returnPercent >= 5 ? "var(--accent)" : holding.returnPercent >= 0 ? "#94a3b8" : "#ef4444",
                    }}
                  >
                    {holding.returnPercent >= 0 ? "+" : ""}{holding.returnPercent}%
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      background: st.bg,
                      color: st.color,
                    }}
                  >
                    {st.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
