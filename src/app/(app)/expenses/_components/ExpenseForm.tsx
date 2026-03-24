"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/expense-categorizer";

const formSchema = z.object({
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
  description: z.string().optional(),
  vendorName: z.string().optional(),
  amount: z.number().positive("סכום חייב להיות חיובי"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לא תקין"),
  entityId: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export type ExpenseFormData = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormData>;
  entities: { id: string; name: string }[];
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  error: string | null;
  submitting: boolean;
}

const inputStyle = {
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  background: "var(--bg-tint)",
  border: "1px solid var(--border-subtle)",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
} as const;

export function ExpenseForm({
  defaultValues,
  entities,
  onSubmit,
  onCancel,
  error,
  submitting,
}: ExpenseFormProps) {
  const t = useTranslations("expenses");
  const tc = useTranslations("common");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "OTHER",
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {/* Category */}
      <div className="flex flex-col gap-1">
        <label htmlFor="category" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t("category")} *
        </label>
        <select id="category" {...register("category")} style={inputStyle}>
          {(
            Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, { label: string }][]
          ).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p style={{ fontSize: 11, color: "#ef4444" }}>{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="description" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t("description")}
        </label>
        <input id="description" {...register("description")} style={inputStyle} placeholder={t("descriptionPlaceholder")} />
      </div>

      {/* Vendor */}
      <div className="flex flex-col gap-1">
        <label htmlFor="vendorName" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t("vendor")}
        </label>
        <input id="vendorName" {...register("vendorName")} style={inputStyle} placeholder={t("vendorPlaceholder")} />
      </div>

      {/* Amount + Date row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="amount" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("amount")} *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            style={inputStyle}
            placeholder={t("amountPlaceholder")}
            dir="ltr"
          />
          {errors.amount && (
            <p style={{ fontSize: 11, color: "#ef4444" }}>{errors.amount.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="date" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("date")} *
          </label>
          <input id="date" type="date" {...register("date")} style={inputStyle} dir="ltr" />
          {errors.date && (
            <p style={{ fontSize: 11, color: "#ef4444" }}>{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Entity */}
      {entities.length > 0 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="entityId" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("entity")}
          </label>
          <select id="entityId" {...register("entityId")} style={inputStyle}>
            <option value="">{t("selectEntity")}</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Recurring checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register("isRecurring")}
          style={{ width: 16, height: 16, borderRadius: 4, accentColor: "#00685f" }}
        />
        <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{t("recurring")}</span>
      </label>

      {error && <p style={{ fontSize: 12, color: "#ef4444" }}>{error}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={submitting}
          className="transition-colors disabled:opacity-50"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none" }}
        >
          {submitting ? t("saving") : tc("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="transition-colors"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", border: "1px solid var(--border-strong)", background: "transparent" }}
        >
          {tc("cancel")}
        </button>
      </div>
    </form>
  );
}
