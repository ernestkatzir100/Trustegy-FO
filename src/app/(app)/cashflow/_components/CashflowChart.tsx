"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CashflowRow {
  month: string;
  recognition: number;
  actual: number;
  expenses: number;
}

function formatTick(value: number) {
  return value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}K`;
}

export function CashflowChart({ data }: { data: CashflowRow[] }) {
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
        תזרים לפי חודש
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
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
            formatter={(value: string) => {
              if (value === "recognition") return "הכרה";
              if (value === "actual") return "בפועל";
              return "הוצאות";
            }}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="recognition"
            name="recognition"
            stroke="#00685f"
            fill="#00685f"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="actual"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="expenses"
            stroke="#ef4444"
            fill="none"
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
