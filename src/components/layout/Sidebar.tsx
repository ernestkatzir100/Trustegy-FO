"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Briefcase,
  Landmark,
  Receipt,
  Store,
  Settings,
  LogOut,
} from "lucide-react";
import { SidebarItem } from "@/components/layout/SidebarItem";
import { logout } from "@/lib/auth/actions";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { icon: LucideIcon; labelKey: string; href: string }[] = [
  { icon: LayoutDashboard, labelKey: "dashboard", href: "/" },
  { icon: Briefcase, labelKey: "consulting", href: "/consulting" },
  { icon: Landmark, labelKey: "loans", href: "/loans" },
  { icon: Receipt, labelKey: "expenses", href: "/expenses" },
  { icon: Store, labelKey: "marketplace", href: "/marketplace" },
  { icon: Settings, labelKey: "settings", href: "/settings" },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("auth");

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed inset-block-0 inset-inline-start-0 z-[100] flex flex-col bg-sidebar-background border-ie border-sidebar-border transition-[width] duration-200 ease-out motion-reduce:transition-none"
      style={{ width: isExpanded ? 220 : 56 }}
    >
      {/* Logo area */}
      <div className="flex items-center h-14 px-[14px] gap-3 border-be border-sidebar-border">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gold flex items-center justify-center">
          <span className="text-[13px] font-bold text-white leading-none">ש</span>
        </div>
        {isExpanded && (
          <span className="text-[15px] font-semibold text-sidebar-foreground whitespace-nowrap">
            שפע
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 mt-3 flex-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            labelKey={item.labelKey}
            href={item.href}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg h-9 px-[10px] w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <LogOut className="flex-shrink-0 w-[18px] h-[18px]" />
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
