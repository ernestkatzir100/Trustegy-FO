"use client";

import { useState } from "react";

const TIME_RANGES = [
  { key: "1y", label: "שנה אחת" },
  { key: "3y", label: "3 שנים" },
  { key: "all", label: "הכל" },
] as const;

export function PerformanceChart() {
  const [activeRange, setActiveRange] = useState<string>("1y");

  return (
    <div className="card-base elev-1 lg:col-span-2" style={{ padding: "28px" }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            ביצועים לאורך זמן
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
            השוואה למדד S&amp;P 500 ואינפלציה
          </p>
        </div>
        <div className="flex p-1 rounded-lg" style={{ background: "var(--bg-muted)" }}>
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              type="button"
              onClick={() => setActiveRange(range.key)}
              className="transition-all"
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                color: activeRange === range.key ? "#0d9488" : "var(--text-tertiary)",
                background: activeRange === range.key ? "var(--accent-teal-subtle)" : "transparent",
                boxShadow: "none",
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative" style={{ height: 240 }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ opacity: 0.15 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--grid-line)", width: "100%" }} />
          ))}
        </div>

        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          {/* Portfolio line — teal */}
          <path
            d="M0 85 C 30 82, 60 78, 80 75 C 100 72, 120 68, 150 62 C 180 55, 210 48, 240 42 C 270 35, 300 28, 340 22 C 360 18, 380 15, 400 12"
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Area fill */}
          <path
            d="M0 85 C 30 82, 60 78, 80 75 C 100 72, 120 68, 150 62 C 180 55, 210 48, 240 42 C 270 35, 300 28, 340 22 C 360 18, 380 15, 400 12 L 400 100 L 0 100 Z"
            fill="url(#tealGradient)"
          />
          {/* S&P 500 line — dashed gray */}
          <path
            d="M0 90 C 40 88, 80 85, 120 82 C 160 79, 200 75, 240 70 C 280 66, 320 62, 360 58 C 380 56, 400 54, 400 53"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div
          className="absolute w-full flex justify-between"
          style={{ bottom: -20, fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600 }}
        >
          <span>ינואר</span>
          <span>מרץ</span>
          <span>מאי</span>
          <span>יולי</span>
          <span>ספטמבר</span>
          <span>נובמבר</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-10 flex gap-6">
        <div className="flex items-center gap-2">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0d9488" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>תיק נוכחי</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#64748b" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>S&amp;P 500 Index</span>
        </div>
      </div>
    </div>
  );
}
