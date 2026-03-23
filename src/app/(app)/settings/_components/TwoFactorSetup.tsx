"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import {
  setupTOTP,
  verifyAndEnableTOTP,
  disableTOTP,
  hasTOTPEnabled,
} from "@/lib/auth/totp";

type SetupStep = "idle" | "loading" | "scan" | "verify" | "enabled";

export function TwoFactorSetup() {
  const t = useTranslations("twoFactor");
  const [step, setStep] = useState<SetupStep>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const result = await hasTOTPEnabled();
    setStep(result.data ? "enabled" : "idle");
  }

  async function handleSetup() {
    setError(null);
    setStep("loading");
    const result = await setupTOTP();
    if (result.error) {
      setError(result.error.message);
      setStep("idle");
      return;
    }
    setQrDataUrl(result.data!.qrDataUrl);
    setManualSecret(result.data!.secret);
    setStep("scan");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await verifyAndEnableTOTP(code);
    if (result.error) {
      setError(result.error.message);
      setCode("");
      setSubmitting(false);
      return;
    }
    setStep("enabled");
    setQrDataUrl(null);
    setManualSecret(null);
    setCode("");
    setSubmitting(false);
  }

  async function handleDisable() {
    setError(null);
    const result = await disableTOTP();
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setStep("idle");
  }

  const cardStyle = {
    background: "var(--surface-card)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  if (step === "loading") {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-3" style={cardStyle}>
        <Loader2 style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} className="animate-spin" />
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("loading")}</p>
      </div>
    );
  }

  if (step === "enabled") {
    return (
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={cardStyle}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 12, background: "rgba(34,197,94,0.15)" }}>
            <Check style={{ width: 16, height: 16, color: "#22c55e" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {t("enabledTitle")}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {t("enabledDescription")}
            </p>
          </div>
        </div>
        {error && <p style={{ fontSize: 12, color: "#ef4444" }}>{error}</p>}
        <button
          onClick={handleDisable}
          className="self-start transition-colors"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", background: "transparent" }}
        >
          {t("disable")}
        </button>
      </div>
    );
  }

  if (step === "idle") {
    return (
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={cardStyle}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {t("setupTitle")}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {t("setupDescription")}
          </p>
        </div>
        {error && <p style={{ fontSize: 12, color: "#ef4444" }}>{error}</p>}
        <button
          onClick={handleSetup}
          className="self-start transition-colors"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none" }}
        >
          {t("enable")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-5" style={cardStyle}>
      {step === "scan" && qrDataUrl && (
        <>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {t("scanTitle")}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {t("scanDescription")}
            </p>
          </div>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={t("qrAlt")}
              width={180}
              height={180}
              className="rounded-xl"
            />
          </div>
          {manualSecret && (
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{t("manualEntry")}</p>
              <code
                className="select-all break-all font-mono"
                style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
              >
                {manualSecret}
              </code>
            </div>
          )}
          <button
            onClick={() => setStep("verify")}
            className="self-start transition-colors"
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none" }}
          >
            {t("next")}
          </button>
        </>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {t("verifySetupTitle")}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {t("verifySetupDescription")}
            </p>
          </div>
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
              height: 48,
              textAlign: "center",
              fontSize: 22,
              letterSpacing: "0.5em",
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            autoFocus
            autoComplete="one-time-code"
            disabled={submitting}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center" }}>{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep("scan"); setCode(""); setError(null); }}
              className="transition-colors"
              style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", background: "transparent" }}
            >
              {t("back")}
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="transition-colors disabled:opacity-50"
              style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none" }}
            >
              {submitting ? t("verifying") : t("confirmEnable")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
