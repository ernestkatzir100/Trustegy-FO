import { pgTable, text, integer, bigint, boolean, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "../helpers";

// ─── Distributors ─────────────────────────────────────────────────────────────

/**
 * Fund distributors / placement agents (מפיצים).
 * Fee percentages stored in basis points (e.g. 50 = 0.50%).
 */
export const distributors = pgTable("distributors", {
  id: id(),
  name: text("name").notNull(),
  email: text("email"),
  emailSecondary: text("email_secondary"),
  phoneMobile: text("phone_mobile"),
  phoneLandline: text("phone_landline"),
  /** מיוחד / מפיץ / מפיץ אופציונלי */
  type: text("type"),
  /** Feeder / No Contract / שותפות דמי הצלחה - סוכנות גג */
  contractType: text("contract_type"),
  /** עמלת היקף — volume/AUM fee in basis points */
  feeVolumeBps: integer("fee_volume_bps"),
  /** עמלת נפרעים — redemption fee in basis points */
  feeRedemptionBps: integer("fee_redemption_bps"),
  /** עמלת דמי הצלחה — success/performance fee in basis points */
  feeSuccessBps: integer("fee_success_bps"),
  /** Original Monday.com item ID for reference */
  mondayId: text("monday_id"),
  ...timestamps,
});

export type Distributor = typeof distributors.$inferSelect;
export type InsertDistributor = typeof distributors.$inferInsert;

// ─── Investors ────────────────────────────────────────────────────────────────

/**
 * LP investor register (ניהול משקיעים).
 * One-time migrated from Monday.com; Shefa is the system of record going forward.
 * Designed to support a future investor portal (portalEnabled flag).
 */
export const investors = pgTable("investors", {
  id: id(),

  // Identity
  /** External Partner ID from Apex/Monday (e.g. "8910-01-124") — primary join key */
  partnerId: text("partner_id").unique(),
  nameEn: text("name_en").notNull(),
  nameHe: text("name_he"),
  /** Canonical display name used throughout the UI */
  displayName: text("display_name").notNull(),

  // Contact
  email: text("email"),
  emailSecondary: text("email_secondary"),
  phoneMobile: text("phone_mobile"),
  phoneLandline: text("phone_landline"),

  // Classification
  /** סוג משקיע — individual / company / partnership etc. */
  investorType: text("investor_type"),
  /** כשיר — ISA-qualified investor */
  isQualified: boolean("is_qualified").notNull().default(false),
  /** ניצע — is beneficiary */
  isBeneficiary: boolean("is_beneficiary").notNull().default(false),
  /** מס תעודת זהות */
  idNumber: text("id_number"),
  address: text("address"),

  // Fund class
  /** ILS = NIS-denominated class, USD = dollar-denominated */
  currencyClass: text("currency_class").notNull().default("ILS"),
  /** α / β / etc. — management fee tier */
  managementFeeClass: text("management_fee_class"),

  // Status
  status: text("status").notNull().default("active"),
  fundManagerApproved: boolean("fund_manager_approved").notNull().default(false),

  // Dates (stored as YYYY-MM-DD text, consistent with fund.ts pattern)
  joinDate: text("join_date"),
  interestAccrualDate: text("interest_accrual_date"),

  // Bank details
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  bankAccount: text("bank_account"),

  // Relations
  distributorId: text("distributor_id"),
  referringAgent: text("referring_agent"),

  // Import metadata
  /** Original Monday.com item ID */
  mondayId: text("monday_id"),
  /** Deduplication workflow state */
  dedupStatus: text("dedup_status").notNull().default("clean"),

  // Future investor portal
  portalEnabled: boolean("portal_enabled").notNull().default(false),

  ...timestamps,
});

export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = typeof investors.$inferInsert;

// ─── Investor Positions ───────────────────────────────────────────────────────

/**
 * Monthly performance snapshots per investor per share class (עסקאות).
 * Full history imported from Monday / Apex 901 reports.
 * All money in smallest unit: NIS amounts in agorot (×100), USD amounts in cents (×100).
 * Percentages in basis points (1% = 100 bps).
 * Exchange rate stored as integer × 10000 (3.7512 → 37512).
 */
export const investorPositions = pgTable("investor_positions", {
  id: id(),
  investorId: text("investor_id").notNull(),

  // Period
  /** YYYY-MM-DD — the reporting month-end date */
  dataDate: text("data_date").notNull(),
  /** e.g. "A ILS", "B USD" */
  className: text("class_name"),
  /** ILS | USD */
  currencyClass: text("currency_class").notNull().default("ILS"),
  managementFeeClass: text("management_fee_class"),

  // Capital — NIS amounts in agorot, USD in cents (bigint to avoid int4 overflow on large funds)
  /** השקעה מקורית בש"ח */
  originalInvestmentNis: bigint("original_investment_nis", { mode: "number" }),
  navNis: bigint("nav_nis", { mode: "number" }),
  navUsd: bigint("nav_usd", { mode: "number" }),
  beginningNav: bigint("beginning_nav", { mode: "number" }),
  endingNav: bigint("ending_nav", { mode: "number" }),
  /** Exchange rate × 10000 (e.g. 3.7512 → 37512) */
  exchangeRate: integer("exchange_rate"),

  // Returns — basis points
  grossMtdBps: integer("gross_mtd_bps"),
  netMtdBps: integer("net_mtd_bps"),
  netYtdBps: integer("net_ytd_bps"),
  netItdBps: integer("net_itd_bps"),

  // Fees — NIS in agorot
  monthlyPerfFee: bigint("monthly_perf_fee", { mode: "number" }),
  cumulativePerfFee: bigint("cumulative_perf_fee", { mode: "number" }),
  mgmtFeeTotal: bigint("mgmt_fee_total", { mode: "number" }),
  redemptionFeePayable: bigint("redemption_fee_payable", { mode: "number" }),
  perfFeePayable: bigint("perf_fee_payable", { mode: "number" }),
  volumeFeePayable: bigint("volume_fee_payable", { mode: "number" }),

  /** אחוז מהקרן in basis points */
  fundAllocationBps: integer("fund_allocation_bps"),

  /** True if this row was imported via Apex 901 report */
  apexSource: boolean("apex_source").notNull().default(false),

  ...timestamps,
});

export type InvestorPosition = typeof investorPositions.$inferSelect;
export type InsertInvestorPosition = typeof investorPositions.$inferInsert;

// ─── Redemptions ──────────────────────────────────────────────────────────────

/**
 * Distribution / redemption events (חלוקות = פדיונות).
 * Money returned to investors. NIS amounts in agorot, USD in cents.
 */
export const redemptions = pgTable("redemptions", {
  id: id(),
  investorId: text("investor_id").notNull(),
  distributorId: text("distributor_id"),

  date: text("date"),
  /** ILS | USD */
  currency: text("currency").notNull().default("ILS"),

  amountUsd: bigint("amount_usd", { mode: "number" }),
  amountNis: bigint("amount_nis", { mode: "number" }),
  investmentAmountUsd: bigint("investment_amount_usd", { mode: "number" }),
  investmentAmountNis: bigint("investment_amount_nis", { mode: "number" }),
  distributionUsd: bigint("distribution_usd", { mode: "number" }),

  status: text("status"),
  /** Source Monday board name, e.g. "חלוקה נובמבר25" */
  sourceBoardName: text("source_board_name"),

  ...timestamps,
});

export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = typeof redemptions.$inferInsert;

// ─── Email Templates ──────────────────────────────────────────────────────────

export type EmailTemplateType = "capital_call" | "distribution" | "statement" | "general";

export const EMAIL_TEMPLATE_TYPES: EmailTemplateType[] = [
  "capital_call",
  "distribution",
  "statement",
  "general",
];

export const EMAIL_TEMPLATE_TYPE_LABELS: Record<EmailTemplateType, string> = {
  capital_call: "Capital Call",
  distribution: "Distribution Notice",
  statement: "Quarterly Statement",
  general: "General Update",
};

/**
 * Reusable email templates with {{variable}} placeholders.
 */
export const emailTemplates = pgTable("email_templates", {
  id: id(),
  name: text("name").notNull(),
  type: text("type").$type<EmailTemplateType>().notNull().default("general"),
  subjectTemplate: text("subject_template").notNull(),
  bodyTemplate: text("body_template").notNull(),
  createdBy: text("created_by"),
  ...timestamps,
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// ─── Email Logs ───────────────────────────────────────────────────────────────

export type EmailStatus = "sent" | "failed" | "bounced";

/**
 * Full audit trail of every email sent to an investor.
 * Attachments stored as JSON array: [{name: string, url: string}]
 */
export const emailLogs = pgTable("email_logs", {
  id: id(),
  investorId: text("investor_id").notNull(),
  templateId: text("template_id"),

  subject: text("subject").notNull(),
  body: text("body").notNull(),
  /** JSON: [{name: string, url: string}] */
  attachments: text("attachments"),

  sentBy: text("sent_by"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  resendMessageId: text("resend_message_id"),
  status: text("status").$type<EmailStatus>().notNull().default("sent"),

  ...timestamps,
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
