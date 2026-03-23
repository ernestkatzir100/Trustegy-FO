import { getTranslations } from "next-intl/server";
import { getEntities } from "@/lib/actions/entities";
import { EntityList } from "./_components/EntityList";

export async function generateMetadata() {
  const t = await getTranslations("entities");
  return { title: t("title") };
}

export default async function EntitiesPage() {
  const t = await getTranslations("entities");
  const result = await getEntities();

  return (
    <div className="flex flex-col gap-6">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{t("title")}</h1>
      <EntityList
        initialEntities={result.data ?? []}
        error={result.error?.message}
      />
    </div>
  );
}
