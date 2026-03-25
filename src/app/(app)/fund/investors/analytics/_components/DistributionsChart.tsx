"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { QuarterlyDistribution } from "@/lib/actions/investor-analytics";

interface Props {
  data: QuarterlyDistribution[];
}

const fmtNis = (agorot: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(agorot / 100);

const fmtUsd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(cents / 100);

export function DistributionsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        style={{
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        No distribution data yet — import חלוקות file to populate.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        barCategoryGap="30%"
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="quarter"
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => fmtNis(v)}
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => {
            const v = typeof value === "number" ? value : 0;
            return [name === "amountNis" ? fmtNis(v) : fmtUsd(v), name === "amountNis" ? "NIS" : "USD"] as [string, string];
          }}
          labelStyle={{ color: "var(--text-muted)", marginBottom: 4, fontWeight: 700 }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {value === "amountNis" ? "העברה שקלית (NIS)" : "העברה דולרית (USD)"}
            </span>
          )}
        />
        <Bar dataKey="amountNis" name="amountNis" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="amountUsd" name="amountUsd" fill="#166534" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
