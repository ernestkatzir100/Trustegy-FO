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
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {t("title")}
      </h1>

      <section className="flex flex-col gap-3">
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {t("entities")}
        </h2>
        <Link
          href="/settings/entities"
          className="rounded-2xl p-4 transition-colors flex items-center gap-3 group"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex items-center justify-center group-hover:opacity-80 transition-opacity"
            style={{ width: 36, height: 36, borderRadius: 12, background: "var(--bg-tint)" }}
          >
            <Building2 style={{ width: 18, height: 18, color: "var(--text-secondary)" }} />
          </div>
          <span style={{ fontSize: 14, color: "var(--text-primary)", flex: 1 }}>{t("entities")}</span>
          <ChevronLeft style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck style={{ width: 16, height: 16, color: "var(--text-secondary)" }} />
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("security")}
          </h2>
        </div>
        <TwoFactorSetup />
      </section>
    </div>
  );
}
