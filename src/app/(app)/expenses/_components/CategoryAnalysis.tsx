"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getCategoryBreakdown, getTopVendors } from "@/lib/actions/expenses";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/expense-categorizer";
import { formatILS, fromAgorot } from "@/lib/money";
import { CategoryBadge } from "./CategoryBadge";

type MonthKey =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12";

interface TopVendor {
  vendorName: string;
  total: number;
  count: number;
  topCategory: string;
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  fontSize: 12,
  background: "#1E2538",
  color: "#F1F5F9",
};

export function CategoryAnalysis() {
  const t = useTranslations("expenses");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<
    {
      category: string;
      total: number;
      count: number;
      months: Record<number, number>;
    }[]
  >([]);
  const [vendors, setVendors] = useState<TopVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategoryBreakdown(year), getTopVendors(year)]).then(
      ([catResult, vendorResult]) => {
        if (catResult.data) setData(catResult.data);
        if (vendorResult.data) setVendors(vendorResult.data);
        setLoading(false);
      }
    );
  }, [year]);

  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // Build monthly chart data — stacked by top 5 categories
  const top5 = data.slice(0, 5);
  const monthlyChartData = Array.from({ length: 12 }, (_, m) => {
    const month = m + 1;
    const entry: Record<string, unknown> = {
      name: t(`months.${String(month) as MonthKey}`).slice(0, 3),
    };
    for (const cat of top5) {
      entry[cat.category] = fromAgorot(cat.months[month] ?? 0);
    }
    return entry;
  });

  // Pie chart data
  const pieData = data.map((d) => ({
    name: EXPENSE_CATEGORIES[d.category as ExpenseCategory]?.label ?? d.category,
    value: fromAgorot(d.total),
    color: EXPENSE_CATEGORIES[d.category as ExpenseCategory]?.hex ?? "#9ca3af",
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-pulse" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          טוען נתונים...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Year selector */}
      <div className="flex items-center gap-3">
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t("year")}:
        </label>
        <div className="flex gap-1">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className="font-mono transition-colors"
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                fontSize: 13,
                background: year === y ? "rgba(13,148,136,0.12)" : "transparent",
                color: year === y ? "#0d9488" : "var(--text-secondary)",
                fontWeight: year === y ? 700 : 400,
                border: "none",
                cursor: "pointer",
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div
          className="flex items-center justify-center py-16 rounded-2xl"
          style={{ background: "var(--surface-card)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{t("noExpenses")}</p>
        </div>
      ) : (
        <>
          {/* Charts row: Stacked bar + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Stacked bar chart */}
            <div className="lg:col-span-3 card-base elev-1 p-5">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
                הוצאות חודשיות לפי קטגוריה
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₪${Number(value).toLocaleString()}`,
                      EXPENSE_CATEGORIES[name as ExpenseCategory]?.label ?? String(name),
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  {top5.map((cat) => (
                    <Bar
                      key={cat.category}
                      dataKey={cat.category}
                      stackId="a"
                      fill={EXPENSE_CATEGORIES[cat.category as ExpenseCategory]?.hex ?? "#9ca3af"}
                      radius={cat === top5[top5.length - 1] ? [4, 4, 0, 0] : undefined}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart */}
            <div className="lg:col-span-2 card-base elev-1 p-5">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
                התפלגות לפי קטגוריה
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₪${Number(value).toLocaleString()}`]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown table */}
          <div className="card-base elev-1 overflow-hidden">
            <div className="flex items-center justify-between" style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                פירוט לפי קטגוריה
              </h3>
            </div>
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("category")}</th>
                  <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("totalThisYear")}</th>
                  <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("totalPercent")}</th>
                  <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("monthlyAvg")}</th>
                  <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("recordCount")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const percent = grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : "0";
                  const monthlyAvg = row.total / 12;
                  const catConfig = EXPENSE_CATEGORIES[row.category as ExpenseCategory];

                  return (
                    <tr
                      key={row.category}
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="p-3"><CategoryBadge category={row.category as ExpenseCategory} /></td>
                      <td className="p-3 font-mono" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(row.total)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="overflow-hidden" style={{ width: 64, height: 6, borderRadius: 20, background: "rgba(255,255,255,0.06)" }}>
                            <div style={{ height: "100%", borderRadius: 20, width: `${percent}%`, background: catConfig?.hex ?? "#9ca3af" }} />
                          </div>
                          <span dir="ltr" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{percent}%</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(Math.round(monthlyAvg))}</td>
                      <td className="p-3" style={{ color: "var(--text-secondary)" }}>{row.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Top vendors table */}
          {vendors.length > 0 && (
            <div className="card-base elev-1 overflow-hidden">
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  ספקים מובילים
                </h3>
              </div>
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>ספק</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>מס&apos; עסקאות</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>סה&quot;כ</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>ממוצע לעסקה</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>קטגוריה עיקרית</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="p-3" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v.vendorName}</td>
                      <td className="p-3" style={{ color: "var(--text-secondary)" }}>{v.count}</td>
                      <td className="p-3 font-mono" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(v.total)}</td>
                      <td className="p-3 font-mono" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(v.count > 0 ? Math.round(v.total / v.count) : 0)}</td>
                      <td className="p-3"><CategoryBadge category={v.topCategory as ExpenseCategory} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
