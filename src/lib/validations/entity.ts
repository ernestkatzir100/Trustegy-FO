import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { entities, taxCategories } from "@/db/schema/entities";

export const insertEntitySchema = createInsertSchema(entities, {
  name: z.string().min(1, "שם הישות נדרש").max(100),
  description: z.string().max(500).optional(),
}).omit({
  id: true,
  ownerId: true,
  isPreSeeded: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateEntitySchema = insertEntitySchema.partial();

export const selectEntitySchema = createSelectSchema(entities);

export const insertTaxCategorySchema = createInsertSchema(taxCategories, {
  name: z.string().min(1, "שם הקטגוריה נדרש").max(100),
  description: z.string().max(500).optional(),
}).omit({
  id: true,
  ownerId: true,
  isPreSeeded: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateTaxCategorySchema = insertTaxCategorySchema.partial();

export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type UpdateEntity = z.infer<typeof updateEntitySchema>;
export type InsertTaxCategory = z.infer<typeof insertTaxCategorySchema>;
export type UpdateTaxCategory = z.infer<typeof updateTaxCategorySchema>;
