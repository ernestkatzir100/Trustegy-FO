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
    return <p className="text-status-red text-[13px]">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {initialEntities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-gold/30 bg-white p-5 shadow-sm max-w-md">
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
          className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("add")}
        </button>
      )}
    </div>
  );
}
