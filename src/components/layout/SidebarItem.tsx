"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  labelKey: string;
  href: string;
  isExpanded: boolean;
}

export function SidebarItem({
  icon: Icon,
  labelKey,
  href,
  isExpanded,
}: SidebarItemProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg h-9 px-[10px] transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon
        className={cn(
          "flex-shrink-0 w-[18px] h-[18px]",
          isActive && "text-gold"
        )}
      />
      {isExpanded && (
        <span className="text-[13px] whitespace-nowrap">
          {t(labelKey as "dashboard" | "consulting" | "loans" | "expenses" | "marketplace" | "migration" | "settings")}
        </span>
      )}
    </Link>
  );
}
