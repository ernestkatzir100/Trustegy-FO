import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "../helpers";

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Platform = "upright" | "sharestates" | "upgrade";

export type HoldingStatus =
  | "PERFORMING"
  | "LATE_PAYMENT"
  | "LOSS_MITIGATION"
  | "FORECLOSURE_EARLY"
  | "FORECLOSURE_MID"
  | "FORECLOSURE_LATE"
  | "REO"
  | "REO_LISTED"
  | "REO_UNDER_CONTRACT"
  | "BORROWER_WORKOUT"
  | "PAYOFF_EXPECTED"
  | "BANKRUPTCY"
  | "TITLE_ISSUE"
  | "NOTE_SALE"
  | "PARTIAL_RECOVERY"
  | "SETTLED"
  | "WRITTEN_OFF";

export type UpdateSource = "excel_upload" | "web_scrape" | "manual";
export type LiquidationConfidence = "high" | "medium" | "low";

// ─── Constants ────────────────────────────────────────────────────────────────

export const HOLDING_STATUSES: HoldingStatus[] = [
  "PERFORMING",
  "LATE_PAYMENT",
  "LOSS_MITIGATION",
  "FORECLOSURE_EARLY",
  "FORECLOSURE_MID",
  "FORECLOSURE_LATE",
  "REO",
  "REO_LISTED",
  "REO_UNDER_CONTRACT",
  "BORROWER_WORKOUT",
  "PAYOFF_EXPECTED",
  "BANKRUPTCY",
  "TITLE_ISSUE",
  "NOTE_SALE",
  "PARTIAL_RECOVERY",
  "SETTLED",
  "WRITTEN_OFF",
];

export const STATUS_LABELS: Record<HoldingStatus, string> = {
  PERFORMING: "Performing",
  LATE_PAYMENT: "Late Payment",
  LOSS_MITIGATION: "Loss Mitigation",
  FORECLOSURE_EARLY: "Foreclosure (Early)",
  FORECLOSURE_MID: "Foreclosure (Mid)",
  FORECLOSURE_LATE: "Foreclosure (Late)",
  REO: "REO",
  REO_LISTED: "REO Listed",
  REO_UNDER_CONTRACT: "REO Under Contract",
  BORROWER_WORKOUT: "Borrower Workout",
  PAYOFF_EXPECTED: "Payoff Expected",
  BANKRUPTCY: "Bankruptcy",
  TITLE_ISSUE: "Title Issue",
  NOTE_SALE: "Note Sale",
  PARTIAL_RECOVERY: "Partial Recovery",
  SETTLED: "Settled",
  WRITTEN_OFF: "Written Off",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  upright: "Upright / FTF",
  sharestates: "Sharestates",
  upgrade: "Upgrade / Prosper",
};

// ─── Schema ──────────────────────────────────────────────────────────────────

/**
 * NPL holdings for Pineapple Fund (Pineapple Entropy LP, LP 540293503).
 * Tracks positions across Upright/FTF, Sharestates, and Upgrade/Prosper.
 * All money amounts stored in USD cents (e.g. $27,000 = 2700000).
 */
export const fundHoldings = pgTable("fund_holdings", {
  id: id(),

  // Platform & identification
  platform: text("platform").$type<Platform>().notNull(),
  offeringId: text("offering_id").notNull(),

  // Property info
  propertyAddress: text("property_address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  propertyType: text("property_type"),

  // Financial — stored in USD cents
  originalInvestment: integer("original_investment"),
  currentPrincipal: integer("current_principal"),
  costBasisApex: integer("cost_basis_apex"),
  marketValueApex: integer("market_value_apex").default(0),
  accrualDate: text("accrual_date"),
  maturityDate: text("maturity_date"),
  /** Annual percentage rate in basis points (1200 = 12.00%) */
  apr: integer("apr"),
  totalEarned: integer("total_earned"),
  lastPaymentDate: text("last_payment_date"),
  lastPaymentAmount: integer("last_payment_amount"),

  // Status tracking
  status: text("status").$type<HoldingStatus>().notNull().default("PERFORMING"),
  subStatus: text("sub_status"),
  lastUpdateDate: text("last_update_date"),
  lastUpdateSource: text("last_update_source").$type<UpdateSource>(),
  lastUpdateText: text("last_update_text"),

  // Loan underwriting
  borrowerName: text("borrower_name"),
  /** Loan-to-ARV in basis points (6460 = 64.60%) */
  loanToArv: integer("loan_to_arv"),
  /** After-Repair Value in USD cents */
  arv: integer("arv"),
  guaranteeType: text("guarantee_type"),
  securityPosition: text("security_position"),

  // Recovery estimates — USD cents
  liquidationEstimateLow: integer("liquidation_estimate_low"),
  liquidationEstimateHigh: integer("liquidation_estimate_high"),
  liquidationTimelineMonths: integer("liquidation_timeline_months"),
  liquidationConfidence: text("liquidation_confidence").$type<LiquidationConfidence>(),
  resolutionNotes: text("resolution_notes"),

  // RBNF pooled notes
  isRbnf: boolean("is_rbnf").notNull().default(false),
  rbnfUnderlyingCount: integer("rbnf_underlying_count"),

  // Special flags
  hurricaneDamage: boolean("hurricane_damage").notNull().default(false),
  /** Partial payoff already distributed, in USD cents */
  partialPayoffReceived: integer("partial_payoff_received"),

  ...timestamps,
});

export type FundHolding = typeof fundHoldings.$inferSelect;
export type InsertFundHolding = typeof fundHoldings.$inferInsert;
