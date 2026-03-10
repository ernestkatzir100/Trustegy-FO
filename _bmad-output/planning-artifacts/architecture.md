---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-09'
inputDocuments:
  - prd.md
  - product-brief-Trustegy-FO-2026-03-09.md
  - ux-design-specification.md
workflowType: 'architecture'
project_name: 'Trustegy-FO'
user_name: 'Ernest'
date: '2026-03-09'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

59 functional requirements organized into 8 domains:

| Domain | FRs | Architectural Implication |
|---|---|---|
| Authentication & Access | FR1-4 | OAuth (Google/Microsoft) + TOTP 2FA. Owner-only — no RBAC complexity for Phase 0/0.5. Session management with 24h inactivity expiry. |
| Entity & Data Model | FR5-9 | Hierarchical entity model (3 pre-seeded entities). Inter-entity transactions. Integer agorot storage. This is the foundational data schema driving everything else. |
| Consolidated Dashboard | FR10-16 | Zero-click morning briefing. 4 defined KPI formulas. Sparkline charts. Auto-refresh after mutations (not real-time push). Server-rendered with minimal client JS. |
| Consulting Operations | FR17-24 | Client → Project → Milestone hierarchy. 5-stage billing workflow state machine (pending → confirmed → billable → invoiced → paid). Proactive alerts. Phase 0.5. |
| Expense & Tax Management | FR25-29 | VAT computation per Calculation Policy (integer math). Tax categories (user-configurable list). Revenue recognition dates. CSV/Excel export. Phase 0.5. |
| Loans & Debt Management | FR30-38 | Borrower + lender sides. Consolidated repayment schedule. Payment timeline. 3-day collision detection. Optimization flags via Shefa AI. Phase 0.5. |
| Shefa AI Companion | FR39-46 | Collapsible chat panel on every screen. Claude API integration. Source-linked answers. Max 3 nudges/day. Confidence tiers. Adaptive personality. Visual character with micro-expressions. |
| Data Migration | FR47-55 | AI-assisted Excel interpretation. Side-by-side verification with progressive disclosure. Row-level source traceability. Frozen snapshot in object storage. Explicit verification gate. |
| System-Wide | FR56-59 | Custom alert rules. Module marketplace shell. RTL-native rendering. Audit trail on all mutations. |

**Non-Functional Requirements:**

30 NFRs across 5 categories:

| Category | NFRs | Key Constraints |
|---|---|---|
| Performance | NFR1-6 | Dashboard <3s, navigation <1s, AI response <5s, mutations <2s, migration <60s. Accuracy over speed. Graceful degradation. |
| Security | NFR7-13 | TLS 1.2+, encryption at rest, httpOnly cookies, server-side data fetching by default, auth verification on all routes. |
| Data Integrity | NFR14-21 | Integer agorot math (zero FP), soft deletes only, audit trail, DB transactions for multi-step ops, daily backups (30-day retention), frozen Excel in separate object storage, source traceability. |
| Reliability | NFR22-26 | No uptime SLA needed. Auto-restart. Health check. Graceful error states. Data loss is the only unacceptable failure. |
| Accessibility | NFR27-30 | Keyboard nav with RTL tab order, 4.5:1 contrast minimum, visible focus indicators, status not conveyed by color alone. WCAG 2.1 AA target. |

**Scale & Complexity:**

- Primary domain: Full-stack web application (fintech — family office + business operations)
- Complexity level: **High**
- Estimated architectural components: ~12 major (auth, entity model, dashboard, consulting, expenses, loans, AI companion, migration, audit, module shell, design system, export)

### Technical Constraints & Dependencies

**Stack (declared in PRD):**
- Next.js 15 App Router — server-first rendering (RSC + SSR)
- PostgreSQL — single database, Railway-managed
- Railway — deployment platform (staging + production)
- Claude API — AI companion backend
- Object storage — frozen Excel snapshots (Railway volume or S3-compatible)

**Data Architecture:**
- `{ data, error }` response convention — errors as values, no thrown exceptions
- CUID primary keys — collision-resistant, URL-safe, sortable
- Soft deletes (`deletedAt`) — all financial entities
- Timestamps: `createdAt`, `updatedAt`, `deletedAt` on all records
- Integer agorot — all money as integers, display formatting at presentation layer only
- Basis points — rates stored as integers (1% = 100bp)

**UX Constraints (from UX Spec):**
- Desktop-only — 1280px+ minimum, no responsive/mobile
- Hebrew-only RTL — logical CSS properties, bidirectional text handling
- Tailwind CSS + shadcn/ui (Radix) — design system foundation
- 6 custom components required: KPICard, StatusBadge, ShefaAvatar, ShefaChat, DataTable, MigrationVerifier
- Typography: Heebo (Hebrew) + IBM Plex Mono (numbers)
- Color system: warm cream (#FAF8F5) base, gold (#C4954A) accent, 3-tier status (green/amber/red)
- Dark sidebar navigation (56px collapsed, expand on hover)
- Floating Shefa chat panel (bottom-left corner, expands upward)

**Simplifying Constraints (what we DON'T need):**
- No real-time push (WebSocket/SSE) — data refreshes on navigation and mutations
- No offline / service workers / PWA
- No mobile / responsive breakpoints
- No multi-tenant / team RBAC (owner-only)
- No SEO (private authenticated app)
- No CI/CD pipeline requirement specified
- No external integrations (Phase 0/0.5 is self-contained)
- No dark mode (Phase 2)
- No multi-currency (ILS only)

### Cross-Cutting Concerns Identified

| Concern | Impact | Spans |
|---|---|---|
| **Integer agorot math** | Every monetary value — storage, calculation, aggregation, display, import, export. Zero floating-point tolerance. | All modules, data layer, presentation layer, migration |
| **Soft deletes + audit trail** | Every financial entity mutation must be soft-deleted and audit-logged. DB transactions for multi-step operations. | All modules, data layer |
| **RTL/Hebrew** | Every UI component must be RTL-native (logical properties). Bidirectional text for mixed Hebrew/English. All strings externalized. | All UI components, layout, navigation |
| **Authentication** | Every route and server action must verify owner authentication before processing. | All routes, all server actions |
| **{ data, error } convention** | Consistent error handling pattern across all data operations. No thrown exceptions in data layer. | All API routes, server actions, data layer |
| **Status semantics** | Green/amber/red system with defined thresholds. Applied consistently across dashboard KPIs, milestones, loans, and alerts. | Dashboard, consulting, loans, nudges |
| **Shefa AI panel** | Accessible from every screen. Contextually aware. Must not cause layout shift when opened/closed. | All layouts, shared layout wrapper |
| **String externalization** | All UI text externalized from day one for future i18n — even though only Hebrew ships initially. | All UI components |
| **Design system** | Tailwind + shadcn/ui + 6 custom components. Consistent spacing (4px base), typography, and color application. | All UI |

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (Next.js 15 App Router) based on PRD technical architecture decisions and UX specification requirements.

### Starter Options Considered

| Option | What It Includes | Verdict |
|---|---|---|
| **T3 Stack** (create-t3-app v7.40) | Next.js 15, TypeScript, Tailwind, tRPC, Prisma, NextAuth | Rejected — tRPC adds unnecessary API client layer for a server-first RSC architecture using `{ data, error }` server actions |
| **Nextkick** (community) | Next.js 15, Auth.js, shadcn/ui, Prisma | Rejected — community template with less established maintenance; Prisma's code generation adds friction |
| **create-next-app + Composable Layers** | Official Next.js 15 + hand-picked best-in-class tools | **Selected** — maximum control, no unnecessary abstractions, each tool purpose-matched |

### Selected Starter: create-next-app + Composable Architecture

**Rationale for Selection:**

The project's server-first architecture (RSC + server actions), `{ data, error }` convention, and integer agorot math requirements demand SQL-level control and minimal abstraction. An opinionated meta-framework like T3 adds layers (tRPC) that conflict with the architectural direction. A composable approach lets each tool serve exactly one purpose without overlap.

**Initialization Command:**

```bash
pnpm create next-app@latest trustegy-fo --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-pnpm
```

**Post-Initialization Setup:**

```bash
# shadcn/ui — design system foundation
pnpm dlx shadcn@latest init

# Drizzle ORM — type-safe SQL for PostgreSQL
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg

# Auth.js v5 — OAuth + 2FA
pnpm add next-auth@beta @auth/drizzle-adapter

# i18n — string externalization from day one
pnpm add next-intl

# Utility libraries
pnpm add cuid2         # CUID primary key generation
pnpm add zod           # Schema validation (forms, API inputs)
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript (strict mode) — type safety across the entire stack
- Node.js 20.9+ runtime (minimum for Next.js 15)
- pnpm package manager — fast, disk-efficient, strict dependency resolution

**Styling Solution:**
- Tailwind CSS — utility-first, configured by create-next-app
- shadcn/ui — Radix primitives with Tailwind styling, added post-init
- CSS logical properties for RTL-native layout (`margin-inline-start`, not `margin-left`)

**Build Tooling:**
- Turbopack — Next.js 15 dev server (fast refresh, HMR)
- Next.js production build with automatic optimization
- ESLint — code quality and consistency

**ORM & Database:**
- Drizzle ORM — TypeScript-first schema definition, SQL-level query control
- PostgreSQL via `pg` driver (node-postgres)
- Drizzle Kit for migrations (`drizzle-kit generate` + `drizzle-kit push`)
- Schema-as-code: entity model defined in TypeScript alongside application code

**Authentication:**
- Auth.js v5 (NextAuth) — OAuth providers (Google, Microsoft)
- Drizzle adapter for session/account storage in PostgreSQL
- TOTP 2FA support
- Server-side session verification on all routes

**Internationalization:**
- next-intl — ~2KB bundle, Server Component native
- Single locale (he-IL) for Phase 0/0.5
- All UI strings externalized from day one
- RTL direction support built-in

**Code Organization:**
- `src/` directory — separates application code from config files
- App Router with route groups for modules: `/(dashboard)`, `/(consulting)`, `/(loans)`
- `@/*` import alias for clean imports
- Server Components by default, Client Components only where interactivity requires

**Development Experience:**
- Turbopack dev server with fast refresh
- TypeScript strict mode with immediate type feedback (no generation step)
- Drizzle Studio for database browsing during development
- shadcn/ui CLI for adding components incrementally (`pnpm dlx shadcn@latest add button`)

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Database session strategy (JWT vs. DB sessions)
2. Server Actions vs. API Routes — when to use which
3. Client vs. Server Component boundary rules
4. Project folder structure
5. Money utility pattern (integer agorot helpers)

**Important Decisions (Shape Architecture):**
6. Form handling approach
7. Caching strategy
8. Logging and error handling pattern
9. Environment configuration
10. Migration strategy (Drizzle Kit)

**Deferred Decisions (Post-MVP):**
- CI/CD pipeline (manual Railway deploy initially)
- Rate limiting (single user — unnecessary)
- API documentation (no external consumers)
- Scaling strategy (single user — unnecessary)
- Dark mode theming architecture (Phase 2)
- Multi-currency conversion layer (Phase 2)

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **ORM** | Drizzle ORM (decided in Step 3) | TypeScript-first, SQL-level control for integer math |
| **Validation** | Zod | Schema validation for forms, server action inputs, and API boundaries. Integrates with Drizzle (drizzle-zod) for auto-generated insert/update schemas. |
| **Migration strategy** | Drizzle Kit — `push` for dev, `generate` + `migrate` for production | Push is fast during development. Generated SQL migrations create a reviewable, auditable migration history for production. |
| **Caching** | None (server-fresh on every request) | Single user, no performance bottleneck. React `cache()` for request-level deduplication only. No Redis, no external cache. Data refreshes on navigation and mutations per PRD. |
| **Schema organization** | One file per domain — `entities.ts`, `consulting.ts`, `loans.ts`, `migration.ts`, `audit.ts` | Mirrors module boundaries. Each schema file is self-contained. Shared base columns (id, timestamps, deletedAt) via a helper. |
| **Soft delete pattern** | `deletedAt: timestamp` column + global `.where(isNull(deletedAt))` filter | All queries exclude soft-deleted records by default. Drizzle's query builder makes this composable. |
| **Audit trail** | Dedicated `audit_log` table — entity type, entity ID, action, previous value (JSON), user ID, timestamp | Triggered by a shared `withAudit()` wrapper on all mutation server actions. No audit on reads. |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| **Session strategy** | Database sessions (not JWT) | More secure for a financial app. Sessions stored in PostgreSQL via Drizzle adapter. Easy to invalidate. No token expiry complexity. |
| **Auth middleware** | Auth.js middleware in `middleware.ts` | Protects all routes except `/auth/*`. Redirects unauthenticated requests to sign-in. |
| **CSRF protection** | Built into Next.js Server Actions | Server Actions include automatic CSRF tokens. No additional library needed. |
| **Security headers** | `next.config.ts` security headers + CSP | Content-Security-Policy, X-Frame-Options, X-Content-Type-Options. Standard hardening for a financial app. |
| **Sensitive data** | Server-side only — never in client bundles | All financial data fetched in Server Components or server actions. Client components receive only display-ready data. NFR12 enforced by architecture. |
| **Environment secrets** | `.env.local` (dev), Railway environment variables (staging/prod) | DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ANTHROPIC_API_KEY, OBJECT_STORAGE_* |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| **Primary mutation pattern** | Server Actions | Type-safe, co-located with components, automatic revalidation. All data mutations go through server actions with `{ data, error }` return type. |
| **API Routes (exceptions)** | Only for: `/api/health` (health check), `/api/upload` (Excel file upload), `/api/ai/chat` (streaming Shefa responses) | API routes used only when Server Actions can't handle the use case (streaming, file upload, external webhooks). |
| **Error handling** | `{ data, error }` wrapper — `ActionResult<T>` type | Every server action returns `{ data: T, error: null }` or `{ data: null, error: { code: string, message: string } }`. No thrown exceptions. Errors are values. |
| **Data fetching** | Server Components fetch directly via Drizzle queries | No API layer between server components and database. Drizzle queries called directly in server components. Keeps the stack flat. |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **State management** | None (no library) | Server Components handle server state. Client components use React `useState` / `useReducer` for local UI state (chat messages, form state, panel open/close). No Redux, no Zustand. |
| **Form handling** | React Hook Form + Zod resolver | Type-safe forms with validation. Zod schemas shared between client validation and server action validation. |
| **Server/Client boundary** | Server Components default. `"use client"` only for: Shefa chat panel, form interactions, migration verification UI, interactive tables (sort/filter), sidebar hover expand | Minimizes client JS bundle. Financial data stays server-side. |
| **Component architecture** | shadcn/ui base + 6 custom domain components. All in `src/components/` | `ui/` for shadcn components, `custom/` for KPICard, StatusBadge, ShefaAvatar, ShefaChat, DataTable, MigrationVerifier. `layout/` for Sidebar, ShefaPanel wrapper. |
| **Dynamic imports** | `next/dynamic` for heavy client components | ShefaChat panel loaded dynamically — not needed on initial dashboard render. Reduces first-load JS. |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| **Hosting** | Railway (decided in PRD) | Two services: web app + PostgreSQL addon. Custom domain (shefa-inv). |
| **Environments** | Staging + Production | Staging for pre-deployment verification. Production for live use. Same Railway project, separate environments. |
| **Build & Deploy** | Railway auto-deploy from `main` branch | Nixpacks auto-detects Node.js + pnpm. Build runs `pnpm build`, serves with `pnpm start`. No custom CI/CD initially. |
| **Logging** | Structured JSON to stdout | Railway captures stdout/stderr. `console.log` with structured objects for production. No external logging service for Phase 0. |
| **Health check** | `/api/health` endpoint | Returns DB connection status + app version. Railway uses this for auto-restart decisions. |
| **Backups** | Railway managed PostgreSQL backups (daily, 30-day retention) | NFR18 compliance. Frozen Excel snapshots stored in Railway volume (separate from DB). |
| **Object storage** | Railway volume for Phase 0, S3-compatible for future | Frozen Excel snapshots need to survive DB failures independently (NFR20). Railway volume is sufficient for single-user, migrate to S3 if needed. |

### Project Structure

```
src/
├── app/
│   ├── (auth)/              # Sign-in, sign-out pages
│   │   └── sign-in/
│   ├── (app)/               # Authenticated app shell (shared layout: sidebar + Shefa)
│   │   ├── layout.tsx       # Sidebar + ShefaPanel wrapper
│   │   ├── (dashboard)/     # Dashboard module
│   │   ├── (consulting)/    # Consulting operations (Phase 0.5)
│   │   ├── (loans)/         # Loans & debt management (Phase 0.5)
│   │   ├── (expenses)/      # Expense & tax management (Phase 0.5)
│   │   ├── (migration)/     # Data migration ceremony
│   │   └── (marketplace)/   # Module marketplace shell
│   ├── api/                 # API routes (health, upload, AI streaming)
│   └── layout.tsx           # Root layout (html dir="rtl", fonts, providers)
├── components/
│   ├── ui/                  # shadcn/ui components (auto-added by CLI)
│   ├── custom/              # Domain components (KPICard, ShefaChat, etc.)
│   └── layout/              # Sidebar, ShefaPanel, AppShell
├── db/
│   ├── schema/              # Drizzle schema files (one per domain)
│   ├── migrations/          # Generated SQL migrations
│   ├── seed.ts              # Seed script (3 pre-seeded entities)
│   └── index.ts             # Database connection + Drizzle instance
├── lib/
│   ├── actions/             # Server actions (one file per domain)
│   ├── auth/                # Auth.js configuration
│   ├── ai/                  # Claude API integration + Shefa logic
│   ├── money.ts             # Integer agorot utilities (toAgorot, fromAgorot, formatILS)
│   ├── validations/         # Shared Zod schemas
│   └── utils.ts             # cn(), shared helpers
├── messages/                # next-intl translation files
│   └── he.json              # Hebrew UI strings
└── types/                   # Shared TypeScript types + ActionResult<T>
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (`create-next-app` + post-init setup)
2. Database schema + Drizzle connection (entities, base tables)
3. Auth.js setup (OAuth, middleware, session)
4. Root layout (RTL, fonts, sidebar shell, Shefa panel placeholder)
5. Design system (Tailwind config, shadcn/ui theme, custom components)
6. Dashboard module (KPIs, morning briefing)
7. Migration ceremony (Excel import, verification UI)
8. Shefa AI panel (Claude API, chat interface)
9. Consulting operations (Phase 0.5)
10. Loans & debt management (Phase 0.5)
11. Expense & tax management (Phase 0.5)

**Cross-Component Dependencies:**
- Auth middleware → all routes depend on it
- Database schema → all modules depend on entity model
- `money.ts` utilities → all modules that touch monetary values
- `ActionResult<T>` type → all server actions and their consumers
- Root layout (sidebar + Shefa panel) → all module pages render within it
- Translation files (`he.json`) → all UI components reference them
- Audit trail wrapper (`withAudit`) → all mutation server actions

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 28 areas where AI agents could make different choices, organized into 5 categories.

### Naming Patterns

**Database Naming Conventions:**

| Element | Convention | Examples |
|---|---|---|
| Tables | snake_case, plural | `entities`, `clients`, `milestones`, `loans`, `audit_logs` |
| Columns | snake_case | `created_at`, `deleted_at`, `entity_id`, `invoice_number` |
| Foreign keys | `{referenced_table_singular}_id` | `entity_id`, `client_id`, `project_id` |
| Indexes | `idx_{table}_{column}` | `idx_milestones_status`, `idx_loans_entity_id` |
| Money columns | suffix `_agorot` | `amount_agorot`, `balance_agorot`, `vat_amount_agorot` |
| Rate columns | suffix `_bp` (basis points) | `vat_rate_bp`, `interest_rate_bp` |
| Boolean columns | prefix `is_` or `has_` | `is_active`, `has_vat` |
| Enums | snake_case values | `'pending'`, `'invoiced'`, `'paid'` |

**Code Naming Conventions:**

| Element | Convention | Examples |
|---|---|---|
| React components | PascalCase | `KPICard`, `ShefaChat`, `MilestoneRow` |
| Component files | PascalCase.tsx | `KPICard.tsx`, `ShefaChat.tsx` |
| Page files | `page.tsx` (Next.js convention) | `src/app/(app)/(dashboard)/page.tsx` |
| Layout files | `layout.tsx` | `src/app/(app)/layout.tsx` |
| Server actions | camelCase verb+noun | `createMilestone`, `updateLoanPayment`, `deleteLoan` |
| Action files | kebab-case.ts | `src/lib/actions/consulting.ts` |
| Utility functions | camelCase | `formatILS`, `toAgorot`, `calculateVat` |
| Variables | camelCase | `entityId`, `totalRevenue`, `milestoneStatus` |
| Types/Interfaces | PascalCase | `MilestoneStatus`, `EntityKPI`, `ActionResult<T>` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_NUDGES_PER_DAY`, `VAT_RATE_DEFAULT_BP` |
| CSS classes | Tailwind utilities (no custom class names) | `className="flex items-center gap-2"` |
| Route segments | kebab-case | `/(consulting)/clients`, `/(loans)/repayment-schedule` |
| Translation keys | dot-notation, section.element | `dashboard.greeting`, `consulting.milestone.status` |

**Drizzle Schema Naming:**

| Element | Convention | Examples |
|---|---|---|
| Schema variable | camelCase plural | `export const entities = pgTable('entities', {...})` |
| Relations variable | camelCase + "Relations" | `export const entitiesRelations = relations(entities, ...)` |
| Insert schema | camelCase "insert" + name | `export const insertEntitySchema = createInsertSchema(entities)` |

### Structure Patterns

**File Organization Rules:**

| Category | Rule | Rationale |
|---|---|---|
| Tests | Co-located `*.test.ts` next to source | Easy to find, easy to maintain. `money.test.ts` sits next to `money.ts`. |
| Components | By type: `ui/`, `custom/`, `layout/` | Matches shadcn/ui convention. Custom domain components separate from generic UI. |
| Server actions | One file per module domain | `src/lib/actions/consulting.ts`, `src/lib/actions/loans.ts`, `src/lib/actions/migration.ts` |
| DB schema | One file per domain | `src/db/schema/entities.ts`, `src/db/schema/consulting.ts`, `src/db/schema/loans.ts` |
| Zod schemas | Co-located with server actions OR in `src/lib/validations/` for shared schemas | Schemas used by both client forms and server actions live in `validations/`. Action-only schemas live in the action file. |
| Types | Shared types in `src/types/` | `ActionResult<T>`, `MilestoneStatus`, domain types used across modules. |
| Static assets | `public/` root | Shefa character images, favicon, fonts (if self-hosted). |

**Module File Pattern (per route group):**

```
src/app/(app)/(dashboard)/
├── page.tsx              # Main page (Server Component)
├── loading.tsx           # Loading skeleton
├── error.tsx             # Error boundary
├── _components/          # Page-specific components (underscore = private to route)
│   ├── EntityCard.tsx
│   └── MorningBriefing.tsx
└── [entityId]/           # Dynamic route for drill-down
    └── page.tsx
```

### Format Patterns

**ActionResult Type (universal return format):**

```typescript
type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } };
```

**Server Action Pattern:**

```typescript
"use server";

export async function createMilestone(
  input: CreateMilestoneInput
): Promise<ActionResult<Milestone>> {
  const parsed = createMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
  }

  try {
    const milestone = await db.insert(milestones).values({...}).returning();
    await logAudit("milestones", milestone[0].id, "create", null);
    return { data: milestone[0], error: null };
  } catch (e) {
    return { data: null, error: { code: "DB_ERROR", message: "לא ניתן ליצור אבן דרך" } };
  }
}
```

**Date Handling:**

| Context | Format | Example |
|---|---|---|
| Database | `timestamp with time zone` | `2026-03-09T07:15:00.000Z` |
| JSON / API | ISO 8601 string | `"2026-03-09T07:15:00.000Z"` |
| Display (Hebrew) | DD/MM/YYYY | `09/03/2026` |
| Display relative | Hebrew relative | `לפני 3 ימים` |

**Money Handling Rules (CRITICAL):**

```typescript
// ✅ CORRECT — integer agorot everywhere
const amountAgorot = 105497500; // ₪1,054,975.00
const vatAmountAgorot = Math.floor(amountAgorot * vatRateBp / 10000);
const displayValue = formatILS(amountAgorot); // "₪1,054,975.00"

// ❌ FORBIDDEN — never use floating point for money
const amount = 1054975.00; // NEVER
const vat = amount * 0.17;  // NEVER
```

**Money Utility Functions (src/lib/money.ts):**

```typescript
export function toAgorot(ils: number): number { return Math.round(ils * 100); }
export function fromAgorot(agorot: number): number { return agorot / 100; }
export function formatILS(agorot: number): string {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(agorot / 100);
}
export function calculateVat(baseAgorot: number, vatRateBp: number): number {
  return Math.floor(baseAgorot * vatRateBp / 10000);
}
```

**JSON Field Naming:**

| Rule | Example |
|---|---|
| camelCase for all JSON fields | `{ entityId, totalRevenue, milestoneStatus }` |
| Money fields always integer agorot | `{ amountAgorot: 105497500, vatAmountAgorot: 17934575 }` |
| Rate fields always basis points | `{ vatRateBp: 1700, interestRateBp: 745 }` |
| Null for absent values (never undefined) | `{ error: null }` not `{ error: undefined }` |

### Communication Patterns

**No event system.** This is a request/response application. No pub/sub, no event emitters, no message queues. Server actions handle mutations. Server Components re-render on navigation and after `revalidatePath()`.

**Revalidation Pattern:**

```typescript
// After any data mutation, revalidate affected paths
import { revalidatePath } from "next/cache";

export async function updateMilestoneStatus(...) {
  // ... mutation logic ...
  revalidatePath("/(app)/(dashboard)");       // Dashboard KPIs update
  revalidatePath("/(app)/(consulting)");      // Consulting views update
  return { data: result, error: null };
}
```

**State Management Rules:**

| Where | Pattern | Example |
|---|---|---|
| Server data | Server Components fetch on render | Dashboard KPIs, loan tables, milestone lists |
| Client UI state | React `useState` | Shefa panel open/close, sidebar expanded, form field values |
| Form state | React Hook Form | Milestone edit form, loan payment form |
| URL state | Next.js `searchParams` | Entity filter, date range, sort column |
| No global client store | — | No Redux, no Zustand, no Context for data. React hooks only. |

### Process Patterns

**Loading States:**

```typescript
// src/app/(app)/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return <DashboardSkeleton />; // Warm cream skeleton, matches design system
}
```

- Every route segment gets a `loading.tsx` with a skeleton matching the page layout
- Skeleton colors use design system cream tones (`bg-cream-dark` / `#F2EDE7`), not gray
- No spinner components. Skeletons only — they feel faster and match the living room aesthetic

**Error Boundaries:**

```typescript
// src/app/(app)/(dashboard)/error.tsx
"use client";
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorDisplay
      message="לא ניתן לטעון את לוח הבקרה"  // Hebrew error message
      onRetry={reset}
    />
  );
}
```

- Every route segment gets an `error.tsx`
- Error messages always in Hebrew (from translation files)
- Never show raw stack traces or English error messages to user
- Always provide a retry action
- Log the actual error server-side for debugging

**Validation Pattern:**

```typescript
// Shared Zod schema — used by BOTH client form and server action
// src/lib/validations/milestone.ts
export const createMilestoneSchema = z.object({
  clientId: z.string().cuid2(),
  projectId: z.string().cuid2(),
  title: z.string().min(1).max(200),
  amountAgorot: z.number().int().positive(),
  dueDate: z.string().datetime(),
});

// Client: React Hook Form uses the schema for instant validation
// Server: Server action re-validates with the same schema (server is source of truth)
```

**Auth Check Pattern:**

```typescript
// Every server action starts with auth check
export async function createMilestone(input: CreateMilestoneInput): Promise<ActionResult<Milestone>> {
  const session = await auth();
  if (!session?.user) {
    return { data: null, error: { code: "UNAUTHORIZED", message: "נדרשת התחברות" } };
  }
  // ... rest of action
}
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Use integer agorot for ALL money values — zero tolerance for floating-point money
2. Return `ActionResult<T>` from ALL server actions — no exceptions, no thrown errors
3. Check authentication at the start of EVERY server action
4. Use `isNull(table.deletedAt)` filter on ALL queries (soft delete enforcement)
5. Log mutations via `withAudit()` wrapper — create, update, delete
6. Use translation keys for ALL user-facing text — no hardcoded Hebrew strings
7. Use CSS logical properties — `margin-inline-start` never `margin-left`
8. Place loading.tsx and error.tsx in EVERY route segment
9. Co-locate page-specific components in `_components/` within the route folder
10. Follow the naming conventions exactly — snake_case DB, camelCase code, PascalCase components

**Anti-Patterns (NEVER do these):**

```typescript
// ❌ Floating-point money
const total = 1054975.00;

// ❌ Thrown errors in server actions
throw new Error("Not found");

// ❌ Hardcoded Hebrew strings
<p>שלום</p>  // Use t('greeting') instead

// ❌ CSS physical properties
style={{ marginLeft: '16px' }}  // Use marginInlineStart

// ❌ Missing auth check in server action
export async function deleteClient(id: string) {
  await db.delete(clients).where(eq(clients.id, id)); // No auth check!
}

// ❌ Hard delete
await db.delete(milestones).where(eq(milestones.id, id)); // Use soft delete!

// ❌ Direct API response without wrapper
return NextResponse.json(milestone); // Use { data, error } format
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
trustegy-fo/
├── .env.example                    # Environment variable template
├── .env.local                      # Local development secrets (git-ignored)
├── .gitignore
├── drizzle.config.ts               # Drizzle Kit configuration
├── next.config.ts                  # Next.js 15 config (security headers, i18n)
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js               # PostCSS for Tailwind
├── tailwind.config.ts              # Tailwind theme (Shefa palette, fonts, RTL)
├── tsconfig.json                   # TypeScript strict mode
├── components.json                 # shadcn/ui configuration
│
├── public/
│   ├── shefa/                      # Shefa character assets
│   │   ├── avatar-happy.svg        # Default/greeting state
│   │   ├── avatar-thinking.svg     # Processing/loading state
│   │   ├── avatar-concerned.svg    # Warning/amber state
│   │   ├── avatar-serious.svg      # Financial analysis state
│   │   └── avatar-celebrating.svg  # Migration success state
│   ├── favicon.ico
│   └── manifest.json               # Basic web app manifest
│
└── src/
    ├── app/
    │   ├── globals.css              # Tailwind base + Shefa design tokens
    │   ├── layout.tsx               # Root layout: <html dir="rtl" lang="he">, fonts, providers
    │   │
    │   ├── (auth)/                  # Public auth routes (no sidebar, no Shefa panel)
    │   │   ├── layout.tsx           # Centered auth layout (cream background, Shefa logo)
    │   │   └── sign-in/
    │   │       └── page.tsx         # OAuth sign-in (Google/Microsoft buttons)
    │   │
    │   ├── (app)/                   # Authenticated app shell
    │   │   ├── layout.tsx           # App layout: Sidebar + ShefaPanel + main content area
    │   │   │
    │   │   ├── (dashboard)/         # Module: Consolidated Dashboard (Phase 0)
    │   │   │   ├── page.tsx         # Morning briefing + KPI cards + status items
    │   │   │   ├── loading.tsx      # Dashboard skeleton (cream tones)
    │   │   │   ├── error.tsx        # Dashboard error boundary
    │   │   │   ├── _components/
    │   │   │   │   ├── MorningBriefing.tsx    # Shefa AI greeting + summary (Server)
    │   │   │   │   ├── EntityCard.tsx          # KPI card per entity (Server)
    │   │   │   │   ├── EntityCardGrid.tsx      # Card grid layout (Server)
    │   │   │   │   ├── SparklineChart.tsx      # Mini trend chart (Client)
    │   │   │   │   └── StatusItems.tsx         # Amber/red items needing attention (Server)
    │   │   │   └── [entityId]/
    │   │   │       ├── page.tsx     # Entity drill-down view
    │   │   │       └── loading.tsx
    │   │   │
    │   │   ├── (migration)/         # Module: Data Migration Ceremony (Phase 0)
    │   │   │   ├── page.tsx         # Migration landing (upload + status)
    │   │   │   ├── loading.tsx
    │   │   │   ├── error.tsx
    │   │   │   ├── _components/
    │   │   │   │   ├── ExcelUploader.tsx       # File upload zone (Client)
    │   │   │   │   ├── VerificationTable.tsx   # Side-by-side comparison (Client)
    │   │   │   │   ├── SummaryTotals.tsx       # Progressive disclosure totals (Server)
    │   │   │   │   ├── RowDetail.tsx           # Expandable row detail (Client)
    │   │   │   │   └── VerifyGate.tsx          # "I verify this matches" button (Client)
    │   │   │   └── verify/
    │   │   │       └── page.tsx     # Verification step (after upload processed)
    │   │   │
    │   │   ├── (consulting)/        # Module: Consulting Operations (Phase 0.5)
    │   │   │   ├── page.tsx         # Consulting overview (all clients)
    │   │   │   ├── loading.tsx
    │   │   │   ├── error.tsx
    │   │   │   ├── _components/
    │   │   │   │   ├── ClientList.tsx           # Client cards/list (Server)
    │   │   │   │   ├── MilestoneTable.tsx       # Milestone status table (Client - sortable)
    │   │   │   │   ├── MilestoneForm.tsx        # Create/edit milestone (Client)
    │   │   │   │   ├── BillingWorkflow.tsx      # Status transition UI (Client)
    │   │   │   │   └── MonthlySummary.tsx       # Monthly billing summary (Server)
    │   │   │   ├── clients/
    │   │   │   │   ├── page.tsx     # Client list page
    │   │   │   │   ├── new/
    │   │   │   │   │   └── page.tsx # Create client
    │   │   │   │   └── [clientId]/
    │   │   │   │       ├── page.tsx # Client detail + projects
    │   │   │   │       └── projects/
    │   │   │   │           └── [projectId]/
    │   │   │   │               └── page.tsx # Project milestones
    │   │   │   └── milestones/
    │   │   │       └── page.tsx     # All milestones view (filterable)
    │   │   │
    │   │   ├── (loans)/             # Module: Loans & Debt Management (Phase 0.5)
    │   │   │   ├── page.tsx         # Consolidated loan view
    │   │   │   ├── loading.tsx
    │   │   │   ├── error.tsx
    │   │   │   ├── _components/
    │   │   │   │   ├── LoanTable.tsx            # All loans table (Client - sortable)
    │   │   │   │   ├── LoanForm.tsx             # Create/edit loan (Client)
    │   │   │   │   ├── RepaymentSchedule.tsx    # Repayment timeline (Server)
    │   │   │   │   ├── PaymentTimeline.tsx      # Chronological payments (Client)
    │   │   │   │   ├── CollisionAlert.tsx       # 3-day collision warning (Server)
    │   │   │   │   └── OptimizationFlags.tsx    # High-rate loan flags (Server)
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx     # Create loan
    │   │   │   └── [loanId]/
    │   │   │       ├── page.tsx     # Loan detail + payment history
    │   │   │       └── payments/
    │   │   │           └── page.tsx # Record payment
    │   │   │
    │   │   ├── (expenses)/          # Module: Expense & Tax Management (Phase 0.5)
    │   │   │   ├── page.tsx         # Expense overview
    │   │   │   ├── loading.tsx
    │   │   │   ├── error.tsx
    │   │   │   ├── _components/
    │   │   │   │   ├── ExpenseTable.tsx         # Expense list (Client - sortable)
    │   │   │   │   ├── ExpenseForm.tsx          # Create/edit expense (Client)
    │   │   │   │   ├── VatSummary.tsx           # VAT breakdown (Server)
    │   │   │   │   └── ExportButton.tsx         # CSV/Excel export (Client)
    │   │   │   └── new/
    │   │   │       └── page.tsx
    │   │   │
    │   │   ├── (marketplace)/       # Module: Module Marketplace Shell (Phase 0)
    │   │   │   ├── page.tsx         # Module grid (active + coming soon)
    │   │   │   ├── loading.tsx
    │   │   │   └── _components/
    │   │   │       ├── ModuleCard.tsx           # Module card (active/coming soon)
    │   │   │       └── ModuleGrid.tsx           # Grid layout
    │   │   │
    │   │   └── settings/            # User settings
    │   │       ├── page.tsx         # Settings page (2FA, alert rules, tax categories)
    │   │       └── _components/
    │   │           ├── TwoFactorSetup.tsx       # TOTP 2FA configuration (Client)
    │   │           ├── AlertRulesEditor.tsx     # Custom alert rules (Client)
    │   │           └── TaxCategoryEditor.tsx    # Configurable tax categories (Client)
    │   │
    │   └── api/
    │       ├── health/
    │       │   └── route.ts         # Health check endpoint (DB status + version)
    │       ├── upload/
    │       │   └── route.ts         # Excel file upload handler
    │       └── ai/
    │           └── chat/
    │               └── route.ts     # Shefa AI streaming endpoint (Claude API)
    │
    ├── components/
    │   ├── ui/                      # shadcn/ui components (auto-generated by CLI)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── popover.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   └── tooltip.tsx
    │   │
    │   ├── custom/                  # Domain-specific custom components
    │   │   ├── KPICard.tsx          # Financial KPI display (big number + sparkline + status)
    │   │   ├── StatusBadge.tsx      # Green/amber/red status indicator (icon + text)
    │   │   ├── ShefaAvatar.tsx      # Puppy character with mood-based expressions
    │   │   ├── ShefaChat.tsx        # Collapsible AI chat panel (Client)
    │   │   ├── DataTable.tsx        # Sortable/filterable financial data table (Client)
    │   │   ├── MigrationVerifier.tsx # Side-by-side Excel/Shefa comparison (Client)
    │   │   ├── MoneyDisplay.tsx     # Formatted ILS display from agorot
    │   │   └── ErrorDisplay.tsx     # Friendly Hebrew error with retry
    │   │
    │   └── layout/                  # App shell components
    │       ├── Sidebar.tsx          # Dark sidebar with icon navigation (Client)
    │       ├── SidebarItem.tsx      # Individual nav item
    │       ├── ShefaPanel.tsx       # Floating Shefa panel wrapper (Client)
    │       ├── AppShell.tsx         # Main content area wrapper
    │       └── Providers.tsx        # NextIntlClientProvider + SessionProvider
    │
    ├── db/
    │   ├── index.ts                 # Drizzle instance + PostgreSQL connection
    │   ├── schema/
    │   │   ├── index.ts             # Re-exports all schemas
    │   │   ├── entities.ts          # entities, inter_entity_transactions (FR5-9)
    │   │   ├── consulting.ts        # clients, projects, milestones (FR17-24)
    │   │   ├── expenses.ts          # expenses, tax_categories (FR25-29)
    │   │   ├── loans.ts             # loans, loan_payments (FR30-38)
    │   │   ├── migration.ts         # migration_sessions, imported_records (FR47-55)
    │   │   ├── ai.ts                # shefa_conversations, shefa_nudges (FR39-46)
    │   │   ├── alerts.ts            # alert_rules, alert_history (FR56)
    │   │   ├── audit.ts             # audit_logs (FR59)
    │   │   └── auth.ts              # users, sessions, accounts (Auth.js tables)
    │   ├── migrations/              # Generated SQL migration files
    │   ├── seed.ts                  # Seed script: 3 entities, sample tax categories
    │   └── helpers.ts               # Shared column helpers (id, timestamps, softDelete)
    │
    ├── lib/
    │   ├── actions/                 # Server actions (one file per domain)
    │   │   ├── entities.ts          # Entity CRUD
    │   │   ├── dashboard.ts         # KPI aggregation queries
    │   │   ├── consulting.ts        # Client, project, milestone CRUD + billing workflow
    │   │   ├── expenses.ts          # Expense CRUD + VAT calculation
    │   │   ├── loans.ts             # Loan CRUD + payment recording + collision detection
    │   │   ├── migration.ts         # Excel processing + verification + seal
    │   │   ├── ai.ts                # Shefa query handling + nudge management
    │   │   └── alerts.ts            # Alert rule CRUD + alert generation
    │   │
    │   ├── auth/
    │   │   ├── config.ts            # Auth.js configuration (providers, adapter, callbacks)
    │   │   └── index.ts             # auth() helper export
    │   │
    │   ├── ai/
    │   │   ├── client.ts            # Anthropic SDK client initialization
    │   │   ├── prompts.ts           # System prompts for Shefa (personality, context, boundaries)
    │   │   ├── tools.ts             # Claude tool definitions (DB query tools for Shefa)
    │   │   └── nudges.ts            # Proactive nudge generation logic (max 3/day)
    │   │
    │   ├── money.ts                 # toAgorot, fromAgorot, formatILS, calculateVat
    │   ├── money.test.ts            # Integer math tests (critical — zero tolerance)
    │   ├── audit.ts                 # withAudit() wrapper + logAudit() helper
    │   ├── audit.test.ts
    │   │
    │   ├── validations/             # Shared Zod schemas (used by forms + server actions)
    │   │   ├── entity.ts
    │   │   ├── milestone.ts
    │   │   ├── expense.ts
    │   │   ├── loan.ts
    │   │   └── common.ts            # Shared validators (money, dates, cuid)
    │   │
    │   └── utils.ts                 # cn(), formatDate(), formatRelativeDate()
    │
    ├── messages/
    │   └── he.json                  # Hebrew translations (all UI strings)
    │
    ├── middleware.ts                 # Auth.js middleware (protects all (app)/ routes)
    │
    └── types/
        ├── index.ts                 # ActionResult<T>, common type exports
        ├── entities.ts              # Entity domain types
        ├── consulting.ts            # Milestone status enum, billing workflow types
        ├── loans.ts                 # Loan types, payment types
        └── ai.ts                    # Shefa message types, confidence tiers
```

### Architectural Boundaries

**Authentication Boundary:**
- `middleware.ts` guards all `/(app)/` routes → unauthenticated users redirected to `/(auth)/sign-in`
- `/(auth)/` routes are public (no sidebar, no Shefa panel, centered layout)
- Every server action independently verifies session via `auth()`
- API routes (`/api/*`) verify auth in route handler

**Module Boundaries (route groups):**
- Each module is a route group under `/(app)/` — shares the app layout (sidebar + Shefa)
- Modules share the same database and data layer — no separate APIs between modules
- Module-specific components live in `_components/` within the route group (private)
- Shared components live in `src/components/` (accessible to all modules)
- Server actions in `src/lib/actions/` are organized per domain but callable from any module

**Data Flow Boundary:**
- Server Components → Drizzle queries → PostgreSQL (direct, no API layer)
- Client Components → Server Actions → Drizzle → PostgreSQL (form submissions, mutations)
- Client Components → API Routes → External services (Claude API streaming, file upload)
- Display formatting (agorot → ILS, dates → Hebrew) happens in React components only

**AI Boundary:**
- Claude API calls happen ONLY in `src/lib/ai/` and `src/app/api/ai/chat/route.ts`
- Shefa never writes data directly — it suggests, user confirms through standard UI
- All Shefa answers include source references (entity, record IDs, date ranges)
- Nudge generation runs as part of dashboard data fetch, not as a background job

### Requirements to Structure Mapping

| FR Domain | Route Group | Actions File | Schema File | Key Components |
|---|---|---|---|---|
| FR1-4 (Auth) | `(auth)/` | — (Auth.js handles) | `auth.ts` | sign-in page, TwoFactorSetup |
| FR5-9 (Entities) | `(dashboard)/` | `entities.ts` | `entities.ts` | EntityCard, EntityCardGrid |
| FR10-16 (Dashboard) | `(dashboard)/` | `dashboard.ts` | — (queries entities, consulting, loans) | MorningBriefing, KPICard, SparklineChart |
| FR17-24 (Consulting) | `(consulting)/` | `consulting.ts` | `consulting.ts` | ClientList, MilestoneTable, BillingWorkflow |
| FR25-29 (Expenses) | `(expenses)/` | `expenses.ts` | `expenses.ts` | ExpenseTable, ExpenseForm, VatSummary |
| FR30-38 (Loans) | `(loans)/` | `loans.ts` | `loans.ts` | LoanTable, RepaymentSchedule, PaymentTimeline |
| FR39-46 (Shefa AI) | — (global panel) | `ai.ts` | `ai.ts` | ShefaChat, ShefaAvatar, ShefaPanel |
| FR47-55 (Migration) | `(migration)/` | `migration.ts` | `migration.ts` | ExcelUploader, VerificationTable, VerifyGate |
| FR56-59 (System) | `settings/`, `(marketplace)/` | `alerts.ts` | `alerts.ts`, `audit.ts` | AlertRulesEditor, ModuleCard |

### Integration Points

**Internal Communication:**
- Dashboard ← aggregates data from entities + consulting + loans + expenses schemas
- Shefa AI ← reads from all schemas for contextual answers
- Nudges ← generated from milestone due dates (consulting) + loan payment dates (loans)
- Revalidation ← mutations in any module trigger `revalidatePath("/(app)/(dashboard)")`
- Audit trail ← all mutations across all modules log to `audit_logs` table

**External Integrations:**
- **Claude API** (`src/lib/ai/client.ts`) → Anthropic SDK for Shefa conversational AI + Excel interpretation
- **OAuth providers** (Auth.js config) → Google and Microsoft for sign-in
- **Object storage** (Railway volume) → Frozen Excel snapshots stored after migration verification

**Data Flow Diagram:**

```
Browser (RTL Hebrew)
    │
    ├── Server Components ──→ Drizzle ──→ PostgreSQL
    │   (dashboard, lists)     (queries)    (single DB)
    │
    ├── Server Actions ──→ Drizzle ──→ PostgreSQL
    │   (forms, mutations)  (insert/update)  + audit_logs
    │
    └── API Routes ──→ Claude API (streaming)
        (chat, upload)    Railway Volume (snapshots)
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices verified compatible — Next.js 15 App Router + Drizzle ORM + Auth.js v5 + shadcn/ui + next-intl all support App Router natively. Drizzle ORM + PostgreSQL (pg driver) has first-class support. Auth.js v5 + `@auth/drizzle-adapter` verified. Zod + Drizzle (`drizzle-zod`) auto-generates schemas. No version conflicts detected.

**Pattern Consistency:**
- `{ data, error }` convention: applied uniformly across server actions, error boundaries, client consumption
- Integer agorot: DB columns (`_agorot`) → TypeScript → Zod (`.int()`) → display (`formatILS`) — consistent end-to-end
- Soft deletes: `deletedAt` in every financial schema + `isNull(deletedAt)` filter on all queries
- RTL: `dir="rtl"` root layout, logical CSS properties enforced, next-intl Hebrew strings
- Naming: snake_case DB ↔ camelCase TypeScript ↔ PascalCase Components — no crossover

**Structure Alignment:**
Route groups map 1:1 to PRD modules. Schema files map 1:1 to route groups and actions files. `_components/` private per route, `components/` shared globally. Auth boundary clean: middleware → `(app)/` protected, `(auth)/` public.

### Requirements Coverage Validation ✅

**Functional Requirements (59/59 covered):**

| FR Range | Domain | Status |
|---|---|---|
| FR1-4 | Auth & Access | ✅ Auth.js v5 OAuth + TOTP, middleware, 24h session |
| FR5-9 | Entity & Data Model | ✅ entities.ts schema, CUID, integer agorot, soft deletes |
| FR10-16 | Dashboard | ✅ (dashboard)/ route, KPI aggregation, sparklines, revalidation |
| FR17-24 | Consulting | ✅ (consulting)/ route, milestone workflow, billing |
| FR25-29 | Expenses & Tax | ✅ (expenses)/ route, VAT calculation, export |
| FR30-38 | Loans & Debt | ✅ (loans)/ route, collision detection, optimization flags |
| FR39-46 | Shefa AI | ✅ Claude API, ShefaChat, nudges, confidence tiers |
| FR47-55 | Migration | ✅ (migration)/ route, Excel upload, verification, snapshots |
| FR56-59 | System-Wide | ✅ Alert rules, marketplace, RTL, audit trail |

**Non-Functional Requirements (30/30 covered):**

| NFR Range | Category | Status |
|---|---|---|
| NFR1-6 | Performance | ✅ Server Components, loading.tsx, direct Drizzle queries |
| NFR7-13 | Security | ✅ Railway TLS, DB encryption, httpOnly sessions, server-side data, CSP |
| NFR14-21 | Data Integrity | ✅ Integer agorot, soft deletes, audit trail, transactions, backups |
| NFR22-26 | Reliability | ✅ Railway auto-restart, health check, error boundaries |
| NFR27-30 | Accessibility | ✅ shadcn/ui keyboard nav, 4.5:1 contrast, focus indicators, icon+text |

### Gaps Found and Resolved

| Gap | Priority | Resolution |
|---|---|---|
| Testing framework not specified | Important | **Vitest** + `@testing-library/react` — modern, fast, native ESM. Co-located `*.test.ts`. |
| `react-hook-form` missing from deps | Critical | Added `react-hook-form` + `@hookform/resolvers` to post-init setup. |
| `drizzle-zod` missing from deps | Important | Added `drizzle-zod` for auto-generated Zod schemas from Drizzle tables. |
| DB connection pooling | Important | Railway PostgreSQL handles pooling. Drizzle `pg` driver supports it natively. No additional config for single-user. |

**Updated Post-Init Dependencies:**

```bash
pnpm add react-hook-form @hookform/resolvers  # Form handling
pnpm add drizzle-zod                           # Schema → Zod auto-generation
pnpm add -D vitest @testing-library/react @vitejs/plugin-react  # Testing
```

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analyzed (59 FRs, 30 NFRs, 4 journeys)
- [x] Scale and complexity assessed (High)
- [x] Technical constraints identified (integer math, RTL, desktop-only, single-user)
- [x] Cross-cutting concerns mapped (9 concerns)

**✅ Starter Template**
- [x] Technology domain identified (full-stack Next.js 15)
- [x] Starter options evaluated with rationale
- [x] ORM decision made (Drizzle over Prisma)
- [x] All init commands documented

**✅ Architectural Decisions**
- [x] Data architecture (Drizzle, Zod, soft deletes, audit trail)
- [x] Authentication & security (DB sessions, middleware, CSP)
- [x] API & communication (server actions, `{ data, error }`, revalidation)
- [x] Frontend architecture (no state library, RHF, Server/Client boundary)
- [x] Infrastructure (Railway, two environments, health check, backups)

**✅ Implementation Patterns**
- [x] Naming conventions (DB, code, routes, translations)
- [x] Structure patterns (tests, components, actions, schemas)
- [x] Format patterns (ActionResult, dates, money, JSON)
- [x] Process patterns (loading, errors, validation, auth check)
- [x] Enforcement guidelines (10 rules + anti-patterns)

**✅ Project Structure**
- [x] Complete directory tree with all files
- [x] Architectural boundaries defined
- [x] Requirements to structure mapping
- [x] Integration points documented

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
1. Zero-ambiguity money handling — integer agorot enforced end-to-end
2. Server-first simplicity — RSC + server actions eliminates client state complexity
3. Flat stack — Server Component → Drizzle → PostgreSQL, no intermediate API layer
4. Module isolation with shared data — route groups provide clean boundaries
5. Comprehensive AI agent guardrails — 10 mandatory rules + code examples

**Areas for Future Enhancement:**
- CI/CD pipeline (deferred — manual Railway deploy sufficient for solo developer)
- E2E testing with Playwright (add when first module is complete)
- Performance monitoring (add post-launch if needed)
- Rate limiting (add when LP portal introduces external users)
