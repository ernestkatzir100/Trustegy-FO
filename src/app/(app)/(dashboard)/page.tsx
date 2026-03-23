import { getTranslations } from "next-intl/server";
import {
  ArrowUpLeft,
  ArrowDownRight,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { getEntities } from "@/lib/actions/entities";
import { formatILS } from "@/lib/money";
import {
  getDemoPortfolioSummary,
  getDemoAssetAllocation,
  getDemoHoldings,
  getDemoRecentActivity,
} from "@/lib/demo-data";
import { getExpensesDashboardSummary } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/expense-categorizer";
import { PortfolioHero } from "@/components/dashboard/PortfolioHero";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { AssetAllocation } from "@/components/dashboard/AssetAllocation";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ExpenseKpis } from "@/components/dashboard/ExpenseKpis";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const entitiesResult = await getEntities();
  const entityList = entitiesResult.data ?? [];

  const portfolio = getDemoPortfolioSummary();
  const allocation = getDemoAssetAllocation();
  const holdings = getDemoHoldings();
  const recentActivity = getDemoRecentActivity();

  // Real expense data from DB (graceful fallback if DB fails)
  let expSummary: Awaited<ReturnType<typeof getExpensesDashboardSummary>>["data"] = null;
  try {
    const expResult = await getExpensesDashboardSummary();
    expSummary = expResult.data ?? null;
  } catch {
    // Dashboard still renders without expense data
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {t("portfolioOverview")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
            {t("title")}
          </p>
        </div>
        {/* Tabs */}
        <nav className="flex gap-5" style={{ fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: "var(--accent)", borderBottom: "2px solid var(--accent)", paddingBottom: 4 }}>
            {t("summary")}
          </span>
          <span className="cursor-pointer transition-colors" style={{ color: "var(--text-tertiary)", paddingBottom: 4 }}>
            {t("assets")}
          </span>
          <span className="cursor-pointer transition-colors" style={{ color: "var(--text-tertiary)", paddingBottom: 4 }}>
            {t("transactions")}
          </span>
          <span className="cursor-pointer transition-colors" style={{ color: "var(--text-tertiary)", paddingBottom: 4 }}>
            {t("documents")}
          </span>
        </nav>
      </div>

      {/* Shefa AI Summary */}
      <div
        className="card-base elev-1"
        style={{
          padding: "16px 22px",
          background: "linear-gradient(135deg, var(--surface-card) 0%, rgba(13,148,136,0.06) 100%)",
          border: "1px solid var(--accent-teal-subtle)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(196,149,74,0.15)" }}
          >
            <Sparkles style={{ width: 14, height: 14, color: "var(--gold)" }} />
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>Shefa</span>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {t("shefaPlaceholder")}
            </p>
          </div>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <PortfolioHero
        totalValue={portfolio.totalValue}
        yearlyReturn={portfolio.yearlyReturn}
        freeCash={portfolio.freeCash}
        cumulativeReturn={portfolio.cumulativeReturn}
        riskLevel={portfolio.riskLevel}
        riskPercent={portfolio.riskPercent}
        riskNote={portfolio.riskNote}
        monthlyIncome={portfolio.monthlyIncome}
        monthlyIncomeNote={portfolio.monthlyIncomeNote}
      />

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceChart />
        <AssetAllocation slices={allocation.slices} totalAssets={allocation.totalAssets} />
      </section>

      {/* Expenses KPI — real data from DB */}
      {expSummary && (
        <ExpenseKpis
          thisMonth={formatILS(expSummary.thisMonth)}
          thisMonthTrend={Math.round(expSummary.momChangePct)}
          vsLastMonth={t("vsLastMonth")}
          totalYear={formatILS(expSummary.totalYear)}
          topCategory={expSummary.topCategory ? (EXPENSE_CATEGORIES[expSummary.topCategory.category as ExpenseCategory]?.label ?? expSummary.topCategory.category) : "—"}
          entityCount={String(entityList.length)}
          sparkData={expSummary.byMonth.map((m) => m.total)}
          labels={{
            expensesThisMonth: t("expensesThisMonth"),
            expensesThisYear: t("expensesThisYear"),
            topExpenseCategory: t("topExpenseCategory"),
            entityCount: t("entityCount"),
          }}
        />
      )}

      {/* Revenue vs Expenses Chart */}
      <RevenueChart />

      {/* Holdings + Recent Activity */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <HoldingsTable holdings={holdings} />

        {/* Recent Activity */}
        <div className="card-base elev-1" style={{ padding: "22px" }}>
          <h3
            className="flex items-center gap-2"
            style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}
          >
            {t("recentActivity")}
          </h3>
          <div className="flex flex-col gap-5">
            {recentActivity.map((activity, i) => {
              const iconBg =
                activity.type === "income"
                  ? "var(--accent-teal-subtle)"
                  : activity.type === "expense"
                    ? "var(--status-red-bg)"
                    : "var(--bg-tint)";
              const iconColor =
                activity.type === "income"
                  ? "var(--accent)"
                  : activity.type === "expense"
                    ? "var(--danger)"
                    : "var(--text-muted)";
              return (
                <div key={i} className="flex gap-3">
                  <div
                    className="flex items-center justify-center shrink-0 mt-0.5"
                    style={{ width: 30, height: 30, borderRadius: "50%", background: iconBg }}
                  >
                    {activity.type === "income" ? (
                      <ArrowDownRight style={{ width: 14, height: 14, color: iconColor }} />
                    ) : activity.type === "expense" ? (
                      <ArrowUpLeft style={{ width: 14, height: 14, color: iconColor }} />
                    ) : (
                      <CreditCard style={{ width: 14, height: 14, color: iconColor }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {activity.description}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                      {activity.entity} · {activity.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="w-full mt-6 transition-colors"
            style={{
              padding: "8px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              background: "transparent",
            }}
          >
            {t("viewFullHistory")}
          </button>
        </div>
      </section>
    </div>
  );
}
