import { getTranslations } from "next-intl/server";
import {
  ArrowUpLeft,
  ArrowDownRight,
  CreditCard,
  Sparkles,
  Receipt,
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
import { KpiCard } from "@/components/dashboard/KpiCard";

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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: "-0.03em" }}>
            {t("portfolioOverview")}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>
            {t("title")}
          </p>
        </div>
        {/* Tabs */}
        <nav className="flex gap-5" style={{ fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: "#0d9488", borderBottom: "2px solid #0d9488", paddingBottom: 4 }}>
            {t("summary")}
          </span>
          <span className="cursor-pointer transition-colors" style={{ color: "rgba(0,0,0,0.35)", paddingBottom: 4 }}>
            {t("assets")}
          </span>
          <span className="cursor-pointer transition-colors" style={{ color: "rgba(0,0,0,0.35)", paddingBottom: 4 }}>
            {t("transactions")}
          </span>
          <span className="cursor-pointer transition-colors" style={{ color: "rgba(0,0,0,0.35)", paddingBottom: 4 }}>
            {t("documents")}
          </span>
        </nav>
      </div>

      {/* Shefa AI Summary */}
      <div
        className="card-base elev-1"
        style={{
          padding: "16px 22px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
          border: "1px solid rgba(13,148,136,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(196,149,74,0.1)" }}
          >
            <Sparkles style={{ width: 14, height: 14, color: "var(--gold)" }} />
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>Shefa</span>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", lineHeight: 1.5 }}>
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
        <section className="grid grid-cols-4 gap-4">
          <KpiCard
            label={t("expensesThisMonth")}
            value={formatILS(expSummary.thisMonth)}
            trend={Math.round(expSummary.momChangePct)}
            trendLabel={t("vsLastMonth")}
            icon={Receipt}
            status={expSummary.momChangePct > 20 ? "warning" : "ok"}
            accentColor="#f59e0b"
            sparkData={expSummary.byMonth.map((m) => m.total)}
          />
          <KpiCard
            label={t("expensesThisYear")}
            value={formatILS(expSummary.totalYear)}
            icon={Receipt}
            accentColor="#0d9488"
            sparkData={expSummary.byMonth.map((m) => m.total)}
          />
          <KpiCard
            label={t("topExpenseCategory")}
            value={expSummary.topCategory ? (EXPENSE_CATEGORIES[expSummary.topCategory.category as ExpenseCategory]?.label ?? expSummary.topCategory.category) : "—"}
            icon={Receipt}
            accentColor="#8b5cf6"
          />
          <KpiCard
            label={t("entityCount")}
            value={String(entityList.length)}
            icon={Receipt}
            accentColor="#0d9488"
          />
        </section>
      )}

      {/* Holdings + Recent Activity */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <HoldingsTable holdings={holdings} />

        {/* Recent Activity */}
        <div className="card-base elev-1" style={{ padding: "22px" }}>
          <h3
            className="flex items-center gap-2"
            style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 20 }}
          >
            {t("recentActivity")}
          </h3>
          <div className="flex flex-col gap-5">
            {recentActivity.map((activity, i) => {
              const iconBg =
                activity.type === "income"
                  ? "rgba(13,148,136,0.1)"
                  : activity.type === "expense"
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(100,116,139,0.08)";
              const iconColor =
                activity.type === "income"
                  ? "#0d9488"
                  : activity.type === "expense"
                    ? "#ef4444"
                    : "#64748b";
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
                    <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                      {activity.description}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginTop: 2 }}>
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
              color: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
            }}
          >
            {t("viewFullHistory")}
          </button>
        </div>
      </section>
    </div>
  );
}
