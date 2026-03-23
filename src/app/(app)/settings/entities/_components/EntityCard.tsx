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

  const cardStyle = {
    background: "var(--surface-card)",
    border: "1px solid var(--border-subtle)",
  };

  if (editing) {
    return (
      <div className="rounded-2xl p-5" style={{ ...cardStyle, borderColor: "rgba(13,148,136,0.3)" }}>
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
    <div className="rounded-2xl p-5 flex flex-col gap-3 group" style={cardStyle}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {entity.name}
          </h3>
          {entity.description && (
            <p className="line-clamp-2" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {entity.description}
            </p>
          )}
        </div>
        {entity.isPreSeeded && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(196,149,74,0.12)", color: "#D4AD6E", border: "1px solid rgba(196,149,74,0.15)", whiteSpace: "nowrap" }}>
            {t("preSeeded")}
          </span>
        )}
      </div>

      {error && <p style={{ fontSize: 11, color: "#ef4444" }}>{error}</p>}

      <div className="flex gap-1.5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 transition-colors"
          style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, color: "var(--text-secondary)", border: "1px solid var(--border-strong)", background: "transparent" }}
        >
          <Pencil style={{ width: 12, height: 12 }} />
          {t("edit")}
        </button>
        {!entity.isPreSeeded && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 transition-colors disabled:opacity-50"
            style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", background: "transparent" }}
          >
            <Trash2 style={{ width: 12, height: 12 }} />
            {deleting ? t("deleting") : t("delete")}
          </button>
        )}
      </div>
    </div>
  );
}
