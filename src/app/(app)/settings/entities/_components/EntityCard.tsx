"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { updateEntity, deleteEntity } from "@/lib/actions/entities";
import { EntityForm } from "./EntityForm";

type Entity = {
  id: string;
  name: string;
  description: string | null;
  isPreSeeded: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  ownerId: string;
};

export function EntityCard({ entity }: { entity: Entity }) {
  const t = useTranslations("entities");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleUpdate(data: { name: string; description?: string }) {
    setError(null);
    setSubmitting(true);
    const result = await updateEntity(entity.id, data);
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setEditing(false);
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    const result = await deleteEntity(entity.id);
    setDeleting(false);
    if (result.error) {
      setError(result.error.message);
    }
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-white p-5 shadow-sm">
        <EntityForm
          defaultValues={{
            name: entity.name,
            description: entity.description ?? undefined,
          }}
          onSubmit={handleUpdate}
          onCancel={() => { setEditing(false); setError(null); }}
          error={error}
          submitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-medium text-text-primary truncate">
            {entity.name}
          </h3>
          {entity.description && (
            <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">
              {entity.description}
            </p>
          )}
        </div>
        {entity.isPreSeeded && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/8 text-gold-dark border border-gold/15 whitespace-nowrap">
            {t("preSeeded")}
          </span>
        )}
      </div>

      {error && <p className="text-status-red text-[11px]">{error}</p>}

      <div className="flex gap-1.5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-text-secondary border border-cream-darker hover:bg-cream-dark transition-colors"
        >
          <Pencil className="w-3 h-3" />
          {t("edit")}
        </button>
        {!entity.isPreSeeded && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-status-red border border-status-red/20 hover:bg-status-red/5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {deleting ? t("deleting") : t("delete")}
          </button>
        )}
      </div>
    </div>
  );
}
