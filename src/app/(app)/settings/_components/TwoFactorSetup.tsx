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

  if (step === "loading") {
    return (
      <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
        <p className="text-text-secondary text-[13px]">{t("loading")}</p>
      </div>
    );
  }

  if (step === "enabled") {
    return (
      <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-status-green/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-status-green" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-text-primary">
              {t("enabledTitle")}
            </p>
            <p className="text-[12px] text-text-secondary">
              {t("enabledDescription")}
            </p>
          </div>
        </div>
        {error && <p className="text-status-red text-[12px]">{error}</p>}
        <button
          onClick={handleDisable}
          className="self-start px-3 py-1.5 rounded-lg text-[12px] text-status-red border border-status-red/20 hover:bg-status-red/5 transition-colors"
        >
          {t("disable")}
        </button>
      </div>
    );
  }

  if (step === "idle") {
    return (
      <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm flex flex-col gap-4">
        <div>
          <p className="text-[14px] font-medium text-text-primary">
            {t("setupTitle")}
          </p>
          <p className="text-[12px] text-text-secondary mt-0.5">
            {t("setupDescription")}
          </p>
        </div>
        {error && <p className="text-status-red text-[12px]">{error}</p>}
        <button
          onClick={handleSetup}
          className="self-start px-3 py-1.5 rounded-lg text-[12px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
        >
          {t("enable")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cream-darker bg-white p-5 shadow-sm flex flex-col gap-5">
      {step === "scan" && qrDataUrl && (
        <>
          <div>
            <p className="text-[14px] font-medium text-text-primary">
              {t("scanTitle")}
            </p>
            <p className="text-[12px] text-text-secondary mt-0.5">
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
              <p className="text-[11px] text-text-tertiary">{t("manualEntry")}</p>
              <code className="text-[12px] font-mono bg-cream px-3 py-2 rounded-lg select-all break-all text-text-primary border border-cream-darker">
                {manualSecret}
              </code>
            </div>
          )}
          <button
            onClick={() => setStep("verify")}
            className="self-start px-3 py-1.5 rounded-lg text-[12px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
          >
            {t("next")}
          </button>
        </>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <p className="text-[14px] font-medium text-text-primary">
              {t("verifySetupTitle")}
            </p>
            <p className="text-[12px] text-text-secondary mt-0.5">
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
            className="w-full h-12 text-center text-[22px] font-mono tracking-[0.5em] rounded-xl bg-cream border border-cream-darker text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            autoFocus
            autoComplete="one-time-code"
            disabled={submitting}
          />
          {error && (
            <p className="text-status-red text-[12px] text-center">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep("scan"); setCode(""); setError(null); }}
              className="px-3 py-1.5 rounded-lg text-[12px] text-text-secondary border border-cream-darker hover:bg-cream-dark transition-colors"
            >
              {t("back")}
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {submitting ? t("verifying") : t("confirmEnable")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
