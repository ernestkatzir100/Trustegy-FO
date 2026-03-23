"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTHS = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצ"];

const DATA = MONTHS.map((m, i) => ({
  month: m,
  revenue: [225, 240, 228, 265, 257, 266, 247, 290, 310, 305, 283, 333][i],
  expenses: [105, 98, 115, 105, 115, 101, 111, 102, 105, 113, 99, 127][i],
}));

function formatTick(value: number) {
  return value >= 1000 ? `${value / 1000}M` : `${value}K`;
}

export function RevenueChart() {
  return (
    <div className="card-base" style={{ padding: 24 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        הכנסות מול הוצאות
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={DATA} barSize={16} barGap={4}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatTick}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface-card)",
              fontSize: 12,
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === "revenue" ? "הכנסות" : "הוצאות"
            }
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="revenue"
            name="revenue"
            fill="#00685f"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="expenses"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
