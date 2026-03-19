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
