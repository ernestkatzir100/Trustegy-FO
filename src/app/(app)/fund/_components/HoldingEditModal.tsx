"use client";

import { useState, useTransition } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { updateFundHolding } from "@/lib/actions/fund";
import { StatusBadge } from "./StatusBadge";
import {
  HOLDING_STATUSES,
  STATUS_LABELS,
  PLATFORM_LABELS,
  type FundHolding,
  type HoldingStatus,
  type LiquidationConfidence,
} from "@/db/schema/fund";

// ─── Money helpers ────────────────────────────────────────────────────────────
const centsToDisplay = (cents: number | null | undefined) =>
  cents != null ? String(cents / 100) : "";

const displayToCents = (value: string): number | null => {
  const n = parseFloat(value.replace(/,/g, ""));
  return isNaN(n) ? null : Math.round(n * 100);
};

// ─── Field wrappers ───────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: 4,
      }}
    >
      {children}
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "var(--surface-input)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 80,
  fontFamily: "inherit",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
};

// ─── Section header ───────────────────────────────────────────────────────────
function Section({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--accent)",
        paddingBottom: 8,
        borderBottom: "1px solid var(--border)",
        marginTop: 4,
      }}
    >
      {title}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
interface Props {
  holding: FundHolding;
  onClose: () => void;
  onSaved: (updated: FundHolding) => void;
}

export function HoldingEditModal({ holding, onClose, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state — dollar display values (string)
  const [status, setStatus] = useState<HoldingStatus>(holding.status);
  const [subStatus, setSubStatus] = useState(holding.subStatus ?? "");
  const [lastUpdateText, setLastUpdateText] = useState(holding.lastUpdateText ?? "");
  const [lastUpdateDate, setLastUpdateDate] = useState(holding.lastUpdateDate ?? "");
  const [resolutionNotes, setResolutionNotes] = useState(holding.resolutionNotes ?? "");
  const [estimateLow, setEstimateLow] = useState(centsToDisplay(holding.liquidationEstimateLow));
  const [estimateHigh, setEstimateHigh] = useState(centsToDisplay(holding.liquidationEstimateHigh));
  const [timelineMonths, setTimelineMonths] = useState(
    holding.liquidationTimelineMonths != null ? String(holding.liquidationTimelineMonths) : ""
  );
  const [confidence, setConfidence] = useState<LiquidationConfidence | "">(
    holding.liquidationConfidence ?? ""
  );
  const [currentPrincipal, setCurrentPrincipal] = useState(centsToDisplay(holding.currentPrincipal));
  const [lastPaymentDate, setLastPaymentDate] = useState(holding.lastPaymentDate ?? "");
  const [lastPaymentAmount, setLastPaymentAmount] = useState(centsToDisplay(holding.lastPaymentAmount));
  const [hurricaneDamage, setHurricaneDamage] = useState(holding.hurricaneDamage);
  const [partialPayoff, setPartialPayoff] = useState(centsToDisplay(holding.partialPayoffReceived));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateFundHolding(holding.id, {
        status,
        subStatus: subStatus || null,
        lastUpdateText: lastUpdateText || null,
        lastUpdateDate: lastUpdateDate || null,
        lastUpdateSource: "manual",
        resolutionNotes: resolutionNotes || null,
        liquidationEstimateLow: displayToCents(estimateLow),
        liquidationEstimateHigh: displayToCents(estimateHigh),
        liquidationTimelineMonths: timelineMonths ? parseInt(timelineMonths) : null,
        liquidationConfidence: confidence || null,
        currentPrincipal: displayToCents(currentPrincipal),
        lastPaymentDate: lastPaymentDate || null,
        lastPaymentAmount: displayToCents(lastPaymentAmount),
        hurricaneDamage,
        partialPayoffReceived: displayToCents(partialPayoff),
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }
      onSaved(result.data);
      onClose();
    });
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 100,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(520px, 100vw)",
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
                {PLATFORM_LABELS[holding.platform as keyof typeof PLATFORM_LABELS]} · #{holding.offeringId}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
                {holding.propertyAddress || "Unnamed Holding"}
              </h2>
              {holding.city && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 8px" }}>
                  {holding.city}{holding.state ? `, ${holding.state}` : ""}
                </p>
              )}
              <StatusBadge status={holding.status} />
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 4,
                borderRadius: "var(--radius-sm)",
                flexShrink: 0,
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <Section title="Status" />

            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as HoldingStatus)}
                style={selectStyle}
              >
                {HOLDING_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </Field>

            <Field label="Sub-status / Platform note">
              <input
                type="text"
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                placeholder="Brief status note..."
                style={inputStyle}
              />
            </Field>

            <Field label="Update date">
              <input
                type="date"
                value={lastUpdateDate}
                onChange={(e) => setLastUpdateDate(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Latest update (full text)">
              <textarea
                value={lastUpdateText}
                onChange={(e) => setLastUpdateText(e.target.value)}
                placeholder="Paste full update text from platform or email..."
                style={{ ...textareaStyle, minHeight: 100 }}
              />
            </Field>

            <Section title="Recovery Estimates" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Low estimate ($)">
                <input
                  type="text"
                  value={estimateLow}
                  onChange={(e) => setEstimateLow(e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </Field>
              <Field label="High estimate ($)">
                <input
                  type="text"
                  value={estimateHigh}
                  onChange={(e) => setEstimateHigh(e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Timeline (months)">
                <input
                  type="number"
                  value={timelineMonths}
                  onChange={(e) => setTimelineMonths(e.target.value)}
                  placeholder="0"
                  min={0}
                  max={120}
                  style={inputStyle}
                />
              </Field>
              <Field label="Confidence">
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as LiquidationConfidence | "")}
                  style={selectStyle}
                >
                  <option value="">— select —</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Field>
            </div>

            <Field label="Resolution notes">
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Analyst notes on expected resolution path..."
                style={textareaStyle}
              />
            </Field>

            <Section title="Financial" />

            <Field label="Current principal ($)">
              <input
                type="text"
                value={currentPrincipal}
                onChange={(e) => setCurrentPrincipal(e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Last payment date">
                <input
                  type="date"
                  value={lastPaymentDate}
                  onChange={(e) => setLastPaymentDate(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Last payment amount ($)">
                <input
                  type="text"
                  value={lastPaymentAmount}
                  onChange={(e) => setLastPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Partial payoff received ($)">
              <input
                type="text"
                value={partialPayoff}
                onChange={(e) => setPartialPayoff(e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </Field>

            <Section title="Flags" />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
              <input
                type="checkbox"
                checked={hurricaneDamage}
                onChange={(e) => setHurricaneDamage(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              Hurricane damage (Helene / Milton)
            </label>

          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
            background: "var(--surface-card)",
          }}
        >
          {error && (
            <p style={{ fontSize: 12, color: "var(--danger)", flex: 1, margin: 0 }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form=""
              onClick={handleSubmit}
              disabled={isPending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              ) : (
                <Save style={{ width: 14, height: 14 }} />
              )}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
