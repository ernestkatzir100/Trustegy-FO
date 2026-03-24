import { z } from "zod";
import type { HoldingStatus, Platform, UpdateSource, LiquidationConfidence } from "@/db/schema/fund";

const platformEnum = z.enum(["upright", "sharestates", "upgrade"] as [Platform, ...Platform[]]);
const statusEnum = z.enum([
  "PERFORMING", "LATE_PAYMENT", "LOSS_MITIGATION",
  "FORECLOSURE_EARLY", "FORECLOSURE_MID", "FORECLOSURE_LATE",
  "REO", "REO_LISTED", "REO_UNDER_CONTRACT",
  "BORROWER_WORKOUT", "PAYOFF_EXPECTED", "BANKRUPTCY",
  "TITLE_ISSUE", "NOTE_SALE", "PARTIAL_RECOVERY",
  "SETTLED", "WRITTEN_OFF",
] as [HoldingStatus, ...HoldingStatus[]]);
const updateSourceEnum = z.enum(["excel_upload", "web_scrape", "manual"] as [UpdateSource, ...UpdateSource[]]);
const confidenceEnum = z.enum(["high", "medium", "low"] as [LiquidationConfidence, ...LiquidationConfidence[]]);

export const updateHoldingSchema = z.object({
  status: statusEnum.optional(),
  subStatus: z.string().max(255).nullable().optional(),
  lastUpdateDate: z.string().nullable().optional(),
  lastUpdateSource: updateSourceEnum.optional(),
  lastUpdateText: z.string().nullable().optional(),
  currentPrincipal: z.number().int().positive().nullable().optional(),
  costBasisApex: z.number().int().positive().nullable().optional(),
  marketValueApex: z.number().int().min(0).nullable().optional(),
  totalEarned: z.number().int().min(0).nullable().optional(),
  lastPaymentDate: z.string().nullable().optional(),
  lastPaymentAmount: z.number().int().min(0).nullable().optional(),
  liquidationEstimateLow: z.number().int().min(0).nullable().optional(),
  liquidationEstimateHigh: z.number().int().min(0).nullable().optional(),
  liquidationTimelineMonths: z.number().int().min(0).max(120).nullable().optional(),
  liquidationConfidence: confidenceEnum.nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  hurricaneDamage: z.boolean().optional(),
  partialPayoffReceived: z.number().int().min(0).nullable().optional(),
  borrowerName: z.string().max(255).nullable().optional(),
  guaranteeType: z.string().max(100).nullable().optional(),
  securityPosition: z.string().max(100).nullable().optional(),
});

export const insertHoldingSchema = z.object({
  platform: platformEnum,
  offeringId: z.string().min(1).max(100),
  propertyAddress: z.string().max(500).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(50).nullable().optional(),
  zip: z.string().max(20).nullable().optional(),
  propertyType: z.string().max(100).nullable().optional(),
  originalInvestment: z.number().int().positive().nullable().optional(),
  currentPrincipal: z.number().int().positive().nullable().optional(),
  costBasisApex: z.number().int().positive().nullable().optional(),
  marketValueApex: z.number().int().min(0).nullable().optional(),
  accrualDate: z.string().nullable().optional(),
  maturityDate: z.string().nullable().optional(),
  apr: z.number().int().min(0).nullable().optional(),
  totalEarned: z.number().int().min(0).nullable().optional(),
  lastPaymentDate: z.string().nullable().optional(),
  lastPaymentAmount: z.number().int().min(0).nullable().optional(),
  status: statusEnum.default("PERFORMING"),
  subStatus: z.string().max(255).nullable().optional(),
  lastUpdateDate: z.string().nullable().optional(),
  lastUpdateSource: updateSourceEnum.optional(),
  lastUpdateText: z.string().nullable().optional(),
  borrowerName: z.string().max(255).nullable().optional(),
  loanToArv: z.number().int().min(0).nullable().optional(),
  arv: z.number().int().positive().nullable().optional(),
  guaranteeType: z.string().max(100).nullable().optional(),
  securityPosition: z.string().max(100).nullable().optional(),
  liquidationEstimateLow: z.number().int().min(0).nullable().optional(),
  liquidationEstimateHigh: z.number().int().min(0).nullable().optional(),
  liquidationTimelineMonths: z.number().int().min(0).max(120).nullable().optional(),
  liquidationConfidence: confidenceEnum.nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  isRbnf: z.boolean().default(false),
  rbnfUnderlyingCount: z.number().int().positive().nullable().optional(),
  hurricaneDamage: z.boolean().default(false),
  partialPayoffReceived: z.number().int().min(0).nullable().optional(),
});

export const listHoldingsSchema = z.object({
  platform: platformEnum.optional(),
  status: statusEnum.optional(),
});

export type UpdateHolding = z.infer<typeof updateHoldingSchema>;
export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type ListHoldingsFilter = z.infer<typeof listHoldingsSchema>;
