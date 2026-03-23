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
        <div
          className="flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(13,148,136,0.15)" }}
        >
          <ShieldCheck style={{ width: 24, height: 24, color: "#0d9488" }} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {t("title")}
          </h1>
          <p className="text-center leading-relaxed" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
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
          className="w-full font-mono"
          style={{
            height: 56,
            textAlign: "center",
            fontSize: 24,
            letterSpacing: "0.5em",
            borderRadius: 12,
            background: "var(--bg-tint)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          autoFocus
          autoComplete="one-time-code"
          disabled={loading}
        />

        {error && (
          <p className="text-center" style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={code.length !== 6 || loading}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            height: 44,
            borderRadius: 12,
            background: "#0d9488",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? t("verifying") : t("verify")}
        </button>
      </form>

      <form action={logout}>
        <button
          type="submit"
          className="transition-colors"
          style={{ color: "var(--text-tertiary)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
        >
          {t("signOutInstead")}
        </button>
      </form>
    </div>
  );
}
