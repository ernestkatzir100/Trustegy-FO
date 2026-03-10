# Story 1.5: TOTP Two-Factor Authentication

Status: done

## Story

As the owner,
I want to optionally enable TOTP-based two-factor authentication,
So that I have an extra layer of security protecting my financial data.

## Acceptance Criteria (BDD)

1. **Given** the owner is authenticated
   **When** they navigate to security settings
   **Then** they can enable TOTP 2FA by scanning a QR code with an authenticator app

2. **And** after enabling, subsequent sign-ins require a 6-digit TOTP code after OAuth

3. **And** the owner can disable 2FA from security settings

4. **And** invalid TOTP codes are rejected with a clear Hebrew error message

5. **And** TOTP secrets are stored securely server-side, never exposed to the client (NFR12)

## Tasks / Subtasks

- [x] Task 1: Add TOTP database schema (AC: #5)
  - [x] 1.1 Add `twoFactorAuth` table to `src/db/schema/auth.ts`
  - [x] 1.2 Fields: userId, encryptedSecret, enabled, failedAttempts, lockedUntil, timestamps
  - [x] 1.3 AES-256-GCM encryption for TOTP secrets at rest

- [x] Task 2: Create crypto utilities (AC: #5)
  - [x] 2.1 Create `src/lib/auth/crypto.ts` with `encryptSecret()` and `decryptSecret()`
  - [x] 2.2 Uses Node.js built-in crypto (AES-256-GCM, 12-byte IV, 16-byte auth tag)
  - [x] 2.3 Encryption key from `TOTP_ENCRYPTION_KEY` environment variable

- [x] Task 3: Create TOTP server actions (AC: #1, #2, #3, #4)
  - [x] 3.1 Create `src/lib/auth/totp.ts` with setupTOTP, verifyAndEnableTOTP, verifyTOTPCode, disableTOTP, hasTOTPEnabled
  - [x] 3.2 QR code generated server-side via `qrcode` package (secret never sent to client bundle)
  - [x] 3.3 TOTP verification with 30s grace period via `@oslojs/otp`
  - [x] 3.4 Rate limiting: lockout after 5 failed attempts for 15 minutes
  - [x] 3.5 Base32 encoding for manual entry of TOTP secret

- [x] Task 4: Update Auth.js JWT callbacks (AC: #2)
  - [x] 4.1 Check `twoFactorAuth` table on sign-in trigger
  - [x] 4.2 Set `twoFactorEnabled` and `twoFactorVerified` flags in JWT
  - [x] 4.3 Support `update` trigger to mark 2FA as verified after TOTP code entry
  - [x] 4.4 Extend Session and JWT types in `src/global.d.ts`

- [x] Task 5: Update middleware for 2FA gate (AC: #2)
  - [x] 5.1 Redirect unverified 2FA users to `/two-factor` page
  - [x] 5.2 Prevent verified users from visiting `/two-factor`
  - [x] 5.3 Allow `/two-factor` route through auth (logged in but not 2FA verified)

- [x] Task 6: Create two-factor verification page (AC: #2, #4)
  - [x] 6.1 Create `src/app/(auth)/two-factor/page.tsx`
  - [x] 6.2 6-digit numeric input with monospace font, auto-focus
  - [x] 6.3 Error display for invalid codes (Hebrew)
  - [x] 6.4 Sign-out fallback link
  - [x] 6.5 Uses `useSession().update()` to refresh JWT after verification

- [x] Task 7: Create settings page with TOTP setup (AC: #1, #3)
  - [x] 7.1 Create `src/app/(app)/settings/page.tsx` with security section
  - [x] 7.2 Create `TwoFactorSetup.tsx` client component with setup wizard
  - [x] 7.3 QR code display, manual secret entry, verification step
  - [x] 7.4 Enabled/disabled state display
  - [x] 7.5 Loading and error boundaries

- [x] Task 8: Add SessionProvider (AC: #2)
  - [x] 8.1 Create `AuthProvider.tsx` client wrapper for `SessionProvider`
  - [x] 8.2 Add to `Providers.tsx` component tree

- [x] Task 9: UI integration (AC: #1)
  - [x] 9.1 Add settings link to Sidebar navigation
  - [x] 9.2 Add Hebrew translations for all 2FA strings to `he.json`
  - [x] 9.3 Update `.env.example` with `TOTP_ENCRYPTION_KEY`

- [x] Task 10: Tests and verification (AC: all)
  - [x] 10.1 Create `crypto.test.ts` — 4 tests (encrypt/decrypt roundtrip, random IV, 20-byte secret, format)
  - [x] 10.2 `pnpm test` — 29/29 pass
  - [x] 10.3 `pnpm build` — clean, all routes generated including /settings and /two-factor

## Dev Notes

### Libraries Used
- `@oslojs/otp@1.1.0` — Zero-dependency TOTP library (RFC 6238), by Lucia Auth author
- `qrcode@1.5.4` — Server-side QR code generation (TOTP secret never reaches client bundle)
- Node.js built-in `crypto` — AES-256-GCM for secret encryption at rest

### 2FA Flow
1. User enables 2FA in Settings → server generates secret, encrypts, stores, returns QR data URL
2. User scans QR with authenticator app → enters 6-digit code to verify setup
3. On next OAuth sign-in → JWT callback checks if user has TOTP enabled → sets `twoFactorVerified: false`
4. Middleware redirects to `/two-factor` → user enters code → server verifies → session updated via `update()` trigger
5. User can disable 2FA from Settings page

### Security
- TOTP secrets encrypted at rest with AES-256-GCM (key from env var)
- QR code generated server-side — secret never in client bundle
- Rate limiting: 5 failed attempts → 15-minute lockout
- 30-second grace period for clock drift tolerance

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- `.next` cache corruption (stale symlink) → fixed by deleting `.next` directory

### Completion Notes List
- TOTP 2FA with @oslojs/otp, QR code setup, AES-256-GCM encrypted secrets
- Settings page at /settings with TwoFactorSetup component
- Two-factor verification page at /two-factor with middleware gate
- Auth.js JWT callbacks track 2FA state (enabled/verified flags)
- SessionProvider added for client-side session updates
- Rate limiting: 5 attempts → 15-min lockout
- 29/29 tests pass, build clean

### File List

**New files created:**
- `src/lib/auth/crypto.ts` — AES-256-GCM encrypt/decrypt utilities
- `src/lib/auth/crypto.test.ts` — Crypto roundtrip tests (4 tests)
- `src/lib/auth/totp.ts` — TOTP server actions (setup, verify, enable, disable)
- `src/app/(auth)/two-factor/page.tsx` — TOTP verification page (post-OAuth gate)
- `src/app/(app)/settings/page.tsx` — Settings page with security section
- `src/app/(app)/settings/loading.tsx` — Settings loading skeleton
- `src/app/(app)/settings/error.tsx` — Settings error boundary
- `src/app/(app)/settings/_components/TwoFactorSetup.tsx` — TOTP setup wizard
- `src/components/layout/AuthProvider.tsx` — SessionProvider client wrapper

**Modified files:**
- `src/db/schema/auth.ts` — Added `twoFactorAuth` table
- `src/lib/auth/index.ts` — JWT callbacks for 2FA state tracking
- `src/middleware.ts` — 2FA gate (redirect unverified to /two-factor)
- `src/global.d.ts` — Extended Session and JWT types with 2FA fields
- `src/components/layout/Providers.tsx` — Added AuthProvider (SessionProvider)
- `src/components/layout/Sidebar.tsx` — Added settings nav item
- `src/components/layout/SidebarItem.tsx` — Added "settings" to label union type
- `messages/he.json` — Added settings and twoFactor translation sections
- `.env.example` — Added TOTP_ENCRYPTION_KEY

### Change Log
- 2026-03-10: Story 1.5 implemented — TOTP 2FA with encrypted secrets, setup wizard, verification gate, rate limiting
