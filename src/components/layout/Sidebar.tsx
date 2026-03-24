"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  TrendingUp,
  BarChart2,
  CreditCard,
  Building2,
  Landmark,
  PieChart,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  Plus,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth/actions";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "ראשי",
    items: [
      { href: "/", icon: LayoutDashboard, label: "לוח בקרה" },
      { href: "/projects", icon: FolderKanban, label: "פרויקטים" },
      { href: "/billing", icon: Receipt, label: "חיוב" },
      { href: "/cashflow", icon: TrendingUp, label: "תזרים" },
      { href: "/reports/pnl", icon: BarChart2, label: "דוחות" },
    ],
  },
  {
    label: "פיננסי",
    items: [
      { href: "/expenses", icon: CreditCard, label: "הוצאות" },
      { href: "/banks", icon: Building2, label: "בנקים" },
      { href: "/financing", icon: Landmark, label: "מימון" },
      { href: "/investments", icon: PieChart, label: "השקעות" },
    ],
  },
  {
    label: "קרן פיינאפל",
    items: [
      { href: "/fund", icon: Briefcase, label: "Fund Management" },
    ],
  },
  {
    label: "ניהול",
    items: [
      { href: "/clients", icon: Users, label: "לקוחות" },
      { href: "/settings", icon: Settings, label: "הגדרות" },
    ],
  },
];

export function Sidebar() {
  const [isExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-block-0 inset-inline-start-0 z-50 flex flex-col"
      style={{
        width: isExpanded ? 256 : 64,
        background: "var(--sidebar-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "var(--shadow-lg)",
        transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "40px 32px 0" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 48 }}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent), var(--accent-container))",
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            ש
          </div>
          {isExpanded && (
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                TRUSTEGY
              </h1>
              <p className="text-label" style={{ color: "var(--text-muted)", marginTop: 2 }}>
                ניהול פיננסי
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              {isExpanded && (
                <div
                  className="text-label"
                  style={{
                    color: "var(--text-muted)",
                    padding: "0 16px",
                    marginBottom: 4,
                    opacity: 0.6,
                  }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 tonal-shift",
                      !isExpanded && "justify-center"
                    )}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "var(--accent)" : "var(--sidebar-text)",
                      borderInlineEnd: isActive ? "4px solid var(--accent)" : "4px solid transparent",
                      background: isActive ? "var(--sidebar-hover)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--sidebar-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <Icon
                      className="shrink-0"
                      style={{ width: 20, height: 20 }}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {isExpanded && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Action button */}
        {isExpanded && (
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2"
            style={{
              marginTop: 24,
              padding: "14px 0",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent), var(--accent-container))",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,104,95,0.2)",
            }}
          >
            <Plus style={{ width: 18, height: 18 }} />
            <span>פעולה חדשה</span>
          </button>
        )}
      </div>

      {/* Bottom section */}
      <div className="mt-auto" style={{ padding: "16px 32px 32px" }}>
        <Link
          href="#"
          className="flex items-center gap-3 tonal-shift"
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            color: "var(--sidebar-muted)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sidebar-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <HelpCircle style={{ width: 20, height: 20 }} strokeWidth={1.8} />
          {isExpanded && <span>עזרה</span>}
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full tonal-shift"
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              color: "var(--sidebar-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut style={{ width: 20, height: 20 }} strokeWidth={1.8} />
            {isExpanded && <span>יציאה</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
