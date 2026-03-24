import { toAgorot } from "./money";

/**
 * Demo financial data per entity for dashboard display.
 * All amounts in agorot (integer). Will be replaced by real DB queries
 * once financial modules (consulting, expenses, loans) are built.
 */

interface EntityFinancials {
  revenue: number;
  expenses: number;
  cashPosition: number;
  loanBalance: number;
  revenueChangePercent: number;
  status: "healthy" | "attention" | "urgent";
}

// Demo data keyed by entity name
const DEMO_FINANCIALS: Record<string, EntityFinancials> = {
  "טראסטג'י ייעוץ": {
    revenue: toAgorot(842000),
    expenses: toAgorot(315000),
    cashPosition: toAgorot(487000),
    loanBalance: 0,
    revenueChangePercent: 12,
    status: "healthy",
  },
  "חברת השקעות": {
    revenue: toAgorot(1250000),
    expenses: toAgorot(180000),
    cashPosition: toAgorot(2340000),
    loanBalance: toAgorot(750000),
    revenueChangePercent: -3,
    status: "attention",
  },
  "אחזקות אישיות": {
    revenue: toAgorot(96000),
    expenses: toAgorot(142000),
    cashPosition: toAgorot(215000),
    loanBalance: toAgorot(420000),
    revenueChangePercent: 0,
    status: "healthy",
  },
};

const DEFAULT_FINANCIALS: EntityFinancials = {
  revenue: 0,
  expenses: 0,
  cashPosition: 0,
  loanBalance: 0,
  revenueChangePercent: 0,
  status: "healthy",
};

export function getDemoFinancials(entityName: string): EntityFinancials {
  return DEMO_FINANCIALS[entityName] ?? DEFAULT_FINANCIALS;
}

export function getConsolidatedFinancials(entityNames: string[]) {
  const all = entityNames.map((n) => getDemoFinancials(n));
  const totalRevenue = all.reduce((sum, e) => sum + e.revenue, 0);
  const totalExpenses = all.reduce((sum, e) => sum + e.expenses, 0);
  const totalCash = all.reduce((sum, e) => sum + e.cashPosition, 0);
  const totalLoans = all.reduce((sum, e) => sum + e.loanBalance, 0);

  // Weighted avg change
  const weightedChange =
    totalRevenue > 0
      ? Math.round(
          all.reduce((sum, e) => sum + e.revenueChangePercent * e.revenue, 0) /
            totalRevenue
        )
      : 0;

  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    cashPosition: totalCash,
    loanBalance: totalLoans,
    revenueChangePercent: weightedChange,
    outstandingInvoices: toAgorot(185000), // demo: 3 invoices
    outstandingCount: 3,
  };
}

export interface UpcomingPayment {
  description: string;
  amount: number; // agorot
  dueDate: string;
  entity: string;
  daysUntil: number;
}

export function getDemoUpcomingPayments(): UpcomingPayment[] {
  return [
    {
      description: "החזר הלוואה — בנק דיסקונט",
      amount: toAgorot(18500),
      dueDate: "2026-03-24",
      entity: "חברת השקעות",
      daysUntil: 5,
    },
    {
      description: "תשלום ריבית — משכנתא",
      amount: toAgorot(8200),
      dueDate: "2026-03-28",
      entity: "אחזקות אישיות",
      daysUntil: 9,
    },
    {
      description: "החזר קרן — בנק הפועלים",
      amount: toAgorot(32000),
      dueDate: "2026-04-01",
      entity: "חברת השקעות",
      daysUntil: 13,
    },
  ];
}

export interface RecentActivity {
  description: string;
  amount: number; // agorot, positive = income, negative = expense
  date: string;
  entity: string;
  type: "income" | "expense" | "payment";
}

/* ── Portfolio-level demo data ── */

export interface PortfolioSummary {
  totalValue: number;
  yearlyReturn: number;
  freeCash: number;
  cumulativeReturn: number;
  riskLevel: string;
  riskPercent: number;
  riskNote: string;
  monthlyIncome: number;
  monthlyIncomeNote: string;
}

export function getDemoPortfolioSummary(): PortfolioSummary {
  return {
    totalValue: toAgorot(12450890),
    yearlyReturn: 14.2,
    freeCash: toAgorot(840200),
    cumulativeReturn: toAgorot(1560000),
    riskLevel: "בינוני-גבוה",
    riskPercent: 65,
    riskNote: "מותאם ליעדי הצמיחה לשנת 2026",
    monthlyIncome: toAgorot(42500),
    monthlyIncomeNote: "כולל דיבידנדים ושכר דירה",
  };
}

export interface AssetSlice {
  label: string;
  percent: number;
  value: number;
  color: string;
}

export function getDemoAssetAllocation(): { slices: AssetSlice[]; totalAssets: number } {
  return {
    totalAssets: 12,
    slices: [
      { label: "מניות", percent: 45, value: toAgorot(5602900), color: "#00685f" },
      { label: 'נדל"ן', percent: 25, value: toAgorot(3112700), color: "#0f172a" },
      { label: 'אג"ח ונכסים חלופיים', percent: 30, value: toAgorot(3735290), color: "#94A3B8" },
    ],
  };
}

export interface HoldingData {
  name: string;
  category: string;
  value: number;
  returnPercent: number;
  status: "active" | "pending" | "watching";
}

export function getDemoHoldings(): HoldingData[] {
  return [
    { name: "Apple Inc. (AAPL)", category: "טכנולוגיה / מניות", value: toAgorot(1450200), returnPercent: 24.5, status: "active" },
    { name: 'נדל"ן — לונדון מזרח', category: 'נדל"ן מסחרי', value: toAgorot(3112700), returnPercent: 8.2, status: "active" },
    { name: 'אג"ח ממשלתי ישראל', category: 'אג"ח ממשלתי', value: toAgorot(840000), returnPercent: 2.1, status: "pending" },
    { name: "Microsoft (MSFT)", category: "טכנולוגיה / מניות", value: toAgorot(920400), returnPercent: 18.4, status: "active" },
  ];
}

export function getDemoRecentActivity(): RecentActivity[] {
  return [
    {
      description: "חשבונית ייעוץ — לקוח אלפא",
      amount: toAgorot(45000),
      date: "2026-03-18",
      entity: "טראסטג'י ייעוץ",
      type: "income",
    },
    {
      description: "שכירות משרד — מרץ",
      amount: toAgorot(-12000),
      date: "2026-03-15",
      entity: "טראסטג'י ייעוץ",
      type: "expense",
    },
    {
      description: "דיבידנד מקרן השקעות",
      amount: toAgorot(78000),
      date: "2026-03-14",
      entity: "חברת השקעות",
      type: "income",
    },
    {
      description: "החזר הלוואה — בנק דיסקונט",
      amount: toAgorot(-18500),
      date: "2026-03-10",
      entity: "חברת השקעות",
      type: "payment",
    },
    {
      description: "ביטוח דירה — רבעון 1",
      amount: toAgorot(-3200),
      date: "2026-03-08",
      entity: "אחזקות אישיות",
      type: "expense",
    },
  ];
}
