import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { id, timestamps, softDelete } from "../helpers";
import { users } from "./auth";

export const entities = pgTable("entities", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isPreSeeded: boolean("is_pre_seeded").notNull().default(false),
  ...timestamps,
  ...softDelete,
});

export const entitiesRelations = relations(entities, ({ one }) => ({
  owner: one(users, {
    fields: [entities.ownerId],
    references: [users.id],
  }),
}));

export const taxCategories = pgTable("tax_categories", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isPreSeeded: boolean("is_pre_seeded").notNull().default(false),
  ...timestamps,
  ...softDelete,
});

export const taxCategoriesRelations = relations(taxCategories, ({ one }) => ({
  owner: one(users, {
    fields: [taxCategories.ownerId],
    references: [users.id],
  }),
}));
