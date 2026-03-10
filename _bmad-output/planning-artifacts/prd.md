---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
  - external-review-revision
inputDocuments:
  - product-brief-Trustegy-FO-2026-03-09.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web_app
  projectTypeNotes: 'Single-tenant, owner-only auth, module architecture'
  domain: fintech
  domainSubtype: 'Family Office Management + Business Operations'
  complexity: high
  complexityDrivers: 'Multi-entity financial model, AI-native companion, RTL/i18n first-class, Tier 1 emotional design, zero-error tolerance, data migration ceremony'
  projectContext: greenfield
  riskFlags: 'Broad MVP scope, AI testability, mathematical verification requirements, visual regression for RTL'
workflowType: 'prd'
date: 2026-03-09
revised: 2026-03-09
author: Ernest
---

# Product Requirements Document — Shefa Investments

**Author:** Ernest
**Date:** 2026-03-09
**Revised:** 2026-03-09 (external review findings applied)

### Naming Convention

- **Shefa** (or **Shefa Investments**) — the product name, used in all user-facing contexts
- **Trustegy-FO** — the repository and project codename, used in technical/build contexts only
- **Shefa** (the puppy) — the AI companion character within the product

## Executive Summary

Shefa Investments is a personal AI-powered financial command center — a Hebrew-first web application built for one person managing a complex multi-entity financial landscape across a consulting business (Trustegy), an investment vehicle company, and personal holdings. The platform replaces a fragile patchwork of Excel spreadsheets and disconnected bank portals with a unified, module-based system that delivers full financial visibility in 30 seconds.

Ernest — CEO of Trustegy, GP of a fund with 20+ LP investors, and solo operator of a growing investment portfolio — currently manages real estate, private and public equities, fund operations, pension funds, loans (as both borrower and lender), and a 10+ client consulting practice through manual reconciliation, ad-hoc deal evaluation, and mental bookkeeping. The result: missed billing dates, cross-entity opacity, cash flow blindness, and strategic decisions made on gut feeling instead of structured analysis.

This tool exists because nothing else does. Consumer wealth trackers only track balances. Enterprise family office platforms require dedicated staff and six-figure budgets. Nothing combines multi-entity investment tracking, consulting operations, and AI-assisted analysis for a single operator. So instead of waiting for someone else to build it — we build it.

The timing is driven by one thing: AI technology — specifically Claude — has matured to the point where a genuine financial companion is possible. The vision predates the technology; the technology has finally caught up.

You open Shefa on a Tuesday morning at your desk. A golden-eyed puppy greets you with your net position across three entities. One card is amber — a billing milestone you'd have missed. You tap it, confirm the invoice, and your day starts 30 seconds in with full control. That's the product promise.

Development is split into two sequential phases. **Phase 0** delivers the platform foundation, Shefa AI companion, Consolidated Dashboard, and Data Migration — proving the value proposition. **Phase 0.5** adds Consulting Operations and Loans & Debt Management — eliminating the spreadsheet entirely. Both phases together constitute the full initial release. All subsequent phases are explicitly out of scope for the initial build.

The release includes desktop-only, ILS-only, Hebrew-only, owner-only authentication, single-tenant architecture with clean schema for future flexibility, zero tolerance for financial rounding errors.

### What Makes This Special

Four reinforcing layers, each building on the last:

1. **Daily utility** — A 30-second morning briefing delivering full financial visibility across all entities. From "I need to check three places" to "I already know."
2. **Proactive intelligence** — Shefa catches what you'd miss: overdue payments, loans worth closing, cash flow gaps two months ahead. Silence is a feature — if there's nothing worth saying, Shefa stays quiet.
3. **Decision elevation** (future) — AI-powered deal evaluation producing scorecards, financial models, and investment memos. Shefa learns from every past decision.
4. **Emotional connection** — Shefa the puppy adapts from playful daily check-ins to serious financial analysis. Claude-inspired warm minimalism with golden Shefa palette. The Saturday Morning Test: when checking your empire feels like opening your favorite app, the product has won.

The core insight: this is a personal tool built because nothing else fits. Where the architecture uses patterns common in enterprise software (module boundaries, entity hierarchies, structured data models), these exist as architectural hygiene for code organization and future flexibility — not as product surface or a scaling plan.

## Project Classification

- **Project Type:** Web application (single-tenant, owner-only auth, module architecture)
- **Domain:** Fintech — Family Office Management + Business Operations
- **Complexity:** High — multi-entity financial model, AI-native companion, RTL/i18n first-class, Tier 1 emotional design, zero-error financial precision, data migration ceremony
- **Project Context:** Greenfield — personal tool, not SaaS
- **Risk Flags:** Broad scope across Phase 0 + 0.5, AI testability, mathematical verification requirements, visual regression for RTL

## Success Criteria

### User Success

**The Control Test:** Ernest feels in command of his financial empire — no anxiety about what's being missed across entities. The mental load of tracking three entities, 10+ clients, and 6+ loans is eliminated, not just reduced.
*Instrumentable signal:* Weekly active usage ≥5 days/week in first month. Zero "I need to check the Excel" moments after migration.

**Zero-Click Morning Picture:** The dashboard loads and the full financial position across all entities is immediately visible — no navigation, no drill-down, no clicks required. If you have to go looking for information, the UX has failed.
*Instrumentable signal:* >80% of sessions start from dashboard and end without drill-down for the daily check-in use case.

**Excel Death Certificate:** The original Excel file is permanently deleted within 3 months of launch. Not archived, not "just in case" — gone. Shefa is the sole source of truth. This is only possible if the migration ceremony produces zero discrepancies and every number is traceable to its original source.
*Instrumentable signal:* Migration verification produces zero mismatches. Excel file deleted by month 3.

**Shefa Catches First:** At least 2 "Shefa caught it before I did" moments per month — an overdue billing milestone, a loan worth closing, a cash flow pattern. These are the proof that the system is smarter than the spreadsheet.
*Instrumentable signal:* Count of user-confirmed Shefa alerts (nudges acted on, not dismissed) ≥2/month.

### Business Success

**Worth Building (6-month gate):** Ernest feels in control. The anxiety of "what am I missing?" is replaced with confidence that the system has it covered. This is subjective but real — and it's the primary measure of whether the investment in building Shefa was justified.
*Instrumentable signal:* Sustained weekly usage at 6-month mark. No return to parallel Excel tracking.

**No Regression:** No named workflow takes longer in Shefa than it did in Excel. Specifically:
- Morning financial review: <30 seconds (vs ~15 minutes across bank portals and Excel)
- Milestone billing update: <2 minutes per milestone (vs ~10 minutes in Excel)
- Loan balance lookup: <10 seconds (vs ~5 minutes across bank portals)
- Migration verification: one-time ceremony, no ongoing time cost

**Saturday Morning Test:** Ernest opens Shefa voluntarily on a weekend — not because he has to, but because he wants to. Product-market fit for a personal tool means it's a pleasure, not a chore.
*Instrumentable signal:* At least 1 weekend session per month by month 3.

### Technical Success

**Zero-Error Financial Precision:** All monetary calculations use integer arithmetic in agorot. No floating point. No rounding errors in storage or calculation. If the Excel said ₪1,054,975, Shefa says ₪1,054,975. See Calculation Policy section for operational rules.

**Data Integrity:** Zero data loss or corruption — ever. Entries must never disappear, corrupt, or silently change. Soft deletes only. Audit trail on all financial mutations.

**AI Trustworthiness:** Every Shefa nudge and recommendation must be accurate and relevant. See AI Operating Model section for boundaries and guarantees.

**Dashboard Load:** The full dashboard renders with complete data on first paint. Accuracy over speed — a correct 3-second load beats an incorrect 1-second load.

### Measurable Outcomes

| Metric | Target | Timeframe |
|---|---|---|
| Excel file deleted | Permanently | Within 3 months |
| Morning briefing | Zero clicks to full picture | Day 1 |
| Weekly active usage | ≥5 days/week | Month 1 ongoing |
| Shefa alerts acted on | ≥2 per month | Month 1 ongoing |
| AI nudge action rate | >30% acted on (not dismissed) | Month 1 baseline |
| Financial calculation errors | Zero | Always |
| Data loss incidents | Zero | Always |
| Named workflow regression vs Excel | Zero — nothing slower | Always |

## User Journeys

### Journey 1: Ernest — The Morning Command (Primary, Success Path)

**Opening Scene:** It's 7:15 AM. Ernest sits down at his desk with coffee. His mind is already running — did that Amdocs payment come through? When's the next Pineapple GP milestone? What's the Mizrachi loan balance after last week's payment? Today, all of this lives in his head. He won't open the Excel until something forces him to.

**Rising Action:** Ernest opens Shefa in his browser. A golden-eyed puppy greets him with a warm "בוקר טוב" and a gentle tail wag. The dashboard is already loaded — zero clicks. Three entity cards show net position: Trustegy consulting at ₪847K revenue YTD, investment company with 4 active holdings, personal portfolio steady. One card pulses amber — a billing milestone for Israel Railways is due in 3 days. Shefa says: "Rail milestone #12 — ₪85,000. Invoice date is Thursday. Want me to flag it for billing?"

**Climax:** Ernest taps the amber card, confirms the billing action, and glances at the KPI row: total outstanding invoices ₪312K, next loan payment in 9 days (Poalim, ₪4,200), cash position healthy across all entities. In 30 seconds — no clicks, no navigation — he knows everything. The coffee is still hot.

**Resolution:** Ernest starts his workday without a background thread of financial anxiety. He doesn't need to remember anything — Shefa already knows. He opens his calendar and focuses on a client meeting, not on chasing numbers.

**Requirements revealed:** Zero-click dashboard, entity-level KPI cards, amber/green status indicators, proactive billing alerts, morning briefing AI summary, Hebrew-first UI, instant load.

---

### Journey 2: Ernest — The Fire Drill (Primary, Edge Case)

**Opening Scene:** It's 2 PM on a Wednesday. Ernest gets a call from his bank — there's an issue with a loan payment that bounced due to insufficient funds in the investment company account. In today's world, this triggers a frantic scramble through bank portals and Excel tabs to understand what happened.

**Rising Action:** Ernest opens Shefa and pulls up the Loans module. The consolidated repayment view shows all 6 loans across entities. He spots it immediately — two loan payments hit the same day from the investment company account, totaling ₪18,000, but the account only had ₪14,000 after last week's capital allocation. Shefa's payment timeline shows the collision clearly. He opens the Shefa AI panel: "Why did the Leumi payment bounce?" Shefa responds with a source-linked answer: "Two payments scheduled for today from the investment company — Leumi ₪8,200 and Discount ₪9,800. Account balance was ₪14,003 after the ₪12,000 transfer to personal on March 3rd. The Discount payment cleared first." Confidence: High (all figures from recorded transactions).

**Climax:** In under 2 minutes, Ernest understands exactly what happened — no bank calls, no Excel forensics. Shefa adds: "This collision was predictable. Want me to flag when multiple loan payments fall within the same 3-day window in the future?" Ernest confirms. A new alert rule is created.

**Resolution:** Ernest calls the bank with full context, resolves the issue in one call, and knows this specific failure mode will never catch him off guard again. Shefa learned from the incident.

**Requirements revealed:** Consolidated loan view across entities, AI conversational query over financial data, payment timeline visualization, payment collision detection, user-configurable alert rules, cross-entity cash flow visibility, source-linked AI answers.

---

### Journey 3: Ernest — The Migration Ceremony (Primary, Onboarding)

**Opening Scene:** Day 1. Ernest has years of financial history in a single Excel file — PnL from 2023-2025, 34+ billing milestones, 6 active loans, entity structures. He's excited but nervous. If a single number is wrong, he'll never trust the new system.

**Rising Action:** Ernest uploads the Excel file. Shefa's AI interprets the structure: "I found 3 entity structures... 34 billing milestones... 6 loan records... 47 expense entries..." Rows that couldn't be interpreted are flagged for manual review. The migration screen splits: Excel data on the left, Shefa's interpretation on the right. Summary totals first — total revenue 2023: ₪1,054,975. Shefa shows the same number with a green checkmark. Revenue 2024: ₪1,152,261. Green checkmark. Ernest drills into detail — each client, each milestone, each loan balance. Row by row, the numbers match.

**Climax:** Every total aligns. Every sub-total aligns. Every individual row traces back to its source cell in the original Excel. Shefa's eyes brighten: "Everything matches perfectly. Ready to make it official?" Ernest clicks "I verify this matches." The original Excel is stored as a frozen snapshot — immutable, always referenceable.

**Resolution:** Ernest exhales. The ceremony worked. Trust is established not through promises but through proof — every number verified, every source traceable. He's not hoping Shefa is right; he *knows* it is. The countdown to deleting the Excel begins.

**Requirements revealed:** Excel import engine with AI-assisted interpretation, side-by-side verification UI, progressive disclosure (summary totals first, row-level detail on demand), row-level source traceability, frozen snapshot storage, explicit user verification gate, integer agora math validation, flagging of uninterpretable rows.

---

### Journey 4: Ernest — Billing Day (Primary, Operational)

**Opening Scene:** It's the 15th of the month. Ernest has 3 billing milestones due this week across different clients — Amdocs (₪45,000), Masav (₪28,000), and NTL (₪15,000). In today's world, he'd need to check the Excel, remember which invoices were already sent, and manually track payment status.

**Rising Action:** Shefa nudged him yesterday: "3 milestones due this week — ₪88,000 total. Amdocs and NTL ready to bill. Masav pending deliverable confirmation." Ernest opens the Consulting Operations module. The milestone view shows all active projects with status: green (billable), amber (pending), red (overdue). He confirms the Amdocs deliverable is complete — the milestone moves from amber to green. He enters invoice number 2026-047 and sets the billing date. The milestone status advances to "invoiced."

**Climax:** By end of day, all three milestones are processed. Shefa updates the dashboard KPIs immediately after each save — outstanding invoices up by ₪88,000, expected cash inflow updated. No spreadsheet touched. No milestone forgotten.

**Resolution:** Ernest reviews the monthly billing summary — 12 milestones billed this month, ₪340,000 total, 2 payments received, 1 overdue (Shefa already flagged it 5 days ago). For the first time, billing day is a 10-minute process, not a 2-hour anxiety session.

**Requirements revealed:** Milestone status tracking (green/amber/red), explicit deliverable confirmation step, billing workflow (pending → confirmed → billable → invoiced → paid), proactive pre-billing nudges, invoice number entry, dashboard KPI auto-update after mutations, monthly billing summary, overdue payment alerts, per-client project views.

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed | Phase |
|---|---|---|
| **Morning Command** | Zero-click dashboard, entity KPIs, morning briefing AI, proactive alerts, Hebrew RTL | Phase 0 |
| **Migration Ceremony** | Excel import, AI-assisted interpretation, side-by-side verification, row-level traceability, frozen snapshots, integer math | Phase 0 |
| **Billing Day** | Milestone tracking, deliverable confirmation, billing workflow, invoice management, KPI auto-update, overdue alerts | Phase 0.5 |
| **Fire Drill** | Consolidated loan view, AI conversational queries, payment timeline, collision detection, configurable alert rules | Phase 0.5 |

**Future journeys** (see Appendix A): LP Investor Check-In, Virtual Assistant Data Entry Delegate

## Domain-Specific Requirements

### Compliance & Regulatory

**VAT & Tax:**
- All revenue and expense records carry VAT rate and computed VAT amount (see FR25-FR28)
- Tax categories assignable to each revenue and expense record from a predefined list
- Revenue recognition dates and billing dates tracked separately on milestones (see FR29)
- P&L data exportable with VAT and tax categories for accountant handoff (see FR57)
- No specific accounting software integration required — clean exports are sufficient

**Fund Reporting (voluntary, not regulated):**
- No Israel Securities Authority compliance required at current fund scale
- LP reporting is a trust-building choice, not a legal obligation
- Quarterly reporting capability planned for future LP portal phase
- Fund calculations (IRR, distributions, capital accounts) must be accurate but are not subject to regulatory audit

### Technical Constraints

**Security:**
- See NFR7-NFR13 for detailed security requirements
- Core principle: owner-only OAuth + optional 2FA, encrypted at rest and in transit, no data residency requirements

**Financial Data Integrity:**
- See NFR14-NFR21 for detailed data integrity requirements
- See Calculation Policy section for operational arithmetic rules
- Core principle: integer agorot math, soft deletes only, audit trail on all mutations, no audit on reads

**Data Export:**
- All financial data exportable (CSV/Excel minimum) for accountant handoff
- Export includes VAT amounts, tax categories, and entity attribution
- Export capability is a hygiene feature, not a core workflow

### Integration Requirements

**Phase 0 + 0.5 — No external integrations:**
- Manual data entry + Excel import for migration
- AI interpretation of uploaded documents (PDFs, bank statements) via Shefa
- No automatic bank feeds, no accounting software integration

**Future integrations (post-Phase 0.5):**
- Bank statement import (file-based before automatic feeds)
- Potential accounting software export format if accountant requests it
- LP portal as a separate authenticated surface

### Risk Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Financial calculation error | Trust destroyed — user will abandon the system | Integer agorot math, defined calculation policy, verification tests on every calculation path |
| Data loss | Unrecoverable — no parallel system after Excel deletion | Automated backups, soft deletes, frozen Excel snapshot as ultimate fallback |
| AI gives wrong financial answer | Trust in all future Shefa outputs damaged | AI Operating Model enforces source-linked answers, confidence tiers, facts-only for financial queries |
| Migration data mismatch | Launch blocked — Ernest won't proceed | Side-by-side verification, row-level traceability, explicit user verification gate, flagged uninterpretable rows |

## Calculation Policy

This section defines how Shefa handles arithmetic for financial data. "Integer agorot" is a storage decision — this section defines the operational rules.

### Money Storage
- All monetary values stored as integers in agorot (1 ILS = 100 agorot)
- Example: ₪1,054,975 is stored as `105497500`
- Display formatting converts agorot to ILS with 2 decimal places at the presentation layer only

### Percentage Storage
- Interest rates and VAT rates stored as basis points (1% = 100 basis points)
- Example: 7.45% is stored as `745`
- This avoids floating-point representation of percentages

### Calculation Rules
- **VAT computation:** `vatAmount = floor(baseAmount * vatBasisPoints / 10000)` — truncate (floor), never round up
- **Interest computation:** Interest calculations use the bank's stated rate and schedule. Shefa records payment amounts as entered — it does not independently compute amortization schedules. Future Phase 2 scenario modeling will add independent interest calculation.
- **Aggregation:** Sum operations on integer agorot are exact. No intermediate rounding.
- **Display rounding:** Only at the presentation layer. Integer agorot → ILS display with 2 decimal places. No rounding occurs in storage or calculation.

### Import Reconciliation
- When Excel contains values that were already rounded (e.g., a cell shows ₪1,054,975 without agorot precision), the imported value is treated as canonical
- Import stores the cell's displayed value converted to agorot (₪1,054,975 → `105497500`)
- No attempt to reverse-engineer "original" precision from rounded Excel outputs
- Any discrepancy between Excel totals and sum-of-parts is flagged during verification for manual review

## AI Operating Model

This section defines what Shefa can and cannot do as a financial AI companion. Vague AI scope in a financial product is a trust failure — these boundaries are non-negotiable.

### Data Access
- Shefa has read access to all financial data for the authenticated owner
- Shefa does not access the internet, market data, or any external APIs
- All Shefa answers are derived from data stored in the Shefa database

### Answer Categories

**Factual financial answers** (e.g., "What's my total outstanding invoices?"):
- Must retrieve from structured database queries only — never generated or estimated
- Every numeric value in the response must be source-linked (which entity, which records, which date range)
- Confidence: always High for deterministic DB lookups

**Pattern-based observations** (e.g., "You've had 3 overdue payments in the last quarter"):
- Derived from structured data through defined aggregation logic
- Must cite the specific records that form the pattern
- Confidence: High if based on complete data, Medium if data may be incomplete

**Recommendations** (e.g., "Consider closing the Leumi loan early — it's your most expensive"):
- Clearly separated from facts in the UI (different visual treatment)
- Must include the reasoning and the data points behind the recommendation
- Confidence: Medium or Low, always stated explicitly
- Shefa never presents recommendations as facts

### Confidence Tiers
- **High (deterministic):** Direct database lookup, exact aggregation. "Your total outstanding invoices are ₪312,000."
- **Medium (pattern-based):** Inference from structured data with stated assumptions. "Based on current billing pace, you'll collect ~₪280K this quarter."
- **Low (speculative):** Prediction or suggestion with significant uncertainty. "This loan might be worth refinancing — but I'd need current market rates to be sure."

### Action Boundaries
- Shefa never initiates actions — it always suggests, and the user confirms
- Nudges are passive notifications, not automated operations
- Creating, editing, or deleting financial records always requires explicit user action through the UI
- Shefa can pre-fill forms based on context, but submission is always user-triggered

### Error Handling
- If Shefa cannot answer a question from available data: "I don't have enough data to answer that."
- If Shefa's confidence is Low: it says so explicitly and explains why
- Wrong answers are worse than no answers — conservative thresholds on launch, loosened as corrections accumulate

## Migration Import Contract

This section defines the technical boundaries of the Excel migration ceremony. The migration is one of the hardest features and must be fully specified before implementation.

### Accepted Input
- File format: `.xlsx` (Excel 2007+)
- Maximum file size: 10MB
- Shefa uses AI-assisted interpretation to identify structure — no fixed sheet/column schema required
- Ernest's Excel is a personal file with custom structure; the import adapts to it

### Interpretation Process
1. Shefa AI scans the workbook and identifies candidate data: entities, revenue records, expense records, billing milestones, loan records
2. Shefa presents its interpretation to the user: "I found X entities, Y milestones, Z loans..."
3. Rows that cannot be confidently interpreted are flagged for manual review — never silently skipped, never silently imported
4. User reviews flagged rows and either confirms interpretation, corrects it, or excludes the row

### Data Extraction Rules
- Cell values (displayed values) are imported, not formulas
- If a cell contains a formula, the computed result is what gets imported
- Values are converted to integer agorot at import time
- Date values are normalized to ISO 8601 internally, displayed in Israeli format (DD/MM/YYYY)

### Verification Flow
1. **Summary verification (progressive disclosure):** Show entity-level totals first (total revenue per year, total loan balances, milestone counts)
2. **Drill-down verification:** User can expand any summary to see individual records
3. **Source traceability:** Every imported record links back to its source sheet, row, and cell
4. **Discrepancy flagging:** If sum-of-parts doesn't match a total row in the Excel, both values are shown with an amber flag

### Lifecycle Rules
- Re-import is supported before the "I verify" gate — replaces all draft imported data
- After "I verify this matches," migration data is sealed and becomes part of the live database
- The original Excel file is stored as a frozen, immutable snapshot in object storage (separate from main database)
- Only one migration ceremony per workbook — subsequent data enters through manual entry or future import features
- Post-verification corrections are made through normal edit operations (with audit trail)

### Error Handling
- Malformed files: clear error message, no partial import
- Unsupported formats (.xls, .csv): clear message directing user to save as .xlsx
- Sheets with no recognizable financial data: flagged, user decides whether to skip
- Import timeout (>60 seconds): operation continues in background, user notified on completion

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. AI-Native Financial Companion (Product Innovation)**

Shefa isn't AI bolted onto a financial dashboard — it's AI woven into the product experience. No fintech product treats AI as an emotional companion with adaptive personality, proactive intelligence, and contextual awareness across financial domains. The innovation isn't "we added a chatbot" — it's that the AI shapes the entire interaction model.

Key novel elements:
- Adaptive personality that shifts tone based on financial context (playful → serious)
- Proactive nudges capped at 3/day — silence as a deliberate feature
- Confidence tiers on every suggestion (see AI Operating Model)
- Learning from user corrections over time — calibration, not just generation

**2. Enterprise Architecture Made Personal (Architectural Innovation)**

Module boundaries, entity hierarchies, and structured data models — patterns typically built for teams of 50+ — designed for a single operator. These exist as **architectural hygiene only**: clean code organization, testability, and future flexibility. They are not user-visible product surface and should not drive implementation complexity beyond what the current use case requires.

Key novel elements:
- Module architecture invisible to the user — one fluid experience, not app-switching
- Hierarchical entity model flexible enough for complex fund structures, simple enough for daily use
- Clean schema that serves one person today without multi-tenant overhead

### Validation Approach

| Innovation | How We Validate | When |
|---|---|---|
| AI companion personality | Ernest's engagement over first 2 weeks — does he talk to Shefa naturally or does it feel forced? | Week 1-2 |
| Proactive nudges | Action rate >30% — are nudges useful or noise? | Month 1 |
| Module-as-one-experience | Zero "where do I find this?" moments — can Ernest navigate without thinking about module boundaries? | Week 1 |
| Enterprise-for-one architecture | Development velocity — does the architecture accelerate or slow feature delivery? | Ongoing |

### Risk Mitigation

| Innovation Risk | Fallback |
|---|---|
| Puppy personality feels forced after initial novelty | Reduce animation complexity and playfulness in serious contexts. Keep the puppy identity and golden-eye visual — simplify the expression range rather than removing the character. The puppy is non-negotiable; its behavior intensity is tunable. |
| Module boundaries create user friction | Merge module UIs into unified navigation — modules remain architectural boundaries only, invisible to user |
| Enterprise patterns add overhead for one user | Simplify progressively — if module marketplace adds overhead without value, flatten to simple route groups |
| AI confidence calibration is wrong early on | Launch with conservative confidence thresholds — Shefa says "I'm not sure" more often initially, loosened as corrections accumulate |

## Web Application Specific Requirements

### Project-Type Overview

Shefa is a server-rendered web application built on Next.js 15 App Router, deployed on Railway. Cloud-hosted, accessed via desktop browser. No offline support, no real-time push updates (data refreshes on page load, navigation, and after mutations), no SEO requirements (private authenticated app). The architecture prioritizes data accuracy and developer velocity over cutting-edge frontend patterns.

### Technical Architecture Decisions

**Rendering Strategy:** Server-first (React Server Components + SSR)
- Server components for all data-fetching views (dashboard, KPIs, loan tables, billing views)
- Client components only where interactivity demands it (Shefa AI chat panel, migration verification UI, form interactions)
- No SPA routing — full page navigations are acceptable for a desktop financial tool
- Rationale: Server-first reduces client bundle, simplifies data security (sensitive financial data fetched server-side by default), and aligns with Next.js 15 App Router defaults

**Browser Support:**
- Modern evergreen browsers only (Chrome, Firefox, Safari, Edge — latest 2 versions)
- No IE11, no legacy browser support
- Desktop-only viewport — minimum 1280px width
- No responsive/mobile optimization for Phase 0 + 0.5

**Performance Targets:** See NFR1-NFR6 for specific measurable targets. Key constraint: accuracy over speed — a correct 3-second load beats an incorrect 1-second load. Data refreshes on page load, navigation, and after mutations — no WebSocket or SSE push updates.

**SEO Strategy:** None — private, authenticated application. `noindex, nofollow` on all routes.

**Accessibility:**
- Keyboard navigation, focus visibility, and contrast ratios as baseline (see NFR27-NFR30)
- RTL keyboard and focus order for Hebrew content
- Broader screen reader polish deferred unless specifically needed

### RTL & Internationalization

**Hebrew-Only for Phase 0 + 0.5:**
- All layouts designed RTL-native — not CSS-flipped LTR
- Hebrew is the only supported language for Phase 0 + 0.5. English locale deferred to Phase 2.
- RTL-aware components: tables, charts, navigation, forms, Shefa chat panel
- Bidirectional text handling for mixed Hebrew/English content (entity names, financial terms, client names)
- Hebrew typography: system fonts optimized for Hebrew readability at data-dense sizes

**i18n Architecture (future-proofing):**
- String externalization from day one — no hardcoded text, even though only Hebrew ships initially
- Single locale for Phase 0 + 0.5: `he-IL`
- Number formatting: Israeli convention (₪1,054,975)
- Date formatting: Israeli convention (DD/MM/YYYY)
- Direction-aware layout primitives — logical properties (`margin-inline-start` not `margin-left`)

### Data Architecture

**API Convention:** `{ data, error }` response pattern across all server actions and API routes
- Consistent error handling — every call returns typed success or typed error
- No thrown exceptions in data layer — errors are values

**Primary Keys:** CUID — collision-resistant, URL-safe, sortable
**Soft Deletes:** All financial entities — `deletedAt` timestamp, never hard delete financial records
**Timestamps:** All records carry `createdAt`, `updatedAt`, `deletedAt`
**Money:** Integer agorot — all monetary values stored as integers, formatted on display only (see Calculation Policy)

### Module Architecture

**Route Groups:** Each module is a Next.js route group (`/(dashboard)`, `/(consulting)`, `/(loans)`)
- Shared layout wraps all modules — unified navigation, persistent Shefa panel
- Module boundaries are code organization only, not user-visible navigation walls
- Shared data layer — modules query the same database, same entity model
- Module shell in UI — marketplace page showing installed and upcoming modules (architectural hygiene — a vision board, not a critical workflow)

### Implementation Considerations

**Desktop-Only Constraints:**
- Minimum viewport: 1280 x 800
- Dense data layouts acceptable — tables, multi-column KPI grids, side-by-side views
- No touch optimization, no hamburger menus, no mobile patterns
- Hover states and tooltips are reliable interaction patterns

**Deployment:**
- Railway with custom domain
- PostgreSQL on Railway
- Two environments: staging (for pre-deployment verification) and production
- Environment variables for configuration (API keys, database URL, auth secrets)

## Status Semantics

Status colors appear across multiple modules. These definitions apply system-wide:

| Color | Meaning | Examples |
|---|---|---|
| **Green** | Ready for action or healthy | Milestone billable, KPI on track, loan payment current |
| **Amber** | Requires attention soon | Milestone approaching due date, payment due within 7 days, flagged item |
| **Red** | Overdue or requires immediate action | Milestone past due, payment missed, import discrepancy |

Thresholds:
- Milestones: amber = due within 7 days, red = past due date
- Loan payments: amber = due within 7 days, red = past due date
- Dashboard KPIs: green = normal, amber = anomaly detected by Shefa

## Project Scoping & Phased Development

### Scope Philosophy

**Approach:** Experience-first — deliver a complete, polished experience for core workflows rather than a broad feature set with rough edges. Earn trust through the Migration Ceremony, prove daily value through the Dashboard, and eliminate the spreadsheet through Consulting Operations and Loans.

**Resource Model:** Solo developer (AI-assisted) building on Railway. No team, no sprints — progressive delivery with personal quality bar.

### Authoritative Scope Boundary

| Scope | What It Means | Status |
|---|---|---|
| **Phase 0** | Must build first. Platform + Dashboard + Migration + Shefa AI. Proves the value proposition. | In scope — build now |
| **Phase 0.5** | Build after Phase 0 succeeds. Consulting Operations + Loans. Eliminates the spreadsheet. | In scope — build second |
| **Phase 2+** | Everything else. Explicitly out of scope for the initial build. | Out of scope |

If a feature is not listed under Phase 0 or Phase 0.5 below, it is out of scope regardless of what other sections may imply.

### Key Scope Decisions Made

| Feature | Decision | Rationale |
|---|---|---|
| Dark mode | Deferred (Phase 2) | Ship light mode only — reduces every component's design surface by half |
| Multiple design moods | Cut to one | Claude-inspired warm minimalism only — one polished mood beats three half-baked ones |
| Shefa visual character | Full investment | Non-negotiable — beautiful, lucid puppy with micro-expressions from day one |
| Module marketplace shell | Keep (architectural hygiene) | Vision board for the product — shows full potential even with 3 active modules. Not a critical workflow. |
| Migration ceremony animations | Simplified | Functional verification with clear UX — accuracy over spectacle |
| Loan scenario modeling | Deferred (Phase 2) | Phase 0.5 shows operational loan management without interactive what-ifs |
| Offline / PWA | Not needed | Always-online, no service workers |
| Real-time push updates | Not needed | Data refreshes on page load, navigation, and after mutations |
| English language | Deferred (Phase 2) | Hebrew-only for Phase 0 + 0.5. String externalization from day one for future i18n. |
| Expense tracking + VAT | Included | Required for accountant handoff and tax reporting |

### Phase 0 — Prove the Value

**Core journeys supported:** Morning Command, Migration Ceremony

- **Platform foundation:** Owner-only OAuth (Google/Microsoft) + TOTP 2FA, Hebrew-only RTL, single-tenant PostgreSQL schema, module marketplace shell, staging + production environments
- **Design system:** Claude-inspired warm minimalism (single mood), golden Shefa palette, light mode only, Hebrew typography, system-wide status semantics (green/amber/red)
- **Shefa AI companion:** Beautiful visual character with micro-expressions, collapsible chat panel, conversational queries with source-linked answers, proactive nudges (max 3/day), confidence tiers, adaptive personality, AI Operating Model enforced
- **Consolidated Dashboard:** Zero-click morning briefing, entity KPI cards with defined formulas, amber/green status indicators, master view with entity drill-down, KPI auto-update after mutations
- **Data Migration:** Excel import with AI-assisted interpretation, side-by-side verification with progressive disclosure, row-level source traceability, frozen snapshot storage, explicit "I verify" gate, integer agorot math, flagged uninterpretable rows

### Phase 0.5 — Kill the Spreadsheet

**Core journeys supported:** Billing Day, Fire Drill

- **Consulting Operations (Phase A):** Client management, project/milestone tracking (green/amber/red), deliverable confirmation step, billing workflow (pending → confirmed → billable → invoiced → paid), invoice number entry, overdue alerts, monthly billing summary
- **Expense & Tax Management:** Expense records per entity, VAT rate and amount on revenue and expenses, tax category assignment, revenue recognition date tracking, export with VAT and categories
- **Loans & Debt Management (full operational):** Create/edit/view loans as borrower and lender, consolidated view across entities, repayment schedule, payment recording, payment timeline visualization, collision detection (multiple payments from same entity within 3-day window), optimization flags (highlights expensive loans)
- **User-configurable alert rules:** Define conditions for proactive notifications beyond Shefa's built-in nudges

### Post-Phase 0.5 Features (Out of Scope)

**Phase 2 — Deepen Intelligence (Month 3-6):**
- Loan scenario modeling — interactive what-if calculations (early closure, refinancing)
- Dark mode
- English language support
- Additional design moods (data mood, action mood)
- Investment Tracking module — multi-asset portfolio
- Document Vault — file repository with AI analysis
- Multi-currency support (ILS, USD, EUR)
- Bank statement import (file-based)

**Phase 3 — Expand Operations (Month 6-9):**
- Deal Evaluation AI — scorecard + financial model + investment memo
- Consulting Phase B — CRM, proposals, contracts
- Fund Management GP/LP — internal tracking
- Accountant export automation
- Data entry delegate role (restricted RBAC)

**Phase 4 — Platform Maturity (Month 9-12):**
- LP read-only portal with professional reporting
- Liquidity Intelligence — forecasting, scenario modeling
- Consulting Phase C — time tracking
- Mobile PWA
- Automatic bank feeds
- Deal evaluation learning — feedback loop from past decisions

### Risk Mitigation Strategy

**Technical Risks:**
- AI trustworthiness: Shefa giving wrong financial information. Mitigation: AI Operating Model enforces source-linked answers, confidence tiers, and conservative thresholds on launch.
- Integer math complexity: every calculation path needs verification. Mitigation: Calculation Policy defines rules; comprehensive test coverage on all monetary operations before launch.

**Delivery Risks:**
- Scope creep from "all of the above" instinct. Mitigation: Phase 0 / 0.5 split creates an early proof point — dashboard ships first, proves value, then operations follow.
- Shefa visual quality bar is high. Mitigation: invest in character design early — don't treat it as a polish pass at the end.

**Trust Risks:**
- Migration is the make-or-break moment. If numbers don't match, nothing else matters. Mitigation: Migration Import Contract defines the exact verification flow; migration is the first feature tested, not the last.
- Excel deletion is irreversible. Mitigation: frozen snapshot always available as reference, stored independently from main database.

## Functional Requirements

### Authentication & Access

- FR1: Owner can sign in via OAuth (Google or Microsoft account)
- FR2: Owner can enable and use TOTP two-factor authentication
- FR3: System restricts all access to authenticated owner only
- FR4: Owner can sign out and sessions expire after inactivity

### Entity & Data Model

- FR5: System pre-seeds 3 entities (Trustegy consulting, investment company, personal holdings). Owner can edit entity details and add new entities if needed.
- FR6: Owner can soft-delete entities. Pre-seeded entities can be renamed but not deleted.
- FR7: Owner can view consolidated financial data across all entities or drill down to a single entity
- FR8: Owner can track inter-entity transactions (owner loans, capital allocations between entities)
- FR9: System stores all monetary values as integer agorot with zero floating-point operations (see Calculation Policy)

### Consolidated Dashboard

- FR10: Owner can view a zero-click morning briefing showing full financial position across all entities on page load
- FR11: Owner can view entity-level KPI cards with the following defined metrics:
  - **Revenue YTD:** sum of all paid + invoiced milestones for the current calendar year, per entity and consolidated
  - **Cash position:** latest manually entered or imported balance per entity (not computed — entered as a data point)
  - **Outstanding invoices:** sum of all milestones in "invoiced" status (not yet paid), per entity and consolidated
  - **Loan balances:** sum of current principal balances across all active loans, per entity and consolidated
- FR12: Owner can see status indicators (amber/green/red per Status Semantics) on items requiring attention
- FR13: Owner can drill down from master view to entity-level detail
- FR14: System displays Shefa AI morning summary at top of dashboard
- FR15: Owner can view visual trends (sparkline charts, month-over-month comparisons)
- FR16: Dashboard KPIs auto-refresh after any data mutation in any module (immediate after save, not real-time push)

### Consulting Operations

- FR17: Owner can create, view, edit, and soft-delete client records
- FR18: Owner can create and manage projects per client with milestone tracking
- FR19: Owner can track milestone status through a workflow: pending → deliverable confirmed → billable → invoiced → paid
- FR20: Owner can enter invoice numbers and billing dates per milestone
- FR21: Owner can view milestones by status (green/billable, amber/pending, red/overdue per Status Semantics)
- FR22: Owner can view monthly billing summary with totals and payment status
- FR23: Owner can view per-client project and billing history
- FR24: System provides proactive alerts for upcoming billing milestones and overdue payments

### Expense & Tax Management

- FR25: Owner can create, view, edit, and soft-delete expense records per entity
- FR26: Owner can assign a VAT rate to each revenue record (milestone) and expense record. System computes VAT amount using Calculation Policy rules.
- FR27: Owner can assign a tax category to each revenue and expense record from a predefined list (categories configurable by owner)
- FR28: Owner can set a revenue recognition date on milestones, tracked separately from billing date
- FR29: Owner can export revenue and expense data with VAT amounts, tax categories, and entity attribution (CSV/Excel) for accountant handoff

### Loans & Debt Management

- FR30: Owner can view all loans across all entities in a consolidated view
- FR31: Owner can create, edit, and soft-delete loans as borrower (bank loans, credit lines) with rate, balance, and payment schedule
- FR32: Owner can create, edit, and soft-delete loans as lender (owner loans between entities) with balances and terms
- FR33: Owner can view consolidated repayment schedule across all entities
- FR34: Owner can record loan payments (mark payments as made, update remaining balance)
- FR35: Owner can view a payment timeline showing chronological payment events across all loans
- FR36: System detects and alerts when multiple loan payments from the same entity fall within a 3-day window (collision detection)
- FR37: System flags high-rate loans and suggests optimization opportunities (via Shefa, with confidence tier)
- FR38: Owner can view payment history and upcoming payment dates per loan

### Shefa AI Companion

- FR39: Owner can open and collapse an AI conversation panel accessible from any screen
- FR40: Owner can ask natural language questions about financial data and receive source-linked answers (per AI Operating Model)
- FR41: Shefa can deliver proactive nudges (max 3/day) about billing alerts, loan reminders, and financial observations
- FR42: Shefa displays confidence tiers (High/Medium/Low) on every suggestion and recommendation
- FR43: Shefa provides explainable reasoning for every recommendation, citing specific data points
- FR44: Shefa adapts personality tone based on context (playful for daily check-ins, serious for financial analysis)
- FR45: Shefa has a visual character presence (puppy with golden eyes) with micro-expressions matching context
- FR46: Owner can provide feedback (confirm/correct) on Shefa suggestions to improve future calibration

### Data Migration & Import

- FR47: Owner can upload an Excel (.xlsx) file for bulk data migration (per Migration Import Contract)
- FR48: System uses AI-assisted interpretation to identify entities, revenue, expenses, milestones, and loans in the uploaded file
- FR49: System presents side-by-side verification with progressive disclosure: summary totals first, row-level detail on demand
- FR50: System traces every imported record back to its source sheet, row, and cell in the original Excel
- FR51: System flags rows that cannot be confidently interpreted for manual review — never silently skips or imports uncertain data
- FR52: Owner must explicitly confirm migration accuracy before data is committed ("I verify this matches")
- FR53: System stores original Excel as a frozen, immutable snapshot in object storage (independent of main database)
- FR54: Owner can enter financial data manually via forms for all data types
- FR55: Re-import is supported before the "I verify" gate. After verification, data is sealed.

### System-Wide Capabilities

- FR56: Owner can define custom alert rules (conditions that trigger proactive notifications)
- FR57: Module marketplace page showing installed and upcoming modules with status (active, coming soon)
- FR58: System renders all layouts RTL-native for Hebrew and handles bidirectional text (Hebrew/English mixed content)
- FR59: System maintains audit trail on all financial data mutations (create, update, delete — who, what, when, previous value)

## Non-Functional Requirements

### Performance

- NFR1: Dashboard initial load completes with full data in <3 seconds
- NFR2: Page-to-page navigation completes in <1 second
- NFR3: Shefa AI conversational responses return in <5 seconds
- NFR4: Data mutations (create, update, delete) confirm in <2 seconds with visual feedback
- NFR5: Excel migration import processes complete file within 60 seconds for files up to 10MB
- NFR6: Performance degrades gracefully under slow network — loading states, never blank screens

### Security

- NFR7: All data encrypted in transit (TLS 1.2+)
- NFR8: All data encrypted at rest (database-level encryption)
- NFR9: OAuth tokens stored securely — never in localStorage, httpOnly cookies only
- NFR10: Session expires after 24 hours of inactivity
- NFR11: TOTP 2FA available as optional second factor
- NFR12: Sensitive financial data fetched server-side by default. Only minimum necessary data hydrated to client components. No secrets, API keys, or privileged backend-only data exposed in client bundles.
- NFR13: All API routes and server actions verify authentication before processing

### Data Integrity

- NFR14: All monetary calculations use integer arithmetic (agorot) — zero floating-point operations anywhere in the stack (see Calculation Policy)
- NFR15: All financial records use soft deletes — no hard deletes ever
- NFR16: All financial mutations logged in audit trail (who, what, when, previous value)
- NFR17: Database transactions used for all multi-step financial operations — no partial writes
- NFR18: Automated daily database backups retained for 30 days minimum. Backups stored encrypted on Railway's managed backup service or an external object store (e.g., S3-compatible). Backup location must be separate from the primary database host.
- NFR19: Database backup restoration tested and documented — must be recoverable within 4 hours. Restore procedure tested at least once before launch.
- NFR20: Frozen Excel snapshot stored in object storage (e.g., Railway volume or S3-compatible bucket), separate from main PostgreSQL database — survives database failure independently
- NFR21: All imported data maintains traceability to source (original Excel sheet, row, and cell reference)

### Reliability

- NFR22: No uptime SLA required — a few hours of downtime is acceptable
- NFR23: Automated database backups are non-negotiable — data loss is the only unacceptable failure
- NFR24: Application auto-restarts on crash (Railway default behavior)
- NFR25: Health check endpoint available for basic monitoring
- NFR26: Error states handled gracefully — user sees clear error messages, never raw stack traces or blank screens

### Accessibility

- NFR27: Keyboard navigation — all interactive elements reachable via keyboard with correct RTL tab order
- NFR28: Sufficient color contrast ratios (4.5:1 minimum for text)
- NFR29: Focus indicators visible on all interactive elements
- NFR30: Status information not conveyed by color alone (amber/green/red indicators include text labels or icons)

---

## Appendix A: Future User Journeys

These journeys are **out of scope** for Phase 0 + 0.5. They are included for vision context and to inform future architecture decisions. They should not drive current implementation.

### Journey A1: LP Investor — Quarterly Check-In (Phase 4)

**Opening Scene:** David, one of Ernest's 20+ LP investors, receives a push notification: "Q1 2026 fund report is ready." He invested ₪200,000 in Ernest's fund 18 months ago. He trusts Ernest personally — they're friends — but he appreciates transparency.

**Rising Action:** David opens the LP portal. Shefa greets him warmly — a simplified version of the puppy, less playful, more professional. His dashboard shows: current investment value ₪231,400, total return 15.7%, 2 distributions received totaling ₪18,000. The quarterly report is one click away — PDF download with fund performance, individual deal breakdowns, and capital account statement.

**Climax:** David reads the report in 5 minutes. Every deal is explained clearly. The fund's performance is benchmarked. He sees a new real estate deal in the pipeline — Shefa shows the projected impact on fund returns. David thinks: "Ernest runs a serious operation."

**Resolution:** David closes the portal satisfied. No email needed, no phone call to Ernest asking "how's my money doing?" The professional quality of the portal reinforced his trust.

**Requirements revealed (future):** LP read-only portal, push notifications, simplified Shefa branding, investment value tracking, return calculations, distribution history, PDF report generation, deal pipeline visibility, professional trust-building design quality.

---

### Journey A2: Virtual Assistant — Data Entry Delegate (Phase 3)

**Opening Scene:** Ernest has hired a part-time virtual assistant to handle routine data entry — logging bank transactions, updating payment statuses, entering new expense records. The assistant needs access to input data but should never see the full financial picture across all entities.

**Rising Action:** The assistant logs in with a restricted role. Their view is scoped — they see only the data entry queue: 12 new bank transactions to categorize, 3 payment confirmations to log, 1 new expense receipt to file. No dashboard, no KPIs, no cross-entity visibility. Each entry has clear fields and Shefa-suggested auto-categorizations with confidence scores.

**Climax:** The assistant processes 15 entries in 20 minutes. Shefa pre-filled 11 of them correctly (recurring transactions it recognized). The assistant confirms or corrects each one. All entries are audit-logged with the assistant's identity.

**Resolution:** Ernest reviews the assistant's work in a single approval queue — 15 entries, 4 corrections made by the assistant, all audit-trailed. He approves them in bulk. The data is clean, the delegation worked.

**Requirements revealed (future):** Restricted data-entry role (RBAC), scoped views per role, data entry queue, Shefa auto-categorization for recurring transactions, audit trail per user identity, bulk approval workflow, entry validation.
