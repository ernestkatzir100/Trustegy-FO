import { text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

/** CUID primary key column */
export const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => createId());

/** Standard timestamp columns (created_at, updated_at) */
export const timestamps = {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

/** Soft delete column (deleted_at) */
export const softDelete = {
  deletedAt: timestamp("deleted_at", { mode: "date" }),
};
