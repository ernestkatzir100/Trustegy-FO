# Story 1.6: Entity Schema, Seed Data & Money Utilities

Status: done

## Story

As the owner,
I want the system to come pre-loaded with my three business entities and handle all money as integer agorot,
So that my financial data is accurate from day one with zero floating-point errors.

## Acceptance Criteria (BDD)

1. **Given** the database is initialized
   **When** the seed script runs
   **Then** 3 entities are created: Trustegy consulting, investment company, personal holdings

2. **And** sample tax categories are seeded from a predefined list

3. **And** the entities table uses CUID primary keys, created_at, updated_at, deleted_at columns

4. **And** all monetary columns are integer type (agorot = ILS x 100)

5. **And** a money utility library exists with: toAgorot, fromAgorot, formatILS, calculateVat — all integer arithmetic (NFR14)

6. **And** Zod schemas are generated from Drizzle schemas via drizzle-zod for form validation

7. **And** snake_case is used for database columns, camelCase for TypeScript code, PascalCase for components

## Tasks / Subtasks

- [x] Task 1: Create shared database column helpers (AC: #3)
  - [x] 1.1 Create `src/db/helpers.ts` with `id()` (CUID), `timestamps`, `softDelete` helpers
  - [x] 1.2 Uses @paralleldrive/cuid2 for collision-resistant IDs

- [x] Task 2: Create entities schema (AC: #3, #4, #7)
  - [x] 2.1 Create `src/db/schema/entities.ts` with `entities` table
  - [x] 2.2 Fields: id (CUID), name, description, owner_id, is_pre_seeded, timestamps, soft delete
  - [x] 2.3 Create `taxCategories` table with same pattern
  - [x] 2.4 Relations to users table
  - [x] 2.5 snake_case column names throughout

- [x] Task 3: Create schema index (AC: #7)
  - [x] 3.1 Create `src/db/schema/index.ts` re-exporting all schemas

- [x] Task 4: Create Zod validation schemas (AC: #6)
  - [x] 4.1 Create `src/lib/validations/entity.ts` with insert/update schemas via drizzle-zod
  - [x] 4.2 InsertEntitySchema, UpdateEntitySchema, InsertTaxCategorySchema
  - [x] 4.3 Hebrew validation messages

- [x] Task 5: Create seed script (AC: #1, #2)
  - [x] 5.1 Create `src/db/seed.ts` with 3 pre-seeded entities and 11 tax categories
  - [x] 5.2 Idempotent (checks for existing before inserting)
  - [x] 5.3 Finds first user as owner

- [x] Task 6: Add npm scripts (AC: all)
  - [x] 6.1 `db:seed`, `db:push`, `db:generate`, `db:migrate` scripts
  - [x] 6.2 Install tsx as dev dependency for seed script

- [x] Task 7: Money utilities (AC: #4, #5)
  - [x] 7.1 Already exists from Story 1.1: `src/lib/money.ts`
  - [x] 7.2 toAgorot, fromAgorot, formatILS, calculateVat — all integer math, 21 tests

- [x] Task 8: Tests and verification (AC: all)
  - [x] 8.1 Create `entity.test.ts` — 8 tests for Zod schemas
  - [x] 8.2 `pnpm test` — 37/37 pass
  - [x] 8.3 `pnpm build` — clean

## Dev Notes

### Pre-seeded Data
- **Entities:** טראסטג'י ייעוץ, חברת השקעות, אחזקות אישיות
- **Tax Categories:** 11 categories covering income types, expense categories (consulting, investments, salary, office, travel, marketing, professional, tech, insurance, finance, other)
- All pre-seeded records marked with `is_pre_seeded: true` — cannot be deleted

### Naming Convention Compliance
- Database: `snake_case` (created_at, owner_id, is_pre_seeded)
- TypeScript: `camelCase` (createdAt, ownerId, isPreSeeded)
- Components: `PascalCase` (TwoFactorSetup, SidebarItem)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Shared DB helpers (id, timestamps, softDelete) for consistent schema patterns
- Entities + taxCategories tables with CUID keys, soft deletes, owner references
- Zod schemas via drizzle-zod for form validation
- Seed script with 3 entities + 11 tax categories (idempotent)
- 37/37 tests pass, build clean

### File List

**New files created:**
- `src/db/helpers.ts` — Shared column helpers (id, timestamps, softDelete)
- `src/db/schema/entities.ts` — Entities and taxCategories tables with relations
- `src/db/schema/index.ts` — Schema re-exports
- `src/db/seed.ts` — Seed script (3 entities, 11 tax categories)
- `src/lib/validations/entity.ts` — Zod schemas for entity/taxCategory validation
- `src/lib/validations/entity.test.ts` — Validation schema tests (8 tests)

**Modified files:**
- `package.json` — Added db:seed, db:push, db:generate, db:migrate scripts; added tsx

### Change Log
- 2026-03-10: Story 1.6 implemented — entity schema, seed data, Zod validation, DB helpers
