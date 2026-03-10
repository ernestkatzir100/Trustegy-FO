---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-03-10'
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# Trustegy-FO - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Trustegy-FO (Shefa Investments), decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Owner can sign in via OAuth (Google or Microsoft account)
FR2: Owner can enable and use TOTP two-factor authentication
FR3: System restricts all access to authenticated owner only
FR4: Owner can sign out and sessions expire after inactivity
FR5: System pre-seeds 3 entities (Trustegy consulting, investment company, personal holdings). Owner can edit entity details and add new entities if needed.
FR6: Owner can soft-delete entities. Pre-seeded entities can be renamed but not deleted.
FR7: Owner can view consolidated financial data across all entities or drill down to a single entity
FR8: Owner can track inter-entity transactions (owner loans, capital allocations between entities)
FR9: System stores all monetary values as integer agorot with zero floating-point operations
FR10: Owner can view a zero-click morning briefing showing full financial position across all entities on page load
FR11: Owner can view entity-level KPI cards with defined metrics: Revenue YTD, Cash position, Outstanding invoices, Loan balances — per entity and consolidated
FR12: Owner can see status indicators (amber/green/red per Status Semantics) on items requiring attention
FR13: Owner can drill down from master view to entity-level detail
FR14: System displays Shefa AI morning summary at top of dashboard
FR15: Owner can view visual trends (sparkline charts, month-over-month comparisons)
FR16: Dashboard KPIs auto-refresh after any data mutation in any module (immediate after save, not real-time push)
FR17: Owner can create, view, edit, and soft-delete client records
FR18: Owner can create and manage projects per client with milestone tracking
FR19: Owner can track milestone status through a workflow: pending → deliverable confirmed → billable → invoiced → paid
FR20: Owner can enter invoice numbers and billing dates per milestone
FR21: Owner can view milestones by status (green/billable, amber/pending, red/overdue per Status Semantics)
FR22: Owner can view monthly billing summary with totals and payment status
FR23: Owner can view per-client project and billing history
FR24: System provides proactive alerts for upcoming billing milestones and overdue payments
FR25: Owner can create, view, edit, and soft-delete expense records per entity
FR26: Owner can assign a VAT rate to each revenue record (milestone) and expense record. System computes VAT amount using Calculation Policy rules.
FR27: Owner can assign a tax category to each revenue and expense record from a predefined list (categories configurable by owner)
FR28: Owner can set a revenue recognition date on milestones, tracked separately from billing date
FR29: Owner can export revenue and expense data with VAT amounts, tax categories, and entity attribution (CSV/Excel) for accountant handoff
FR30: Owner can view all loans across all entities in a consolidated view
FR31: Owner can create, edit, and soft-delete loans as borrower (bank loans, credit lines) with rate, balance, and payment schedule
FR32: Owner can create, edit, and soft-delete loans as lender (owner loans between entities) with balances and terms
FR33: Owner can view consolidated repayment schedule across all entities
FR34: Owner can record loan payments (mark payments as made, update remaining balance)
FR35: Owner can view a payment timeline showing chronological payment events across all loans
FR36: System detects and alerts when multiple loan payments from the same entity fall within a 3-day window (collision detection)
FR37: System flags high-rate loans and suggests optimization opportunities (via Shefa, with confidence tier)
FR38: Owner can view payment history and upcoming payment dates per loan
FR39: Owner can open and collapse an AI conversation panel accessible from any screen
FR40: Owner can ask natural language questions about financial data and receive source-linked answers (per AI Operating Model)
FR41: Shefa can deliver proactive nudges (max 3/day) about billing alerts, loan reminders, and financial observations
FR42: Shefa displays confidence tiers (High/Medium/Low) on every suggestion and recommendation
FR43: Shefa provides explainable reasoning for every recommendation, citing specific data points
FR44: Shefa adapts personality tone based on context (playful for daily check-ins, serious for financial analysis)
FR45: Shefa has a visual character presence (puppy with golden eyes) with micro-expressions matching context
FR46: Owner can provide feedback (confirm/correct) on Shefa suggestions to improve future calibration
FR47: Owner can upload an Excel (.xlsx) file for bulk data migration (per Migration Import Contract)
FR48: System uses AI-assisted interpretation to identify entities, revenue, expenses, milestones, and loans in the uploaded file
FR49: System presents side-by-side verification with progressive disclosure: summary totals first, row-level detail on demand
FR50: System traces every imported record back to its source sheet, row, and cell in the original Excel
FR51: System flags rows that cannot be confidently interpreted for manual review — never silently skips or imports uncertain data
FR52: Owner must explicitly confirm migration accuracy before data is committed ("I verify this matches")
FR53: System stores original Excel as a frozen, immutable snapshot in object storage (independent of main database)
FR54: Owner can enter financial data manually via forms for all data types
FR55: Re-import is supported before the "I verify" gate. After verification, data is sealed.
FR56: Owner can define custom alert rules (conditions that trigger proactive notifications)
FR57: Module marketplace page showing installed and upcoming modules with status (active, coming soon)
FR58: System renders all layouts RTL-native for Hebrew and handles bidirectional text (Hebrew/English mixed content)
FR59: System maintains audit trail on all financial data mutations (create, update, delete — who, what, when, previous value)

### NonFunctional Requirements

NFR1: Dashboard initial load completes with full data in <3 seconds
NFR2: Page-to-page navigation completes in <1 second
NFR3: Shefa AI conversational responses return in <5 seconds
NFR4: Data mutations (create, update, delete) confirm in <2 seconds with visual feedback
NFR5: Excel migration import processes complete file within 60 seconds for files up to 10MB
NFR6: Performance degrades gracefully under slow network — loading states, never blank screens
NFR7: All data encrypted in transit (TLS 1.2+)
NFR8: All data encrypted at rest (database-level encryption)
NFR9: OAuth tokens stored securely — never in localStorage, httpOnly cookies only
NFR10: Session expires after 24 hours of inactivity
NFR11: TOTP 2FA available as optional second factor
NFR12: Sensitive financial data fetched server-side by default. No secrets or API keys exposed in client bundles.
NFR13: All API routes and server actions verify authentication before processing
NFR14: All monetary calculations use integer arithmetic (agorot) — zero floating-point operations anywhere in the stack
NFR15: All financial records use soft deletes — no hard deletes ever
NFR16: All financial mutations logged in audit trail (who, what, when, previous value)
NFR17: Database transactions used for all multi-step financial operations — no partial writes
NFR18: Automated daily database backups retained for 30 days minimum, stored separately from primary database host
NFR19: Database backup restoration tested and documented — recoverable within 4 hours
NFR20: Frozen Excel snapshot stored in object storage, separate from main PostgreSQL database
NFR21: All imported data maintains traceability to source (original Excel sheet, row, and cell reference)
NFR22: No uptime SLA required — a few hours of downtime is acceptable
NFR23: Automated database backups are non-negotiable — data loss is the only unacceptable failure
NFR24: Application auto-restarts on crash (Railway default behavior)
NFR25: Health check endpoint available for basic monitoring
NFR26: Error states handled gracefully — user sees clear error messages, never raw stack traces or blank screens
NFR27: Keyboard navigation — all interactive elements reachable via keyboard with correct RTL tab order
NFR28: Sufficient color contrast ratios (4.5:1 minimum for text)
NFR29: Focus indicators visible on all interactive elements
NFR30: Status information not conveyed by color alone (amber/green/red indicators include text labels or icons)

### Additional Requirements

**From Architecture — Starter Template & Infrastructure:**
- Project initialization using `pnpm create next-app@latest` with TypeScript, Tailwind, ESLint, App Router, src directory, Turbopack
- Post-init: shadcn/ui, Drizzle ORM + pg, Auth.js v5, next-intl, cuid2, zod, react-hook-form, drizzle-zod, vitest
- Drizzle ORM schema setup with shared column helpers (id, timestamps, softDelete)
- Database seed script: 3 pre-seeded entities, sample tax categories
- Auth.js v5 configuration with OAuth providers (Google, Microsoft) and Drizzle adapter
- Middleware.ts for route protection (all (app)/ routes require auth)
- Health check API endpoint (/api/health)
- Railway deployment configuration (staging + production environments)
- Environment variable setup (.env.example template)
- Security headers in next.config.ts (CSP, X-Frame-Options, X-Content-Type-Options)

**From Architecture — Implementation Patterns:**
- ActionResult<T> type definition for all server actions
- Integer agorot money utility library (toAgorot, fromAgorot, formatILS, calculateVat)
- Audit trail infrastructure (audit_logs table, withAudit wrapper, logAudit helper)
- All server actions must check auth, validate with Zod, return ActionResult<T>
- Revalidation pattern: mutations trigger revalidatePath for affected routes
- Loading.tsx skeleton in every route segment (warm cream tones, not gray)
- Error.tsx boundary in every route segment (Hebrew error messages, retry action)

**From Architecture — Data Patterns:**
- { data, error } response convention across all server actions
- CUID primary keys on all tables
- Soft delete (deletedAt timestamp) on all financial entities
- Database transactions for multi-step financial operations
- snake_case database naming, camelCase code, PascalCase components

**From UX Design — Design System Setup:**
- Tailwind config with Shefa palette (cream #FAF8F5, gold #C4954A, status colors)
- Typography setup: Heebo (Hebrew sans-serif) + IBM Plex Mono (financial numbers)
- Spacing system (4px base unit)
- Dark sidebar navigation (56px collapsed, expand on hover)
- Floating Shefa panel (bottom-left corner, click to expand upward as overlay)
- 6 custom components: KPICard, StatusBadge, ShefaAvatar, ShefaChat, DataTable, MigrationVerifier
- WCAG 2.1 AA accessibility compliance
- Desktop-only: 1280px+ minimum viewport
- RTL-native layout using CSS logical properties (margin-inline-start, not margin-left)
- Fade-in content loading (Shefa appears first, data follows)
- String externalization via next-intl (he.json) — no hardcoded Hebrew strings

**From UX Design — Interaction Patterns:**
- Module switching via sidebar without page reload feel
- Status semantics: green (healthy/ready), amber (attention needed, 7-day threshold), red (overdue/immediate)
- Progressive disclosure: totals first, drill-down on demand
- No toast notifications — state change IS feedback
- Maximum 2-level navigation depth (module → detail)
- Shefa puppy micro-expressions matching context (happy, thinking, concerned, serious, celebrating)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | OAuth sign-in (Google/Microsoft) |
| FR2 | Epic 1 | TOTP two-factor authentication |
| FR3 | Epic 1 | Access restricted to authenticated owner |
| FR4 | Epic 1 | Sign out and session expiry |
| FR5 | Epic 1 | Pre-seeded entities + CRUD |
| FR6 | Epic 1 | Soft-delete entities |
| FR7 | Epic 2 | Consolidated financial data view |
| FR8 | Epic 7 | Inter-entity transactions |
| FR9 | Epic 1 | Integer agorot storage |
| FR10 | Epic 2 | Zero-click morning briefing |
| FR11 | Epic 2 | Entity-level KPI cards |
| FR12 | Epic 2 | Status indicators (amber/green/red) |
| FR13 | Epic 2 | Drill down master → entity detail |
| FR14 | Epic 3 | Shefa AI morning summary on dashboard |
| FR15 | Epic 2 | Visual trends (sparklines) |
| FR16 | Epic 2 | Dashboard KPI auto-refresh |
| FR17 | Epic 5 | Client CRUD |
| FR18 | Epic 5 | Projects with milestone tracking |
| FR19 | Epic 5 | Milestone status workflow |
| FR20 | Epic 5 | Invoice numbers and billing dates |
| FR21 | Epic 5 | Milestones by status view |
| FR22 | Epic 5 | Monthly billing summary |
| FR23 | Epic 5 | Per-client project/billing history |
| FR24 | Epic 5 | Proactive billing alerts |
| FR25 | Epic 6 | Expense CRUD per entity |
| FR26 | Epic 6 | VAT rate assignment + computation |
| FR27 | Epic 6 | Tax category assignment |
| FR28 | Epic 5 | Revenue recognition date |
| FR29 | Epic 6 | Export data (CSV/Excel) |
| FR30 | Epic 7 | Consolidated loan view |
| FR31 | Epic 7 | Borrower loans CRUD |
| FR32 | Epic 7 | Lender loans CRUD |
| FR33 | Epic 7 | Consolidated repayment schedule |
| FR34 | Epic 7 | Record loan payments |
| FR35 | Epic 7 | Payment timeline |
| FR36 | Epic 7 | Collision detection (3-day window) |
| FR37 | Epic 7 | High-rate loan optimization |
| FR38 | Epic 7 | Payment history and upcoming dates |
| FR39 | Epic 3 | AI conversation panel |
| FR40 | Epic 3 | Natural language financial queries |
| FR41 | Epic 3 | Proactive nudges (max 3/day) |
| FR42 | Epic 3 | Confidence tiers |
| FR43 | Epic 3 | Explainable reasoning |
| FR44 | Epic 3 | Personality tone adaptation |
| FR45 | Epic 3 | Visual character (puppy) |
| FR46 | Epic 3 | User feedback on suggestions |
| FR47 | Epic 4 | Excel upload for migration |
| FR48 | Epic 4 | AI-assisted interpretation |
| FR49 | Epic 4 | Side-by-side verification |
| FR50 | Epic 4 | Source traceability |
| FR51 | Epic 4 | Flag uncertain rows |
| FR52 | Epic 4 | Explicit confirmation gate |
| FR53 | Epic 4 | Frozen snapshot storage |
| FR54 | Epic 5/6/7 | Manual data entry forms (partial per module) |
| FR55 | Epic 4 | Re-import before verification |
| FR56 | Epic 8 | Custom alert rules |
| FR57 | Epic 8 | Module marketplace page |
| FR58 | Epic 1 | RTL-native Hebrew layout |
| FR59 | Epic 1 | Audit trail |

**Coverage: 59/59 FRs mapped — zero gaps.**

## Epic List

### Epic 1: Platform Foundation & Entity Management
Owner can securely sign in, manage their business entities, and interact with a polished Hebrew-first interface built on a solid financial data foundation.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR9, FR58, FR59

**User outcomes:**
- OAuth sign-in (Google/Microsoft) with optional TOTP 2FA
- Session management and access control (24h expiry)
- Pre-seeded 3 entities (Trustegy consulting, investment company, personal holdings) + CRUD
- Integer agorot monetary infrastructure (zero floating-point)
- RTL-native design system (Shefa palette, Heebo + IBM Plex Mono, dark sidebar)
- Audit trail on all financial mutations
- Security headers, route protection middleware, health check endpoint

**Implementation notes:** Heaviest epic (~15-20 stories). Includes project init, design system, auth, entities, and infrastructure. All other epics depend on this foundation. Consider grouping stories into: (a) Project Setup & Design System, (b) Auth & Security, (c) Entity Management, (d) Infrastructure & Patterns.

---

### Epic 2: Financial Dashboard & Morning Briefing
Owner sees their complete financial position across all entities the moment the page loads — KPIs, trends, and status indicators at a glance.

**FRs covered:** FR7, FR10, FR11, FR12, FR13, FR15, FR16

**User outcomes:**
- Zero-click morning briefing layout (data loads on page open)
- Consolidated view across all entities
- KPI cards: Revenue YTD, Cash position, Outstanding invoices, Loan balances
- Status indicators (green/amber/red with text labels per WCAG)
- Entity drill-down from master to detail view
- Sparkline charts and month-over-month trends
- Auto-refresh KPIs after any data mutation

**Implementation notes:** Dashboard displays progressive data — KPIs show entity-level info initially, enriching as consulting/expenses/loans modules ship. KPI cards designed with empty/zero states that gracefully upgrade when data arrives.

---

### Epic 3: Shefa AI Assistant
Owner has an intelligent AI companion (Shefa the golden-eyed puppy) who delivers a morning summary, answers financial questions in natural language, and proactively alerts about important matters.

**FRs covered:** FR14, FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR46

**User outcomes:**
- AI conversation panel (collapsible, bottom-left floating overlay)
- Morning summary generation displayed at top of dashboard
- Natural language queries about financial data with source-linked answers
- Proactive nudges (max 3/day) — billing alerts, loan reminders, observations
- Confidence tiers (High/Medium/Low) on every suggestion
- Explainable reasoning citing specific data points
- Personality tone adaptation (playful ↔ serious based on context)
- Shefa puppy visual character with micro-expressions (happy, thinking, concerned, serious, celebrating)
- User feedback mechanism (confirm/correct suggestions)

**Implementation notes:** Shefa's query capability expands progressively as domain modules are added. Design the AI query layer with adapter pattern so Shefa's knowledge grows with each new module. Phase 0 delivers entity + migration data queries; Phase 0.5 adds consulting, expense, and loan awareness.

---

### Epic 4: Data Migration (Excel Import)
Owner can upload their existing Excel financial data and have it intelligently interpreted, verified side-by-side, and committed with full traceability to the original source.

**FRs covered:** FR47, FR48, FR49, FR50, FR51, FR52, FR53, FR55

**User outcomes:**
- Excel upload (.xlsx) for bulk data migration
- AI-assisted interpretation (entities, revenue, expenses, milestones, loans)
- Side-by-side verification with progressive disclosure (summary first, row detail on demand)
- Source traceability (original sheet, row, cell reference)
- Uncertain row flagging for manual review — never silently imports
- Explicit "I verify this matches" confirmation gate
- Frozen immutable snapshot stored in object storage (separate from PostgreSQL)
- Re-import supported before verification; data sealed after confirmation

**Implementation notes:** Recommended to ship before Dashboard (Epic 2) so Ernest can load real financial data, making the dashboard meaningful from first use. Processing must complete within 60 seconds for files up to 10MB.

---

### Epic 5: Consulting & Billing Module
Owner can manage consulting clients, track project milestones through the full billing lifecycle (pending → paid), and view billing summaries with proactive alerts for upcoming and overdue payments.

**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR28, FR54 (partial)

**User outcomes:**
- Client CRUD (create, view, edit, soft-delete)
- Project management with milestone tracking per client
- Milestone workflow: pending → deliverable confirmed → billable → invoiced → paid
- Invoice number and billing date entry per milestone
- Milestone status views (green/billable, amber/pending, red/overdue)
- Monthly billing summary with totals and payment status
- Per-client project and billing history
- Proactive alerts for upcoming milestones and overdue payments
- Revenue recognition date tracking (separate from billing date)
- Manual data entry forms for consulting data

**Implementation notes:** Phase 0.5 module. Independent of Epics 4, 6, 7. Feeds data into Dashboard KPIs (Revenue YTD, Outstanding invoices) and Shefa queries.

---

### Epic 6: Expenses & Tax Module
Owner can track expenses per entity, assign VAT rates and tax categories, and export clean data for accountant handoff — making tax season painless.

**FRs covered:** FR25, FR26, FR27, FR29, FR54 (partial)

**User outcomes:**
- Expense CRUD per entity (create, view, edit, soft-delete)
- VAT rate assignment on revenue and expense records with computed amounts (integer agorot math)
- Tax category assignment from configurable predefined list
- Export revenue + expense data with VAT amounts, tax categories, entity attribution (CSV/Excel)
- Manual data entry forms for expense records

**Implementation notes:** Phase 0.5 module. FR26 (VAT) applies to both revenue records (milestones from Epic 5) and expense records. VAT computation uses Calculation Policy rules with integer arithmetic. Tax categories are seeded in Epic 1 database seed.

---

### Epic 7: Loans & Debt Management
Owner has complete visibility into all loans across entities — as borrower and lender — with repayment schedules, payment tracking, collision detection, and optimization suggestions.

**FRs covered:** FR8, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR54 (partial)

**User outcomes:**
- Inter-entity transactions (owner loans, capital allocations between entities)
- Consolidated loan view across all entities
- Borrower loans (bank loans, credit lines) with rate, balance, payment schedule
- Lender loans (owner loans between entities) with balances and terms
- Consolidated repayment schedule across all entities
- Record loan payments (mark as made, update remaining balance)
- Payment timeline (chronological events across all loans)
- Collision detection (multiple payments from same entity within 3-day window)
- High-rate loan optimization suggestions (via Shefa, with confidence tier)
- Payment history and upcoming payment dates per loan
- Manual data entry forms for loan data

**Implementation notes:** Phase 0.5 module. Largest Phase 0.5 epic (11 FRs). FR37 (optimization suggestions) requires Shefa AI integration from Epic 3. Feeds Loan balances into Dashboard KPIs.

---

### Epic 8: Settings & Module Marketplace
Owner can define custom alert rules and view the module marketplace showing what's active and what's coming next.

**FRs covered:** FR56, FR57

**User outcomes:**
- Custom alert rule creation (owner-defined conditions that trigger proactive notifications)
- Module marketplace page (installed modules with active/coming soon status)

**Implementation notes:** Lightweight epic (2 FRs, ~3-4 stories). Can be delivered at any point after Epic 1. Consider as Phase 1 or late Phase 0.5 deliverable.

---

### Dependency Flow

```
Epic 1 (Platform) ← Foundation for all
  ├── Epic 4 (Migration) ← Populates data first
  ├── Epic 2 (Dashboard) ← Shows data progressively
  ├── Epic 3 (Shefa AI) ← Queries expand with modules
  ├── Epic 5 (Consulting) ← Independent module
  ├── Epic 6 (Expenses) ← Independent module
  ├── Epic 7 (Loans) ← Independent module
  └── Epic 8 (Settings) ← Independent
```

### Recommended Delivery Order

**Phase 0:** Epic 1 → Epic 4 → Epic 2 → Epic 3
**Phase 0.5:** Epic 5, Epic 6, Epic 7 (parallel or any order)
**Phase 1:** Epic 8

---

## Epic Stories

### Epic 1: Platform Foundation & Entity Management

#### Story 1.1: Project Initialization & Design System

As the owner,
I want the application to render in a polished Hebrew-first visual design with warm cream tones, gold accents, and proper RTL layout,
So that every screen feels premium and native from the very first interaction.

**Acceptance Criteria:**

**Given** the project is initialized with Next.js 15, TypeScript, Tailwind, App Router, and src directory
**When** the application loads in a browser
**Then** the page renders with RTL direction (dir="rtl") using CSS logical properties (margin-inline-start, not margin-left)
**And** Tailwind is configured with the Shefa palette (cream #FAF8F5, gold #C4954A, status colors green/amber/red)
**And** typography uses Heebo for Hebrew text and IBM Plex Mono for financial numbers (loaded via next/font)
**And** the 4px base spacing system is configured
**And** next-intl is set up with a he.json strings file — no hardcoded Hebrew anywhere
**And** every route segment has a loading.tsx skeleton in warm cream tones (not gray)
**And** every route segment has an error.tsx boundary with Hebrew error messages and a retry action
**And** all dependencies are installed: shadcn/ui, Drizzle ORM + pg, Auth.js v5, next-intl, cuid2, zod, react-hook-form, drizzle-zod, vitest

---

#### Story 1.2: Application Shell & Sidebar Navigation

As the owner,
I want a dark sidebar that collapses to 56px and expands on hover, with module navigation that switches content without full page reloads,
So that I can move between modules quickly in a clean, Claude-desktop-inspired layout.

**Acceptance Criteria:**

**Given** the design system from Story 1.1 is in place
**When** the owner views the application
**Then** a dark sidebar navigation is rendered at 56px width (collapsed) with icons for each module
**And** hovering over the sidebar expands it to show module labels
**And** clicking a module switches the main content area via Next.js route groups without a full page reload feel
**And** the layout enforces a minimum viewport of 1280px (desktop-only)
**And** content loads with a fade-in animation (Shefa appears first, data follows)
**And** security headers are configured in next.config.ts (CSP, X-Frame-Options, X-Content-Type-Options)
**And** a health check endpoint exists at /api/health returning status 200
**And** an .env.example template documents all required environment variables

---

#### Story 1.3: Database Foundation & OAuth Sign-In

As the owner,
I want to sign in securely with my Google or Microsoft account so that only I can access my financial data.

**Acceptance Criteria:**

**Given** the owner navigates to the application
**When** they are not authenticated
**Then** they are redirected to a login page with Google and Microsoft sign-in options
**And** Auth.js v5 is configured with Drizzle adapter storing sessions in PostgreSQL
**And** Drizzle ORM is set up with shared column helpers (id using CUID, created_at, updated_at, deleted_at)
**And** OAuth tokens are stored in httpOnly cookies — never in localStorage (NFR9)
**And** middleware.ts protects all (app)/ routes, redirecting unauthenticated requests to login
**And** successful sign-in creates a database session and redirects to the dashboard
**And** all data is encrypted in transit via TLS 1.2+ (NFR7)

---

#### Story 1.4: Session Management & Sign Out

As the owner,
I want to sign out and have my session expire after 24 hours of inactivity,
So that my financial data remains secure even if I forget to log out.

**Acceptance Criteria:**

**Given** the owner is authenticated
**When** they click the sign-out action
**Then** the database session is invalidated and they are redirected to the login page
**And** sessions automatically expire after 24 hours of inactivity (NFR10)
**And** an auth check helper function is available for all server actions to verify authentication before processing (NFR13)
**And** the ActionResult<T> type is defined: `{ data: T; error: null } | { data: null; error: { code: string; message: string } }`
**And** all server actions follow the pattern: check auth → validate with Zod → return ActionResult<T>

---

#### Story 1.5: TOTP Two-Factor Authentication

As the owner,
I want to optionally enable TOTP-based two-factor authentication,
So that I have an extra layer of security protecting my financial data.

**Acceptance Criteria:**

**Given** the owner is authenticated
**When** they navigate to security settings
**Then** they can enable TOTP 2FA by scanning a QR code with an authenticator app
**And** after enabling, subsequent sign-ins require a 6-digit TOTP code after OAuth
**And** the owner can disable 2FA from security settings
**And** invalid TOTP codes are rejected with a clear Hebrew error message
**And** TOTP secrets are stored securely server-side, never exposed to the client (NFR12)

---

#### Story 1.6: Entity Schema, Seed Data & Money Utilities

As the owner,
I want the system to come pre-loaded with my three business entities and handle all money as integer agorot,
So that my financial data is accurate from day one with zero floating-point errors.

**Acceptance Criteria:**

**Given** the database is initialized
**When** the seed script runs
**Then** 3 entities are created: Trustegy consulting, investment company, personal holdings
**And** sample tax categories are seeded from a predefined list
**And** the entities table uses CUID primary keys, created_at, updated_at, deleted_at columns
**And** all monetary columns are integer type (agorot = ILS × 100)
**And** a money utility library exists with: toAgorot(ils), fromAgorot(agorot), formatILS(agorot), calculateVat(baseAgorot, vatRateBp) — all using integer arithmetic, zero floating-point (NFR14)
**And** Zod schemas are generated from Drizzle schemas via drizzle-zod for form validation
**And** snake_case is used for database columns, camelCase for TypeScript code, PascalCase for components

---

#### Story 1.7: Entity Management UI

As the owner,
I want to view, edit, and add business entities, and soft-delete ones I no longer need,
So that I can organize my financial data across the right business structures.

**Acceptance Criteria:**

**Given** the owner is authenticated and entities are seeded
**When** they navigate to entity management
**Then** all entities are displayed in a list with their details
**And** the owner can edit any entity's details via a form (react-hook-form + Zod validation)
**And** the owner can add a new entity
**And** the owner can soft-delete non-pre-seeded entities (deleted_at timestamp set, NFR15)
**And** pre-seeded entities (Trustegy consulting, investment company, personal holdings) can be renamed but not deleted
**And** all mutations use server actions that: check auth → validate Zod → return ActionResult<T>
**And** successful mutations trigger revalidatePath for affected routes
**And** mutations confirm in <2 seconds with visual feedback (NFR4)
**And** database transactions are used for multi-step operations (NFR17)

---

#### Story 1.8: Audit Trail Infrastructure

As the owner,
I want every financial data change to be logged with who changed it, what changed, when, and the previous value,
So that I have a complete audit history for accountability and compliance.

**Acceptance Criteria:**

**Given** the audit infrastructure is set up
**When** any financial data mutation occurs (create, update, delete)
**Then** an entry is written to the audit_logs table recording: user_id, action (create/update/delete), table_name, record_id, previous_value (JSON), new_value (JSON), timestamp
**And** a withAudit() wrapper function exists that server actions can use to automatically log mutations
**And** a logAudit() helper exists for manual audit entries
**And** entity mutations from Story 1.7 are retroactively wrapped with audit logging
**And** audit logs are append-only — they cannot be edited or deleted
**And** all financial mutations are logged (NFR16)

---

### Epic 2: Financial Dashboard & Morning Briefing

#### Story 2.1: Dashboard Layout & Morning Briefing Shell

As the owner,
I want to see my complete financial position across all entities the moment the page loads, without clicking anything,
So that I get an instant morning briefing every time I open the app.

**Acceptance Criteria:**

**Given** the owner is authenticated and navigates to the dashboard
**When** the page loads
**Then** a consolidated financial overview is displayed across all entities with zero clicks required
**And** the layout includes a reserved slot at the top for the Shefa AI morning summary (populated in Epic 3, shows a warm placeholder until then)
**And** entity cards are displayed showing each entity's name and summary data
**And** a consolidated "All Entities" summary section shows aggregate totals
**And** the initial load completes with full data in <3 seconds (NFR1)
**And** a loading.tsx skeleton in warm cream tones is displayed while data loads (NFR6)
**And** the layout is RTL-native with correct Hebrew alignment

---

#### Story 2.2: KPI Cards with Status Indicators

As the owner,
I want to see KPI cards showing Revenue YTD, Cash position, Outstanding invoices, and Loan balances — per entity and consolidated — with color-coded status indicators,
So that I can spot what needs attention at a glance.

**Acceptance Criteria:**

**Given** the dashboard is loaded
**When** the owner views the KPI section
**Then** four KPI cards are displayed: Revenue YTD, Cash position, Outstanding invoices, Loan balances
**And** each KPI shows per-entity values and a consolidated total across all entities
**And** monetary values are displayed using formatILS() (formatted from integer agorot)
**And** each KPI card includes a status indicator: green (healthy), amber (attention needed, 7-day threshold), red (overdue/immediate)
**And** status indicators include text labels or icons in addition to color — never color alone (NFR30)
**And** KPIs that have no data yet (before domain modules ship) display ₪0 with a neutral state gracefully
**And** financial numbers use IBM Plex Mono font

---

#### Story 2.3: Entity Drill-Down from Master View

As the owner,
I want to click on any entity to drill down from the consolidated master view into that entity's detailed financial breakdown,
So that I can examine each business individually when needed.

**Acceptance Criteria:**

**Given** the owner is on the consolidated dashboard
**When** they click on an entity card or entity name
**Then** the view drills down to show that entity's individual KPIs, data, and details
**And** the drill-down follows progressive disclosure: summary totals shown first, detailed breakdown on demand
**And** navigation depth is maximum 2 levels (master → entity detail)
**And** a breadcrumb or back action allows returning to the consolidated view
**And** page-to-page navigation completes in <1 second (NFR2)
**And** keyboard navigation reaches all interactive elements with correct RTL tab order (NFR27)
**And** focus indicators are visible on all interactive elements (NFR29)

---

#### Story 2.4: Sparkline Charts & Visual Trends

As the owner,
I want to see sparkline charts and month-over-month comparisons on my KPI cards,
So that I can spot trends without opening a separate analytics view.

**Acceptance Criteria:**

**Given** the dashboard KPI cards are displayed
**When** sufficient historical data exists (2+ months)
**Then** each KPI card displays an inline sparkline chart showing the trend over recent months
**And** month-over-month comparison values are shown (e.g., +12% or -₪5,000 vs last month)
**And** sparklines render correctly in RTL layout
**And** when insufficient data exists, the sparkline area shows a subtle "not enough data" state instead of an empty gap
**And** color contrast meets 4.5:1 minimum ratio (NFR28)

---

#### Story 2.5: Dashboard Auto-Refresh After Mutations

As the owner,
I want the dashboard KPIs to automatically refresh whenever I save data in any module,
So that the numbers I see are always current without manually refreshing the page.

**Acceptance Criteria:**

**Given** the owner has the dashboard open and makes a data mutation in any module (consulting, expenses, loans)
**When** the mutation is saved successfully
**Then** the dashboard KPIs are automatically refreshed with updated values
**And** the refresh is immediate after save (not real-time push / polling)
**And** the refresh uses the revalidatePath pattern to re-fetch affected dashboard data
**And** the refresh is seamless — no full page reload, no layout shift
**And** if the owner is on a different module page, the dashboard data is refreshed when they navigate back

---

### Epic 3: Shefa AI Assistant

#### Story 3.1: Shefa Conversation Panel UI

As the owner,
I want to open and collapse an AI conversation panel from any screen by clicking the Shefa puppy icon in the bottom-left corner,
So that I can chat with Shefa whenever I need help without leaving my current context.

**Acceptance Criteria:**

**Given** the owner is on any page in the application
**When** they click the Shefa icon in the bottom-left corner
**Then** a conversation panel expands upward as a floating overlay
**And** the panel does not obscure the full page — it overlays from the bottom-left
**And** clicking the icon again (or a close button) collapses the panel
**And** the panel maintains conversation history within the session
**And** the panel is accessible via keyboard with correct RTL tab order (NFR27)
**And** focus indicators are visible on all interactive elements in the panel (NFR29)
**And** the panel renders correctly in RTL layout with Hebrew text

---

#### Story 3.2: Shefa Visual Character & Micro-Expressions

As the owner,
I want Shefa to appear as a puppy with golden eyes whose expressions change based on context — happy, thinking, concerned, serious, celebrating —
So that the AI feels like a living companion, not a cold chatbot.

**Acceptance Criteria:**

**Given** the Shefa panel or avatar is visible
**When** the context changes (daily check-in, financial analysis, alert, success)
**Then** Shefa's visual representation displays the appropriate micro-expression:
- **Happy**: default state, daily check-ins, good news
- **Thinking**: processing a query, loading response
- **Concerned**: attention-needed items, amber alerts
- **Serious**: financial analysis, overdue items, red alerts
- **Celebrating**: milestones achieved, positive trends
**And** the Shefa avatar is rendered using the ShefaAvatar component
**And** expression transitions are smooth (not jarring swaps)
**And** the avatar is visible in both the collapsed icon and expanded panel states

---

#### Story 3.3: AI Morning Summary on Dashboard

As the owner,
I want Shefa to generate a personalized morning summary displayed at the top of my dashboard,
So that I get an intelligent briefing highlighting what matters most today.

**Acceptance Criteria:**

**Given** the owner opens the dashboard
**When** the page loads
**Then** Shefa's morning summary is displayed at the top of the dashboard in the reserved slot
**And** the summary highlights: key financial observations, items needing attention, upcoming deadlines
**And** Shefa's personality tone is playful for routine check-ins (FR44)
**And** the summary is generated server-side — no API keys exposed in client bundles (NFR12)
**And** the Shefa avatar appears first with a thinking expression, then the summary fades in
**And** the summary adapts based on available data (entity-only before domain modules, richer after)
**And** AI response returns in <5 seconds (NFR3)

---

#### Story 3.4: Natural Language Financial Queries

As the owner,
I want to ask Shefa natural language questions about my financial data and receive answers that link back to the source data,
So that I can get quick answers without navigating through multiple screens.

**Acceptance Criteria:**

**Given** the owner has the Shefa panel open
**When** they type a question like "What are my outstanding invoices?" or "How much do I owe on loans?"
**Then** Shefa responds with a clear answer sourced from actual financial data
**And** the response includes links to the relevant source records (e.g., "See Invoice #1234")
**And** Shefa displays a confidence tier on the response: High, Medium, or Low (FR42)
**And** Shefa provides explainable reasoning, citing specific data points (FR43) — e.g., "Based on 3 outstanding invoices from Client X totaling ₪45,000"
**And** Shefa's tone adapts to context: serious for financial analysis, playful for casual questions (FR44)
**And** queries that cannot be answered are handled gracefully with a clear Hebrew message
**And** responses return in <5 seconds (NFR3)
**And** all data is fetched server-side (NFR12)

---

#### Story 3.5: Proactive Nudges

As the owner,
I want Shefa to proactively alert me about billing deadlines, loan reminders, and financial observations — up to 3 times per day —
So that I never miss something important without being overwhelmed by notifications.

**Acceptance Criteria:**

**Given** the owner is using the application
**When** Shefa detects an actionable insight (upcoming billing milestone, overdue payment, unusual pattern)
**Then** a nudge is displayed in the Shefa panel or as a subtle indicator on the Shefa icon
**And** nudges are limited to a maximum of 3 per day (FR41)
**And** each nudge displays a confidence tier: High, Medium, or Low (FR42)
**And** each nudge includes explainable reasoning citing specific data points (FR43)
**And** Shefa's expression changes to match the nudge context (concerned for overdue, happy for positive)
**And** nudges cover: billing alerts, loan payment reminders, and financial observations
**And** no toast notifications are used — nudges appear within the Shefa system, not as popups

---

#### Story 3.6: User Feedback on Shefa Suggestions

As the owner,
I want to confirm or correct Shefa's suggestions,
So that Shefa can learn and improve the quality of future recommendations.

**Acceptance Criteria:**

**Given** Shefa displays a suggestion, recommendation, or nudge
**When** the owner interacts with it
**Then** confirm (thumbs up / "correct") and correct (thumbs down / "not quite") actions are available
**And** feedback is stored with the suggestion record for future calibration
**And** Shefa acknowledges the feedback with an appropriate response and expression (celebrating if confirmed, thoughtful if corrected)
**And** feedback submission confirms in <2 seconds (NFR4)
**And** the feedback mechanism is accessible via keyboard (NFR27)

---

### Epic 4: Data Migration (Excel Import)

#### Story 4.1: Excel Upload & File Handling

As the owner,
I want to upload an Excel (.xlsx) file containing my existing financial data,
So that I can migrate my records into the system without manual re-entry.

**Acceptance Criteria:**

**Given** the owner navigates to the Migration module
**When** they select an .xlsx file via a file upload component
**Then** the file is accepted and uploaded to the server for processing
**And** only .xlsx files are accepted — other formats show a clear Hebrew error message
**And** files up to 10MB are supported
**And** a progress indicator is shown during upload
**And** the original Excel file is stored as a frozen, immutable snapshot in object storage (separate from PostgreSQL) (FR53, NFR20)
**And** the snapshot cannot be modified or deleted after storage
**And** the upload confirms in <2 seconds with visual feedback (NFR4)
**And** Shefa's expression changes to "thinking" during upload

---

#### Story 4.2: AI-Assisted Data Interpretation

As the owner,
I want the system to use AI to automatically identify entities, revenue, expenses, milestones, and loans in my uploaded Excel file,
So that I don't have to manually map columns and rows.

**Acceptance Criteria:**

**Given** an Excel file has been uploaded
**When** the system processes the file
**Then** AI-assisted interpretation identifies and categorizes data into: entities, revenue, expenses, milestones, and loans
**And** each interpreted record is traced back to its source sheet, row, and cell in the original Excel (FR50, NFR21)
**And** the complete interpretation processes within 60 seconds for files up to 10MB (NFR5)
**And** a progress indicator shows interpretation status with percentage or step count
**And** all processing happens server-side — no sensitive data exposed in client bundles (NFR12)
**And** all monetary values are converted to integer agorot during interpretation (NFR14)

---

#### Story 4.3: Uncertain Row Flagging

As the owner,
I want the system to flag any rows it cannot confidently interpret, rather than silently skipping or guessing,
So that I never have incorrect data imported without my knowledge.

**Acceptance Criteria:**

**Given** the AI interpretation has completed
**When** any row cannot be confidently categorized or contains ambiguous data
**Then** the row is flagged for manual review with a clear explanation of what's uncertain
**And** flagged rows are visually distinct (amber status indicator with text label)
**And** the system never silently skips or imports uncertain data (FR51)
**And** the owner can manually assign the correct category or field mapping for each flagged row
**And** the owner can dismiss a flagged row to exclude it from import
**And** a count of flagged vs. confident rows is displayed prominently

---

#### Story 4.4: Side-by-Side Verification with Progressive Disclosure

As the owner,
I want to see a side-by-side comparison of my original Excel data next to the system's interpretation, starting with summary totals and drilling into row-level detail on demand,
So that I can verify accuracy before committing.

**Acceptance Criteria:**

**Given** the interpretation (and any manual flag resolution) is complete
**When** the owner views the verification screen
**Then** summary totals are displayed first: total records per category, total monetary amounts, entity distribution
**And** the owner can expand any category to see row-level detail (progressive disclosure)
**And** each row shows the original Excel source (sheet, row, cell) alongside the interpreted values (FR50)
**And** discrepancies or transformations are highlighted
**And** the MigrationVerifier component renders a clear side-by-side layout
**And** the layout is RTL-native with correct Hebrew labels
**And** monetary values are displayed using formatILS() alongside the raw agorot values

---

#### Story 4.5: Confirmation Gate & Data Commitment

As the owner,
I want to explicitly confirm that the migration matches my records before data is permanently committed,
So that I have full control and nothing is imported without my approval.

**Acceptance Criteria:**

**Given** the owner has reviewed the side-by-side verification
**When** they click the "I verify this matches" confirmation button
**Then** all verified data is committed to the database in a single transaction (NFR17)
**And** committed data is sealed — it becomes part of the live financial data
**And** the confirmation action is prominent and requires deliberate intent (not easily clicked by accident)
**And** after commitment, the migration status changes to "verified and sealed"
**And** Shefa celebrates the successful migration with a celebrating expression
**And** audit trail entries are created for all imported records (NFR16)
**And** the dashboard KPIs refresh to reflect newly imported data

---

#### Story 4.6: Re-Import Before Verification

As the owner,
I want to upload a corrected Excel file and re-run the import before I've confirmed verification,
So that I can fix mistakes in my source data without being locked into a bad import.

**Acceptance Criteria:**

**Given** the owner has uploaded and interpreted an Excel file but has NOT yet clicked "I verify this matches"
**When** they choose to re-import
**Then** they can upload a new .xlsx file which replaces the previous interpretation
**And** the previous interpretation data is discarded
**And** the new file goes through the full AI interpretation and verification flow again
**And** the previous frozen snapshot is replaced with the new file's snapshot
**And** after the owner has clicked "I verify this matches" (Story 4.5), the re-import option is no longer available — data is sealed (FR55)
**And** a clear Hebrew message explains that re-import is only available before verification

---

### Epic 5: Consulting & Billing Module

#### Story 5.1: Client Management

As the owner,
I want to create, view, edit, and soft-delete client records,
So that I can organize my consulting work by client.

**Acceptance Criteria:**

**Given** the owner navigates to the Consulting module
**When** they interact with the client management section
**Then** they can view a list of all active clients (soft-deleted clients are hidden by default)
**And** they can create a new client record with name, contact details, and entity association
**And** they can edit any client's details via a form (react-hook-form + Zod validation)
**And** they can soft-delete a client (deleted_at timestamp set, record preserved) (NFR15)
**And** the clients table is created with CUID primary keys, timestamps, and soft delete columns
**And** all mutations use server actions: auth check → Zod validate → ActionResult<T>
**And** mutations are wrapped with audit logging via withAudit() (NFR16)
**And** mutations confirm in <2 seconds with visual feedback (NFR4)

---

#### Story 5.2: Project & Milestone Tracking

As the owner,
I want to create projects per client with milestone tracking,
So that I can manage deliverables and know exactly where each engagement stands.

**Acceptance Criteria:**

**Given** a client exists
**When** the owner creates a project for that client
**Then** the project is associated with the client and entity
**And** the owner can add milestones to the project with: title, description, amount (in agorot, NFR14), and expected delivery date
**And** each milestone is initialized with status "pending"
**And** the projects and milestones tables are created with proper schema (CUID, timestamps, soft delete, foreign keys)
**And** the owner can edit project details and milestone details
**And** the owner can soft-delete projects and milestones (NFR15)
**And** all monetary values are stored as integer agorot (NFR14)

---

#### Story 5.3: Milestone Status Workflow

As the owner,
I want to advance milestones through a workflow — pending → deliverable confirmed → billable → invoiced → paid —
So that I can track exactly where each deliverable is in the billing lifecycle.

**Acceptance Criteria:**

**Given** a milestone exists on a project
**When** the owner updates its status
**Then** the milestone progresses through the workflow: pending → deliverable confirmed → billable → invoiced → paid
**And** status can only move forward in the workflow (no skipping steps, no going backward)
**And** each status transition is logged in the audit trail with previous and new status (NFR16)
**And** the owner can set a revenue recognition date on the milestone, tracked separately from the billing date (FR28)
**And** database transactions are used for status transitions to prevent partial writes (NFR17)

---

#### Story 5.4: Invoice Tracking on Milestones

As the owner,
I want to enter invoice numbers and billing dates on milestones when they reach the invoiced stage,
So that I can match system records to real invoices sent to clients.

**Acceptance Criteria:**

**Given** a milestone has reached "billable" or "invoiced" status
**When** the owner enters invoice details
**Then** they can set an invoice number and billing date on the milestone
**And** the invoice number is stored as a text field (free-form to match any numbering system)
**And** the billing date is stored and displayed separately from the revenue recognition date
**And** invoiced milestones display the invoice number prominently in all views
**And** editing invoice details is audit-logged (NFR16)

---

#### Story 5.5: Milestone Status Views

As the owner,
I want to view milestones filtered by status — green for billable/paid, amber for pending, red for overdue —
So that I can quickly focus on what needs action.

**Acceptance Criteria:**

**Given** milestones exist across multiple clients and projects
**When** the owner views the milestone status view
**Then** milestones are displayed with status indicators: green (billable/ready, paid), amber (pending, deliverable confirmed), red (overdue — past expected date and not yet invoiced/paid)
**And** status indicators include text labels or icons in addition to color (NFR30)
**And** the owner can filter milestones by status category (green/amber/red)
**And** overdue is defined as: expected delivery date passed and status is still pending or deliverable confirmed (7-day amber threshold per Status Semantics)
**And** the DataTable component is used with sortable columns and RTL-native layout
**And** keyboard navigation works correctly with RTL tab order (NFR27)

---

#### Story 5.6: Monthly Billing Summary & Client History

As the owner,
I want to view a monthly billing summary with totals and payment status, and drill into per-client project and billing history,
So that I can track revenue flow and know exactly what's been billed and paid.

**Acceptance Criteria:**

**Given** milestones with billing data exist
**When** the owner navigates to the billing summary view
**Then** a monthly summary is displayed showing: total billed, total paid, total outstanding — per month
**And** monetary values are formatted using formatILS() from integer agorot
**And** the owner can drill down into any month to see individual milestones
**And** a per-client history view shows all projects and milestones for a selected client (FR23)
**And** the history includes: milestone status, invoice number, billing date, payment status, amounts
**And** progressive disclosure: summary totals first, row-level detail on demand

---

#### Story 5.7: Proactive Billing Alerts

As the owner,
I want the system to proactively alert me about upcoming billing milestones and overdue payments,
So that I never miss a billing opportunity or let a payment slip.

**Acceptance Criteria:**

**Given** milestones exist with expected dates and status data
**When** a milestone's expected date is approaching (within 7 days) or has passed without advancing to invoiced/paid
**Then** the system generates a proactive alert visible on the dashboard and in the Shefa nudge system (FR24)
**And** upcoming milestones (within 7 days) show amber status
**And** overdue milestones (past expected date, not invoiced/paid) show red status
**And** alerts include: client name, project name, milestone title, amount, and days until/past due
**And** alerts feed into the dashboard KPI for "Outstanding invoices"
**And** alerts are available to Shefa for proactive nudges (integrated with Epic 3)
**And** manual data entry forms are available for all consulting data types (FR54)

---

### Epic 6: Expenses & Tax Module

#### Story 6.1: Expense Management

As the owner,
I want to create, view, edit, and soft-delete expense records per entity,
So that I can track what each business entity is spending.

**Acceptance Criteria:**

**Given** the owner navigates to the Expenses module
**When** they interact with expense records
**Then** they can view a list of all expenses filtered by entity (with option to see all entities)
**And** they can create a new expense with: description, amount (input in ILS, stored as integer agorot), date, entity association
**And** they can edit any expense record via a form (react-hook-form + Zod validation)
**And** they can soft-delete expense records (deleted_at timestamp, NFR15)
**And** the expenses table is created with CUID primary keys, timestamps, soft delete, and entity foreign key
**And** all monetary values are stored as integer agorot — zero floating-point (NFR14)
**And** all mutations use server actions: auth check → Zod validate → ActionResult<T>
**And** mutations are wrapped with audit logging via withAudit() (NFR16)
**And** mutations confirm in <2 seconds with visual feedback (NFR4)
**And** manual data entry forms are fully functional for expense records (FR54)

---

#### Story 6.2: VAT Rate Assignment & Computation

As the owner,
I want to assign a VAT rate to each expense and revenue record and have the system automatically compute the VAT amount,
So that I always know the exact VAT owed without manual calculation.

**Acceptance Criteria:**

**Given** an expense record exists (or a revenue milestone from Epic 5)
**When** the owner assigns a VAT rate
**Then** the VAT rate is stored on the record (as basis points for integer precision)
**And** the system computes the VAT amount using calculateVat(baseAgorot, vatRateBp) from the money utility library
**And** the computation uses integer arithmetic — zero floating-point operations (NFR14)
**And** the computed VAT amount is stored alongside the base amount
**And** both base amount and VAT amount are displayed using formatILS()
**And** the total (base + VAT) is displayed clearly
**And** VAT rate changes trigger recalculation and audit logging (NFR16)
**And** database transactions ensure base and VAT amounts update atomically (NFR17)

---

#### Story 6.3: Tax Category Assignment

As the owner,
I want to assign a tax category to each revenue and expense record from a predefined list that I can configure,
So that my data is properly categorized for tax reporting.

**Acceptance Criteria:**

**Given** tax categories are seeded in the database (from Epic 1 seed data)
**When** the owner creates or edits a revenue or expense record
**Then** they can select a tax category from the predefined list
**And** the owner can navigate to settings to add, edit, or rename tax categories
**And** the owner cannot delete a tax category that is in use by existing records
**And** each record stores its tax category association
**And** tax category changes are audit-logged (NFR16)
**And** the category selector renders correctly in RTL with Hebrew labels

---

#### Story 6.4: Revenue & Expense Export for Accountant

As the owner,
I want to export my revenue and expense data with VAT amounts, tax categories, and entity attribution as CSV or Excel,
So that I can hand clean data to my accountant without reformatting.

**Acceptance Criteria:**

**Given** revenue and expense records exist with VAT and tax category data
**When** the owner clicks the export action
**Then** they can choose between CSV and Excel (.xlsx) format
**And** the export includes: date, description, entity name, base amount (ILS), VAT rate, VAT amount (ILS), total (ILS), tax category
**And** monetary values are exported as ILS decimal values (converted from agorot for human readability)
**And** the export can be filtered by: entity, date range, tax category
**And** the exported file downloads with a descriptive filename including date range and entity
**And** column headers are in Hebrew
**And** the export processes server-side — no sensitive data exposed in the client (NFR12)

---

#### Story 6.5: Expense Status Indicators & Dashboard Integration

As the owner,
I want my expenses to feed into the dashboard with status indicators showing what needs attention,
So that the consolidated view always reflects my current expense position.

**Acceptance Criteria:**

**Given** expense records exist across entities
**When** the dashboard loads
**Then** expense data contributes to the Cash position KPI (reducing available cash)
**And** expenses without tax categories assigned show amber status (attention needed)
**And** expenses without VAT rates assigned show amber status
**And** status indicators include text labels in addition to color (NFR30)
**And** expense summary data is available to Shefa for queries and morning summary
**And** the dashboard auto-refreshes when expenses are created, edited, or deleted (via revalidatePath)

---

### Epic 7: Loans & Debt Management

#### Story 7.1: Borrower Loan Management

As the owner,
I want to create, edit, and soft-delete loans where my entities are the borrower — bank loans and credit lines — with rate, balance, and payment schedule,
So that I can track exactly what each entity owes.

**Acceptance Criteria:**

**Given** the owner navigates to the Loans module
**When** they create a borrower loan
**Then** they can enter: lender name (bank/institution), entity (borrower), loan type (bank loan/credit line), principal amount, interest rate, start date, term length, payment frequency, payment amount
**And** all monetary values are stored as integer agorot (NFR14)
**And** the loans table is created with CUID primary keys, timestamps, soft delete, entity foreign key, loan_type enum (borrower/lender)
**And** the owner can edit loan details and soft-delete loans (NFR15)
**And** all mutations use server actions: auth check → Zod validate → ActionResult<T>
**And** mutations are wrapped with audit logging via withAudit() (NFR16)
**And** mutations confirm in <2 seconds with visual feedback (NFR4)
**And** manual data entry forms are fully functional for loan records (FR54)

---

#### Story 7.2: Lender Loan Management (Inter-Entity)

As the owner,
I want to create, edit, and soft-delete loans where my entities are the lender — owner loans between entities — with balances and terms,
So that I can track capital flowing between my businesses.

**Acceptance Criteria:**

**Given** the Loans module and borrower loans from Story 7.1 exist
**When** the owner creates a lender loan
**Then** they can enter: borrower entity, lender entity, amount, interest rate (if any), terms, start date
**And** both the lending and borrowing entities must exist in the system
**And** the loan is visible from both entities' perspectives (as asset for lender, liability for borrower)
**And** inter-entity transactions are tracked with clear directionality (FR8)
**And** the owner can edit and soft-delete lender loans (NFR15)
**And** database transactions ensure both sides of the inter-entity record are consistent (NFR17)
**And** all mutations are audit-logged (NFR16)

---

#### Story 7.3: Consolidated Loan View

As the owner,
I want to view all loans across all entities in a single consolidated view,
So that I can see my complete debt and lending position at a glance.

**Acceptance Criteria:**

**Given** borrower and lender loans exist across multiple entities
**When** the owner navigates to the consolidated loan view
**Then** all active loans are displayed in a DataTable with: entity, loan type (borrower/lender), counterparty, outstanding balance, interest rate, next payment date
**And** the view can be filtered by entity, loan type, or status
**And** a summary section shows: total debt (all borrower loans), total lent (all lender loans), net position
**And** monetary values are formatted using formatILS() from integer agorot
**And** financial numbers use IBM Plex Mono font
**And** the table is sortable by any column with correct RTL layout
**And** keyboard navigation works with RTL tab order (NFR27)

---

#### Story 7.4: Payment Recording & Balance Updates

As the owner,
I want to record loan payments — marking them as made and updating the remaining balance —
So that my loan balances always reflect reality.

**Acceptance Criteria:**

**Given** a loan exists with an outstanding balance
**When** the owner records a payment
**Then** they can enter: payment date, payment amount (in ILS, stored as agorot), and optional notes
**And** the loan's remaining balance is recalculated using integer arithmetic (NFR14)
**And** the payment is stored in a loan_payments table with CUID, timestamps, loan foreign key
**And** the balance update and payment record are saved in a single database transaction (NFR17)
**And** the payment is audit-logged with previous and new balance (NFR16)
**And** the loan's status updates if fully repaid (balance reaches zero)
**And** mutations confirm in <2 seconds with visual feedback (NFR4)

---

#### Story 7.5: Repayment Schedule & Payment Timeline

As the owner,
I want to view a consolidated repayment schedule and a chronological payment timeline across all loans,
So that I can plan cash flow and see the full history of payments.

**Acceptance Criteria:**

**Given** loans exist with payment schedules and recorded payments
**When** the owner views the repayment schedule
**Then** upcoming payments are displayed chronologically across all loans and entities (FR33)
**And** each entry shows: date, loan name, entity, amount due, counterparty
**And** the payment timeline shows a chronological history of all payment events (FR35)
**And** past payments show: date, loan, entity, amount paid, remaining balance after payment
**And** the owner can view payment history and upcoming dates per individual loan (FR38)
**And** the schedule highlights payments due within 7 days (amber) and overdue payments (red)
**And** status indicators include text labels in addition to color (NFR30)
**And** monetary values are formatted using formatILS()

---

#### Story 7.6: Payment Collision Detection

As the owner,
I want the system to detect and alert me when multiple loan payments from the same entity fall within a 3-day window,
So that I can plan cash flow and avoid liquidity crunches.

**Acceptance Criteria:**

**Given** multiple loans exist for the same entity with upcoming payments
**When** two or more payments from the same entity fall within a 3-day window
**Then** the system flags the collision with a red status indicator and clear description
**And** the alert shows: entity name, the conflicting payments (loan names, amounts, dates), and total amount due in the window
**And** the collision alert is visible in the repayment schedule view and on the dashboard
**And** the alert is available to Shefa for proactive nudges (integrated with Epic 3)
**And** collisions are recalculated whenever payments are recorded or loan schedules change

---

#### Story 7.7: High-Rate Loan Optimization & Dashboard Integration

As the owner,
I want the system to flag high-rate loans and suggest optimization opportunities, and feed all loan data into the dashboard KPIs,
So that I can minimize interest costs and see my full debt position on the morning briefing.

**Acceptance Criteria:**

**Given** loans exist with varying interest rates
**When** the system analyzes the loan portfolio
**Then** loans with rates significantly above average are flagged with an amber/red indicator
**And** optimization suggestions are provided via Shefa with a confidence tier (High/Medium/Low) (FR37, FR42)
**And** suggestions include explainable reasoning citing specific data — e.g., "Loan X at 8.5% is 3% above your average. Refinancing could save ₪12,000/year" (FR43)
**And** loan data feeds into the dashboard: Loan balances KPI, upcoming payment alerts
**And** the dashboard auto-refreshes when loans are created, edited, or payments recorded (via revalidatePath)
**And** loan summary data is available to Shefa for queries and morning summary

---

### Epic 8: Settings & Module Marketplace

#### Story 8.1: Custom Alert Rules

As the owner,
I want to define custom alert rules with conditions that trigger proactive notifications,
So that I get alerted about exactly the things that matter to me — beyond the system defaults.

**Acceptance Criteria:**

**Given** the owner navigates to Settings
**When** they create a custom alert rule
**Then** they can define: a name, a condition type (e.g., "balance below threshold", "payment due within N days", "expense exceeds amount"), a target entity (or all), and a threshold value
**And** the alert_rules table is created with CUID, timestamps, soft delete, and condition fields
**And** the owner can view, edit, and soft-delete their custom rules (NFR15)
**And** active rules are evaluated when relevant data changes and trigger alerts in the Shefa nudge system
**And** custom alerts respect the max 3 nudges/day limit (shared with system nudges from Epic 3)
**And** all mutations are audit-logged (NFR16)
**And** mutations confirm in <2 seconds with visual feedback (NFR4)
**And** forms render correctly in RTL with Hebrew labels

---

#### Story 8.2: Module Marketplace Page

As the owner,
I want to see a marketplace page showing which modules are installed and active, and which are coming soon,
So that I know what my system can do today and what's on the horizon.

**Acceptance Criteria:**

**Given** the owner navigates to the Marketplace section via the sidebar
**When** the page loads
**Then** all modules are displayed as cards with: module name, description, and status
**And** status values are: "active" (installed and working), "coming soon" (planned, not yet available)
**And** active modules show a green status badge; coming soon modules show a neutral/amber badge
**And** status badges include text labels in addition to color (NFR30)
**And** the current active modules reflect what's actually deployed (Platform, Dashboard, Shefa, Migration, etc.)
**And** the page is informational — no install/uninstall actions needed for a single-owner app
**And** the layout is RTL-native with Hebrew module names and descriptions
**And** page loads in <1 second (NFR2)

---

#### Story 8.3: Settings Navigation & Entity Configuration Hub

As the owner,
I want a settings area that brings together entity management, tax category configuration, custom alerts, and security settings (2FA) in one place,
So that I have a single destination for all configuration needs.

**Acceptance Criteria:**

**Given** the owner clicks the settings icon in the sidebar
**When** the settings page loads
**Then** sections are displayed for: Entity Management (links to Epic 1 entity UI), Tax Categories (links to Epic 6 category management), Custom Alerts (Story 8.1), Security (2FA settings from Epic 1)
**And** each section shows a summary of current configuration (e.g., "3 entities", "12 tax categories", "2 alert rules", "2FA enabled")
**And** clicking a section navigates to the relevant management view
**And** navigation follows the maximum 2-level depth rule (settings → section detail)
**And** the layout is RTL-native with correct Hebrew labels
**And** keyboard navigation reaches all sections with correct RTL tab order (NFR27)

---

## Story Summary

| Epic | Title | Stories |
|------|-------|---------|
| 1 | Platform Foundation & Entity Management | 8 |
| 2 | Financial Dashboard & Morning Briefing | 5 |
| 3 | Shefa AI Assistant | 6 |
| 4 | Data Migration (Excel Import) | 6 |
| 5 | Consulting & Billing Module | 7 |
| 6 | Expenses & Tax Module | 5 |
| 7 | Loans & Debt Management | 7 |
| 8 | Settings & Module Marketplace | 3 |
| **Total** | | **47 stories** |

**FR Coverage: 59/59 — zero gaps.**
