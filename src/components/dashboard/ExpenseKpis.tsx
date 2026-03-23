"use client";

import { Receipt } from "lucide-react";
import { KpiCard } from "./KpiCard";

interface ExpenseKpisProps {
  thisMonth: string;
  thisMonthTrend: number;
  vsLastMonth: string;
  totalYear: string;
  topCategory: string;
  entityCount: string;
  sparkData: number[];
  labels: {
    expensesThisMonth: string;
    expensesThisYear: string;
    topExpenseCategory: string;
    entityCount: string;
  };
}

export function ExpenseKpis({
  thisMonth,
  thisMonthTrend,
  totalYear,
  topCategory,
  entityCount,
  sparkData,
  labels,
}: ExpenseKpisProps) {
  const trendStr = thisMonthTrend >= 0 ? `+${thisMonthTrend}%` : `${thisMonthTrend}%`;

  return (
    <section className="grid grid-cols-4" style={{ gap: "var(--space-gap)" }}>
      <KpiCard
        label={labels.expensesThisMonth}
        value={thisMonth}
        trend={trendStr}
        trendType={thisMonthTrend > 20 ? "down" : "up"}
        icon={Receipt}
        accentColor="#f59e0b"
        sparkData={sparkData}
      />
      <KpiCard
        label={labels.expensesThisYear}
        value={totalYear}
        icon={Receipt}
        sparkData={sparkData}
      />
      <KpiCard
        label={labels.topExpenseCategory}
        value={topCategory}
        icon={Receipt}
        accentColor="#8b5cf6"
      />
      <KpiCard
        label={labels.entityCount}
        value={entityCount}
        icon={Receipt}
      />
    </section>
  );
}
