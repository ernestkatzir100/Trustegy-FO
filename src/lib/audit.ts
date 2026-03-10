import { db } from "@/db";
import { auditLogs } from "@/db/schema/audit";

export type AuditAction = "create" | "update" | "delete";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  tableName: string;
  recordId: string;
  previousValue?: unknown;
  newValue?: unknown;
}

/**
 * Writes an audit log entry. Append-only — cannot be edited or deleted.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  await db.insert(auditLogs).values({
    userId: entry.userId,
    action: entry.action,
    tableName: entry.tableName,
    recordId: entry.recordId,
    previousValue: entry.previousValue ?? null,
    newValue: entry.newValue ?? null,
  });
}

/**
 * Wraps a mutation function with automatic audit logging.
 * The mutation function must return { recordId, previousValue?, newValue? }.
 */
export async function withAudit<T>(
  params: {
    userId: string;
    action: AuditAction;
    tableName: string;
  },
  mutation: () => Promise<{
    result: T;
    recordId: string;
    previousValue?: unknown;
    newValue?: unknown;
  }>
): Promise<T> {
  const { result, recordId, previousValue, newValue } = await mutation();

  await logAudit({
    userId: params.userId,
    action: params.action,
    tableName: params.tableName,
    recordId,
    previousValue,
    newValue,
  });

  return result;
}
