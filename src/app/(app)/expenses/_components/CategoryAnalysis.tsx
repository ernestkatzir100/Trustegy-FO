"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getCategoryBreakdown } from "@/lib/actions/expenses";
import { type ExpenseCategory } from "@/lib/expense-categorizer";
import { formatILS } from "@/lib/money";
import { CategoryBadge } from "./CategoryBadge";

type MonthKey = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";

export function CategoryAnalysis() {
  const t = useTranslations("expenses");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<
    { category: string; total: number; count: number; months: Record<number, number> }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCategoryBreakdown(year).then((result) => {
      if (result.data) setData(result.data);
      setLoading(false);
    });
  }, [year]);

  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  const maxMonthly = Math.max(
    ...data.flatMap((d) => Object.values(d.months)),
    1
  );

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-[13px] text-text-tertiary animate-pulse">
          {t("saving")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Year selector */}
      <div className="flex items-center gap-3">
        <label className="text-[13px] font-medium text-text-secondary">
          {t("year")}:
        </label>
        <div className="flex gap-1">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-[13px] font-mono transition-colors ${
                year === y
                  ? "bg-gold text-white"
                  : "text-text-secondary hover:bg-cream-dark"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-16 rounded-2xl border border-cream-darker bg-white">
          <p className="text-[14px] text-text-secondary">{t("noExpenses")}</p>
        </div>
      ) : (
        <>
          {/* Monthly bar chart */}
          <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm">
            <div className="flex gap-1 items-end h-40">
              {Array.from({ length: 12 }, (_, m) => {
                const month = m + 1;
                const monthTotal = data.reduce(
                  (s, d) => s + (d.months[month] ?? 0),
                  0
                );
                const height =
                  maxMonthly > 0
                    ? Math.max((monthTotal / maxMonthly) * 100, 2)
                    : 2;

                return (
                  <div
                    key={month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t-md bg-gold/70 hover:bg-gold transition-colors min-h-[2px]"
                      style={{ height: `${height}%` }}
                      title={`${t(`months.${String(month) as MonthKey}`)}: ${formatILS(monthTotal)}`}
                    />
                    <span className="text-[10px] text-text-tertiary">
                      {t(`months.${String(month) as MonthKey}`).slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown table */}
          <div className="rounded-2xl border border-cream-darker bg-white shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-cream-dark text-text-secondary">
                  <th className="text-start p-3 font-medium">{t("category")}</th>
                  <th className="text-start p-3 font-medium">{t("totalThisYear")}</th>
                  <th className="text-start p-3 font-medium">{t("totalPercent")}</th>
                  <th className="text-start p-3 font-medium">{t("monthlyAvg")}</th>
                  <th className="text-start p-3 font-medium">{t("recordCount")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const percent =
                    grandTotal > 0
                      ? ((row.total / grandTotal) * 100).toFixed(1)
                      : "0";
                  const monthlyAvg = row.total / 12;

                  return (
                    <tr
                      key={row.category}
                      className="border-t border-cream-darker hover:bg-cream/50"
                    >
                      <td className="p-3">
                        <CategoryBadge
                          category={row.category as ExpenseCategory}
                        />
                      </td>
                      <td className="p-3 font-mono" dir="ltr">
                        {formatILS(row.total)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-cream-darker overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[12px] text-text-tertiary" dir="ltr">
                            {percent}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono" dir="ltr">
                        {formatILS(Math.round(monthlyAvg))}
                      </td>
                      <td className="p-3 text-text-secondary">{row.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
