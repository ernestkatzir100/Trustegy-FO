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

type MonthKey = "1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12";

interface TopVendor {
  vendorName: string;
  total: number;
  count: number;
  topCategory: string;
}

/* ── Explicit category colors ── */
const CATEGORY_COLORS: Record<string, string> = {
  SALARY:        "#3b82f6",
  VEHICLE:       "#f97316",
  ACCOUNTING:    "#14b8a6",
  MAINTENANCE:   "#6b7280",
  TAX:           "#ef4444",
  FINANCING:     "#8b5cf6",
  LEGAL:         "#6366f1",
  SUBCONTRACTOR: "#f59e0b",
  GIFTS:         "#ec4899",
  OTHER:         "#94a3b8",
};

const ALL_CATEGORIES: { key: ExpenseCategory; label: string }[] = [
  { key: "SALARY", label: "משכורות" },
  { key: "FINANCING", label: "מימון" },
  { key: "VEHICLE", label: "רכב" },
  { key: "ACCOUNTING", label: "הנהלת חשבונות" },
  { key: "TAX", label: "מיסים" },
  { key: "LEGAL", label: "משפטי" },
  { key: "SUBCONTRACTOR", label: "קבלני משנה" },
  { key: "MAINTENANCE", label: "אחזקה" },
  { key: "GIFTS", label: "מתנות" },
  { key: "OTHER", label: "אחר" },
];

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  fontSize: 12,
  background: "var(--surface-card)",
  color: "var(--text-primary)",
};

export function CategoryAnalysis() {
  const t = useTranslations("expenses");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<
    { category: string; total: number; count: number; months: Record<number, number> }[]
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
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Build monthly chart data — ALL categories, ALL 12 months
  const dataByCategory = Object.fromEntries(data.map((d) => [d.category, d]));
  const monthlyChartData = Array.from({ length: 12 }, (_, m) => {
    const month = m + 1;
    const entry: Record<string, unknown> = {
      month: t(`months.${String(month) as MonthKey}`).slice(0, 3),
    };
    for (const cat of ALL_CATEGORIES) {
      const catData = dataByCategory[cat.key];
      entry[cat.key] = catData ? fromAgorot(catData.months[month] ?? 0) : 0;
    }
    return entry;
  });

  // Pie chart data — with explicit colors
  const pieData = data.map((d) => ({
    name: EXPENSE_CATEGORIES[d.category as ExpenseCategory]?.label ?? d.category,
    value: fromAgorot(d.total),
    category: d.category,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-pulse" style={{ fontSize: 13, color: "var(--text-muted)" }}>
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
                background: year === y ? "var(--accent-subtle)" : "transparent",
                color: year === y ? "var(--accent)" : "var(--text-secondary)",
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
          className="flex items-center justify-center py-16 card-base"
        >
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{t("noExpenses")}</p>
        </div>
      ) : (
        <>
          {/* Charts row: Stacked bar + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Stacked bar chart — ALL categories with explicit colors */}
            <div className="lg:col-span-3 card-base" style={{ padding: 20 }}>
              <h3 className="section-title" style={{ marginBottom: 16 }}>
                הוצאות חודשיות לפי קטגוריה
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₪${Number(value).toLocaleString()}`,
                      EXPENSE_CATEGORIES[name as ExpenseCategory]?.label ?? String(name),
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }}
                    formatter={(value) => EXPENSE_CATEGORIES[value as ExpenseCategory]?.label ?? value}
                  />
                  {ALL_CATEGORIES.map((cat, i) => (
                    <Bar
                      key={cat.key}
                      dataKey={cat.key}
                      stackId="a"
                      fill={CATEGORY_COLORS[cat.key]}
                      name={cat.key}
                      radius={i === ALL_CATEGORIES.length - 1 ? [4, 4, 0, 0] : undefined}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart — explicit Cell fill colors */}
            <div className="lg:col-span-2 card-base" style={{ padding: 20 }}>
              <h3 className="section-title" style={{ marginBottom: 16 }}>
                התפלגות לפי קטגוריה
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={CATEGORY_COLORS[entry.category] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₪${Number(value).toLocaleString()}`]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown table */}
          <div className="card-base overflow-hidden">
            <div className="flex items-center justify-between" style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 className="section-title">פירוט לפי קטגוריה</h3>
            </div>
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)" }}>
                  <th className="table-header text-start p-3">{t("category")}</th>
                  <th className="table-header text-start p-3">{t("totalThisYear")}</th>
                  <th className="table-header text-start p-3">{t("totalPercent")}</th>
                  <th className="table-header text-start p-3">{t("monthlyAvg")}</th>
                  <th className="table-header text-start p-3">{t("recordCount")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const percent = grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : "0";
                  const monthlyAvg = row.total / 12;
                  const barColor = CATEGORY_COLORS[row.category] ?? "#94a3b8";

                  return (
                    <tr
                      key={row.category}
                      className="tonal-shift"
                      style={{ borderTop: "1px solid var(--border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="p-3"><CategoryBadge category={row.category as ExpenseCategory} /></td>
                      <td className="p-3 num" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(row.total)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="overflow-hidden" style={{ width: 64, height: 4, borderRadius: 2, background: "var(--bg-tint)" }}>
                            <div style={{ height: "100%", borderRadius: 2, width: `${percent}%`, background: barColor }} />
                          </div>
                          <span dir="ltr" style={{ fontSize: 12, color: "var(--text-muted)" }}>{percent}%</span>
                        </div>
                      </td>
                      <td className="p-3 num" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(Math.round(monthlyAvg))}</td>
                      <td className="p-3" style={{ color: "var(--text-secondary)" }}>{row.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Top vendors table */}
          {vendors.length > 0 && (
            <div className="card-base overflow-hidden">
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <h3 className="section-title">ספקים מובילים</h3>
              </div>
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-subtle)" }}>
                    <th className="table-header text-start p-3">ספק</th>
                    <th className="table-header text-start p-3">מס&apos; עסקאות</th>
                    <th className="table-header text-start p-3">סה&quot;כ</th>
                    <th className="table-header text-start p-3">ממוצע לעסקה</th>
                    <th className="table-header text-start p-3">קטגוריה עיקרית</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr
                      key={i}
                      className="tonal-shift"
                      style={{ borderTop: "1px solid var(--border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="p-3" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v.vendorName}</td>
                      <td className="p-3" style={{ color: "var(--text-secondary)" }}>{v.count}</td>
                      <td className="p-3 num" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(v.total)}</td>
                      <td className="p-3 num" dir="ltr" style={{ color: "var(--text-primary)" }}>{formatILS(v.count > 0 ? Math.round(v.total / v.count) : 0)}</td>
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
