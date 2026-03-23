"use client";

import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/expense-categorizer";

export function CategoryBadge({ category }: { category: string }) {
  const cat = EXPENSE_CATEGORIES[category as ExpenseCategory];
  if (!cat) return <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{category}</span>;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: `${cat.hex}14`,
        color: cat.hex,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: "var(--radius-full)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cat.hex,
          flexShrink: 0,
        }}
      />
      {cat.label}
    </span>
  );
}
