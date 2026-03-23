import { formatILS, toAgorot } from "@/lib/money";

const DEMO_ACCOUNTS = [
  { bank: "בנק מזרחי טפחות", accountNum: "12-345-678901", type: "עו\"ש", balance: 1250000, color: "#e11d48" },
  { bank: "בנק הפועלים", accountNum: "56-789-012345", type: "עו\"ש", balance: 890000, color: "#2563eb" },
  { bank: "בנק לאומי", accountNum: "10-234-567890", type: "חסכון", balance: 2100000, color: "#059669" },
  { bank: "בנק דיסקונט", accountNum: "23-456-789012", type: "פיקדון", balance: 500000, color: "#7c3aed" },
];

const DEMO_TRANSACTIONS = [
  { date: "2026-03-20", ref: "TXN-4521", desc: "העברה מחשבון חסכון", credit: 150000, debit: 0, balance: 1250000 },
  { date: "2026-03-18", ref: "TXN-4520", desc: "תשלום משכורות מרץ", credit: 0, debit: 85000, balance: 1100000 },
  { date: "2026-03-15", ref: "TXN-4519", desc: "קבלה - דמי ניהול Q1", credit: 245000, debit: 0, balance: 1185000 },
  { date: "2026-03-12", ref: "TXN-4518", desc: "תשלום שכירות משרד", credit: 0, debit: 18000, balance: 940000 },
  { date: "2026-03-10", ref: "TXN-4517", desc: "ריבית הלוואה", credit: 0, debit: 12500, balance: 958000 },
  { date: "2026-03-08", ref: "TXN-4516", desc: "קבלה - עמלת ייעוץ", credit: 85000, debit: 0, balance: 970500 },
];

function getBankInitials(name: string): string {
  const words = name.split(" ");
  if (words.length >= 2) return words[0][0] + words[1][0];
  return name.slice(0, 2);
}

export default function BanksPage() {
  const totalBalance = DEMO_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);

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
          בנקים
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          חשבונות בנק ותנועות
        </p>
      </div>

      {/* Account cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_ACCOUNTS.map((account) => (
          <div
            key={account.accountNum}
            className="card-base elev-1"
            style={{ padding: "20px" }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
              {/* Colored icon circle */}
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  background: account.color + "18",
                  color: account.color,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {getBankInitials(account.bank)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {account.bank}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {account.accountNum}
                </div>
              </div>
            </div>

            {/* Type badge */}
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--bg-tint)",
                  color: "var(--text-secondary)",
                }}
              >
                {account.type}
              </span>
            </div>

            {/* Balance */}
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--success)",
                letterSpacing: "-0.02em",
              }}
            >
              {formatILS(toAgorot(account.balance))}
            </div>
          </div>
        ))}
      </div>

      {/* Total balance banner */}
      <div
        className="card-base"
        style={{
          padding: "18px 24px",
          background: "linear-gradient(135deg, var(--accent) 0%, #0f766e 100%)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
          סה&quot;כ יתרות בכל החשבונות
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
          {formatILS(toAgorot(totalBalance))}
        </span>
      </div>

      {/* Transactions table */}
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
            תנועות אחרונות
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
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "start",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  תאריך
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "start",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  אסמכתא
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "start",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  תיאור
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "start",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  זכות
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "start",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  חובה
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "start",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  יתרה
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TRANSACTIONS.map((tx) => (
                <tr
                  key={tx.ref}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.date}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: "monospace",
                      color: "var(--text-muted)",
                      fontSize: 12,
                    }}
                  >
                    {tx.ref}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {tx.desc}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: tx.credit > 0 ? "var(--success)" : "var(--text-muted)",
                      fontWeight: tx.credit > 0 ? 600 : 400,
                    }}
                  >
                    {tx.credit > 0 ? formatILS(toAgorot(tx.credit)) : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: tx.debit > 0 ? "var(--danger)" : "var(--text-muted)",
                      fontWeight: tx.debit > 0 ? 600 : 400,
                    }}
                  >
                    {tx.debit > 0 ? formatILS(toAgorot(tx.debit)) : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatILS(toAgorot(tx.balance))}
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
