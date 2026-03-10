# Story 1.3: Database Foundation & OAuth Sign-In

Status: review

## Story

As the owner,
I want to sign in securely with my Google or Microsoft account so that only I can access my financial data.

## Acceptance Criteria (BDD)

1. **Given** the owner navigates to the application
   **When** they are not authenticated
   **Then** they are redirected to a login page with Google and Microsoft sign-in options

2. **And** Auth.js v5 is configured with Drizzle adapter storing sessions in PostgreSQL

3. **And** Drizzle ORM is set up with auth tables (users, accounts, sessions, verificationTokens)

4. **And** OAuth tokens are stored in httpOnly cookies — never in localStorage

5. **And** middleware.ts protects all (app)/ routes, redirecting unauthenticated requests to sign-in

6. **And** successful sign-in creates a database record and redirects to the dashboard

7. **And** the health check endpoint remains public (no auth required)

## Tasks / Subtasks

- [x] Task 1: Create Auth.js database schema (AC: #2, #3)
  - [x] 1.1 Create `src/db/schema/auth.ts` with users, accounts, sessions, verificationTokens tables
  - [x] 1.2 Use text IDs with crypto.randomUUID() for user primary keys
  - [x] 1.3 Composite primary keys for accounts and verificationTokens
  - [x] 1.4 Cascade delete on user references

- [x] Task 2: Configure Auth.js v5 split pattern (AC: #2, #4)
  - [x] 2.1 Create `src/lib/auth/config.ts` — edge-compatible config (providers, pages, authorized callback)
  - [x] 2.2 Create `src/lib/auth/index.ts` — full config with DrizzleAdapter, JWT strategy, session callbacks
  - [x] 2.3 Configure Google OAuth provider (auto-detected env vars)
  - [x] 2.4 Configure Microsoft Entra ID provider (explicit clientId, clientSecret, issuer)
  - [x] 2.5 JWT strategy with user.id passthrough to session

- [x] Task 3: Create Auth API route handler (AC: #1, #6)
  - [x] 3.1 Create `src/app/api/auth/[...nextauth]/route.ts` with GET and POST handlers

- [x] Task 4: Create middleware for route protection (AC: #5, #7)
  - [x] 4.1 Create `src/middleware.ts` using edge-compatible authConfig
  - [x] 4.2 Redirect unauthenticated users to /sign-in
  - [x] 4.3 Redirect authenticated users away from /sign-in to /
  - [x] 4.4 Exclude /api/auth and /api/health from protection
  - [x] 4.5 Exclude static assets from middleware matching

- [x] Task 5: Create server actions for auth (AC: #1, #6)
  - [x] 5.1 Create `src/lib/auth/actions.ts` with loginWithGoogle, loginWithMicrosoft, logout

- [x] Task 6: Upgrade sign-in page with OAuth buttons (AC: #1)
  - [x] 6.1 Google sign-in button with official Google logo SVG
  - [x] 6.2 Microsoft sign-in button with official Microsoft logo SVG
  - [x] 6.3 All text from he.json via getTranslations
  - [x] 6.4 Cream card styling consistent with Shefa palette

- [x] Task 7: Verify and test (AC: all)
  - [x] 7.1 Run `pnpm build` — no errors, middleware compiled
  - [x] 7.2 Run `pnpm test` — no regressions (21/21 pass)
  - [x] 7.3 Verify /api/auth/[...nextauth] route exists in build output
  - [x] 7.4 Verify middleware size in build output

## Dev Notes

### Split Auth Config Pattern (Edge Compatibility)
Auth.js v5 requires a split config pattern because the `pg` driver is NOT edge-compatible and middleware runs on edge runtime:
- `auth/config.ts` — edge-safe: providers + pages + authorized callback ONLY
- `auth/index.ts` — full Node.js: DrizzleAdapter + JWT callbacks + session strategy

### JWT Strategy Decision
Using `session: { strategy: "jwt" }` because:
- Edge middleware can't access the database (pg driver not edge-compatible)
- JWT tokens stored in httpOnly cookies (satisfies NFR9)
- Adapter used only for user creation/linking, not session reads

### Database Schema Notes
- Auth.js requires specific table/column names — DO NOT rename
- Using `text` type for id_token (Microsoft tokens can exceed 4KB)
- Drizzle ORM 0.45.x composite primary key syntax uses array return from table callback

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- `@auth/core/adapters` type import not found — replaced with inline type definition
- `callbacks` specified twice (spread from config + explicit) — fixed by spreading config first then merging callbacks

### Completion Notes List
- ✅ Auth.js v5 (next-auth@beta.30) configured with split edge/Node.js pattern
- ✅ DrizzleAdapter with PostgreSQL schema (users, accounts, sessions, verificationTokens)
- ✅ Google + Microsoft Entra ID OAuth providers configured
- ✅ JWT session strategy with user.id passthrough
- ✅ Middleware protects all (app)/ routes, allows /api/auth, /api/health, /sign-in
- ✅ Sign-in page with branded Google and Microsoft OAuth buttons
- ✅ Server actions for loginWithGoogle, loginWithMicrosoft, logout
- ✅ `pnpm build` clean — middleware 92KB, all routes generated
- ✅ `pnpm test` 21/21 pass, no regressions

### File List

**New files created:**
- `src/db/schema/auth.ts` — Auth.js database schema (users, accounts, sessions, verificationTokens)
- `src/lib/auth/config.ts` — Edge-compatible auth config (providers, pages)
- `src/lib/auth/index.ts` — Full auth config with DrizzleAdapter
- `src/lib/auth/actions.ts` — Server actions (loginWithGoogle, loginWithMicrosoft, logout)
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler
- `src/middleware.ts` — Route protection middleware

**Modified files:**
- `src/app/(auth)/sign-in/page.tsx` — upgraded with Google + Microsoft OAuth buttons

### Change Log
- 2026-03-10: Story 1.3 implemented — Auth.js v5 with Drizzle adapter, OAuth providers, middleware protection
