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
  vsLastMonth,
  totalYear,
  topCategory,
  entityCount,
  sparkData,
  labels,
}: ExpenseKpisProps) {
  return (
    <section className="grid grid-cols-4 gap-4">
      <KpiCard
        label={labels.expensesThisMonth}
        value={thisMonth}
        trend={thisMonthTrend}
        trendLabel={vsLastMonth}
        icon={Receipt}
        status={thisMonthTrend > 20 ? "warning" : "ok"}
        accentColor="#f59e0b"
        sparkData={sparkData}
      />
      <KpiCard
        label={labels.expensesThisYear}
        value={totalYear}
        icon={Receipt}
        accentColor="#0d9488"
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
        accentColor="#0d9488"
      />
    </section>
  );
}
