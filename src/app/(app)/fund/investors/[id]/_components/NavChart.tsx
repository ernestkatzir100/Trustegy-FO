"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { InvestorPosition } from "@/db/schema/investors";

interface Props {
  positions: InvestorPosition[];
  currency: string;
}

const fmt = (cents: number, currency: string) =>
  new Intl.NumberFormat(currency === "USD" ? "en-US" : "he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(cents / 100);

export function NavChart({ positions, currency }: Props) {
  if (positions.length < 2) {
    return (
      <div
        style={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Not enough data for chart
      </div>
    );
  }

  const data = [...positions]
    .sort((a, b) => a.dataDate.localeCompare(b.dataDate))
    .map((p) => ({
      date: p.dataDate.substring(0, 7), // YYYY-MM
      nav: currency === "USD" ? (p.navUsd ?? 0) : (p.navNis ?? 0),
      netMtd: p.netMtdBps != null ? p.netMtdBps / 100 : null,
    }));

  const navValues = data.map((d) => d.nav);
  const minNav = Math.min(...navValues);
  const maxNav = Math.max(...navValues);
  const isPositive = data[data.length - 1].nav >= data[0].nav;
  const color = isPositive ? "#22c55e" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => fmt(v, currency)}
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          domain={[minNav * 0.95, maxNav * 1.05]}
          width={80}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: unknown) =>
            typeof v === "number" ? fmt(v, currency) : String(v)
          }
          labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="nav"
          stroke={color}
          strokeWidth={2}
          fill="url(#navGradient)"
          dot={false}
          activeDot={{ r: 4, fill: color }}
          name="NAV"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
