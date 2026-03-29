"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const INVESTOR_NAV: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/fund/investors", label: "LP Register", exact: true },
  { href: "/fund/investors/analytics", label: "Analytics" },
  { href: "/fund/investors/email", label: "Email" },
  { href: "/fund/investors/import", label: "Import" },
  { href: "/fund/investors/qa", label: "🔍 QA" },
];

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Secondary nav */}
      <nav
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {INVESTOR_NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href || pathname === item.href + "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--accent)" : "var(--text-muted)",
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
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
