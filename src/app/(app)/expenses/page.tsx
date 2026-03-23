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
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            {t("title")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            ניהול ומעקב הוצאות עסקיות
          </p>
        </div>
      </div>
      <ExpensesClient entities={entityList} />
    </div>
  );
}
