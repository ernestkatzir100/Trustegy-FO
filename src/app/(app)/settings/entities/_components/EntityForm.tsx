"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { insertEntitySchema, type InsertEntity } from "@/lib/validations/entity";

interface EntityFormProps {
  defaultValues?: Partial<InsertEntity>;
  onSubmit: (data: InsertEntity) => Promise<void>;
  onCancel: () => void;
  error: string | null;
  submitting: boolean;
}

export function EntityForm({
  defaultValues,
  onSubmit,
  onCancel,
  error,
  submitting,
}: EntityFormProps) {
  const t = useTranslations("entities");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InsertEntity>({
    resolver: zodResolver(insertEntitySchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-[12px] font-medium text-text-secondary">
          {t("name")}
        </label>
        <input
          id="name"
          {...register("name")}
          className="h-9 px-3 rounded-lg border border-cream-darker bg-cream text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder={t("namePlaceholder")}
          autoFocus
        />
        {errors.name && (
          <p className="text-status-red text-[11px]">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-[12px] font-medium text-text-secondary">
          {t("description")}
        </label>
        <input
          id="description"
          {...register("description")}
          className="h-9 px-3 rounded-lg border border-cream-darker bg-cream text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      {error && <p className="text-status-red text-[12px]">{error}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {submitting ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[12px] text-text-secondary border border-cream-darker hover:bg-cream-dark transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
