"use server";

import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { entities } from "@/db/schema/entities";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import { withAudit } from "@/lib/audit";
import {
  insertEntitySchema,
  updateEntitySchema,
  type InsertEntity,
  type UpdateEntity,
} from "@/lib/validations/entity";
import type { ActionResult } from "@/types";

type Entity = typeof entities.$inferSelect;

export async function getEntities(): Promise<ActionResult<Entity[]>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const result = await db
    .select()
    .from(entities)
    .where(and(eq(entities.ownerId, userId), isNull(entities.deletedAt)));

  return actionSuccess(result);
}

export async function createEntity(
  data: InsertEntity
): Promise<ActionResult<Entity>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const parsed = insertEntitySchema.safeParse(data);
  if (!parsed.success) {
    return actionError("VALIDATION", parsed.error.issues[0].message);
  }

  const created = await withAudit(
    { userId, action: "create", tableName: "entities" },
    async () => {
      const [result] = await db
        .insert(entities)
        .values({ ...parsed.data, ownerId: userId })
        .returning();
      return { result, recordId: result.id, newValue: result };
    }
  );

  revalidatePath("/");
  return actionSuccess(created);
}

export async function updateEntity(
  id: string,
  data: UpdateEntity
): Promise<ActionResult<Entity>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const parsed = updateEntitySchema.safeParse(data);
  if (!parsed.success) {
    return actionError("VALIDATION", parsed.error.issues[0].message);
  }

  const [existing] = await db
    .select()
    .from(entities)
    .where(
      and(
        eq(entities.id, id),
        eq(entities.ownerId, userId),
        isNull(entities.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return actionError("NOT_FOUND", "הישות לא נמצאה");
  }

  const updated = await withAudit(
    { userId, action: "update", tableName: "entities" },
    async () => {
      const [result] = await db
        .update(entities)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(entities.id, id))
        .returning();
      return { result, recordId: id, previousValue: existing, newValue: result };
    }
  );

  revalidatePath("/");
  return actionSuccess(updated);
}

export async function deleteEntity(
  id: string
): Promise<ActionResult<null>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const [existing] = await db
    .select()
    .from(entities)
    .where(
      and(
        eq(entities.id, id),
        eq(entities.ownerId, userId),
        isNull(entities.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return actionError("NOT_FOUND", "הישות לא נמצאה");
  }

  if (existing.isPreSeeded) {
    return actionError("FORBIDDEN", "לא ניתן למחוק ישות מובנית");
  }

  await withAudit(
    { userId, action: "delete", tableName: "entities" },
    async () => {
      await db
        .update(entities)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(entities.id, id));
      return { result: null, recordId: id, previousValue: existing };
    }
  );

  revalidatePath("/");
  return actionSuccess(null);
}
