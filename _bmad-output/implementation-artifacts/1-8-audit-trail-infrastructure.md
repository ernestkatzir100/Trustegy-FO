# Story 1.8: Audit Trail Infrastructure

Status: done

## Story

As the owner,
I want every financial data change to be logged with who changed it, what changed, when, and the previous value,
So that I have a complete audit history for accountability and compliance.

## Acceptance Criteria (BDD)

1. **Given** the audit infrastructure is set up
   **When** any financial data mutation occurs (create, update, delete)
   **Then** an entry is written to the audit_logs table recording: user_id, action, table_name, record_id, previous_value (JSON), new_value (JSON), timestamp

2. **And** a withAudit() wrapper function exists that server actions can use to automatically log mutations

3. **And** a logAudit() helper exists for manual audit entries

4. **And** entity mutations from Story 1.7 are retroactively wrapped with audit logging

5. **And** audit logs are append-only — they cannot be edited or deleted

6. **And** all financial mutations are logged (NFR16)

## Tasks / Subtasks

- [x] Task 1: Create audit_logs schema (AC: #1, #5)
  - [x] 1.1 Create `src/db/schema/audit.ts` with `auditLogs` table
  - [x] 1.2 Fields: id, user_id, action, table_name, record_id, previous_value (jsonb), new_value (jsonb), created_at
  - [x] 1.3 No update/delete columns — append-only by design
  - [x] 1.4 Add to schema index

- [x] Task 2: Create audit utilities (AC: #2, #3)
  - [x] 2.1 Create `src/lib/audit.ts`
  - [x] 2.2 `logAudit()` — writes a single audit log entry
  - [x] 2.3 `withAudit()` — wraps a mutation function with automatic audit logging

- [x] Task 3: Wrap entity actions with audit (AC: #4, #6)
  - [x] 3.1 `createEntity()` — logs new entity value
  - [x] 3.2 `updateEntity()` — logs previous and new values
  - [x] 3.3 `deleteEntity()` — logs previous value

- [x] Task 4: Verify (AC: all)
  - [x] 4.1 `pnpm test` — 37/37 pass
  - [x] 4.2 `pnpm build` — clean

## Dev Notes

### withAudit Pattern
```typescript
const created = await withAudit(
  { userId, action: "create", tableName: "entities" },
  async () => {
    const [result] = await db.insert(entities).values({...}).returning();
    return { result, recordId: result.id, newValue: result };
  }
);
```
The mutation function returns `{ result, recordId, previousValue?, newValue? }`. `withAudit` calls `logAudit` after the mutation succeeds.

### Append-Only Design
The audit_logs table has no `updated_at`, `deleted_at`, or any mutation columns. Records are written once and never modified. The only operation is INSERT.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Audit log table with jsonb for previous/new values
- `logAudit()` and `withAudit()` utility functions
- All entity mutations (create, update, delete) now audit-logged
- Append-only by design — no update/delete columns
- 37/37 tests pass, build clean

### File List

**New files created:**
- `src/db/schema/audit.ts` — Audit log table schema
- `src/lib/audit.ts` — Audit utility functions (logAudit, withAudit)

**Modified files:**
- `src/db/schema/index.ts` — Added audit schema export
- `src/lib/actions/entities.ts` — Wrapped all mutations with withAudit

### Change Log
- 2026-03-10: Story 1.8 implemented — audit trail infrastructure with withAudit wrapper
