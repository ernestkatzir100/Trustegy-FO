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

const inputStyle = {
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
} as const;

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
        <label htmlFor="name" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t("name")}
        </label>
        <input
          id="name"
          {...register("name")}
          style={inputStyle}
          placeholder={t("namePlaceholder")}
          autoFocus
        />
        {errors.name && (
          <p style={{ fontSize: 11, color: "#ef4444" }}>{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t("description")}
        </label>
        <input
          id="description"
          {...register("description")}
          style={inputStyle}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      {error && <p style={{ fontSize: 12, color: "#ef4444" }}>{error}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={submitting}
          className="transition-colors disabled:opacity-50"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none" }}
        >
          {submitting ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="transition-colors"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", background: "transparent" }}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
