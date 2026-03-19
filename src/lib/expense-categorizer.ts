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
  { label: string; color: string }
> = {
  SALARY: { label: "משכורות", color: "blue" },
  VEHICLE: { label: "רכב", color: "orange" },
  ACCOUNTING: { label: "הנהלת חשבונות", color: "teal" },
  MAINTENANCE: { label: "אחזקה", color: "gray" },
  TAX: { label: "מיסים", color: "red" },
  FINANCING: { label: "מימון", color: "purple" },
  LEGAL: { label: "משפטי", color: "indigo" },
  SUBCONTRACTOR: { label: "קבלני משנה", color: "amber" },
  GIFTS: { label: "מתנות", color: "pink" },
  OTHER: { label: "אחר", color: "slate" },
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
