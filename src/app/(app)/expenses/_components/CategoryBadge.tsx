"use client";

import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/expense-categorizer";

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  red: "bg-red-50 text-red-700 border-red-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export function CategoryBadge({ category }: { category: string }) {
  const cat = EXPENSE_CATEGORIES[category as ExpenseCategory];
  const colors = cat ? (colorMap[cat.color] ?? colorMap.slate) : colorMap.slate;
  const label = cat?.label ?? category;

  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${colors}`}
    >
      {label}
    </span>
  );
}
