/**
 * Seed data for Pineapple Fund (Pineapple Entropy LP, LP 540293503)
 * NPL portfolio as of March 2026.
 *
 * Run standalone: pnpm tsx src/db/seed-fund.ts
 * Or import seedFund() into the main seed.ts
 *
 * All money in USD cents (e.g. $27,000 = 2700000).
 */

import { db } from "./index";
import { fundHoldings } from "./schema/fund";
import type { InsertFundHolding } from "./schema/fund";

const TODAY = new Date().toISOString().split("T")[0];

const holdings: InsertFundHolding[] = [
  // ── Upright / FTF ──────────────────────────────────────────────────────

  {
    platform: "upright",
    offeringId: "66050",
    propertyAddress: "Pittsburgh, PA",
    city: "Pittsburgh",
    state: "PA",
    propertyType: "Single Family",
    originalInvestment: 2700000,
    currentPrincipal: 2700000,
    costBasisApex: 2700000,
    marketValueApex: 0,
    status: "PAYOFF_EXPECTED",
    subStatus: "Payoff expected within 30 days (04/15/25). Revised payoff statements in process.",
    lastUpdateDate: "2025-04-15",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Payoff expected within 30 days (04/15/25). Revised payoff statements in process. Same borrower recently repaid another loan.",
    loanToArv: 6460,
    arv: 39500000,
    securityPosition: "1st Position",
    liquidationEstimateLow: 2400000,
    liquidationEstimateHigh: 2700000,
    liquidationTimelineMonths: 2,
    liquidationConfidence: "high",
    resolutionNotes: "Strong borrower — recently repaid other loans on same portfolio. Payoff statement issued.",
    borrowerName: "Borrower A (Pittsburgh/Cherry Lane)",
  },

  {
    platform: "upright",
    offeringId: "67212",
    propertyAddress: "Cleveland, OH",
    city: "Cleveland",
    state: "OH",
    propertyType: "Single Family",
    originalInvestment: 2400000,
    currentPrincipal: 2400000,
    costBasisApex: 2400000,
    marketValueApex: 0,
    status: "FORECLOSURE_EARLY",
    subStatus: "Complaint + PJR filed 02/04/25. Awaiting service of summons.",
    lastUpdateDate: "2025-02-04",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Complaint + PJR filed 02/04/25. Awaiting service of summons.",
    loanToArv: 6450,
    arv: 15500000,
    securityPosition: "1st Position",
    liquidationEstimateLow: 1500000,
    liquidationEstimateHigh: 2000000,
    liquidationTimelineMonths: 12,
    liquidationConfidence: "medium",
    resolutionNotes: "Early stage foreclosure. Ohio timelines can be 12-18 months.",
  },

  {
    platform: "upright",
    offeringId: "62994",
    propertyAddress: "Cherry Lane / Fletcher, OH",
    city: "Fletcher",
    state: "OH",
    propertyType: "Single Family",
    originalInvestment: 6400000,
    currentPrincipal: 6400000,
    costBasisApex: 6400000,
    marketValueApex: 0,
    status: "BORROWER_WORKOUT",
    subStatus: "Borrower refinancing in batches of 2-3. Recently repaid other loans (02/24/25).",
    lastUpdateDate: "2025-02-24",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Borrower refinancing in batches of 2-3. Same borrower as Pittsburgh. Has recently repaid other loans (02/24/25).",
    loanToArv: 6420,
    arv: 45500000,
    securityPosition: "1st Position",
    liquidationEstimateLow: 5500000,
    liquidationEstimateHigh: 6400000,
    liquidationTimelineMonths: 4,
    liquidationConfidence: "high",
    resolutionNotes: "Same borrower as Pittsburgh (#66050). Active refinance in progress — expect repayment.",
    borrowerName: "Borrower A (Pittsburgh/Cherry Lane)",
  },

  {
    platform: "upright",
    offeringId: "84679",
    propertyAddress: "RBNF Series 82 (Pooled Note)",
    propertyType: "Pooled RBNF",
    originalInvestment: 11596200,
    currentPrincipal: 11596200,
    costBasisApex: 11596200,
    marketValueApex: 0,
    status: "LOSS_MITIGATION",
    subStatus: "Pooled note matured Feb 2024. Last payment 05/01/24. Underlying pool largely REO or late stage foreclosure.",
    lastUpdateDate: "2025-01-15",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Pooled note, matured Feb 2024. Last payment 05/01/24. Underlying pool 'largely REO or late stage foreclosure' per Michael Roth. Original $750K pool. Total earned $109,966.",
    totalEarned: 10996600,
    lastPaymentDate: "2024-05-01",
    isRbnf: true,
    rbnfUnderlyingCount: 12,
    liquidationEstimateLow: 3000000,
    liquidationEstimateHigh: 7000000,
    liquidationTimelineMonths: 18,
    liquidationConfidence: "low",
    resolutionNotes: "Pooled note. Recovery depends on individual underlying properties reaching resolution. Long tail expected.",
    securityPosition: "1st Position",
  },

  {
    platform: "upright",
    offeringId: "59206",
    propertyAddress: "Valrico, FL",
    city: "Valrico",
    state: "FL",
    propertyType: "Single Family",
    originalInvestment: 2000000,
    currentPrincipal: 2000000,
    costBasisApex: 2000000,
    marketValueApex: 0,
    status: "FORECLOSURE_MID",
    subStatus: "Dismissed from bankruptcy 09/16/25. Returning to foreclosure sale docket. Note sale also being pursued.",
    lastUpdateDate: "2025-09-16",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Dismissed from bankruptcy 09/16/25. Returning to foreclosure sale docket. Payoff statement sent May 2025. Note sale also being pursued.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 1200000,
    liquidationEstimateHigh: 1800000,
    liquidationTimelineMonths: 8,
    liquidationConfidence: "medium",
    resolutionNotes: "Post-bankruptcy, back on foreclosure docket. Both foreclosure sale and note sale being pursued simultaneously.",
  },

  {
    platform: "upright",
    offeringId: "56780",
    propertyAddress: "Chicago, IL",
    city: "Chicago",
    state: "IL",
    propertyType: "Single Family",
    originalInvestment: 1500000,
    currentPrincipal: 1500000,
    costBasisApex: 1500000,
    marketValueApex: 0,
    status: "FORECLOSURE_MID",
    subStatus: "Awaiting court judgment of foreclosure. STALE — no movement 7+ months.",
    lastUpdateDate: "2024-08-12",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Awaiting court judgment of foreclosure. Last update 08/12/24 — STALE, no movement 7 months. Motion for default judgment granted 04/29/24.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 800000,
    liquidationEstimateHigh: 1300000,
    liquidationTimelineMonths: 12,
    liquidationConfidence: "low",
    resolutionNotes: "STALE — no update in 7+ months. Need to follow up with Upright on court timeline. Default judgment already granted 04/29/24.",
  },

  {
    platform: "upright",
    offeringId: "55319",
    propertyAddress: "Manasota Key / Englewood, FL",
    city: "Englewood",
    state: "FL",
    propertyType: "Single Family",
    originalInvestment: 3500000,
    currentPrincipal: 3500000,
    costBasisApex: 3500000,
    marketValueApex: 0,
    status: "REO_UNDER_CONTRACT",
    subStatus: "REO. Partial payoff 6.95% distributed Feb 2026. Active negotiations with buyer.",
    lastUpdateDate: "2026-02-05",
    lastUpdateSource: "manual",
    lastUpdateText:
      "REO. Partial payoff 6.95% distributed Feb 2026 (hurricane damage - Helene/Milton). Active negotiations with buyer, closing expected ~45 days from 02/05/26. Insurance claim was lower than expected.",
    hurricaneDamage: true,
    partialPayoffReceived: 243250,
    lastPaymentDate: "2026-02-05",
    lastPaymentAmount: 243250,
    securityPosition: "1st Position",
    liquidationEstimateLow: 2000000,
    liquidationEstimateHigh: 3200000,
    liquidationTimelineMonths: 2,
    liquidationConfidence: "high",
    resolutionNotes: "Under contract. Hurricane damage reduced property value and insurance payout. Closing expected ~45 days from Feb 5, 2026.",
  },

  {
    platform: "upright",
    offeringId: "54548",
    propertyAddress: "Indianapolis, IN (Position 1)",
    city: "Indianapolis",
    state: "IN",
    propertyType: "Single Family",
    originalInvestment: 1247100,
    currentPrincipal: 1247100,
    costBasisApex: 1247100,
    marketValueApex: 0,
    status: "TITLE_ISSUE",
    subStatus: "Title issue blocking sale since 09/15/25. Counsel pressing title agent.",
    lastUpdateDate: "2025-09-15",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Title issue blocking sale since 09/15/25. Counsel pressing title agent. Borrower resolved other title issues but this final one stuck.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 800000,
    liquidationEstimateHigh: 1200000,
    liquidationTimelineMonths: 6,
    liquidationConfidence: "medium",
    resolutionNotes: "Same property, 2 positions. Title agent must clear final lien. Borrower has been cooperative on other issues.",
  },

  {
    platform: "upright",
    offeringId: "54548",
    propertyAddress: "Indianapolis, IN (Position 2)",
    city: "Indianapolis",
    state: "IN",
    propertyType: "Single Family",
    originalInvestment: 1325000,
    currentPrincipal: 1325000,
    costBasisApex: 1325000,
    marketValueApex: 0,
    status: "TITLE_ISSUE",
    subStatus: "Title issue blocking sale since 09/15/25. Same property as position 1.",
    lastUpdateDate: "2025-09-15",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Title issue blocking sale since 09/15/25. Counsel pressing title agent. Borrower resolved other title issues but this final one stuck.",
    securityPosition: "2nd Position",
    liquidationEstimateLow: 700000,
    liquidationEstimateHigh: 1100000,
    liquidationTimelineMonths: 6,
    liquidationConfidence: "medium",
    resolutionNotes: "Same property as position 1 (#54548-1). 2nd lien — recovery depends on title resolution and sufficient proceeds.",
  },

  {
    platform: "upright",
    offeringId: "41923",
    propertyAddress: "Boston, MA (Position 1)",
    city: "Boston",
    state: "MA",
    propertyType: "Multi-Family",
    originalInvestment: 1200000,
    currentPrincipal: 1200000,
    costBasisApex: 1200000,
    marketValueApex: 0,
    status: "REO_LISTED",
    subStatus: "Fell out of contract 03/03/26, being relisted. 5 of 6 borrower properties closed out.",
    lastUpdateDate: "2026-03-03",
    lastUpdateSource: "manual",
    lastUpdateText:
      "5 of 6 borrower properties closed out. This last one fell out of contract 03/03/26, being relisted + active buyer dialogue.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 900000,
    liquidationEstimateHigh: 1200000,
    liquidationTimelineMonths: 3,
    liquidationConfidence: "medium",
    resolutionNotes: "Last remaining property of this borrower. Fell out of contract — actively relisting. Strong Boston market.",
  },

  {
    platform: "upright",
    offeringId: "41923",
    propertyAddress: "Boston, MA (Position 2)",
    city: "Boston",
    state: "MA",
    propertyType: "Multi-Family",
    originalInvestment: 1500000,
    currentPrincipal: 1500000,
    costBasisApex: 1500000,
    marketValueApex: 0,
    status: "REO_LISTED",
    subStatus: "Fell out of contract 03/03/26, being relisted. Same property as position 1.",
    lastUpdateDate: "2026-03-03",
    lastUpdateSource: "manual",
    lastUpdateText:
      "5 of 6 borrower properties closed out. This last one fell out of contract 03/03/26, being relisted + active buyer dialogue.",
    securityPosition: "2nd Position",
    liquidationEstimateLow: 800000,
    liquidationEstimateHigh: 1100000,
    liquidationTimelineMonths: 3,
    liquidationConfidence: "medium",
    resolutionNotes: "Same property as position 1 (#41923-1). 2nd lien — recovery below 1st position.",
  },

  // ── Sharestates ─────────────────────────────────────────────────────────

  {
    platform: "sharestates",
    offeringId: "BC2020-0012877",
    propertyAddress: "Hovenden Rd",
    propertyType: "Multi-Family",
    originalInvestment: 1600000,
    currentPrincipal: 1600000,
    costBasisApex: 1600000,
    marketValueApex: 0,
    status: "REO",
    subStatus: "Already foreclosed, property owned. Payoff letter requested March 4.",
    lastUpdateDate: "2026-03-04",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Already foreclosed, property owned. Payoff letter requested March 4.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 1000000,
    liquidationEstimateHigh: 1500000,
    liquidationTimelineMonths: 6,
    liquidationConfidence: "medium",
    resolutionNotes: "REO — property owned by lender. Pending listing and sale.",
  },

  {
    platform: "sharestates",
    offeringId: "BC2021-0013995",
    propertyAddress: "1217 E Preston St",
    propertyType: "Single Family",
    originalInvestment: 1000000,
    currentPrincipal: 1000000,
    costBasisApex: 1000000,
    marketValueApex: 0,
    status: "REO",
    subStatus: "Property owned, waiting for sale.",
    lastUpdateDate: "2026-01-01",
    lastUpdateSource: "manual",
    lastUpdateText: "Property owned, waiting for sale.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 700000,
    liquidationEstimateHigh: 1000000,
    liquidationTimelineMonths: 6,
    liquidationConfidence: "medium",
    resolutionNotes: "REO — pending listing.",
  },

  {
    platform: "sharestates",
    offeringId: "BC2019-009293",
    propertyAddress: "115 Rogers Ave",
    propertyType: "Multi-Family",
    originalInvestment: 137400,
    currentPrincipal: 0,
    costBasisApex: 0,
    marketValueApex: 0,
    status: "SETTLED",
    subStatus: "REO Sold & Completed. No deficiency judgment pursued.",
    lastUpdateDate: "2026-01-15",
    lastUpdateSource: "manual",
    lastUpdateText:
      "REO Sold & Completed. No deficiency judgment pursued.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 0,
    liquidationEstimateHigh: 0,
    liquidationTimelineMonths: 0,
    liquidationConfidence: "high",
    resolutionNotes: "Fully resolved. Minimal residual amount recovered.",
  },

  {
    platform: "sharestates",
    offeringId: "BC2020-0011104",
    propertyAddress: "Crotona Ave",
    city: "Bronx",
    state: "NY",
    propertyType: "Multi-Family",
    originalInvestment: 1000000,
    currentPrincipal: 1000000,
    costBasisApex: 1000000,
    marketValueApex: 0,
    status: "FORECLOSURE_MID",
    subStatus: "Borrower contacted Feb 11, workout attempted outside foreclosure. Payoff letter requested March 5.",
    lastUpdateDate: "2026-03-05",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Borrower contacted Feb 11, workout attempted outside foreclosure. Payoff letter requested March 5.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 700000,
    liquidationEstimateHigh: 1000000,
    liquidationTimelineMonths: 8,
    liquidationConfidence: "medium",
    resolutionNotes: "Borrower in dialogue — possible workout. Foreclosure proceeding concurrently as leverage.",
  },

  {
    platform: "sharestates",
    offeringId: "BC2021-0013242",
    propertyAddress: "1340 Prospect Ave",
    propertyType: "Multi-Family",
    originalInvestment: 1200000,
    currentPrincipal: 1200000,
    costBasisApex: 1200000,
    marketValueApex: 0,
    status: "FORECLOSURE_MID",
    subStatus: "Still in legal proceedings.",
    lastUpdateDate: "2026-01-01",
    lastUpdateSource: "manual",
    lastUpdateText: "Still in legal proceedings.",
    securityPosition: "1st Position",
    liquidationEstimateLow: 800000,
    liquidationEstimateHigh: 1200000,
    liquidationTimelineMonths: 12,
    liquidationConfidence: "medium",
    resolutionNotes: "Mid-foreclosure. Awaiting court action.",
  },

  {
    platform: "sharestates",
    offeringId: "BC2019-0010591",
    propertyAddress: "1252-1256 Main Street",
    propertyType: "Multi-Family",
    originalInvestment: 2200000,
    currentPrincipal: 2200000,
    costBasisApex: 2200000,
    marketValueApex: 0,
    status: "PERFORMING",
    subStatus: "Current loan, paying monthly interest ($220/mo received Feb 2026).",
    lastUpdateDate: "2026-02-28",
    lastUpdateSource: "manual",
    lastUpdateText:
      "Current loan, paying monthly interest ($220/mo received Feb 2026).",
    apr: 1200,
    lastPaymentDate: "2026-02-28",
    lastPaymentAmount: 22000,
    securityPosition: "1st Position",
    liquidationEstimateLow: 2000000,
    liquidationEstimateHigh: 2200000,
    liquidationTimelineMonths: 6,
    liquidationConfidence: "medium",
    resolutionNotes: "Only performing loan in portfolio. Monitor for payoff or maturity.",
  },

  // ── Upgrade / Prosper ───────────────────────────────────────────────────

  {
    platform: "upgrade",
    offeringId: "UPGRADE-POOL-2024",
    propertyAddress: "Upgrade/Prosper Pool (Detail TBD)",
    propertyType: "Consumer Loan Pool",
    originalInvestment: 3386000,
    currentPrincipal: 3386000,
    costBasisApex: 3386000,
    marketValueApex: 0,
    status: "LOSS_MITIGATION",
    subStatus: "Monthly statements available. Detail to be parsed from Excel upload.",
    lastUpdateDate: TODAY,
    lastUpdateSource: "manual",
    lastUpdateText:
      "Upgrade/Prosper portfolio — $33,860 per Apex Feb 2026 report. Individual loan detail pending Excel upload (Phase 2).",
    liquidationEstimateLow: 500000,
    liquidationEstimateHigh: 2000000,
    liquidationTimelineMonths: 24,
    liquidationConfidence: "low",
    resolutionNotes: "Consumer loan portfolio. Individual positions to be detailed after Excel parser is built (Phase 2). Apex values: cost basis $33,860, market ~$0.",
  },
];

export async function seedFund(): Promise<void> {
  console.log("🌱 Seeding fund holdings...");

  // Clear existing holdings
  await db.delete(fundHoldings);

  // Insert all positions
  await db.insert(fundHoldings).values(holdings);

  console.log(`✅ Seeded ${holdings.length} fund holdings`);
  console.log("   - Upright/FTF: 11 positions");
  console.log("   - Sharestates: 6 positions");
  console.log("   - Upgrade/Prosper: 1 placeholder position");
}

// Allow standalone execution
if (require.main === module) {
  seedFund()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
