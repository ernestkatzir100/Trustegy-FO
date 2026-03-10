# Story 1.7: Entity Management UI

Status: done

## Story

As the owner,
I want to view, edit, and add business entities, and soft-delete ones I no longer need,
So that I can organize my financial data across the right business structures.

## Acceptance Criteria (BDD)

1. **Given** the owner is authenticated and entities are seeded
   **When** they navigate to entity management
   **Then** all entities are displayed in a list with their details

2. **And** the owner can edit any entity's details via a form (react-hook-form + Zod validation)

3. **And** the owner can add a new entity

4. **And** the owner can soft-delete non-pre-seeded entities (deleted_at timestamp set, NFR15)

5. **And** pre-seeded entities can be renamed but not deleted

6. **And** all mutations use server actions that: check auth -> validate Zod -> return ActionResult<T>

7. **And** successful mutations trigger revalidatePath for affected routes

8. **And** mutations confirm in <2 seconds with visual feedback (NFR4)

## Tasks / Subtasks

- [x] Task 1: Create entity server actions (AC: #1-7)
  - [x] 1.1 Create `src/lib/actions/entities.ts`
  - [x] 1.2 `getEntities()` — fetches all non-deleted entities for current user
  - [x] 1.3 `createEntity()` — auth check, Zod validation, insert, revalidatePath
  - [x] 1.4 `updateEntity()` — auth check, ownership check, Zod validation, update
  - [x] 1.5 `deleteEntity()` — auth check, ownership check, pre-seeded guard, soft delete
  - [x] 1.6 All actions follow pattern: requireAuth -> validate -> mutate -> revalidatePath -> return ActionResult

- [x] Task 2: Create entity management page (AC: #1)
  - [x] 2.1 Create `src/app/(app)/settings/entities/page.tsx` — server component fetching entities
  - [x] 2.2 Loading skeleton with 3 cards

- [x] Task 3: Create EntityList component (AC: #1, #3)
  - [x] 3.1 Displays entity cards in responsive grid
  - [x] 3.2 "Add entity" button toggles inline form

- [x] Task 4: Create EntityCard component (AC: #2, #4, #5)
  - [x] 4.1 Shows entity name, description, pre-seeded badge
  - [x] 4.2 Edit mode with inline form
  - [x] 4.3 Delete button (hidden for pre-seeded entities)
  - [x] 4.4 Error display per card

- [x] Task 5: Create EntityForm component (AC: #2, #6, #8)
  - [x] 5.1 react-hook-form with zodResolver
  - [x] 5.2 Name field (required) + description field (optional)
  - [x] 5.3 Submit/cancel buttons with loading state
  - [x] 5.4 Reusable for both create and edit

- [x] Task 6: Settings page integration (AC: #1)
  - [x] 6.1 Add entity management link to settings page
  - [x] 6.2 Hebrew translations for all entity UI strings

- [x] Task 7: Verify (AC: all)
  - [x] 7.1 `pnpm test` — 37/37 pass
  - [x] 7.2 `pnpm build` — clean, /settings/entities route generated

## Dev Notes

### Action Pattern
All entity actions follow the standard pattern:
```typescript
const { userId, error } = await requireAuth();
if (error) return actionError(error.code, error.message);
const parsed = schema.safeParse(data);
if (!parsed.success) return actionError("VALIDATION", ...);
// ... mutation ...
revalidatePath("/");
return actionSuccess(result);
```

### Pre-seeded Entity Protection
- `isPreSeeded: true` entities can be renamed but not deleted
- Delete action checks `isPreSeeded` flag and returns `FORBIDDEN` error

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Entity CRUD server actions with auth guard + Zod validation
- Entity management UI at /settings/entities with card grid
- react-hook-form + zodResolver for form validation
- Pre-seeded entity protection (rename OK, delete blocked)
- 37/37 tests pass, build clean

### File List

**New files created:**
- `src/lib/actions/entities.ts` — Entity CRUD server actions
- `src/app/(app)/settings/entities/page.tsx` — Entity management page
- `src/app/(app)/settings/entities/loading.tsx` — Loading skeleton
- `src/app/(app)/settings/entities/_components/EntityList.tsx` — Entity list with add form
- `src/app/(app)/settings/entities/_components/EntityCard.tsx` — Entity card with edit/delete
- `src/app/(app)/settings/entities/_components/EntityForm.tsx` — Reusable entity form

**Modified files:**
- `src/app/(app)/settings/page.tsx` — Added entity management link
- `messages/he.json` — Added entities section translations

### Change Log
- 2026-03-10: Story 1.7 implemented — entity management UI with full CRUD
