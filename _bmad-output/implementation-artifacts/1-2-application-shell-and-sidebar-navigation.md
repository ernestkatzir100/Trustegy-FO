# Story 1.2: Application Shell & Sidebar Navigation

Status: review

## Story

As the owner,
I want a dark sidebar that collapses to 56px and expands on hover, with module navigation that switches content without full page reloads,
So that I can move between modules quickly in a clean, Claude-desktop-inspired layout.

## Acceptance Criteria (BDD)

1. **Given** the design system from Story 1.1 is in place
   **When** the owner views the application
   **Then** a dark sidebar navigation is rendered at 56px width (collapsed) with icons for each module

2. **And** hovering over the sidebar expands it to 220px showing module labels

3. **And** clicking a module switches the main content area via Next.js route groups without a full page reload feel

4. **And** the layout enforces a minimum viewport of 1280px (desktop-only)

5. **And** content loads with a fade-in animation (300ms ease)

6. **And** security headers are configured in `next.config.ts` (CSP, X-Frame-Options, X-Content-Type-Options)

7. **And** a health check endpoint exists at `/api/health` returning status 200

8. **And** an `.env.example` template documents all required environment variables

## Tasks / Subtasks

- [x] Task 1: Build Sidebar component (AC: #1, #2)
  - [x] 1.1 Create `src/components/layout/Sidebar.tsx` as Client Component (`"use client"`)
  - [x] 1.2 Implement collapsed state: 56px width, centered 40x40px icon buttons
  - [x] 1.3 Implement expanded state: 220px width on hover, labels appear inline with icons
  - [x] 1.4 Background: `#2C2520` (var(--text-primary)), warm near-black
  - [x] 1.5 Add `width 200ms ease` transition, respect `prefers-reduced-motion`
  - [x] 1.6 Position: fixed, full viewport height, z-index 100
  - [x] 1.7 Use CSS logical properties throughout (no physical left/right)

- [x] Task 2: Build SidebarItem component (AC: #1, #2, #3)
  - [x] 2.1 Create `src/components/layout/SidebarItem.tsx` as Client Component
  - [x] 2.2 Render emoji icon (18px) + label (13px, Heebo, weight 500)
  - [x] 2.3 Active state: gold background (`#C4954A`), cream text (`#FAF8F5`)
  - [x] 2.4 Default state: transparent bg, icon color `#E8E0D6`
  - [x] 2.5 Hover state: `rgba(255,255,255,0.08)` background, 150ms transition
  - [x] 2.6 Use Next.js `<Link>` for route navigation
  - [x] 2.7 Use `usePathname()` to detect active module
  - [x] 2.8 Focus ring: 2px gold, 2px offset (keyboard navigation)
  - [x] 2.9 Minimum click target: 44x44px (WCAG)

- [x] Task 3: Build AppShell component (AC: #4, #5)
  - [x] 3.1 Create `src/components/layout/AppShell.tsx`
  - [x] 3.2 Main content area: `flex: 1`, max-width 1120px, centered
  - [x] 3.3 Padding: 32px top/bottom, 40px left/right (via logical properties)
  - [x] 3.4 `overflow-y: auto` (scrolls vertically, never horizontal)
  - [x] 3.5 Add fade-in animation (300ms ease) on content
  - [x] 3.6 Add `prefers-reduced-motion` fallback (instant render)

- [x] Task 4: Build ShefaPanel placeholder (AC: #1)
  - [x] 4.1 Create `src/components/layout/ShefaPanel.tsx` as Client Component
  - [x] 4.2 Render 52px circle trigger button at bottom-left corner (fixed position)
  - [x] 4.3 Show 🐕 emoji in gold-subtle background (`#F5EDD8`)
  - [x] 4.4 Click handler: placeholder (full chat in Story 3.1)
  - [x] 4.5 Position: fixed, bottom 24px, inset-inline-start 72px (clears sidebar)

- [x] Task 5: Upgrade (app)/layout.tsx to full app shell (AC: #1, #3)
  - [x] 5.1 Replace placeholder layout with Sidebar + AppShell + ShefaPanel composition
  - [x] 5.2 Layout: flex row (sidebar fixed, main content fills remaining space)
  - [x] 5.3 Main content offset by 56px (sidebar collapsed width) using `margin-inline-start`
  - [x] 5.4 Wrap with Providers (NextIntlClientProvider already from 1.1)

- [x] Task 6: Create module route placeholders (AC: #3)
  - [x] 6.1 Create `(app)/consulting/page.tsx` with placeholder content
  - [x] 6.2 Create `(app)/loans/page.tsx` with placeholder content
  - [x] 6.3 Create `(app)/expenses/page.tsx` with placeholder content
  - [x] 6.4 Create `(app)/marketplace/page.tsx` with placeholder content
  - [x] 6.5 Create `(app)/migration/page.tsx` with placeholder content
  - [x] 6.6 Add `loading.tsx` and `error.tsx` for each new route
  - [x] 6.7 Each placeholder shows module name from `he.json` with cream background

- [x] Task 7: Create health check endpoint (AC: #7)
  - [x] 7.1 Create `src/app/api/health/route.ts`
  - [x] 7.2 Return JSON: `{ status: "ok", timestamp, version: "0.1.0" }`
  - [x] 7.3 No auth check required (public endpoint for Railway monitoring)

- [x] Task 8: Add viewport enforcement (AC: #4)
  - [x] 8.1 Add viewport meta tag if not already in root layout
  - [x] 8.2 Add soft warning banner for viewports below 1280px (CSS `@media`)
  - [x] 8.3 Warning text in Hebrew from `he.json`

- [x] Task 9: Add sidebar navigation strings to he.json (AC: #1)
  - [x] 9.1 Add `sidebar.dashboard`: "לוח בקרה"
  - [x] 9.2 Add `sidebar.consulting`: "ייעוץ"
  - [x] 9.3 Add `sidebar.loans`: "הלוואות"
  - [x] 9.4 Add `sidebar.expenses`: "הוצאות"
  - [x] 9.5 Add `sidebar.marketplace`: "מרקטפלייס"
  - [x] 9.6 Add `sidebar.migration`: "ייבוא נתונים"
  - [x] 9.7 Add `viewport.warning`: viewport warning text

- [x] Task 10: Verify and test (AC: all)
  - [x] 10.1 Run `pnpm dev` — confirm sidebar renders at 56px, expands on hover
  - [x] 10.2 Click each module icon — content area swaps, URL updates
  - [x] 10.3 Tab through sidebar items — gold focus ring visible
  - [x] 10.4 Verify health check: `curl localhost:3000/api/health` returns 200
  - [x] 10.5 Run `pnpm build` — no errors
  - [x] 10.6 Verify RTL: sidebar visually on left, content flows right-to-left

## Dev Notes

### CRITICAL: Build on Story 1.1 Foundation

Story 1.1 already created:
- Root `layout.tsx` with `<html dir="rtl" lang="he">`, fonts, Providers
- `globals.css` with full Shefa palette via Tailwind v4 `@theme` / `@theme inline`
- `(auth)/layout.tsx` and `(auth)/sign-in/page.tsx`
- `(app)/layout.tsx` (placeholder — upgrade this)
- `(app)/(dashboard)/page.tsx` with loading.tsx and error.tsx
- `components/layout/Providers.tsx` (NextIntlClientProvider)
- `components/ui/` shadcn components (button, card, skeleton, separator, tooltip)
- `lib/utils.ts` with `cn()` utility
- `messages/he.json` with base strings
- `next.config.ts` with security headers and `createNextIntlPlugin`
- `.env.example`
- All dependencies installed

**DO NOT recreate or duplicate any of the above.** Extend what exists.

### Sidebar Component Architecture

```tsx
// src/components/layout/Sidebar.tsx
"use client";

// Structure:
// - Fixed position, full height, z-index 100
// - State: isExpanded (boolean, driven by onMouseEnter/onMouseLeave)
// - Background: bg-text-primary (#2C2520)
// - Width transition: 56px ↔ 220px, 200ms ease
// - Contains: array of SidebarItem components
// - Rendered in (app)/layout.tsx

// Navigation items configuration:
const NAV_ITEMS = [
  { icon: "📊", labelKey: "sidebar.dashboard", href: "/" },
  { icon: "💼", labelKey: "sidebar.consulting", href: "/consulting" },
  { icon: "🏦", labelKey: "sidebar.loans", href: "/loans" },
  { icon: "📑", labelKey: "sidebar.expenses", href: "/expenses" },
  { icon: "🏪", labelKey: "sidebar.marketplace", href: "/marketplace" },
];
```

### SidebarItem Component Specs

```tsx
// src/components/layout/SidebarItem.tsx
"use client";

// Props: { icon: string, labelKey: string, href: string, isExpanded: boolean }
// - Uses next/link for client-side navigation
// - Uses usePathname() to determine active state
// - Active detection: pathname.startsWith(href) (except "/" which is exact match)
//
// Visual states:
// DEFAULT:  bg-transparent, icon #E8E0D6, label #F2EDE7
// HOVER:    bg-[rgba(255,255,255,0.08)], same icon/label colors
// ACTIVE:   bg-gold (#C4954A), icon #FAF8F5, label #FAF8F5
// FOCUS:    ring-2 ring-gold ring-offset-2 ring-offset-text-primary
//
// Icon: 18px font-size, flex-shrink-0, centered in 40x40px area
// Label: 13px (small), weight 500, Heebo, white-space nowrap
// Label visibility: hidden when collapsed, visible when expanded
// Gap: 12px between icon and label (when expanded)
// Border-radius: 8px (rounded square)
// Min height: 44px (WCAG touch target)
```

### App Shell Layout Pattern

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Dark sidebar (56px)  │   Cream content area (flex: 1)          │
│  ┌──────┐             │   max-width: 1120px, centered           │
│  │ 📊   │ ← gold bg   │   padding: 32px 40px                    │
│  │ 💼   │              │                                         │
│  │ 🏦   │              │   {children} ← route group content      │
│  │ 📑   │              │                                         │
│  │ 🏪   │              │                                         │
│  │      │              │                                         │
│  │      │              │                                         │
│  │      │              │                                         │
│  └──────┘              │                                         │
│  🐕 trigger (52px)     │                                         │
│  (bottom-left)         │                                         │
└──────────────────────────────────────────────────────────────────┘

Sidebar: fixed, #2C2520
Content: scrollable, #FAF8F5, margin-inline-start: 56px
Shefa trigger: fixed, bottom-24px, inset-inline-start: 72px
```

### CSS Implementation Details

**Sidebar width transition (Tailwind v4):**
```css
/* In globals.css — add to existing @theme section if needed */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**RTL-safe positioning:**
```tsx
// Sidebar
className="fixed inset-block-0 inset-inline-start-0 z-[100]"

// Main content offset
className="ms-[56px]" // margin-inline-start: 56px

// Shefa trigger
className="fixed bottom-6 start-[72px]" // inset-inline-start
```

**Reduced motion:**
```tsx
// Apply to sidebar
className="transition-[width] duration-200 ease motion-reduce:transition-none"

// Apply to content fade-in
className="animate-[fade-in_300ms_ease] motion-reduce:animate-none"
```

### Route Mapping

| Sidebar Item | Icon | Hebrew | Route | Route Group |
|---|---|---|---|---|
| Dashboard | 📊 | לוח בקרה | `/` | `(app)/(dashboard)` |
| Consulting | 💼 | ייעוץ | `/consulting` | `(app)/(consulting)` |
| Loans | 🏦 | הלוואות | `/loans` | `(app)/(loans)` |
| Expenses | 📑 | הוצאות | `/expenses` | `(app)/(expenses)` |
| Marketplace | 🏪 | מרקטפלייס | `/marketplace` | `(app)/(marketplace)` |

**Not in sidebar (accessed via other paths):**
- Migration: `/migration` — accessed via dashboard or dedicated flow
- Settings: `/settings` — accessed from future settings icon/link

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
}
```

**Note:** Database connection check will be added in Story 1.3 when Drizzle is fully configured. For now, return a simple health response.

### Viewport Warning Implementation

```tsx
// Add to root layout.tsx or AppShell
// CSS-only approach using @media query:
<div className="hidden max-[1279px]:flex fixed inset-0 z-[200] bg-cream items-center justify-center p-10">
  <p className="text-text-secondary text-center text-body">
    {t("viewport.warning")}
  </p>
</div>
```

### Module Placeholder Pattern

Each module placeholder follows the same pattern:
```tsx
// src/app/(app)/(consulting)/page.tsx
import { useTranslations } from "next-intl";

export default function ConsultingPage() {
  const t = useTranslations("sidebar");
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <h1 className="text-h1 font-semibold text-text-primary">
        {t("consulting")}
      </h1>
    </div>
  );
}
```

Each also gets a `loading.tsx` (cream skeleton) and `error.tsx` (Hebrew error + retry) following the patterns from Story 1.1.

### Updated he.json Additions

Add to the existing `messages/he.json`:
```json
{
  "sidebar": {
    "dashboard": "לוח בקרה",
    "consulting": "ייעוץ",
    "loans": "הלוואות",
    "expenses": "הוצאות",
    "marketplace": "מרקטפלייס",
    "migration": "ייבוא נתונים"
  },
  "viewport": {
    "warning": "שפע מותאמת למסך רחב יותר. מומלץ רזולוציה של 1280 פיקסל לפחות."
  }
}
```

**IMPORTANT:** Merge into existing he.json — do NOT overwrite. The file already has `app`, `common`, `errors`, `auth`, `dashboard` sections from Story 1.1.

### Architecture Compliance

| Requirement | Implementation |
|---|---|
| Sidebar width | 56px collapsed, 220px expanded on hover |
| Sidebar background | `#2C2520` (var(--text-primary)) warm near-black |
| Active state | Gold bg `#C4954A`, cream text `#FAF8F5` |
| Expand animation | `width 200ms ease`, respects `prefers-reduced-motion` |
| Content area | `flex: 1`, max-width 1120px, centered, scrollable |
| RTL | CSS logical properties throughout (ps-*, pe-*, ms-*, me-*, start-*, end-*) |
| Accessibility | Tab navigation, 2px gold focus ring, 44px min targets, WCAG AA |
| Desktop only | 1280px minimum, soft warning below |
| Client Components | Sidebar.tsx, SidebarItem.tsx, ShefaPanel.tsx only |
| Server Components | AppShell.tsx, all page.tsx files |
| Navigation | Next.js `<Link>`, route groups, usePathname() for active state |
| i18n | All labels from he.json via useTranslations() |

### File Structure (Story 1.2 Additions)

Files to **create** (new):
```
src/
├── components/
│   └── layout/
│       ├── Sidebar.tsx          # NEW — dark sidebar (Client)
│       ├── SidebarItem.tsx      # NEW — nav item (Client)
│       ├── AppShell.tsx         # NEW — main content wrapper
│       └── ShefaPanel.tsx       # NEW — Shefa trigger placeholder (Client)
├── app/
│   ├── api/
│   │   └── health/
│   │       └── route.ts         # NEW — health check endpoint
│   └── (app)/
│       ├── (consulting)/
│       │   ├── page.tsx         # NEW — placeholder
│       │   ├── loading.tsx      # NEW
│       │   └── error.tsx        # NEW
│       ├── (loans)/
│       │   ├── page.tsx         # NEW — placeholder
│       │   ├── loading.tsx      # NEW
│       │   └── error.tsx        # NEW
│       ├── (expenses)/
│       │   ├── page.tsx         # NEW — placeholder
│       │   ├── loading.tsx      # NEW
│       │   └── error.tsx        # NEW
│       ├── (marketplace)/
│       │   ├── page.tsx         # NEW — placeholder
│       │   ├── loading.tsx      # NEW
│       │   └── error.tsx        # NEW
│       └── (migration)/
│           ├── page.tsx         # NEW — placeholder
│           ├── loading.tsx      # NEW
│           └── error.tsx        # NEW
```

Files to **modify** (existing):
```
src/app/(app)/layout.tsx         # UPGRADE — placeholder → full app shell with sidebar
messages/he.json                 # EXTEND — add sidebar.* and viewport.* keys
```

### What This Story Does NOT Include

- No auth configuration or middleware (Story 1.3)
- No database queries in health check (Story 1.3)
- No Shefa chat panel functionality (Story 3.1)
- No Shefa avatar SVG assets (Story 3.2)
- No actual module content (future stories per epic)
- No settings page (Story 8.3)
- No dark mode toggle
- No mobile responsive layout

### Previous Story Intelligence (Story 1.1)

Key patterns established in Story 1.1 that MUST be followed:
- **Tailwind v4:** CSS-first config via `@theme` in `globals.css` — no `tailwind.config.ts`
- **shadcn/ui:** new-york style, `--rtl` enabled, `components.json` with blank tailwind.config
- **next-intl v4:** `src/i18n/request.ts` with hardcoded `he-IL`, `NextIntlClientProvider` in root layout
- **RTL:** `dir="rtl"` on `<html>`, CSS logical properties only (`ps-*`, `me-*`, `start-*`)
- **Loading skeletons:** Cream tones (`bg-cream-dark`), never gray
- **Error boundaries:** `"use client"`, Hebrew messages from he.json, retry button
- **Imports:** Always `@/*` alias (e.g., `import { cn } from "@/lib/utils"`)
- **Components:** `src/components/ui/` for shadcn, `src/components/layout/` for app structure
- **No hardcoded Hebrew:** All text from `messages/he.json` via `useTranslations()`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — App Shell Layout, Sidebar, Route Groups, Health Check]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Sidebar Design (56px/220px), Navigation Items, Hover States, Animations, RTL]
- [Source: _bmad-output/implementation-artifacts/1-1-project-initialization-and-design-system.md — Previous Story Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md — FR58 (RTL), NFR1 (dashboard <3s), NFR2 (navigation <1s), NFR25 (health check), NFR27-30 (accessibility)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Route groups `(consulting)`, `(loans)`, etc. caused "parallel pages resolve to same path" error — fixed by using regular route folders instead (only `(dashboard)` stays as a route group since it maps to `/`)
- Type error in SidebarItem: `t(labelKey as keyof IntlMessages["sidebar"])` failed with next-intl's strict typing — fixed with explicit union type cast

### Completion Notes List

- ✅ Sidebar: 56px collapsed → 220px on hover, bg `#2C2520`, `width 200ms ease` transition with reduced-motion fallback
- ✅ SidebarItem: emoji icons (18px) + labels (13px), gold active state, hover `rgba(255,255,255,0.08)`, 2px gold focus ring, 44px min target (WCAG)
- ✅ AppShell: flex-1, max-width 1120px, centered, 300ms fade-in with reduced-motion fallback
- ✅ ShefaPanel: 52px circle trigger button, 🐕 emoji, gold-subtle bg, fixed bottom-left clearing sidebar
- ✅ App layout upgraded: Sidebar + AppShell + ShefaPanel composition, viewport warning for <1280px
- ✅ Module routes: `/consulting`, `/loans`, `/expenses`, `/marketplace`, `/migration` — each with loading.tsx (cream skeleton) and error.tsx (Hebrew + retry)
- ✅ Health check: `/api/health` returns `{ status: "ok", timestamp, version }` — public endpoint
- ✅ All navigation items use Next.js `<Link>` with `usePathname()` for active state detection
- ✅ RTL: CSS logical properties only (`inset-inline-start`, `ms-[56px]`, `start-[72px]`)
- ✅ All Hebrew strings from `he.json` — sidebar.*, viewport.*, modules.* sections added
- ✅ `pnpm build` clean (12 routes), `pnpm test` 21/21 pass, zero hardcoded Hebrew

### File List

**New files created:**
- `src/components/layout/Sidebar.tsx` — dark sidebar (Client Component, hover expand)
- `src/components/layout/SidebarItem.tsx` — nav item (Client Component, active detection)
- `src/components/layout/AppShell.tsx` — main content wrapper (Server Component)
- `src/components/layout/ShefaPanel.tsx` — Shefa trigger placeholder (Client Component)
- `src/app/api/health/route.ts` — health check endpoint
- `src/app/(app)/consulting/page.tsx` — consulting placeholder
- `src/app/(app)/consulting/loading.tsx` — consulting loading skeleton
- `src/app/(app)/consulting/error.tsx` — consulting error boundary
- `src/app/(app)/loans/page.tsx` — loans placeholder
- `src/app/(app)/loans/loading.tsx` — loans loading skeleton
- `src/app/(app)/loans/error.tsx` — loans error boundary
- `src/app/(app)/expenses/page.tsx` — expenses placeholder
- `src/app/(app)/expenses/loading.tsx` — expenses loading skeleton
- `src/app/(app)/expenses/error.tsx` — expenses error boundary
- `src/app/(app)/marketplace/page.tsx` — marketplace placeholder
- `src/app/(app)/marketplace/loading.tsx` — marketplace loading skeleton
- `src/app/(app)/marketplace/error.tsx` — marketplace error boundary
- `src/app/(app)/migration/page.tsx` — migration placeholder
- `src/app/(app)/migration/loading.tsx` — migration loading skeleton
- `src/app/(app)/migration/error.tsx` — migration error boundary

**Modified files:**
- `src/app/(app)/layout.tsx` — upgraded from placeholder to full Sidebar + AppShell + ShefaPanel + viewport warning
- `messages/he.json` — added sidebar.*, viewport.*, modules.* sections

### Change Log

- 2026-03-10: Story 1.2 implemented — app shell with dark sidebar, module navigation, health check, viewport enforcement
