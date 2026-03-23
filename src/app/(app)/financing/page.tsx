import { formatILS, toAgorot } from "@/lib/money";

const DEMO_LOANS = [
  { lender: "בנק מזרחי טפחות", type: "הלוואה עסקית", original: 2000000, balance: 1450000, rate: 3.8, endDate: "2028-06", monthly: 18500 },
  { lender: "בנק הפועלים", type: "משכנתא", original: 3500000, balance: 2800000, rate: 4.2, endDate: "2035-12", monthly: 28000 },
  { lender: "בנק לאומי", type: "הלוואה לזמן קצר", original: 500000, balance: 320000, rate: 5.1, endDate: "2027-03", monthly: 22000 },
];

const DEMO_OWNER_LOANS = [
  { lender: "ארנסט כציר", amount: 800000, balance: 600000, rate: 3.0, endDate: "2027-12", status: "active" as const },
  { lender: "דנה כציר", amount: 400000, balance: 0, rate: 2.5, endDate: "2025-06", status: "completed" as const },
];

function getLenderInitials(name: string): string {
  const words = name.split(" ");
  if (words.length >= 2) return words[0][0] + words[1][0];
  return name.slice(0, 2);
}

export default function FinancingPage() {
  const totalDebt = DEMO_LOANS.reduce((sum, l) => sum + l.balance, 0);
  const totalMonthly = DEMO_LOANS.reduce((sum, l) => sum + l.monthly, 0);
  const avgRate =
    DEMO_LOANS.reduce((sum, l) => sum + l.rate * l.balance, 0) /
    DEMO_LOANS.reduce((sum, l) => sum + l.balance, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          מימון
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          ניהול הלוואות ומימון
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total debt */}
        <div className="card-base elev-1" style={{ padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
            סה&quot;כ חוב
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--danger)", letterSpacing: "-0.02em" }}>
            {formatILS(toAgorot(totalDebt))}
          </div>
        </div>

        {/* Monthly payment */}
        <div className="card-base elev-1" style={{ padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
            תשלום חודשי
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--warning)", letterSpacing: "-0.02em" }}>
            {formatILS(toAgorot(totalMonthly))}
          </div>
        </div>

        {/* Average rate */}
        <div className="card-base elev-1" style={{ padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
            ריבית ממוצעת
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>
            {avgRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Loan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_LOANS.map((loan) => {
          const repaidPct = ((loan.original - loan.balance) / loan.original) * 100;
          return (
            <div
              key={loan.lender + loan.type}
              className="card-base elev-1"
              style={{ padding: "20px" }}
            >
              {/* Lender header */}
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {getLenderInitials(loan.lender)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    {loan.lender}
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--bg-tint)",
                      color: "var(--text-secondary)",
                      marginTop: 3,
                    }}
                  >
                    {loan.type}
                  </span>
                </div>
              </div>

              {/* Amounts */}
              <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>סכום מקורי</span>
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                  {formatILS(toAgorot(loan.original))}
                </span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 12 }}>
                <span style={{ color: "var(--text-muted)" }}>יתרה נוכחית</span>
                <span style={{ fontWeight: 700, color: "var(--danger)" }}>
                  {formatILS(toAgorot(loan.balance))}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: "var(--radius-full)",
                  background: "var(--bg-subtle)",
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${repaidPct}%`,
                    height: "100%",
                    borderRadius: "var(--radius-full)",
                    background: "var(--accent)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, textAlign: "center" as const }}>
                {repaidPct.toFixed(0)}% שולם
              </div>

              {/* Rate + end date + monthly */}
              <div
                className="flex justify-between"
                style={{
                  fontSize: 12,
                  paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>ריבית</div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--warning-subtle)",
                      color: "var(--warning)",
                    }}
                  >
                    {loan.rate}%
                  </span>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>סיום</div>
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    {loan.endDate}
                  </div>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>חודשי</div>
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    {formatILS(toAgorot(loan.monthly))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Owner loans table */}
      <div className="card-base elev-1" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            הלוואות בעלים
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["מלווה", "סכום מקורי", "יתרה", "ריבית", "תאריך סיום", "סטטוס"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: "10px 16px",
                        textAlign: "start",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        fontSize: 12,
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {DEMO_OWNER_LOANS.map((ol) => (
                <tr
                  key={ol.lender}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {ol.lender}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {formatILS(toAgorot(ol.amount))}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: ol.balance > 0 ? "var(--danger)" : "var(--text-muted)",
                    }}
                  >
                    {ol.balance > 0 ? formatILS(toAgorot(ol.balance)) : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {ol.rate}%
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {ol.endDate}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        background:
                          ol.status === "active"
                            ? "var(--success-subtle)"
                            : "var(--bg-subtle)",
                        color:
                          ol.status === "active"
                            ? "var(--success)"
                            : "var(--text-muted)",
                      }}
                    >
                      {ol.status === "active" ? "פעילה" : "הושלמה"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
