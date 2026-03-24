"use client";

import type { LucideIcon } from "lucide-react";

/* ── Mini bar chart (Stitch style) ── */
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 40, width: "100%" }}>
      {data.map((v, i) => {
        const pct = max > 0 ? (v / max) * 100 : 0;
        const opacity = 0.15 + (i / (data.length - 1)) * 0.85;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${pct}%`,
              background: color,
              opacity,
              borderRadius: "2px 2px 0 0",
              minHeight: 2,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Types ── */
interface KpiCardProps {
  label: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  sparkData?: number[];
  accentColor?: string;
}

export function KpiCard({
  label,
  value,
  trend,
  trendType = "up",
  icon: Icon,
  sparkData,
  accentColor = "var(--accent)",
}: KpiCardProps) {
  const trendBg = trendType === "down" ? "var(--danger-subtle)" : "var(--accent-subtle)";
  const trendColor = trendType === "down" ? "var(--danger)" : "var(--accent)";

  return (
    <div
      className="card-base relative overflow-hidden group"
      style={{ padding: "var(--space-card)" }}
    >
      {/* Sparkline hover gradient — Stitch style */}
      <div
        className="absolute inset-x-0 bottom-0 h-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,104,95,0.08) 50%, transparent 100%)" }}
      />
      {/* Top: icon + trend badge */}
      <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
        <div
          style={{
            padding: 12,
            borderRadius: "var(--radius-xl)",
            background: "var(--accent-subtle)",
            color: "var(--accent)",
          }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
        {trend && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: trendColor,
              background: trendBg,
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Label */}
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </p>

      {/* Value — large bold */}
      <h3
        className="num"
        dir="ltr"
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: 16,
        }}
      >
        {value}
      </h3>

      {/* Mini bar chart */}
      {sparkData && sparkData.length >= 2 && (
        <MiniBarChart data={sparkData} color={accentColor === "var(--accent)" ? "#00685f" : accentColor} />
      )}
    </div>
  );
}
