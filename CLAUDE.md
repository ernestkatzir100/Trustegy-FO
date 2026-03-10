# CLAUDE.md — Trustegy-FO (Shefa Investments)

## Project Overview
Shefa Investments (rebrand of Trustegy Family Office) — a family office management platform for alternative investments, P2P/marketplace lending, and portfolio management. Built for Israeli financial market context.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Radix UI, Lucide icons, shadcn/ui (CVA + clsx + tailwind-merge)
- **Auth:** NextAuth v5 (beta), with TOTP/2FA (oslo/otp, qrcode)
- **Database:** PostgreSQL (Railway), Drizzle ORM, Drizzle-Zod for validation
- **i18n:** next-intl (Hebrew RTL + English)
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest + Testing Library
- **Package Manager:** pnpm
- **Deployment:** Railway (auto-deploy from GitHub main branch)

## Project Structure
```
src/
├── app/          # Next.js App Router pages and API routes
├── components/   # Shared UI components
├── db/           # Drizzle schema, migrations, seeds
├── i18n/         # Internationalization (en/he)
├── lib/          # Utilities, helpers
├── middleware.ts  # Auth + i18n middleware
└── types/        # TypeScript type definitions
```

## Key Commands
```bash
pnpm dev              # Run locally
pnpm build            # Production build
pnpm test             # Run tests
pnpm db:push          # Push schema to DB
pnpm db:generate      # Generate migrations
pnpm db:seed          # Seed database
railway run pnpm dev  # Run with Railway env vars
```

## Development Rules

### RTL / i18n
- This is a bilingual app (Hebrew + English). Hebrew is RTL.
- Always use logical CSS properties: `ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`
- NEVER use `pl-`, `pr-`, `ml-`, `mr-`, `text-left`, `text-right`, `float-left`, `float-right`
- All user-facing strings must go through next-intl translation keys

### Database
- Use Drizzle ORM for all DB operations
- Schema changes: edit schema → `pnpm db:generate` → `pnpm db:push`
- Validate inputs with Drizzle-Zod schemas

### Auth
- NextAuth v5 beta handles sessions
- 2FA with TOTP (QR code setup)
- Protect all routes via middleware

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Server Components by default, `"use client"` only when needed
- Server Actions for mutations (src/app/actions/)

### Deployment
- Push to `main` → Railway auto-deploys
- Environment variables managed in Railway dashboard
- Never commit .env files

## Business Context
- **Owner:** Ernest Katzir, CEO of Pineapple Fund
- **Target users:** Family office managers, alternative investment professionals
- **Regulatory context:** Israeli financial market, ISA regulations
- **BMAD Method:** Project uses BMAD for structured development workflow
