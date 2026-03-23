"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Inline SVG sparkline — zero dependencies ── */
function Sparkline({
  data,
  color,
  width = 72,
  height = 28,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * height,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    `M ${points[0].x} ${height} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline"
    >
      <path d={areaPath} fill={color} className="sparkline-area" />
      <path d={linePath} stroke={color} className="sparkline-line" />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={color}
      />
    </svg>
  );
}

/* ── Types ── */
type Status = "ok" | "warning" | "danger";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  status?: Status;
  sparkData?: number[];
  accentColor?: string;
}

const statusStyles: Record<Status, { dot: string; bg: string; text: string; label: string }> = {
  ok: { dot: "#22c55e", bg: "rgba(34,197,94,0.15)", text: "#22c55e", label: "תקין" },
  warning: { dot: "#f59e0b", bg: "rgba(245,158,11,0.15)", text: "#f59e0b", label: "דורש תשומת לב" },
  danger: { dot: "#ef4444", bg: "rgba(239,68,68,0.15)", text: "#ef4444", label: "דחוף" },
};

export function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  status,
  sparkData,
  accentColor = "#0d9488",
}: KpiCardProps) {
  const trendUp = trend !== undefined && trend >= 0;
  const trendColor = trend === undefined ? "#94a3b8" : trendUp ? "#22c55e" : "#ef4444";
  const trendBg = trend === undefined ? "rgba(148,163,184,0.15)" : trendUp ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)";
  const st = status ? statusStyles[status] : null;

  return (
    <div
      className="card-base elev-1"
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: 144,
      }}
    >
      {/* Top: label + icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            letterSpacing: "0.1px",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${accentColor}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} strokeWidth={2} style={{ color: accentColor }} />
        </div>
      </div>

      {/* Value */}
      <div
        className="num"
        dir="ltr"
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        {value}
      </div>

      {/* Bottom: trend/status + sparkline */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {st ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: st.bg,
                color: st.text,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 20,
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: st.dot,
                  flexShrink: 0,
                }}
              />
              {st.label}
            </span>
          ) : trend !== undefined ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: trendBg,
                color: trendColor,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 20,
                width: "fit-content",
              }}
            >
              {trendUp ? (
                <TrendingUp size={11} strokeWidth={2.5} />
              ) : (
                <TrendingDown size={11} strokeWidth={2.5} />
              )}
              <span dir="ltr">
                {trendUp ? "+" : ""}
                {trend}%
              </span>
            </span>
          ) : null}

          {trendLabel && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
                fontWeight: 400,
              }}
            >
              {trendLabel}
            </span>
          )}
        </div>

        {sparkData && sparkData.length >= 2 && (
          <Sparkline data={sparkData} color={accentColor} width={72} height={28} />
        )}
      </div>
    </div>
  );
}
