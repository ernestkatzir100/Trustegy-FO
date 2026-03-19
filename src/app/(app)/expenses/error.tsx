"use client";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-text-secondary text-[15px]">{t("genericError")}</p>
      <pre className="text-red-600 text-[12px] max-w-lg overflow-auto bg-red-50 p-3 rounded-lg">
        {error.message}
        {error.digest && `\nDigest: ${error.digest}`}
      </pre>
      <button
        onClick={reset}
        className="bg-gold text-cream px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors"
      >
        {t("retry")}
      </button>
    </div>
  );
}
