import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "../helpers";
import { users } from "./auth";
import { entities } from "./entities";

export const expenses = pgTable("expenses", {
  id: id(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("OTHER"),
  subcategory: text("subcategory"),
  description: text("description"),
  /** Amount in agorot (integer). Always positive — expenses are outflows. */
  amount: integer("amount").notNull(),
  /** Date of expense as ISO string (YYYY-MM-DD) */
  date: text("date").notNull(),
  vendorName: text("vendor_name"),
  entityId: text("entity_id").references(() => entities.id, {
    onDelete: "set null",
  }),
  isRecurring: boolean("is_recurring").notNull().default(false),
  importSource: text("import_source").notNull().default("MANUAL"),
  ...timestamps,
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
