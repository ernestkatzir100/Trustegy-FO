"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { EntityCard } from "./EntityCard";
import { EntityForm } from "./EntityForm";
import { createEntity } from "@/lib/actions/entities";

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

export function EntityList({
  initialEntities,
  error,
}: {
  initialEntities: Entity[];
  error?: string;
}) {
  const t = useTranslations("entities");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(data: { name: string; description?: string }) {
    setFormError(null);
    setSubmitting(true);
    const result = await createEntity(data);
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setShowForm(false);
  }

  if (error) {
    return <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {initialEntities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

      {showForm ? (
        <div className="rounded-2xl p-5 max-w-md" style={{ background: "var(--surface-card)", border: "1px solid var(--accent-teal)" }}>
          <EntityForm
            onSubmit={handleCreate}
            onCancel={() => { setShowForm(false); setFormError(null); }}
            error={formError}
            submitting={submitting}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="self-start flex items-center gap-1.5 transition-colors"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none" }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          {t("add")}
        </button>
      )}
    </div>
  );
}
