import { getTranslations } from "next-intl/server";
import {
  Sparkles,
  Wallet,
  TrendingUp,
  FileText,
  Landmark,
  Calendar,
  ArrowUpLeft,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import { getEntities } from "@/lib/actions/entities";
import { formatILS } from "@/lib/money";
import {
  getConsolidatedFinancials,
  getDemoFinancials,
  getDemoUpcomingPayments,
  getDemoRecentActivity,
} from "@/lib/demo-data";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EntityCard } from "@/components/dashboard/EntityCard";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const entitiesResult = await getEntities();
  const entityList = entitiesResult.data ?? [];
  const entityNames = entityList.map((e) => e.name);
  const consolidated = getConsolidatedFinancials(entityNames);
  const upcomingPayments = getDemoUpcomingPayments();
  const recentActivity = getDemoRecentActivity();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">
          {t("greeting")}
        </h1>
        <p className="text-[14px] text-text-secondary mt-1">{t("title")}</p>
      </div>

      {/* Shefa AI Summary */}
      <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-gold">Shefa</span>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              {t("shefaPlaceholder")}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 items-stretch">
        <KpiCard
          label={t("revenueYtd")}
          value={formatILS(consolidated.revenue)}
          changePercent={consolidated.revenueChangePercent}
          changeLabel={t("vsLastMonth")}
          status="healthy"
          statusText={t("statusHealthy")}
          icon={<TrendingUp className="w-4 h-4 text-text-tertiary" />}
        />
        <KpiCard
          label={t("cashPosition")}
          value={formatILS(consolidated.cashPosition)}
          changePercent={8}
          changeLabel={t("vsLastMonth")}
          status="healthy"
          statusText={t("statusHealthy")}
          icon={<Wallet className="w-4 h-4 text-text-tertiary" />}
        />
        <KpiCard
          label={t("outstandingInvoices")}
          value={formatILS(consolidated.outstandingInvoices)}
          changePercent={-15}
          changeLabel={t("vsLastMonth")}
          status="attention"
          statusText={`${consolidated.outstandingCount} ${t("statusAttention")}`}
          icon={<FileText className="w-4 h-4 text-text-tertiary" />}
        />
        <KpiCard
          label={t("loanBalances")}
          value={formatILS(consolidated.loanBalance)}
          changePercent={-2}
          changeLabel={t("vsLastMonth")}
          status={consolidated.loanBalance > 0 ? "attention" : "healthy"}
          statusText={consolidated.loanBalance > 0 ? t("statusAttention") : t("statusHealthy")}
          icon={<Landmark className="w-4 h-4 text-text-tertiary" />}
        />
      </div>

      {/* Entity Breakdown + Upcoming Payments */}
      <div className="grid grid-cols-3 gap-4">
        {/* Entity Cards */}
        <div className="col-span-2 flex flex-col gap-3">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
            {t("entityBreakdown")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {entityList.map((entity) => {
              const fin = getDemoFinancials(entity.name);
              return (
                <EntityCard
                  key={entity.id}
                  name={entity.name}
                  description={entity.description}
                  revenue={fin.revenue}
                  expenses={fin.expenses}
                  cashPosition={fin.cashPosition}
                  loanBalance={fin.loanBalance}
                  status={fin.status}
                />
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming Payments + Recent Activity */}
        <div className="flex flex-col gap-4">
          {/* Upcoming Payments */}
          <div className="dashboard-card" style={{ padding: "20px 22px" }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar style={{ width: 16, height: 16, opacity: 0.4 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
                {t("upcomingPayments")}
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingPayments.map((payment, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>
                      {payment.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>
                      {payment.entity} · בעוד {payment.daysUntil} ימים
                    </span>
                    <span className="font-mono" dir="ltr" style={{ fontSize: 15, fontWeight: 600, color: "#dc2626" }}>
                      {formatILS(payment.amount)}
                    </span>
                  </div>
                  {i < upcomingPayments.length - 1 && (
                    <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card" style={{ padding: "20px 22px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.01em", marginBottom: 12 }}>
              {t("recentActivity")}
            </h3>
            <div className="flex flex-col gap-3">
              {recentActivity.map((activity, i) => {
                const iconBg = activity.type === "income" ? "#dcfce7" : activity.type === "expense" ? "#fee2e2" : "#fef9c3";
                const iconColor = activity.type === "income" ? "#16a34a" : activity.type === "expense" ? "#dc2626" : "#a16207";
                const amountColor = activity.amount >= 0 ? "#16a34a" : "#dc2626";
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className="flex items-center justify-center mt-0.5"
                      style={{ width: 24, height: 24, borderRadius: 8, background: iconBg }}
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>
                          {activity.description}
                        </span>
                        <span
                          className="font-mono shrink-0"
                          dir="ltr"
                          style={{ fontSize: 15, fontWeight: 600, color: amountColor }}
                        >
                          {activity.amount >= 0 ? "+" : ""}{formatILS(Math.abs(activity.amount))}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2, display: "block" }}>
                        {activity.entity} · {activity.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
