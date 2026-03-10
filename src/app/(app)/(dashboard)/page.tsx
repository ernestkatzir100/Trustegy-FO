import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">
          {t("greeting")}
        </h1>
        <p className="text-[14px] text-text-secondary mt-1">{t("title")}</p>
      </div>

      {/* Shefa AI Summary placeholder */}
      <div className="rounded-2xl border border-cream-darker bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-gold">Shefa</span>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              {t("shefaPlaceholder")}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards placeholder */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm"
          >
            <div className="h-3 w-20 bg-cream-darker rounded mb-3" />
            <div className="h-7 w-28 bg-cream-dark rounded mb-2" />
            <div className="h-3 w-16 bg-cream-darker rounded" />
          </div>
        ))}
      </div>

      {/* Entity cards placeholder */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-24 bg-cream-darker rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-cream-dark rounded" />
              <div className="h-3 w-3/4 bg-cream-dark rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
