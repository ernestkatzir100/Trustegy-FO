import { z } from "zod";

export const insertExpenseSchema = z.object({
  category: z.enum([
    "SALARY",
    "VEHICLE",
    "ACCOUNTING",
    "MAINTENANCE",
    "TAX",
    "FINANCING",
    "LEGAL",
    "SUBCONTRACTOR",
    "GIFTS",
    "OTHER",
  ]),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().positive("סכום חייב להיות חיובי"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לא תקין"),
  vendorName: z.string().optional(),
  entityId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  importSource: z
    .enum(["MANUAL", "BANK_MIZRAHI", "CREDIT_MAX", "GENERIC"])
    .optional(),
});

export const updateExpenseSchema = insertExpenseSchema.partial();

export type InsertExpenseInput = z.infer<typeof insertExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
