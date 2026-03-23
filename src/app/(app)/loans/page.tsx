import { getTranslations } from "next-intl/server";
import { Landmark } from "lucide-react";

export default async function LoansPage() {
  const t = await getTranslations("modules");
  return (
    <div className="flex flex-col gap-6">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {t("loans")}
      </h1>
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="flex items-center justify-center mb-4"
          style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.06)" }}
        >
          <Landmark className="w-6 h-6" style={{ color: "var(--text-tertiary)" }} />
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{t("comingSoon")}</p>
      </div>
    </div>
  );
}
