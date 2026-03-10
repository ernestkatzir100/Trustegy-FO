import { getTranslations } from "next-intl/server";
import { Briefcase } from "lucide-react";

export default async function ConsultingPage() {
  const t = await getTranslations("modules");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">
        {t("consulting")}
      </h1>
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-cream-darker bg-white shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-cream-dark flex items-center justify-center mb-4">
          <Briefcase className="w-6 h-6 text-text-tertiary" />
        </div>
        <p className="text-[14px] text-text-secondary">{t("comingSoon")}</p>
      </div>
    </div>
  );
}
