import { Building2 } from "lucide-react";
import { formatILS } from "@/lib/money";

interface EntityCardProps {
  name: string;
  description: string | null;
  revenue: number;
  expenses: number;
  cashPosition: number;
  loanBalance: number;
  status: "healthy" | "attention" | "urgent";
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  healthy: { label: "תקין", bg: "#dcfce7", color: "#16a34a" },
  attention: { label: "דורש תשומת לב", bg: "#fef9c3", color: "#a16207" },
  urgent: { label: "דחוף", bg: "#fee2e2", color: "#dc2626" },
};

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.4)", marginBottom: 2 }}>
        {label}
      </span>
      <span
        className="font-mono"
        dir="ltr"
        style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: color ?? "#1a1a1a" }}
      >
        {value}
      </span>
    </div>
  );
}

export function EntityCard({
  name,
  description,
  revenue,
  expenses,
  cashPosition,
  loanBalance,
  status,
}: EntityCardProps) {
  const netIncome = revenue - expenses;
  const st = statusConfig[status];

  return (
    <div className="card-base elev-1 flex flex-col gap-4" style={{ padding: "20px 22px" }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
            <Building2 style={{ width: 18, height: 18, color: "var(--gold)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{name}</h3>
            {description && (
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 1 }}>{description}</p>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5"
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: 20,
            letterSpacing: "0.1px",
            background: st.bg,
            color: st.color,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
          {st.label}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricRow label="הכנסות" value={formatILS(revenue)} />
        <MetricRow label="הוצאות" value={formatILS(expenses)} />
        <MetricRow label="מזומנים" value={formatILS(cashPosition)} color="#16a34a" />
        <MetricRow
          label="הלוואות"
          value={loanBalance > 0 ? `-${formatILS(loanBalance)}` : formatILS(0)}
          color={loanBalance > 0 ? "#dc2626" : undefined}
        />
      </div>

      {/* Divider + Net */}
      <div
        className="flex items-center justify-between"
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          marginTop: 4,
          paddingTop: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,0.5)" }}>רווח נקי</span>
        <span
          className="num"
          dir="ltr"
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: netIncome >= 0 ? "#16a34a" : "#dc2626" }}
        >
          {formatILS(netIncome)}
        </span>
      </div>
    </div>
  );
}
