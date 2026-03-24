import Link from "next/link";
import { headers } from "next/headers";

const FUND_NAV = [
  { href: "/fund/portfolio", label: "Portfolio" },
  { href: "/fund/analytics", label: "Analytics" },
  { href: "/fund/investors", label: "Investors" },
  { href: "/fund/import", label: "Data Import" },
  { href: "/fund/apex", label: "Apex Reports" },
] as const;

export default async function FundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

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
      <nav
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 0,
        }}
      >
        {FUND_NAV.map((item) => {
          const isPlaceholder = ["/fund/analytics", "/fund/investors", "/fund/import", "/fund/apex"].includes(item.href);
          const isActive = pathname === item.href || (!pathname && item.href === "/fund/portfolio");

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                borderBottom: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                marginBottom: -1,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {item.label}
              {isPlaceholder && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    background: "rgba(107,114,128,0.15)",
                    color: "var(--text-muted)",
                    borderRadius: 4,
                    padding: "1px 4px",
                  }}
                >
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
