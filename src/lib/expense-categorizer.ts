export type ExpenseCategory =
  | "SALARY"
  | "VEHICLE"
  | "ACCOUNTING"
  | "MAINTENANCE"
  | "TAX"
  | "FINANCING"
  | "LEGAL"
  | "SUBCONTRACTOR"
  | "GIFTS"
  | "OTHER";

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { label: string; color: string; hex: string; bg: string }
> = {
  SALARY: { label: "משכורות", color: "blue", hex: "#3b82f6", bg: "#eff6ff" },
  VEHICLE: { label: "רכב", color: "orange", hex: "#f97316", bg: "#fff7ed" },
  ACCOUNTING: { label: "הנהלת חשבונות", color: "teal", hex: "#14b8a6", bg: "#f0fdfa" },
  MAINTENANCE: { label: "אחזקה", color: "gray", hex: "#6b7280", bg: "#f9fafb" },
  TAX: { label: "מיסים", color: "red", hex: "#ef4444", bg: "#fef2f2" },
  FINANCING: { label: "מימון", color: "purple", hex: "#8b5cf6", bg: "#f5f3ff" },
  LEGAL: { label: "משפטי", color: "indigo", hex: "#6366f1", bg: "#eef2ff" },
  SUBCONTRACTOR: { label: "קבלני משנה", color: "amber", hex: "#f59e0b", bg: "#fffbeb" },
  GIFTS: { label: "מתנות", color: "pink", hex: "#ec4899", bg: "#fdf2f8" },
  OTHER: { label: "אחר", color: "slate", hex: "#9ca3af", bg: "#f9fafb" },
};

const RULES: { category: ExpenseCategory; keywords: string[] }[] = [
  {
    category: "SALARY",
    keywords: [
      "משכורת",
      "שכר",
      "ביטוח לאומי",
      "מבטחים",
      "פנסיה",
      "salary",
      "payroll",
      "פיצויים",
      "הפרשות",
    ],
  },
  {
    category: "VEHICLE",
    keywords: [
      "דלק",
      "פז",
      "סונול",
      "דלקן",
      "ליסינג",
      "רכב",
      "חניה",
      "טסלה",
      "טסט",
      "fuel",
      "garage",
      "ביטוח רכב",
    ],
  },
  {
    category: "ACCOUNTING",
    keywords: [
      "הנהלת חשבונות",
      "רואה חשבון",
      'רו"ח',
      "ביקורת",
      "שומה",
      "accounting",
      "bookkeeping",
    ],
  },
  {
    category: "MAINTENANCE",
    keywords: [
      "תחזוקה",
      "ניקיון",
      "תיקון",
      "אחזקה",
      "שיפוץ",
      "חשמל",
      "מים",
      "maintenance",
      "repair",
      "שמירה",
      "אבטחה",
    ],
  },
  {
    category: "TAX",
    keywords: [
      "מס הכנסה",
      'מע"מ',
      "מקדמות",
      "ארנונה",
      "מס שבח",
      "רשות המסים",
      "tax",
      "vat",
      "היטל",
    ],
  },
  {
    category: "FINANCING",
    keywords: [
      "ריבית",
      "הלוואה",
      "משכנתא",
      "מזרחי",
      "פועלים",
      "btb",
      "עמלת",
      "בנק",
      "אשראי",
      "interest",
      "loan",
      "מימון",
      "פרעון",
      "הלוואה- פרעון",
    ],
  },
  {
    category: "LEGAL",
    keywords: [
      "עורך דין",
      'עו"ד',
      "ייעוץ משפטי",
      "נוטריון",
      "legal",
      "attorney",
      "בית משפט",
      "תביעה",
    ],
  },
  {
    category: "SUBCONTRACTOR",
    keywords: [
      "קבלן",
      "יועץ",
      "פרילנסר",
      "שירותי",
      "עצמאי",
      "contractor",
      "consultant",
      "freelance",
    ],
  },
  {
    category: "GIFTS",
    keywords: ["מתנה", "מתנות", "פרח", "gifts", "gift", "פרחים", "סל"],
  },
];

export function categorizeExpense(
  description: string,
  vendor?: string
): { category: ExpenseCategory; confidence: "HIGH" | "LOW" } {
  const text = `${description} ${vendor || ""}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return { category: rule.category, confidence: "HIGH" };
    }
  }
  return { category: "OTHER", confidence: "LOW" };
}
