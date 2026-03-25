"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import type { HoldingStatus, Platform } from "@/db/schema/fund";

// ─── Color maps ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PERFORMING: "#22c55e",
  LATE_PAYMENT: "#eab308",
  LOSS_MITIGATION: "#f97316",
  FORECLOSURE_EARLY: "#ef4444",
  FORECLOSURE_MID: "#dc2626",
  FORECLOSURE_LATE: "#b91c1c",
  REO: "#a855f7",
  REO_LISTED: "#9333ea",
  REO_UNDER_CONTRACT: "#7c3aed",
  BORROWER_WORKOUT: "#6366f1",
  PAYOFF_EXPECTED: "#10b981",
  BANKRUPTCY: "#991b1b",
  TITLE_ISSUE: "#f59e0b",
  NOTE_SALE: "#3b82f6",
  PARTIAL_RECOVERY: "#14b8a6",
  SETTLED: "#6b7280",
  WRITTEN_OFF: "#374151",
};

const PLATFORM_COLORS: Record<string, string> = {
  upright: "#0d9488",
  sharestates: "#3b82f6",
  upgrade: "#a855f7",
};

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatusDatum {
  name: string;
  value: number;
  status: string;
}
interface PlatformDatum {
  name: string;
  costBasis: number;
  count: number;
  platform: string;
}
interface WaterfallDatum {
  id: string;
  label: string;
  costBasis: number;
  low: number;
  high: number;
  platform: string;
  status: string;
}

interface Props {
  statusData: StatusDatum[];
  platformData: PlatformDatum[];
  waterfallData: WaterfallDatum[];
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border-strong)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      {label && (
        <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
          {label}
        </div>
      )}
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color ?? "var(--text-secondary)", marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === "number" && p.value > 1000 ? usd(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "var(--text-muted)",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function ChartCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsCharts({ statusData, platformData, waterfallData }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Row 1: Status donut + Platform bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Status distribution */}
        <ChartCard>
          <SectionTitle>Status Distribution</SectionTitle>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Platform breakdown */}
        <ChartCard>
          <SectionTitle>Cost Basis by Platform</SectionTitle>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformData}
                margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  formatter={(v) => (typeof v === "number" ? usd(v) : String(v))}
                />
                <Bar dataKey="costBasis" name="Cost Basis" radius={[4, 4, 0, 0]}>
                  {platformData.map((entry) => (
                    <Cell
                      key={entry.platform}
                      fill={PLATFORM_COLORS[entry.platform] ?? "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Recovery waterfall */}
      {waterfallData.length > 0 && (
        <ChartCard>
          <SectionTitle>Recovery Estimate by Position</SectionTitle>
          <div style={{ height: Math.max(260, waterfallData.length * 32 + 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={waterfallData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                barCategoryGap="20%"
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={140}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as WaterfallDatum;
                    return (
                      <div
                        style={{
                          background: "var(--surface-elevated)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                          {d.label}
                        </div>
                        <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>
                          Cost Basis: <strong style={{ color: "var(--text-primary)" }}>{usd(d.costBasis)}</strong>
                        </div>
                        {(d.low > 0 || d.high > 0) && (
                          <div style={{ color: "#22c55e" }}>
                            Recovery: <strong>{usd(d.low)} – {usd(d.high)}</strong>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                {/* Cost basis bar */}
                <Bar
                  dataKey="costBasis"
                  name="Cost Basis"
                  radius={[0, 3, 3, 0]}
                  fill="rgba(107,114,128,0.25)"
                  stroke="rgba(107,114,128,0.5)"
                  strokeWidth={1}
                />
                {/* Recovery low bar (transparent offset) */}
                <Bar dataKey="low" name="Recovery Low" fill="transparent" stackId="recovery" />
                {/* Recovery range bar */}
                <Bar
                  dataKey={(d: WaterfallDatum) => Math.max(0, d.high - d.low)}
                  name="Recovery Range"
                  stackId="recovery"
                  radius={[0, 3, 3, 0]}
                >
                  {waterfallData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={
                        entry.high >= entry.costBasis
                          ? "rgba(34,197,94,0.7)"
                          : "rgba(251,146,60,0.7)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, background: "rgba(107,114,128,0.4)", borderRadius: 2, display: "inline-block" }} />
              Cost basis
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, background: "rgba(34,197,94,0.7)", borderRadius: 2, display: "inline-block" }} />
              Recovery ≥ cost
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, background: "rgba(251,146,60,0.7)", borderRadius: 2, display: "inline-block" }} />
              Recovery &lt; cost (loss)
            </span>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
