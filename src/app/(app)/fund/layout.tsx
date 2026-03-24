import { FundNav } from "./_components/FundNav";

export default async function FundLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex flex-col gap-6">
      {/* Module header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Pineapple Entropy LP · LP 540293503
          </span>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Fund Management
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          NPL portfolio tracking, recovery analytics, and investor CRM
        </p>
      </div>

      {/* Sub-navigation */}
      <FundNav />

      {children}
    </div>
  );
}
