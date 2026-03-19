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

  const inputClass =
    "h-9 px-3 rounded-lg border border-cream-darker bg-cream text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {/* Category */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="category"
          className="text-[12px] font-medium text-text-secondary"
        >
          {t("category")} *
        </label>
        <select id="category" {...register("category")} className={inputClass}>
          {(
            Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, { label: string }][]
          ).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-status-red text-[11px]">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-[12px] font-medium text-text-secondary"
        >
          {t("description")}
        </label>
        <input
          id="description"
          {...register("description")}
          className={inputClass}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      {/* Vendor */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="vendorName"
          className="text-[12px] font-medium text-text-secondary"
        >
          {t("vendor")}
        </label>
        <input
          id="vendorName"
          {...register("vendorName")}
          className={inputClass}
          placeholder={t("vendorPlaceholder")}
        />
      </div>

      {/* Amount + Date row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="amount"
            className="text-[12px] font-medium text-text-secondary"
          >
            {t("amount")} *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            className={inputClass}
            placeholder={t("amountPlaceholder")}
            dir="ltr"
          />
          {errors.amount && (
            <p className="text-status-red text-[11px]">
              {errors.amount.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="date"
            className="text-[12px] font-medium text-text-secondary"
          >
            {t("date")} *
          </label>
          <input
            id="date"
            type="date"
            {...register("date")}
            className={inputClass}
            dir="ltr"
          />
          {errors.date && (
            <p className="text-status-red text-[11px]">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      {/* Entity */}
      {entities.length > 0 && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="entityId"
            className="text-[12px] font-medium text-text-secondary"
          >
            {t("entity")}
          </label>
          <select id="entityId" {...register("entityId")} className={inputClass}>
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
          className="w-4 h-4 rounded border-cream-darker text-gold focus:ring-gold"
        />
        <span className="text-[13px] text-text-primary">{t("recurring")}</span>
      </label>

      {error && <p className="text-status-red text-[12px]">{error}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {submitting ? t("saving") : tc("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[12px] text-text-secondary border border-cream-darker hover:bg-cream-dark transition-colors"
        >
          {tc("cancel")}
        </button>
      </div>
    </form>
  );
}
