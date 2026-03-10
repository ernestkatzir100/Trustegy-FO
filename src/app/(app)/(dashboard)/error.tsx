"use client";
import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-text-secondary text-[15px]">{t("genericError")}</p>
      <button
        onClick={reset}
        className="bg-gold text-cream px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors"
      >
        {t("retry")}
      </button>
    </div>
  );
}
