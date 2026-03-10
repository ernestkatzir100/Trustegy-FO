# Story 1.1: Project Initialization & Design System

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the owner,
I want the application to render in a polished Hebrew-first visual design with warm cream tones, gold accents, and proper RTL layout,
So that every screen feels premium and native from the very first interaction.

## Acceptance Criteria (BDD)

1. **Given** the project is initialized with Next.js 15, TypeScript, Tailwind, App Router, and src directory
   **When** the application loads in a browser
   **Then** the page renders with RTL direction (`dir="rtl"`) using CSS logical properties (`margin-inline-start`, not `margin-left`)

2. **And** Tailwind is configured with the Shefa palette (cream `#FAF8F5`, gold `#C4954A`, status colors green/amber/red)

3. **And** typography uses Heebo for Hebrew text and IBM Plex Mono for financial numbers (loaded via `next/font`)

4. **And** the 4px base spacing system is configured

5. **And** next-intl is set up with a `he.json` strings file — no hardcoded Hebrew anywhere

6. **And** every route segment has a `loading.tsx` skeleton in warm cream tones (not gray)

7. **And** every route segment has an `error.tsx` boundary with Hebrew error messages and a retry action

8. **And** all dependencies are installed: shadcn/ui, Drizzle ORM + pg, Auth.js v5, next-intl, @paralleldrive/cuid2, zod, react-hook-form, @hookform/resolvers, vitest

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js 15 project (AC: #1)
  - [x] 1.1 Run `pnpm create next-app@15 trustegy-fo --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-pnpm`
  - [x] 1.2 Pin to Next.js `15.5.12` (latest security-patched 15.x)
  - [x] 1.3 Verify TypeScript strict mode in `tsconfig.json`
  - [x] 1.4 Set `<html dir="rtl" lang="he">` in root `layout.tsx`
  - [x] 1.5 Configure `next.config.ts` with security headers (CSP, X-Frame-Options, X-Content-Type-Options)

- [x] Task 2: Configure Tailwind v4 design system (AC: #2, #4)
  - [x] 2.1 Configure Shefa color palette via `@theme` directive in `globals.css`
  - [x] 2.2 Define status colors (green `#4A8C6F`, amber `#C48B2C`, red `#B5544A`) with bg variants
  - [x] 2.3 Set up 4px spacing scale
  - [x] 2.4 Define border-radius tokens (sm: 8px, md: 12px, lg: 16px)
  - [x] 2.5 Define shadow tokens (warm-toned, subtle)
  - [x] 2.6 Configure animation tokens (fade-in, amber-pulse, panel-slide, skeleton-shimmer)
  - [x] 2.7 Add `prefers-reduced-motion` fallbacks for all animations

- [x] Task 3: Set up typography system (AC: #3)
  - [x] 3.1 Load Heebo via `next/font/google` (variable font, no weight needed)
  - [x] 3.2 Load IBM Plex Mono via `next/font/google` (weights: 400, 500, 600, 700)
  - [x] 3.3 Map fonts to CSS variables (`--font-heebo`, `--font-ibm-plex-mono`)
  - [x] 3.4 Configure `@theme inline` to map `--font-sans` and `--font-mono`
  - [x] 3.5 Define type scale tokens (display 36px, h1 24px, h2 20px, h3 18px, body 15px, small 13px, micro 12px)

- [x] Task 4: Initialize shadcn/ui (AC: #2)
  - [x] 4.1 Run `pnpm dlx shadcn@latest init -t next --rtl`
  - [x] 4.2 Configure `components.json` with new-york style, blank tailwind.config, RTL enabled
  - [x] 4.3 Override shadcn CSS variables in `:root` with Shefa palette values
  - [x] 4.4 Install base components: button, card, skeleton, separator, tooltip
  - [x] 4.5 Ensure skeleton component uses cream tones (`#F2EDE7`), never gray

- [x] Task 5: Configure next-intl (AC: #5)
  - [x] 5.1 Install next-intl, create `src/i18n/request.ts` with hardcoded `he-IL` locale
  - [x] 5.2 Create `src/messages/he.json` with initial structure (common, errors, app)
  - [x] 5.3 Wrap root layout with `NextIntlClientProvider`
  - [x] 5.4 Configure `next.config.ts` with `createNextIntlPlugin` wrapper
  - [x] 5.5 Create `src/global.d.ts` with `AppConfig` type augmentation for strict typing

- [x] Task 6: Install all dependencies (AC: #8)
  - [x] 6.1 Install production deps: drizzle-orm, pg, next-auth@beta, @auth/drizzle-adapter, next-intl, @paralleldrive/cuid2, zod, react-hook-form, @hookform/resolvers
  - [x] 6.2 Install dev deps: drizzle-kit, @types/pg, vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/dom, @testing-library/jest-dom, vite-tsconfig-paths, jsdom
  - [x] 6.3 Create `vitest.config.mts` with jsdom environment, react plugin, tsconfigPaths

- [x] Task 7: Create route segment shells (AC: #6, #7)
  - [x] 7.1 Create `(auth)/layout.tsx` — centered auth layout, cream background
  - [x] 7.2 Create `(auth)/sign-in/page.tsx` — placeholder sign-in page
  - [x] 7.3 Create `(app)/layout.tsx` — authenticated app shell (placeholder)
  - [x] 7.4 Create `(app)/(dashboard)/page.tsx` — dashboard placeholder
  - [x] 7.5 Create `loading.tsx` for each route segment with cream skeleton
  - [x] 7.6 Create `error.tsx` for each route segment with Hebrew error message and retry button
  - [x] 7.7 Create `src/lib/utils.ts` with `cn()` utility function

- [x] Task 8: Create project infrastructure files
  - [x] 8.1 Create `.env.example` with all required environment variable keys
  - [x] 8.2 Create `drizzle.config.ts` (PostgreSQL dialect, schema path, migrations path)
  - [x] 8.3 Create `src/db/index.ts` — Drizzle instance placeholder (connection via DATABASE_URL)
  - [x] 8.4 Create `src/types/index.ts` — `ActionResult<T>` type definition
  - [x] 8.5 Create `src/lib/money.ts` — `toAgorot()`, `fromAgorot()`, `formatILS()`, `calculateVat()` utility functions
  - [x] 8.6 Create `src/lib/money.test.ts` — comprehensive integer math tests (ZERO TOLERANCE)

- [x] Task 9: Verify and test
  - [x] 9.1 Run `pnpm dev` — confirm app loads with RTL layout, cream background, Heebo font
  - [x] 9.2 Run `pnpm test` — confirm money utility tests pass
  - [x] 9.3 Run `pnpm build` — confirm production build succeeds
  - [x] 9.4 Verify no hardcoded Hebrew text (all from he.json)
  - [x] 9.5 Verify CSS logical properties used everywhere (no `margin-left`, `padding-right`, etc.)

## Dev Notes

### CRITICAL: Architecture Updates from Web Research (March 2026)

The architecture document was written with some assumptions that have since changed. The following updates are **mandatory**:

#### 1. Tailwind CSS v4 (NOT v3)

Tailwind CSS v4.2.1 is the current stable release. **There is NO `tailwind.config.ts` file.** Configuration is CSS-first:

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Shefa Living Room Palette */
  --cream: #FAF8F5;
  --cream-dark: #F2EDE7;
  --cream-darker: #E8E0D6;
  --gold: #C4954A;
  --gold-light: #D4AD6E;
  --gold-dark: #A67B35;
  --gold-subtle: #F5EDD8;
  --text-primary: #2C2520;
  --text-secondary: #8A7E72;
  --text-tertiary: #B5A99B;

  /* Status Colors */
  --status-green: #4A8C6F;
  --status-green-bg: #EDF5F0;
  --status-amber: #C48B2C;
  --status-amber-bg: #FDF3E0;
  --status-red: #B5544A;
  --status-red-bg: #FAEDEB;

  /* shadcn/ui semantic mappings */
  --background: #FAF8F5;
  --foreground: #2C2520;
  --card: #F2EDE7;
  --card-foreground: #2C2520;
  --popover: #F2EDE7;
  --popover-foreground: #2C2520;
  --primary: #C4954A;
  --primary-foreground: #FAF8F5;
  --secondary: #F2EDE7;
  --secondary-foreground: #2C2520;
  --muted: #F2EDE7;
  --muted-foreground: #8A7E72;
  --accent: #F2EDE7;
  --accent-foreground: #2C2520;
  --destructive: #B5544A;
  --destructive-foreground: #FAF8F5;
  --border: #E8E0D6;
  --input: #E8E0D6;
  --ring: #C4954A;
  --radius: 0.75rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Shefa custom colors */
  --color-cream: var(--cream);
  --color-cream-dark: var(--cream-dark);
  --color-cream-darker: var(--cream-darker);
  --color-gold: var(--gold);
  --color-gold-light: var(--gold-light);
  --color-gold-dark: var(--gold-dark);
  --color-gold-subtle: var(--gold-subtle);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  --color-status-green: var(--status-green);
  --color-status-green-bg: var(--status-green-bg);
  --color-status-amber: var(--status-amber);
  --color-status-amber-bg: var(--status-amber-bg);
  --color-status-red: var(--status-red);
  --color-status-red-bg: var(--status-red-bg);

  /* Radius tokens */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* Font mapping */
  --font-sans: var(--font-heebo);
  --font-mono: var(--font-ibm-plex-mono);
}
```

**Key v4 differences:**
- No `tailwind.config.ts` — all configuration in CSS via `@theme`
- `@theme inline` for runtime CSS variable resolution (essential for theming)
- `tw-animate-css` replaces deprecated `tailwindcss-animate`
- Logical RTL properties built-in: `ps-4`, `pe-4`, `ms-4`, `me-4`, `start-0`, `end-0`
- Automatic content detection — no `content` array needed

#### 2. shadcn/ui Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- `tailwind.config` must be **blank** (`""`) for Tailwind v4
- Style: `"new-york"` (the `"default"` style is deprecated)
- Init command: `pnpm dlx shadcn@latest init -t next --rtl`
- The `--rtl` flag auto-transforms physical CSS classes to logical equivalents

#### 3. next-intl v4 Setup (Single Locale, No Routing)

For a single locale (`he-IL`) without URL prefix:

**`src/i18n/request.ts`:**
```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  return {
    locale: 'he-IL',
    messages: (await import('../../messages/he.json')).default,
  };
});
```

**`src/global.d.ts`:**
```typescript
import messages from '../messages/he.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'he-IL';
    Messages: typeof messages;
  }
}
```

**`next.config.ts`:**
```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // security headers, etc.
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

- **No middleware.ts needed** for single locale
- **No `[locale]` folder** in app directory
- `NextIntlClientProvider` required in root layout (wraps children)
- Use `useTranslations()` in components, `getTranslations()` in async Server Components

#### 4. Auth.js v5 — Important Status Note

Auth.js v5 **never left beta** (latest: `5.0.0-beta.26`). The project has been absorbed by Better Auth. However:
- It still receives security patches
- Many teams have shipped with it successfully in production
- The architecture specifies Auth.js v5, so we proceed with it

Install: `pnpm add next-auth@beta @auth/drizzle-adapter`

**Note for future stories (1.3):** The dev should evaluate Better Auth as an alternative if Auth.js v5 issues arise during implementation. For Story 1.1, we only install the package — no auth configuration happens here.

#### 5. Drizzle ORM Updates

- **`drizzle-zod` is deprecated.** Use `drizzle-orm/zod` instead:
  ```typescript
  import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
  ```
- **Simplified connection:**
  ```typescript
  import { drizzle } from 'drizzle-orm/node-postgres';
  const db = drizzle(process.env.DATABASE_URL!);
  ```
- **CUID2 package:** `@paralleldrive/cuid2` (not `cuid2`)
  ```typescript
  import { createId } from '@paralleldrive/cuid2';
  ```

#### 6. Next.js 15 Async APIs

In Next.js 15, several APIs are now async:
```typescript
// cookies, headers, params, searchParams are all async
const cookieStore = await cookies();
const headersList = await headers();
const { slug } = await params;  // in page.tsx
const { q } = await searchParams;  // in page.tsx
```

#### 7. Vitest 4 Configuration

```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
});
```

### Project Structure (Story 1.1 Scope Only)

Files to create in this story:

```
trustegy-fo/
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── vitest.config.mts
├── components.json
├── public/
│   └── (empty, ready for Shefa assets)
├── messages/
│   └── he.json
└── src/
    ├── global.d.ts
    ├── i18n/
    │   └── request.ts
    ├── app/
    │   ├── globals.css              # Tailwind v4 + Shefa design tokens
    │   ├── layout.tsx               # Root: <html dir="rtl" lang="he">, fonts, providers
    │   ├── (auth)/
    │   │   ├── layout.tsx           # Centered auth layout
    │   │   └── sign-in/
    │   │       ├── page.tsx         # Placeholder sign-in
    │   │       ├── loading.tsx
    │   │       └── error.tsx
    │   └── (app)/
    │       ├── layout.tsx           # App shell placeholder
    │       └── (dashboard)/
    │           ├── page.tsx         # Dashboard placeholder
    │           ├── loading.tsx
    │           └── error.tsx
    ├── components/
    │   ├── ui/                      # shadcn components (installed via CLI)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── separator.tsx
    │   │   └── tooltip.tsx
    │   └── layout/
    │       └── Providers.tsx        # NextIntlClientProvider wrapper
    ├── db/
    │   └── index.ts                 # Drizzle instance placeholder
    ├── lib/
    │   ├── utils.ts                 # cn() utility
    │   ├── money.ts                 # Integer agorot math utilities
    │   └── money.test.ts            # Money math tests (CRITICAL)
    └── types/
        └── index.ts                 # ActionResult<T>
```

### Architecture Compliance

| Requirement | Implementation |
|---|---|
| Framework | Next.js 15.5.12, App Router, TypeScript strict, pnpm |
| Styling | Tailwind CSS v4 (`@theme` in CSS) + shadcn/ui (new-york, --rtl) |
| RTL | `dir="rtl"` on `<html>`, CSS logical properties only (`ps-*`, `pe-*`, `ms-*`, `me-*`) |
| Typography | Heebo (sans via `next/font`), IBM Plex Mono (mono via `next/font`) |
| i18n | next-intl v4, single locale `he-IL`, no middleware, no routing prefix |
| Design Tokens | CSS variables in `:root` + `@theme inline` mapping |
| Spacing | 4px base unit system |
| Component Library | shadcn/ui with Shefa palette override |
| Color System | Cream `#FAF8F5`, Gold `#C4954A`, Status green/amber/red (muted on cream) |

### Library & Framework Requirements (Exact Versions)

| Package | Version | Purpose |
|---|---|---|
| next | 15.5.12 | Framework (App Router, RSC, SSR) |
| react / react-dom | 19.x (bundled) | UI library |
| typescript | 5.x (bundled) | Type safety |
| tailwindcss | 4.2.x (bundled) | Styling (CSS-first) |
| tw-animate-css | latest | Animation utilities for shadcn |
| next-intl | ^4.8 | i18n (Hebrew strings, no routing) |
| drizzle-orm | ^0.45 | Database ORM (PostgreSQL) |
| pg | ^8.x | PostgreSQL driver |
| next-auth | 5.0.0-beta.x | Auth framework (install only, configure in 1.3) |
| @auth/drizzle-adapter | ^1.11 | Drizzle adapter for Auth.js (install only) |
| @paralleldrive/cuid2 | ^2.x | Primary key generation |
| zod | ^3.x | Schema validation |
| react-hook-form | ^7.x | Form handling |
| @hookform/resolvers | ^3.x | Zod resolver for react-hook-form |
| **Dev Dependencies** | | |
| drizzle-kit | ^0.31 | Database migrations CLI |
| @types/pg | latest | PostgreSQL types |
| vitest | ^4.0 | Test runner |
| @vitejs/plugin-react | latest | React support for Vitest |
| @testing-library/react | latest | Component testing |
| @testing-library/dom | latest | DOM testing utilities |
| @testing-library/jest-dom | latest | Custom Jest matchers |
| vite-tsconfig-paths | latest | Path alias support (`@/*`) |
| jsdom | latest | DOM environment for Vitest |

### File Structure Requirements

**Naming Conventions:**
- React components: `PascalCase.tsx` (e.g., `Providers.tsx`)
- Pages/layouts: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Utilities: `camelCase.ts` (e.g., `money.ts`, `utils.ts`)
- Tests: co-located `*.test.ts` (e.g., `money.test.ts` next to `money.ts`)
- Types: `camelCase.ts` in `src/types/`
- CSS: only `globals.css` — no CSS modules, no styled-components
- Imports: always use `@/*` alias (e.g., `import { cn } from "@/lib/utils"`)

**Route Group Pattern:**
- `(auth)` — public auth routes (no sidebar, centered layout)
- `(app)` — authenticated routes (sidebar + main content)
- `(dashboard)` — dashboard module within `(app)`
- `_components/` prefix for route-private components (underscore = private to route)

### Testing Requirements

**For Story 1.1, test coverage focuses on:**

1. **Money Utilities (`src/lib/money.test.ts`)** — ZERO TOLERANCE for errors:
   - `toAgorot(10.54)` → `1054`
   - `toAgorot(1054975)` → `105497500`
   - `fromAgorot(105497500)` → `1054975`
   - `formatILS(105497500)` → `"₪1,054,975.00"` (Hebrew locale formatting)
   - `calculateVat(100000, 1700)` → `17000` (17% VAT on ₪1,000 = ₪170)
   - `calculateVat(99999, 1700)` → `16999` (floor, never round up)
   - Edge cases: zero, negative amounts, large numbers, boundary values

2. **Build Verification:**
   - `pnpm build` succeeds without errors
   - `pnpm dev` loads with RTL layout

### Money Utility Implementation Guide

```typescript
// src/lib/money.ts

/**
 * Converts ILS amount to agorot (integer).
 * Example: toAgorot(1054975) → 105497500
 */
export function toAgorot(ils: number): number {
  return Math.round(ils * 100);
}

/**
 * Converts agorot to ILS for display.
 * Example: fromAgorot(105497500) → 1054975
 */
export function fromAgorot(agorot: number): number {
  return agorot / 100;
}

/**
 * Formats agorot as ILS currency string.
 * Example: formatILS(105497500) → "₪1,054,975.00"
 */
export function formatILS(agorot: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromAgorot(agorot));
}

/**
 * Calculates VAT amount in agorot using integer math.
 * vatRateBp is in basis points (17% = 1700).
 * Uses floor (truncate) — never rounds up.
 * Example: calculateVat(100000, 1700) → 17000
 */
export function calculateVat(baseAgorot: number, vatRateBp: number): number {
  return Math.floor(baseAgorot * vatRateBp / 10000);
}
```

### ActionResult<T> Type Definition

```typescript
// src/types/index.ts

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } };
```

### Environment Variables (.env.example)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trustegy_fo

# Auth.js
AUTH_SECRET=           # Generate: npx auth secret
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ISSUER=

# AI (Shefa)
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Security Headers (next.config.ts)

```typescript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];
```

### Loading Skeleton Pattern

All `loading.tsx` files must use cream-toned skeletons:
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <Skeleton className="h-8 w-64 bg-cream-dark" />
      <div className="flex gap-5">
        <Skeleton className="h-40 w-full bg-cream-dark rounded-xl" />
        <Skeleton className="h-40 w-full bg-cream-dark rounded-xl" />
        <Skeleton className="h-40 w-full bg-cream-dark rounded-xl" />
      </div>
    </div>
  );
}
```

### Error Boundary Pattern

All `error.tsx` files must:
- Use `"use client"` directive
- Show Hebrew error message from next-intl
- Include retry button
- Never show raw stack traces

```tsx
"use client";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-text-secondary text-body">{t("genericError")}</p>
      <button
        onClick={reset}
        className="bg-gold text-cream px-4 py-2 rounded-lg hover:bg-gold-dark"
      >
        {t("retry")}
      </button>
    </div>
  );
}
```

### Hebrew Strings Structure (messages/he.json)

```json
{
  "app": {
    "name": "שפע",
    "tagline": "המרכז הפיננסי שלך"
  },
  "common": {
    "save": "שמור",
    "cancel": "ביטול",
    "delete": "מחק",
    "edit": "ערוך",
    "add": "הוסף",
    "search": "חיפוש",
    "loading": "טוען...",
    "noData": "אין נתונים להצגה"
  },
  "errors": {
    "genericError": "משהו השתבש. נסה שוב.",
    "retry": "נסה שוב",
    "networkError": "לא ניתן להתחבר לשרת",
    "unauthorized": "נדרשת התחברות"
  },
  "auth": {
    "signIn": "התחברות",
    "signOut": "התנתקות",
    "signInWith": "התחבר עם {provider}"
  },
  "dashboard": {
    "greeting": "בוקר טוב",
    "title": "סקירה כללית"
  }
}
```

### What This Story Does NOT Include

Explicitly **out of scope** for Story 1.1:
- No database schema creation (Story 1.3)
- No Auth.js configuration (Story 1.3)
- No middleware route protection (Story 1.3)
- No sidebar navigation (Story 1.2)
- No Shefa character assets (Story 3.2)
- No actual dashboard data (Story 2.1)
- No entity management (Story 1.7)
- No dark mode (Phase 2)
- No responsive/mobile layout (never — desktop only)

### Cross-Story Context (Epic 1)

This story establishes the foundation for all subsequent stories:
- **Story 1.2** will use the design system to build the dark sidebar (56px collapsed, 220px expanded)
- **Story 1.3** will configure Auth.js using the installed packages and create the database schema
- **Story 1.4** will define `ActionResult<T>` patterns for server actions (type already created here)
- **Story 1.6** will use `money.ts` utilities for entity seed data
- **Story 1.8** will use the audit trail infrastructure built on the patterns established here

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Technical Stack, Project Structure, Design System]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Color Palette, Typography, Spacing, RTL, Status Semantics]
- [Source: _bmad-output/planning-artifacts/prd.md — FR1, FR5, FR9, FR58, FR59, NFR1-6, NFR27-30]
- [Web Research: Next.js 15.5.12 latest stable, security patches required ≥15.5.10]
- [Web Research: Tailwind CSS v4.2.1 — CSS-first configuration, @theme directive]
- [Web Research: shadcn/ui — RTL flag, new-york style, tw-animate-css]
- [Web Research: next-intl v4.8.3 — AppConfig type augmentation, no middleware for single locale]
- [Web Research: Auth.js v5 beta.26 — joined Better Auth, still receives security patches]
- [Web Research: Drizzle ORM v0.45.1 — drizzle-zod deprecated, use drizzle-orm/zod]
- [Web Research: Vitest 4.0.18 — vite-tsconfig-paths for @/* aliases, jsdom environment]
- [Web Research: @paralleldrive/cuid2 — correct package name for CUID2]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build initially failed due to missing `class-variance-authority` package (shadcn/ui dependency not auto-installed). Fixed by adding it explicitly.
- ESLint warnings for unused `error` parameter in error boundary components — resolved by removing destructured variable (Next.js still passes it via the type signature).
- Hardcoded Hebrew found in `layout.tsx` metadata and `sign-in/page.tsx` — refactored to use `getTranslations()` / `generateMetadata()`.

### Completion Notes List

- ✅ Next.js 15.5.12 initialized with TypeScript strict, App Router, src directory, Turbopack
- ✅ Tailwind CSS v4.2.1 configured with full Shefa palette via CSS-first `@theme inline` — no tailwind.config.ts
- ✅ shadcn/ui initialized with new-york style, RTL support, 5 base components (button, card, skeleton, separator, tooltip)
- ✅ Typography system: Heebo (Hebrew sans-serif) + IBM Plex Mono (financial numbers) via next/font
- ✅ 4px spacing system configured via `--spacing: 4px`
- ✅ Shadow tokens (warm-toned rgba(44,37,32,x)), radius tokens, animation tokens with reduced-motion fallbacks
- ✅ next-intl v4.8.3 configured for single locale he-IL — no middleware, no [locale] routing
- ✅ All Hebrew strings in `messages/he.json` — zero hardcoded Hebrew in source files (verified via grep)
- ✅ Route segments: (auth)/sign-in and (app)/(dashboard) with loading.tsx skeletons (cream tones) and error.tsx boundaries (Hebrew via next-intl)
- ✅ Money utilities with integer agorot math — 21 tests, all passing, ZERO TOLERANCE
- ✅ ActionResult<T> type, Drizzle db placeholder, .env.example, drizzle.config.ts
- ✅ Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, X-DNS-Prefetch-Control
- ✅ CSS logical properties only — no margin-left/padding-right anywhere (verified via grep)
- ✅ `pnpm build` succeeds with zero errors, zero warnings
- ✅ `pnpm test` passes all 21 tests

### File List

**New files created:**
- `.env.example` — environment variable template
- `components.json` — shadcn/ui configuration
- `drizzle.config.ts` — Drizzle ORM config (PostgreSQL)
- `vitest.config.mts` — Vitest config with jsdom, react plugin, tsconfig paths
- `messages/he.json` — Hebrew translation strings
- `src/global.d.ts` — next-intl AppConfig type augmentation
- `src/i18n/request.ts` — next-intl request config (he-IL locale)
- `src/components/layout/Providers.tsx` — NextIntlClientProvider + TooltipProvider wrapper
- `src/components/ui/button.tsx` — shadcn button component
- `src/components/ui/card.tsx` — shadcn card component
- `src/components/ui/skeleton.tsx` — shadcn skeleton component (cream tones)
- `src/components/ui/separator.tsx` — shadcn separator component
- `src/components/ui/tooltip.tsx` — shadcn tooltip component
- `src/db/index.ts` — Drizzle instance placeholder
- `src/lib/utils.ts` — cn() utility (clsx + tailwind-merge)
- `src/lib/money.ts` — Integer agorot math utilities (toAgorot, fromAgorot, formatILS, calculateVat)
- `src/lib/money.test.ts` — 21 comprehensive money math tests
- `src/types/index.ts` — ActionResult<T> type definition
- `src/app/(auth)/layout.tsx` — centered auth layout
- `src/app/(auth)/sign-in/page.tsx` — placeholder sign-in page
- `src/app/(auth)/sign-in/loading.tsx` — cream skeleton loading
- `src/app/(auth)/sign-in/error.tsx` — Hebrew error boundary with retry
- `src/app/(app)/layout.tsx` — authenticated app shell placeholder
- `src/app/(app)/(dashboard)/page.tsx` — dashboard placeholder
- `src/app/(app)/(dashboard)/loading.tsx` — cream skeleton loading
- `src/app/(app)/(dashboard)/error.tsx` — Hebrew error boundary with retry

**Modified files:**
- `package.json` — name, scripts (test, test:watch), all dependencies, pnpm.onlyBuiltDependencies
- `next.config.ts` — security headers + next-intl plugin
- `src/app/globals.css` — complete Shefa design system (palette, tokens, animations)
- `src/app/layout.tsx` — RTL, Hebrew, Heebo/IBM Plex Mono fonts, Providers wrapper

**Deleted files:**
- `src/app/page.tsx` — default Next.js page (replaced by route groups)
- `README.md` — default create-next-app readme

### Change Log

- 2026-03-10: Story 1.1 implemented — full project initialization with Shefa design system, all 9 tasks complete, 21 tests passing
