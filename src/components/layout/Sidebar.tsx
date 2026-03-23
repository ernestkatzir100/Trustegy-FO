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
    label: "ניהול",
    items: [
      { href: "/clients", icon: Users, label: "לקוחות" },
      { href: "/settings", icon: Settings, label: "הגדרות" },
    ],
  },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-block-0 inset-inline-start-0 z-[100] flex flex-col transition-[width] duration-200 ease-out motion-reduce:transition-none"
      style={{
        width: isExpanded ? 220 : 56,
        background: "var(--sidebar-bg, #161B27)",
      }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center h-14 px-[14px] gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          style={{ background: "#22c55e" }}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="text-[13px] font-bold text-white leading-none">ש</span>
        </button>
        {isExpanded && (
          <span className="text-[15px] font-semibold text-white whitespace-nowrap">
            שפע
          </span>
        )}
      </div>

      {/* Navigation groups */}
      <nav className="flex flex-col flex-1 px-2 mt-3 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {isExpanded && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  padding: "12px 14px 4px",
                }}
              >
                {group.label}
              </div>
            )}
            {!isExpanded && group !== NAV_GROUPS[0] && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px" }} />
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
                    "flex items-center rounded-lg mb-0.5 transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    !isExpanded && "justify-center"
                  )}
                  style={{
                    gap: 10,
                    padding: "9px 12px",
                    fontSize: 14,
                    borderRadius: 8,
                    color: isActive ? "#0d9488" : "rgba(255,255,255,0.5)",
                    background: isActive ? "rgba(13,148,136,0.08)" : "transparent",
                    borderInlineEnd: isActive ? "3px solid #0d9488" : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon
                    className="shrink-0"
                    style={{
                      width: 17,
                      height: 17,
                      color: isActive ? "#0d9488" : undefined,
                    }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {isExpanded && (
                    <span className="whitespace-nowrap" style={{ fontSize: 13 }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {isExpanded ? (
          <div className="flex items-center gap-3 mb-2" style={{ padding: "4px 4px" }}>
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#0d9488",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              E
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-white truncate">Ernest Katzir</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>מנהל מערכת</span>
            </div>
          </div>
        ) : null}

        <form action={logout}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-3 rounded-lg h-9 px-[10px] w-full transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              !isExpanded && "justify-center"
            )}
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut className="shrink-0 w-[17px] h-[17px]" strokeWidth={1.8} />
            {isExpanded && (
              <span className="text-[13px] whitespace-nowrap">יציאה</span>
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}
