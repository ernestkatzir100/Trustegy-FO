import { getTranslations } from "next-intl/server";
import { getEntities } from "@/lib/actions/entities";
import { ExpensesClient } from "./_components/ExpensesClient";

export default async function ExpensesPage() {
  const t = await getTranslations("expenses");
  const entitiesResult = await getEntities();
  const entityList = (entitiesResult.data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">
        {t("title")}
      </h1>
      <ExpensesClient entities={entityList} />
    </div>
  );
}
