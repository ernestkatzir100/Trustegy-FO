import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Building2, ChevronLeft, ShieldCheck } from "lucide-react";
import { TwoFactorSetup } from "./_components/TwoFactorSetup";

export async function generateMetadata() {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">
        {t("title")}
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
          {t("entities")}
        </h2>
        <Link
          href="/settings/entities"
          className="rounded-2xl border border-cream-darker bg-white p-4 hover:border-gold/30 transition-colors flex items-center gap-3 shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-cream-dark flex items-center justify-center group-hover:bg-gold/10 transition-colors">
            <Building2 className="w-[18px] h-[18px] text-text-secondary group-hover:text-gold transition-colors" />
          </div>
          <span className="text-[14px] text-text-primary flex-1">{t("entities")}</span>
          <ChevronLeft className="w-4 h-4 text-text-tertiary" />
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-text-secondary" />
          <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
            {t("security")}
          </h2>
        </div>
        <TwoFactorSetup />
      </section>
    </div>
  );
}
