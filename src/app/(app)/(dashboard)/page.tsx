import { getTranslations } from "next-intl/server";
import {
  Sparkles,
  Wallet,
  TrendingUp,
  Receipt,
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
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111",
            letterSpacing: "-0.03em",
          }}
        >
          {t("greeting")}
        </h1>
        <p style={{ fontSize: 14, color: "rgba(0,0,0,0.45)", marginTop: 4 }}>
          {t("title")}
        </p>
      </div>

      {/* Shefa AI Summary */}
      <div
        className="card-base elev-1"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
          border: "1px solid rgba(13,148,136,0.12)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center shrink-0 mt-0.5"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(196,149,74,0.1)",
            }}
          >
            <Sparkles style={{ width: 16, height: 16, color: "var(--gold)" }} />
          </div>
          <div className="flex flex-col gap-1">
            <span
              style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}
            >
              Shefa
            </span>
            <p
              style={{
                fontSize: 14,
                color: "rgba(0,0,0,0.5)",
                lineHeight: 1.6,
              }}
            >
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
          trend={consolidated.revenueChangePercent}
          trendLabel={t("vsLastMonth")}
          icon={TrendingUp}
          status="ok"
          accentColor="#0d9488"
          sparkData={[1800, 1950, 2050, 2100, 2150, 2188]}
        />
        <KpiCard
          label={t("cashPosition")}
          value={formatILS(consolidated.cashPosition)}
          trend={8}
          trendLabel={t("vsLastMonth")}
          icon={Wallet}
          status="ok"
          accentColor="#0d9488"
          sparkData={[2600, 2750, 2900, 2820, 2980, 3042]}
        />
        <KpiCard
          label={t("outstandingInvoices")}
          value={formatILS(consolidated.outstandingInvoices)}
          trend={-15}
          trendLabel={t("vsLastMonth")}
          icon={Receipt}
          status="warning"
          accentColor="#f59e0b"
          sparkData={[280, 310, 290, 240, 210, 185]}
        />
        <KpiCard
          label={t("loanBalances")}
          value={formatILS(consolidated.loanBalance)}
          trend={-2}
          trendLabel={t("vsLastMonth")}
          icon={Landmark}
          status={consolidated.loanBalance > 0 ? "warning" : "ok"}
          accentColor={consolidated.loanBalance > 0 ? "#f59e0b" : "#0d9488"}
          sparkData={[1300, 1280, 1260, 1240, 1210, 1170]}
        />
      </div>

      {/* Entity Breakdown + Upcoming Payments */}
      <div className="grid grid-cols-3 gap-4">
        {/* Entity Cards */}
        <div className="col-span-2 flex flex-col gap-3">
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
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
          <div
            className="card-base elev-1"
            style={{ padding: "20px 22px" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar
                style={{ width: 16, height: 16, color: "rgba(0,0,0,0.35)" }}
              />
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: "-0.01em",
                }}
              >
                {t("upcomingPayments")}
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingPayments.map((payment, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#1a1a1a",
                      }}
                    >
                      {payment.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(0,0,0,0.4)",
                        marginTop: 2,
                      }}
                    >
                      {payment.entity} · בעוד {payment.daysUntil} ימים
                    </span>
                    <span
                      className="num"
                      dir="ltr"
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#dc2626",
                      }}
                    >
                      {formatILS(payment.amount)}
                    </span>
                  </div>
                  {i < upcomingPayments.length - 1 && (
                    <div
                      style={{
                        height: 1,
                        background: "rgba(0,0,0,0.06)",
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="card-base elev-1"
            style={{ padding: "20px 22px" }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.01em",
                marginBottom: 12,
              }}
            >
              {t("recentActivity")}
            </h3>
            <div className="flex flex-col gap-3">
              {recentActivity.map((activity, i) => {
                const iconBg =
                  activity.type === "income"
                    ? "#dcfce7"
                    : activity.type === "expense"
                      ? "#fee2e2"
                      : "#fef9c3";
                const iconColor =
                  activity.type === "income"
                    ? "#16a34a"
                    : activity.type === "expense"
                      ? "#dc2626"
                      : "#a16207";
                const amountColor =
                  activity.amount >= 0 ? "#16a34a" : "#dc2626";
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className="flex items-center justify-center mt-0.5"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        background: iconBg,
                      }}
                    >
                      {activity.type === "income" ? (
                        <ArrowDownRight
                          style={{ width: 14, height: 14, color: iconColor }}
                        />
                      ) : activity.type === "expense" ? (
                        <ArrowUpLeft
                          style={{ width: 14, height: 14, color: iconColor }}
                        />
                      ) : (
                        <CreditCard
                          style={{ width: 14, height: 14, color: iconColor }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="truncate"
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#1a1a1a",
                          }}
                        >
                          {activity.description}
                        </span>
                        <span
                          className="num shrink-0"
                          dir="ltr"
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: amountColor,
                          }}
                        >
                          {activity.amount >= 0 ? "+" : ""}
                          {formatILS(Math.abs(activity.amount))}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "rgba(0,0,0,0.4)",
                          marginTop: 2,
                          display: "block",
                        }}
                      >
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
