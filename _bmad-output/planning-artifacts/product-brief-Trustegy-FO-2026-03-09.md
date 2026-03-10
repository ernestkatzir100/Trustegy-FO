---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "C:\\Users\\ernes\\OneDrive - TRUSTEGY\\P&L\\Trustegy PnL23.xlsx"
  - "C:\\Users\\ernes\\OneDrive - TRUSTEGY\\Desktop 1\\TR_Family Office\\DOC-001-PRD.docx"
  - "C:\\Users\\ernes\\OneDrive - TRUSTEGY\\Desktop 1\\TR_Family Office\\DOC-002-Technical-Architecture.docx"
  - "C:\\Users\\ernes\\OneDrive - TRUSTEGY\\Desktop 1\\TR_Family Office\\DOC-005-Roadmap.docx"
  - "C:\\Users\\ernes\\OneDrive - TRUSTEGY\\Desktop 1\\TR_Family Office\\shefa.png"
date: 2026-03-09
author: Ernest
---

# Product Brief: Shefa Investments

## Executive Summary

**Shefa Investments** is an AI-powered financial command center — a modular family office platform designed for a solo operator managing a complex financial universe across multiple entities: an operating consulting business (Trustegy), an investment vehicle company, and personal investments.

The platform replaces a fragile spreadsheet-based system with a unified, Hebrew-first web application that provides consolidated visibility across all holdings, AI-powered deal evaluation, fund management with LP capabilities, and full consulting business operations — all presented through a Tier 1 UI inspired by Claude's warm minimalism, iOS depth, and Shefa's signature golden palette.

Built on Railway with a marketplace-style module architecture, Shefa occupies the massive pricing gap between consumer wealth trackers ($1-3K/yr) and enterprise family office platforms ($75-250K+/yr). No existing product combines multi-entity investment tracking, AI-assisted deal scoring, GP/LP fund administration, and consulting operations management in a single platform designed for one person.

The product's soul is **Shefa** — a puppy AI companion with golden eyes who serves as financial advisor, data analyst, and daily companion. Shefa adapts its personality from playful daily nudges to serious deal evaluation, creating an emotional connection no competitor can replicate.

**Product identity:** "AI-powered financial command center"
**Brand:** Shefa (שפע) — Hebrew for abundance
**Architecture:** Core platform with module marketplace — install what you need, when you need it

---

## Core Vision

### Problem Statement

A solo family office operator manages a sprawling financial landscape across three entities — a consulting business, an investment company, and personal holdings — spanning real estate, private and public equities, fund management (GP/LP), pension funds, alternative investments, loans (both as borrower and lender), and day-to-day consulting operations. Today this is managed through disconnected Excel spreadsheets and multiple bank portals, with no unified view, no automated cash flow tracking, and no decision support for evaluating new investment opportunities.

### Problem Impact

- **No single source of truth**: Financial data is scattered across spreadsheets with manual monthly reconciliation across entities, leading to a fragmented view of net worth and liquidity
- **Cash flow blindness**: The current Excel tracks actual income vs. recognized revenue separately, but offers no forecasting, scenario modeling, or commitment planning (capital calls, loan repayments, distributions)
- **Manual billing lifecycle**: Invoice tracking (billing dates, payment status, invoice numbers) is maintained by hand across 34+ milestones with no automation or aging alerts
- **Loan complexity**: Multiple loans across personal and business entities (6+ active loans at varying rates from 7.45% to 10.75%) with no optimization analysis or consolidated repayment view
- **No deal evaluation capability**: New investment opportunities (real estate projects, company acquisitions, fund commitments) are evaluated ad-hoc with no structured scoring or AI-assisted modeling
- **Cross-entity opacity**: Money flows frequently between entities (owner loans totaling ~₪481K, investment allocations) but inter-entity reconciliation is manual and error-prone
- **Consulting operations fragmented**: Client management, project tracking, billing, and P&L for 10+ clients happen in the same spreadsheet — no CRM, no automated invoicing, no engagement lifecycle management

### Why Existing Solutions Fall Short

- **Enterprise family office platforms** (Addepar, AtlasFive, Archway) cost $75-250K+/yr, require dedicated staff, and have 3-12 month implementation timelines — overkill for a solo operator
- **Consumer wealth trackers** (Kubera, Vyzer) only track balances — no consulting operations, no deal evaluation, no fund management, no multi-entity P&L
- **Consulting management tools** (Bonsai, HoneyBook, Scoro) have zero multi-entity awareness and cannot integrate with an investment management context
- **No platform offers AI-powered deal evaluation** — the entire market tracks what you already own but doesn't help you decide what to invest in next
- **No platform is Hebrew-first** with RTL design for the Israeli market
- **The real competitor is the spreadsheet** — and it's winning because nothing else fits the solo family office operator's unique needs at an accessible price point

### Proposed Solution

Shefa Investments — a modular, Hebrew-first web application (with English support) deployed on Railway, serving as a unified AI-powered financial command center:

**Core Platform:**
- Module marketplace architecture — each module is independent, can be enabled/disabled, shares a unified data layer
- Hierarchical entity model (parent umbrella with child entities) with graph-like flexibility for complex fund structures
- Multi-currency support (ILS, USD, EUR) with banking integration evolving from file import to automatic feeds
- OAuth authentication (Google/Microsoft) + 2FA + role-based access control from day one
- Tenant-aware data model — built for one, designed so it could scale to many
- PWA for mobile — installable, push notifications, works offline

**Shefa AI Companion:**
- Collapsible AI panel (Claude-style conversation interface) — always accessible, contextually aware
- Proactive nudges — Shefa appears when there's something worth saying (billing alerts, loan reminders, portfolio insights)
- Adaptive personality — playful for daily interactions, serious for deal evaluation, professional for LP reports
- Visual presence — the puppy with golden eyes, micro-expressions matching context (happy, thinking, concerned)

**Modules (marketplace architecture):**

1. **Consolidated Dashboard** — Shefa's morning briefing at top, visual trends in middle, precise KPIs at bottom. Master view across all entities with drill-down
2. **Consulting Operations** — iterative build: Phase A (projects, milestones, billing, P&L — replacing the Excel), Phase B (CRM, proposals, contracts), Phase C (time tracking). Full engagement lifecycle
3. **Loans & Debt Management** — both borrower and lender sides, refinancing scenarios, optimization analysis, consolidated repayment view
4. **Investment Tracking** — multi-asset-class portfolio management: real estate (passive), private equity, public stocks, funds, pension, alternatives
5. **Deal Evaluation (AI)** — Shefa generates three outputs from one input: quick scorecard, financial model (IRR, sensitivity, scenarios), and investment memo. Per-asset-class templates. Learns from past decisions over time
6. **Fund Management (GP/LP)** — progressive: internal tracking first, document sharing with LPs second, full portal with live data after legal review. Capital calls, distributions, waterfall calculations
7. **Liquidity Intelligence** — cash position tracking, forecasting, commitment planning, scenario modeling across all entities
8. **Document Vault** — contextual file repository per entity/deal/client with inline preview, folder structure, tagging, full-text search, contract/license expiry alerts, version history, AI document reading and analysis (Shefa summarizes key terms), and RBAC-based sharing (LP read-only access to fund docs, accountant receives quarterly exports, owner sees everything). Storage via S3-compatible object storage with metadata in PostgreSQL

### Key Differentiators

1. **AI-native financial companion**: Shefa combines financial modeling, structured scoring, and conversational analysis. The puppy learns from every deal — past decisions refine future recommendations. No competitor has anything close
2. **Solo operator UX — Tier 1 quality**: Claude's warm minimalism + iOS depth + Shefa's golden palette. Three adaptive design moods (warm/data/action). Designed for one person managing everything, not a team tool squeezed into single-user mode. Beautiful enough to screenshot
3. **True multi-entity architecture**: Hierarchical entity model with cross-entity transaction tracking, consolidated and entity-level views, graph-like flexibility for fund structures. Built as a core data model, not a reporting layer
4. **Module marketplace**: Core platform with independently installable modules sharing a unified data layer. Start with 3, grow organically. Each module is self-contained but connected
5. **Hebrew-first RTL design**: Purpose-built for the Israeli market — typography, layout, navigation all designed RTL-native, not retrofitted. English as secondary language
6. **Consulting + investments unified**: The only product managing both an operating business and investment portfolio under one roof, with shared financial intelligence and cross-entity visibility
7. **Personal investment intelligence engine**: Deal evaluation that gets smarter with every decision. "This looks like the Anilevich deal — similar structure, but 2% lower return. You passed on deals like this 3 out of 4 times"
8. **Accessible positioning**: Professional-grade capabilities in the pricing desert between $3K consumer tools and $75K+ enterprise platforms

### Technical Foundation

- **Stack**: Next.js 15 (App Router), PostgreSQL everywhere (dev + production), Railway deployment
- **Design system**: Claude-inspired warm minimalism, iOS depth, three adaptive moods, golden Shefa accent palette, dark mode, premium Hebrew typography
- **Architecture**: Server-first rendering, module route groups, `{ data, error }` API convention, CUID primary keys, soft deletes, tenant-aware schema
- **AI layer**: Claude API for deal evaluation, document extraction, conversational advisor. Unified "Ask Shefa" interface across all modules
- **Auth**: NextAuth with OAuth (Google/Microsoft), TOTP 2FA, RBAC (owner, admin, investor-readonly)
- **Mobile**: PWA — installable, push notifications, responsive

### Success Criteria

1. **Excel retired** — zero spreadsheet dependency within 3 months of launch
2. **60-second financial picture** — full visibility across all entities from a single dashboard
3. **First AI-evaluated deal** — Shefa used for a real investment decision with scorecard, model, and memo

### Launch Definition (v1)

- 3 priority modules live: consolidated dashboard, consulting operations (Phase A), loans/debt management
- Historical data migrated from Excel — no parallel running
- Shefa AI advisor active with conversational capabilities
- Module marketplace functional — upcoming modules visible even if only 3 installed
- Deployed on Railway with custom domain (shefa-inv)

---

## Target Users

### Primary User: Ernest — CEO of His Financial Empire

**Profile:** Solo entrepreneur managing a complex financial universe across three entities — an operating consulting business (Trustegy, specializing in risk management and business continuity), an investment vehicle company, and personal investments. Based in Israel, works in Hebrew, manages multi-currency holdings across ILS, USD, and EUR. Also serves as GP of a fund with 20+ LP investors (friends and family).

**Identity in Shefa:** One person commanding a strategic overview of his entire financial empire. The dashboard is the CEO view — everything at a glance. Each module is a different hat: consultant, GP, investor, business owner. Shefa adapts its language contextually — "Your client Amdocs" in consulting mode, "Your fund's IRR" in GP mode. Not juggling — commanding.

**Current reality:** No structured daily financial routine because the tools don't support one. Reacts to things as they come up — jumping between bank portals, Excel spreadsheets, and mental notes. Spends hours on manual reconciliation, misses billing dates, lacks visibility into cross-entity cash flow, and evaluates investment opportunities ad-hoc without structured analysis.

**Motivations:**
- Control and visibility over a complex, growing financial landscape
- Making better investment decisions backed by data and AI analysis
- Eliminating manual spreadsheet work that eats productive hours
- Running a professional fund operation that inspires LP confidence
- Building a system that grows with his ambitions

**Success vision — four progressive "aha" moments:**
1. Opening Shefa in the morning and knowing the exact financial position across everything in 30 seconds
2. Shefa alerting about something that would have been missed — overdue payment, loan worth closing, cash flow problem 2 months ahead
3. Evaluating a deal through Shefa and making a confident investment decision backed by real analysis
4. Realizing the Excel hasn't been opened in a month — and not missing it

**Core usage pattern:** Morning check-in with Shefa's dashboard briefing. Throughout the day — billing actions, deal evaluation, client management. Monthly — consolidated P&L review, liquidity planning, portfolio rebalancing assessment. Quarterly — LP reporting, fund performance analysis.

### Secondary User: LP Investors (Future — Read-Only Portal)

**Profile:** 20+ external investors in Ernest's fund with GP/LP structure. Friends and family — similar level of sophistication, unified needs. They trust Ernest personally; the portal reinforces that trust with professional presentation.

**Mindset:** Three simultaneous needs:
- **Quick answers** — balance, returns, distributions at a glance
- **Transparency on demand** — detailed reporting on fund investments and individual deal performance when they want to dig deeper
- **Professional trust signal** — the portal experience itself demonstrates that their capital is managed by a serious, organized operation. Tier 1 design quality IS the trust signal

**Portal tone:** Not cold institutional. This is "Ernest is showing me how my money is doing." Shefa's brand warmth carries through — a simplified Shefa greeting, warm golden palette, approachable yet professional.

**Core usage pattern:** Quarterly login for report review. Occasional check-ins when capital calls or distributions occur. Annual review of detailed fund performance.

### Data Consumer: Accountant (Non-User)

**Profile:** Ernest's external accountant (רו"ח) who receives financial data but never logs into Shefa. Currently receives Excel-based P&L and expense data for tax filings and compliance.

**Needs from Shefa:**
- Accountant-ready exports — P&L reports, expense summaries by category, VAT calculations, revenue recognition schedules
- Familiar format — reports structured the way Israeli accountants expect them
- Reliable data — if Shefa's exports are accurate, the accountant becomes an indirect advocate

**Value to Ernest:** Shefa auto-generates what Ernest currently spends hours manually preparing from Excel for the accountant every month.

### User Journey

**Ernest's journey with Shefa:**

- **Day 1 — Trust ceremony:** Historical data imported from Excel. Shefa presents Ernest's familiar numbers in the new interface with explicit verification: "Here's your P&L — ₪1,054,975 revenue in 2023, ₪1,152,261 in 2024. Does this match?" Original Excel stored as frozen snapshot — every number traceable back to its source row. Trust is earned when the totals match perfectly
- **Week 1 — Habit forming:** Morning routine established for the first time. Open Shefa, read the briefing, act on alerts. Billing milestones managed through the app instead of Excel. Shefa nudges about upcoming payments
- **Month 1 — Trust deepening:** P&L tracked entirely in Shefa. Loan management consolidated. Shefa flags the Mizrachi loan at 10.75% — "consider closing." First proactive insight that would have been missed in the spreadsheet
- **Month 3 — Excel retired:** A real estate opportunity comes in. Ernest asks Shefa to evaluate it. Scorecard, financial model, investment memo generated. First AI-evaluated deal. The Excel file hasn't been opened in weeks
- **Month 6+ — Platform expansion:** New modules installed from the marketplace — investment tracking, liquidity intelligence. Shefa is learning Ernest's investment patterns. LP portal in planning. The platform grows with the empire

**LP journey (future):**

- **Onboarding:** Invitation email from Ernest. OAuth setup. Immediate view of their fund position — Shefa greets them warmly
- **Quarterly cycle:** Push notification — "Q1 report is ready." Login, review dashboard, download PDF report. In and out in 5 minutes
- **Trust deepening:** Over time, the professional quality of the portal experience builds confidence in Ernest as GP. The Tier 1 design signals competence before a single number is read

---

## Success Metrics

### North Star Metrics

Three equally weighted dimensions — time, visibility, and decision quality:

1. **Time reclaimed** — hours saved from manual Excel reconciliation, billing tracking, report preparation, and cross-entity data gathering. Baseline unknown (currently scattered and untracked), but the target is measurable: zero hours spent in spreadsheets
2. **Visibility achieved** — 60-second financial picture across all entities from a single dashboard. From "I need to check three places" to "I already know"
3. **Decision quality elevated** — investment decisions backed by structured AI analysis (scorecard + model + memo) instead of ad-hoc gut feeling. Not about quantifying returns — about confidence in the process

### Emotional Success Metric: The Saturday Morning Test

The ultimate measure of product-market fit: Does Ernest open Shefa on a Saturday morning — not because he has to, but because he wants to? When checking your financial empire feels like checking your favorite app, the product has won.

### Data Accuracy: Zero Tolerance

All financial calculations use integer arithmetic in agora (cents/agorot). No floating point. No rounding errors. No "close enough." If the Excel says ₪1,054,975, Shefa says ₪1,054,975. This is non-negotiable — a single mismatched number destroys trust permanently.

### Migration Ceremony: Belt and Suspenders

- Every number imported with zero margin of error
- Interactive side-by-side verification screen: Excel on the left, Shefa on the right
- Green checkmarks as each total matches
- Migration is not complete until Ernest clicks "I verify this matches"
- Original Excel stored as frozen snapshot — every number traceable back to its source row and cell

### Week 1 Double-Gate

Two conditions must both be true by the end of Week 1:

1. **Excel closed** — Ernest has not opened the spreadsheet for any financial task
2. **Shefa reveals something new** — the platform has surfaced at least one insight Ernest didn't already know (upcoming payment, loan optimization, cash flow pattern)

If either gate fails, the product hasn't proven its value.

### Shefa AI Health Score

Triple-metric system to prove Shefa's intelligence is real, not performative:

1. **Action rate** — percentage of Shefa's proactive nudges that Ernest acts on (clicked, not just dismissed). Target: >30%. Below that, Shefa is becoming noise
2. **Decision confidence** — after every deal evaluation, Ernest rates confidence (1-5). The trend must climb over time — if it flattens, the AI isn't learning
3. **Discovery value** — count of "Shefa caught it first" moments per month — insights Ernest didn't already know (missed payment, loan optimization, cash flow gap 2 months ahead)

### Pride of Ownership: The Show-Off Test

Three touchpoints where design quality proves its value:

1. **LP impression** — when an LP first logs into the portal, their reaction should be "this is serious." The portal's design quality IS the trust signal
2. **Screenshot-worthy** — Ernest voluntarily screenshots a dashboard or deal evaluation to share. If the UI is beautiful enough to share, it's Tier 1
3. **Accountant upgrade** — when the accountant receives Shefa-generated reports instead of Excel exports, they say "this is better than what I usually get"

### Marketplace Vitality

The module marketplace succeeds when:

- Ernest browses upcoming modules with excitement, not obligation
- Ernest requests new modules — ideas he wants built
- Installed module count grows organically over time

### Failure Signals

Three warning signs that demand immediate attention:

1. **Trust erosion** — Ernest double-checks Shefa's numbers in the original Excel. If he's verifying, he doesn't trust
2. **Engagement decay** — morning check-in routine breaks. If Ernest skips days, the product isn't essential
3. **Efficiency regression** — a task takes longer in Shefa than it did in Excel. If the old way is faster, the new way has failed

### Anti-Goals: What Shefa Must Never Become

1. **Never noisy** — maximum 3 proactive nudges per day. Quality over quantity. If there's nothing worth saying, Shefa stays quiet. Silence is a feature
2. **Never a black box** — every AI recommendation shows its reasoning. "I scored this deal 7.2 because..." not just "I recommend this deal." Ernest trusts his own judgment; Shefa supports it, never replaces it
3. **Never complex** — the system should never require a manual or training. If Ernest can't figure out a feature in 30 seconds, the UX has failed. Complexity is the enemy

---

## MVP Scope

### Core Features

**Platform Foundation:**
- OAuth authentication (Google/Microsoft) + TOTP 2FA — Ernest as sole user
- Desktop-only web application — Tier 1 UI with Claude's warm minimalism, iOS depth, Shefa's golden palette, three adaptive design moods (warm/data/action), dark mode
- Hebrew-first RTL design with English support
- Hierarchical entity model (Trustegy consulting, investment company, personal)
- ILS-only currency — foreign holdings stored as ILS equivalent
- Module marketplace shell — full browsing experience, module detail pages, enable/disable toggles, "Coming Soon" cards for upcoming modules
- Tenant-aware schema from day one
- Railway deployment with custom domain (shefa-inv)

**Module 1: Consolidated Dashboard (Full Vision)**
- Shefa's morning briefing at top — AI-generated daily summary of financial position across all entities
- Visual trends in middle — sparkline charts, month-over-month comparisons, revenue trends
- Precise KPI cards at bottom — net worth, cash position, revenue MTD/YTD, outstanding invoices, loan balances
- Master view across all entities with drill-down to entity level

**Module 2: Consulting Operations (Phase A)**
- Client management — 10+ existing clients (Amdocs, Pineapple GP, Masav, Israel Railways, NTL, etc.)
- Project and milestone tracking — replacing the BILLING Excel sheet (34+ milestones)
- Billing tracking — dates, payment status, invoice numbers, manual data entry
- Shefa proactive nudges — upcoming billing dates, overdue payment alerts (max 3/day)
- No invoice generation, no revenue recognition, no CRM, no time tracking (all Phase B+)

**Module 3: Loans & Debt Management (Full Depth)**
- Borrower side — all 6+ active loans displayed with rates (7.45%-10.75%), balances, payment schedules
- Lender side — owner loans between entities (~₪481K), tracking of loans given
- Optimization flags — Shefa highlights expensive loans, suggests closures/refinancing
- Scenario modeling — "What if I close Mizrachi early?" "What if I refinance Poalim?" Interactive what-if calculations
- Consolidated repayment view across all entities

**Shefa AI Companion (Core Platform — he/him):**
- Collapsible AI panel — Claude-style conversation interface, always accessible, contextually aware
- Conversational queries — natural language questions over financial data
- Proactive nudges — max 3/day, billing alerts, loan reminders, cash flow observations
- Document context — can read uploaded documents and reference them in answers
- "Shefa is learning" framing — confidence scores on every AI suggestion, honest expectations from Day 1
- Adaptive personality — playful for daily check-ins, serious for financial analysis
- Visual presence — the puppy boy with golden eyes, micro-expressions matching context (happy, thinking, concerned)
- Explainable AI — every recommendation shows reasoning and confidence level, never a black box
- Feedback loop — Ernest's confirmations/corrections train Shefa's calibration over time

**Data Entry Pipeline (Progressive):**
- Manual entry via forms for all data types
- Excel import — bulk migration from Trustegy PnL23.xlsx (historical data)
- AI extraction — upload bank statement/contract PDF, Shefa reads and suggests entries with confidence scores: "I'm 94% sure this is an Amdocs payment of ₪45,000 — here's why"
- Recurring transaction templates — auto-populate predictable flows (monthly loan payments, retainer billing)

**Data Migration (Trust Ceremony):**
- Full migration of Excel data: PnL (2023-2025 actuals), billing, loans (מימון), Anilevich
- Forward-looking 2026 budget/forecast structure ready for planning in Shefa
- Zero-error import with integer agora math — no floating point, no rounding
- Full ceremony with progressive disclosure — Shefa narrates big numbers first with celebration, Ernest drills into detail underneath
- Interactive side-by-side verification: Excel on left, Shefa on right, animated green checkmarks as totals match
- Migration complete only when Ernest clicks "I verify this matches"
- Original Excel stored as frozen snapshot — every number traceable back to its source row and cell

### Out of Scope for MVP

**Deferred Modules:**
- Investment Tracking (multi-asset portfolio management)
- Deal Evaluation AI (scorecard, financial model, investment memo)
- Fund Management GP/LP (capital calls, distributions, LP portal)
- Liquidity Intelligence (forecasting, commitment planning, scenarios)
- Document Vault (full file repository with versioning, RBAC sharing, expiry alerts)

**Deferred Platform Features:**
- Mobile / PWA — no responsive optimization, push notifications, or offline
- Multi-currency — no USD/EUR support, no exchange rate feeds
- LP read-only portal — no external user access
- Accountant exports — no automated report generation or email scheduling
- Consulting Phase B (CRM, proposals, contracts) and Phase C (time tracking)
- Invoice generation and revenue recognition logic
- Automatic bank feeds integration

**Deferred AI Capabilities:**
- Deal evaluation and scoring
- Investment pattern learning ("This looks like the Anilevich deal")
- LP report generation
- Full Document Vault AI analysis (basic document reading available via Shefa panel)

### MVP Success Gates

1. **Trust ceremony passed** — all migrated numbers match Excel perfectly, Ernest clicks "I verify"
2. **Week 1 double-gate cleared** — Excel closed AND Shefa reveals something new
3. **Saturday morning test** — Ernest opens Shefa voluntarily on a weekend within first month
4. **Shefa AI health score baseline** — action rate >30%, at least 2 "caught it first" moments in month 1
5. **Zero regression** — no task takes longer in Shefa than it did in Excel

### Future Vision

**Phase 2 — Investment Intelligence (Month 3-6):**
- Investment Tracking module — multi-asset portfolio (real estate, private/public equity, funds, pension, alternatives)
- Deal Evaluation AI — scorecard + financial model + investment memo from single input
- Document Vault — full file repository with versioning, RBAC sharing, expiry alerts, AI analysis
- Multi-currency support (ILS, USD, EUR) with automatic exchange rates

**Phase 3 — Fund Operations (Month 6-9):**
- Fund Management GP/LP — internal tracking first, document sharing second, full portal after legal review
- LP read-only portal — OAuth, quarterly reports, push notifications
- Accountant export automation — scheduled P&L and expense reports
- Consulting Phase B — CRM, proposals, contracts

**Phase 4 — Platform Maturity (Month 9-12):**
- Liquidity Intelligence — cash position forecasting, commitment planning, scenario modeling
- Consulting Phase C — time tracking
- Mobile PWA — installable, push notifications, offline dashboard
- Automatic bank feeds integration
- Deal evaluation learning — feedback loop from past decisions

**Long-term Vision (Year 2+):**
- Shefa learns Ernest's investment patterns — "This looks like the Anilevich deal — similar structure, but 2% lower return. You passed on deals like this 3 out of 4 times"
- Potential SaaS positioning for other solo family office operators
- Advanced marketplace with community-contributed modules
- API integrations with Israeli banking and financial services
