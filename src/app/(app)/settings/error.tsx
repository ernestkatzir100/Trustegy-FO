"use client";

import { useTranslations } from "next-intl";

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-text-secondary">{t("genericError")}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-gold text-white text-[14px] hover:bg-gold/90 transition-colors"
      >
        {t("retry")}
      </button>
    </div>
  );
}
