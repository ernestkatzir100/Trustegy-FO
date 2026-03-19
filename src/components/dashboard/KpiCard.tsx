"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

type Status = "healthy" | "attention" | "urgent";

interface KpiCardProps {
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  status?: Status;
  statusText?: string;
  icon?: ReactNode;
}

const statusStyles: Record<Status, { bg: string; color: string; dot: string }> = {
  healthy: { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
  attention: { bg: "#fef9c3", color: "#a16207", dot: "#a16207" },
  urgent: { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
};

export function KpiCard({
  label,
  value,
  changePercent,
  changeLabel,
  status = "healthy",
  statusText,
  icon,
}: KpiCardProps) {
  const isPositive = changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent < 0;
  const st = statusStyles[status];

  return (
    <div className="dashboard-card flex flex-col justify-between" style={{ padding: "20px 22px", minHeight: 136 }}>
      {/* Top: label + icon */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.45)", letterSpacing: "0.1px" }}>
          {label}
        </span>
        {icon && (
          <div style={{ opacity: 0.35 }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="font-mono"
        dir="ltr"
        style={{ fontSize: 30, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.1 }}
      >
        {value}
      </div>

      {/* Bottom: trend + status */}
      <div className="flex items-center justify-between">
        {changePercent !== undefined && (
          <div
            className="flex items-center gap-1"
            style={{ fontSize: 12, color: isPositive ? "#16a34a" : isNegative ? "#dc2626" : "rgba(0,0,0,0.35)" }}
          >
            {isPositive ? (
              <TrendingUp style={{ width: 14, height: 14 }} />
            ) : isNegative ? (
              <TrendingDown style={{ width: 14, height: 14 }} />
            ) : (
              <Minus style={{ width: 14, height: 14 }} />
            )}
            <span dir="ltr">{isPositive ? "+" : ""}{changePercent}%</span>
            {changeLabel && (
              <span style={{ color: "rgba(0,0,0,0.35)", marginInlineStart: 4 }}>{changeLabel}</span>
            )}
          </div>
        )}

        {statusText && (
          <div
            className="flex items-center gap-1.5"
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 20,
              letterSpacing: "0.1px",
              background: st.bg,
              color: st.color,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
            {statusText}
          </div>
        )}
      </div>
    </div>
  );
}
