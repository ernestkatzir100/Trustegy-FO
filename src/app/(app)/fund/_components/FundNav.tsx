"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FUND_NAV = [
  { href: "/fund/portfolio", label: "Portfolio", live: true },
  { href: "/fund/import", label: "Data Import", live: true },
  { href: "/fund/analytics", label: "Analytics", live: true },
  { href: "/fund/investors", label: "Investors", live: false },
  { href: "/fund/apex", label: "Apex Reports", live: false },
] as const;

export function FundNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: 2,
        borderBottom: "1px solid var(--border)",
        paddingBottom: 0,
      }}
    >
      {FUND_NAV.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

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
            {!item.live && (
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
  );
}
