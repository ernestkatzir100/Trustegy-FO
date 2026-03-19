"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
      { href: "/consulting", icon: FolderKanban, label: "פרויקטים" },
      { href: "/expenses", icon: CreditCard, label: "הוצאות" },
      { href: "/loans", icon: TrendingUp, label: "תזרים" },
    ],
  },
  {
    label: "פיננסי",
    items: [
      { href: "/marketplace", icon: Building2, label: "בנקים" },
      { href: "/migration", icon: Landmark, label: "מימון" },
    ],
  },
  {
    label: "ניהול",
    items: [
      { href: "/settings", icon: Settings, label: "הגדרות" },
    ],
  },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("auth");

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed inset-block-0 inset-inline-start-0 z-[100] flex flex-col bg-sidebar-background border-ie border-sidebar-border transition-[width] duration-200 ease-out motion-reduce:transition-none"
      style={{ width: isExpanded ? 220 : 56 }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-[14px] gap-3 border-be border-sidebar-border">
        <div className="shrink-0 w-7 h-7 rounded-lg bg-gold flex items-center justify-center">
          <span className="text-[13px] font-bold text-white leading-none">ש</span>
        </div>
        {isExpanded && (
          <span className="text-[15px] font-semibold text-sidebar-foreground whitespace-nowrap">
            שפע
          </span>
        )}
      </div>

      {/* Navigation groups */}
      <nav className="flex flex-col flex-1 px-2 mt-3 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {isExpanded && (
              <div className="text-[10px] font-bold tracking-widest uppercase text-sidebar-foreground/30 px-[10px] pt-3 pb-1">
                {group.label}
              </div>
            )}
            {!isExpanded && group !== NAV_GROUPS[0] && (
              <div className="h-px bg-sidebar-border mx-2 my-2" />
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
                    "flex items-center gap-3 rounded-lg h-9 px-[10px] mb-0.5 transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    !isExpanded && "justify-center"
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0 w-[17px] h-[17px]",
                      isActive ? "text-gold" : ""
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {isExpanded && (
                    <span className="text-[13px] whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-3">
        <form action={logout}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-3 rounded-lg h-9 px-[10px] w-full",
              "text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              !isExpanded && "justify-center"
            )}
          >
            <LogOut className="shrink-0 w-[17px] h-[17px]" strokeWidth={1.8} />
            {isExpanded && (
              <span className="text-[13px] whitespace-nowrap">
                {t("signOut")}
              </span>
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}
