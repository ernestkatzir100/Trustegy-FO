import { TrendingUp, ShieldCheck, Banknote } from "lucide-react";
import { formatILS } from "@/lib/money";

interface PortfolioHeroProps {
  totalValue: number;
  yearlyReturn: number;
  freeCash: number;
  cumulativeReturn: number;
  riskLevel: string;
  riskPercent: number;
  riskNote: string;
  monthlyIncome: number;
  monthlyIncomeNote: string;
}

export function PortfolioHero({
  totalValue,
  yearlyReturn,
  freeCash,
  cumulativeReturn,
  riskLevel,
  riskPercent,
  riskNote,
  monthlyIncome,
  monthlyIncomeNote,
}: PortfolioHeroProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {/* Total Portfolio Value — spans 2 columns */}
      <div className="md:col-span-2 card-base elev-1 relative overflow-hidden group" style={{ padding: "28px 28px 24px" }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(13,150,139,0.06) 50%, transparent 100%)" }} />
        <div className="flex justify-between items-start">
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
              סה&quot;כ שווי התיק
            </p>
            <h2
              className="num"
              dir="ltr"
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {formatILS(totalValue)}
            </h2>
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{
              background: "rgba(13,148,136,0.15)",
              color: "#0d9488",
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <TrendingUp size={14} strokeWidth={2.5} />
            <span dir="ltr">+{yearlyReturn}% השנה</span>
          </div>
        </div>
        <div className="mt-7 flex gap-8">
          <div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 4 }}>
              מזומן פנוי
            </p>
            <p className="num" dir="ltr" style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
              {formatILS(freeCash)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 4 }}>
              תשואה מצטברת
            </p>
            <p className="num" dir="ltr" style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
              {formatILS(cumulativeReturn)}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="card-base elev-1 flex flex-col justify-between" style={{ padding: "24px" }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>
              רמת סיכון
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{riskLevel}</h3>
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--accent-teal-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={16} style={{ color: "#0d9488" }} />
          </div>
        </div>
        <div>
          <div style={{ width: "100%", height: 6, background: "var(--bg-tint)", borderRadius: 20, marginTop: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${riskPercent}%`, background: "#0d9488", borderRadius: 20 }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 8 }}>{riskNote}</p>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="card-base elev-1 flex flex-col justify-between" style={{ padding: "24px" }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>
              הכנסה חודשית צפויה
            </p>
            <h3 className="num" dir="ltr" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              {formatILS(monthlyIncome)}
            </h3>
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--accent-teal-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Banknote size={16} style={{ color: "#0d9488" }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4" style={{ color: "#0d9488" }}>
          <p style={{ fontSize: 12, fontWeight: 500 }}>{monthlyIncomeNote}</p>
        </div>
      </div>
    </section>
  );
}
