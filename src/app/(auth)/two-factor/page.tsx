"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { verifyTOTPCode } from "@/lib/auth/totp";
import { logout } from "@/lib/auth/actions";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("twoFactor");
  const { update } = useSession();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await verifyTOTPCode(code);

    if (result.error) {
      setError(result.error.message);
      setCode("");
      setLoading(false);
      return;
    }

    await update();
    router.push("/");
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[360px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-gold" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="text-text-secondary text-[13px] text-center leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder={t("placeholder")}
          className="w-full h-14 text-center text-[24px] font-mono tracking-[0.5em] rounded-xl bg-white border border-cream-darker text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent shadow-sm"
          autoFocus
          autoComplete="one-time-code"
          disabled={loading}
        />

        {error && (
          <p className="text-status-red text-[13px] text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={code.length !== 6 || loading}
          className="w-full h-11 rounded-xl bg-gold text-white font-medium text-[14px] hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          {loading ? t("verifying") : t("verify")}
        </button>
      </form>

      <form action={logout}>
        <button
          type="submit"
          className="text-text-tertiary text-[13px] hover:text-text-secondary transition-colors"
        >
          {t("signOutInstead")}
        </button>
      </form>
    </div>
  );
}
