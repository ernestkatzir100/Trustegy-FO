"use client";

import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/expense-categorizer";

const colorMap: Record<string, string> = {
  blue: "rgba(59,130,246,0.15)",
  orange: "rgba(249,115,22,0.15)",
  teal: "rgba(13,148,136,0.15)",
  gray: "rgba(148,163,184,0.15)",
  red: "rgba(239,68,68,0.15)",
  purple: "rgba(139,92,246,0.15)",
  indigo: "rgba(99,102,241,0.15)",
  amber: "rgba(245,158,11,0.15)",
  pink: "rgba(236,72,153,0.15)",
  slate: "rgba(148,163,184,0.15)",
};

const textColorMap: Record<string, string> = {
  blue: "#60a5fa",
  orange: "#fb923c",
  teal: "#2dd4bf",
  gray: "#94a3b8",
  red: "#f87171",
  purple: "#a78bfa",
  indigo: "#818cf8",
  amber: "#fbbf24",
  pink: "#f472b6",
  slate: "#94a3b8",
};

export function CategoryBadge({ category }: { category: string }) {
  const cat = EXPENSE_CATEGORIES[category as ExpenseCategory];
  const bg = cat ? (colorMap[cat.color] ?? colorMap.slate) : colorMap.slate;
  const textColor = cat ? (textColorMap[cat.color] ?? textColorMap.slate) : textColorMap.slate;
  const label = cat?.label ?? category;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        background: bg,
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}
