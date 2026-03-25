"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, X, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { importFundHoldings, analyzeBatchHoldings } from "@/lib/actions/fund";
import type { ImportResult, AiAnalysisResult } from "@/lib/actions/fund";
import type { ImportPreviewResult } from "@/app/api/fund/import/route";
import type { Platform } from "@/db/schema/fund";

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "upright", label: "Upright / FTF" },
  { value: "sharestates", label: "Sharestates" },
  { value: "upgrade", label: "Upgrade / Prosper" },
];

const ACCEPT = ".xlsx,.xls,.csv";

function fmt(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function bpToPercent(bp: number | null | undefined): string {
  if (bp == null) return "—";
  return `${(bp / 100).toFixed(2)}%`;
}

function friendlyField(key: string): string {
  const map: Record<string, string> = {
    currentPrincipal: "Current Principal",
    status: "Status",
    subStatus: "Sub-Status",
    maturityDate: "Maturity Date",
    lastUpdateText: "Last Update",
    apr: "APR",
    arv: "ARV",
    loanToArv: "Loan-to-ARV",
    propertyAddress: "Address",
  };
  return map[key] ?? key;
}

function formatFieldValue(key: string, value: unknown): string {
  if (value == null) return "—";
  if (key === "currentPrincipal" || key === "arv") return fmt(value as number);
  if (key === "apr" || key === "loanToArv") return bpToPercent(value as number);
  return String(value);
}

type Phase = "idle" | "previewing" | "preview_ready" | "committing" | "done" | "error";

export default function FundImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [platformOverride, setPlatformOverride] = useState<Platform | "">("");
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setFile(null);
    setPreview(null);
    setPhase("idle");
    setErrorMsg(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreview(null);
    setPhase("idle");
    setErrorMsg(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handlePreview = async () => {
    if (!file) return;
    setPhase("previewing");
    setErrorMsg(null);

    const fd = new FormData();
    fd.append("file", file);
    if (platformOverride) fd.append("platform", platformOverride);

    try {
      const res = await fetch("/api/fund/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Preview failed");
        setPhase("error");
        return;
      }
      setPreview(json as ImportPreviewResult);
      setPhase("preview_ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setPhase("error");
    }
  };

  const handleCommit = () => {
    if (!preview) return;
    setPhase("committing");
    startTransition(async () => {
      const result = await importFundHoldings(preview.rows.map((r) => r.parsed));
      if (result.error) {
        setErrorMsg(result.error.message);
        setPhase("error");
      } else {
        setImportResult(result.data);
        setPhase("done");
      }
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 4 }}>
          Data Import
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Upload monthly Excel / CSV reports from Upright, Sharestates, or Upgrade to sync holdings data.
        </p>
      </div>

      {phase === "done" && importResult ? (
        <DoneCard result={importResult} onReset={reset} />
      ) : (
        <>
          {/* Upload area + platform selector */}
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              padding: 32,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                  background: dragging ? "var(--sidebar-hover)" : "transparent",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  onChange={onFileChange}
                  style={{ display: "none" }}
                />
                {file ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <FileSpreadsheet style={{ width: 28, height: 28, color: "var(--accent)", flexShrink: 0 }} />
                    <div style={{ textAlign: "start" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {(file.size / 1024).toFixed(0)} KB · click to change
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      style={{ marginInlineStart: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                    >
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload style={{ width: 32, height: 32, color: "var(--text-muted)", margin: "0 auto 12px" }} />
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
                      Drop file here or click to browse
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      .xlsx, .xls, .csv
                    </div>
                  </>
                )}
              </div>

              {/* Platform selector */}
              <div style={{ minWidth: 200 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Platform
                </label>
                <select
                  value={platformOverride}
                  onChange={(e) => setPlatformOverride(e.target.value as Platform | "")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-strong)",
                    background: "var(--surface-elevated)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <option value="">Auto-detect</option>
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  Detected from filename by default
                </div>

                <button
                  type="button"
                  disabled={!file || phase === "previewing"}
                  onClick={handlePreview}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: "var(--radius-md)",
                    background: !file || phase === "previewing"
                      ? "var(--surface-elevated)"
                      : "linear-gradient(135deg, var(--accent), var(--accent-container))",
                    color: !file || phase === "previewing" ? "var(--text-muted)" : "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: !file || phase === "previewing" ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.2s",
                  }}
                >
                  {phase === "previewing" ? (
                    <>Parsing…</>
                  ) : (
                    <>
                      <ArrowRight style={{ width: 16, height: 16 }} />
                      Preview Import
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {phase === "error" && errorMsg && (
              <div style={{
                marginTop: 16,
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}>
                <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#ef4444" }}>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Preview diff table */}
          {phase === "preview_ready" && preview && (
            <PreviewTable
              preview={preview}
              onCommit={handleCommit}
              committing={isPending}
            />
          )}
        </>
      )}
    </div>
  );
}

function PreviewTable({
  preview,
  onCommit,
  committing,
}: {
  preview: ImportPreviewResult;
  onCommit: () => void;
  committing: boolean;
}) {
  const hasChanges = preview.newCount + preview.updateCount > 0;
  const platformLabel = PLATFORM_OPTIONS.find((p) => p.value === preview.platform)?.label ?? preview.platform;

  return (
    <div style={{
      background: "var(--surface-card)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      {/* Summary bar */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
      }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{platformLabel}</span>
          {preview.reportDate && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginInlineStart: 8 }}>
              Report date: {preview.reportDate}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, marginInlineStart: "auto", flexWrap: "wrap", alignItems: "center" }}>
          <Chip color="#22c55e" label={`${preview.newCount} new`} />
          <Chip color="var(--accent)" label={`${preview.updateCount} updated`} />
          <Chip color="var(--text-muted)" label={`${preview.rows.length - preview.newCount - preview.updateCount} unchanged`} />
          <button
            type="button"
            disabled={!hasChanges || committing}
            onClick={onCommit}
            style={{
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              background: !hasChanges || committing
                ? "var(--surface-elevated)"
                : "linear-gradient(135deg, var(--accent), var(--accent-container))",
              color: !hasChanges || committing ? "var(--text-muted)" : "#fff",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: !hasChanges || committing ? "not-allowed" : "pointer",
            }}
          >
            {committing ? "Importing…" : `Commit ${preview.newCount + preview.updateCount} changes`}
          </button>
        </div>
      </div>

      {/* Rows */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["", "Offering ID", "Status", "Changes"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px",
                  textAlign: "start",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row) => {
              const changeCount = Object.keys(row.changes).length;
              const isUnchanged = !row.isNew && changeCount === 0;
              return (
                <tr
                  key={row.offeringId}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    opacity: isUnchanged ? 0.45 : 1,
                    background: row.isNew ? "rgba(34,197,94,0.04)" : "transparent",
                  }}
                >
                  <td style={{ padding: "10px 16px", width: 28 }}>
                    {row.isNew ? (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 100, background: "rgba(34,197,94,0.15)", color: "#22c55e", letterSpacing: "0.06em", textTransform: "uppercase" }}>NEW</span>
                    ) : changeCount > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 100, background: "rgba(0,104,95,0.12)", color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>UPD</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 100, background: "var(--surface-elevated)", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 600 }}>
                    {row.offeringId}
                  </td>
                  <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>
                    {row.parsed.status}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {row.isNew ? (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>New position</span>
                    ) : changeCount === 0 ? (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No changes</span>
                    ) : (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.entries(row.changes).map(([key, val]) => (
                          <span
                            key={key}
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 100,
                              background: "var(--surface-elevated)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-strong)",
                            }}
                          >
                            {friendlyField(key)}: {formatFieldValue(key, val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function DoneCard({
  result,
  onReset,
}: {
  result: ImportResult;
  onReset: () => void;
}) {
  const [aiResults, setAiResults] = useState<AiAnalysisResult[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [, startAi] = useTransition();

  const totalAffected = result.affectedIds.length;

  function runAiAnalysis() {
    if (!totalAffected) return;
    setAiLoading(true);
    setAiError(null);
    startAi(async () => {
      const res = await analyzeBatchHoldings(result.affectedIds);
      setAiLoading(false);
      if (res.error) {
        setAiError(res.error.message);
      } else {
        setAiResults(res.data);
      }
    });
  }

  const statusChanges = aiResults?.filter((r) => r.statusChanged) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        padding: 48,
        textAlign: "center",
      }}>
        <CheckCircle2 style={{ width: 48, height: 48, color: "#22c55e", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 8 }}>
          Import complete
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32 }}>
          <Stat label="Inserted" value={result.inserted} color="#22c55e" />
          <Stat label="Updated" value={result.updated} color="var(--accent)" />
          {result.skipped > 0 && <Stat label="Skipped" value={result.skipped} color="var(--text-muted)" />}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {totalAffected > 0 && !aiResults && (
            <button
              type="button"
              onClick={runAiAnalysis}
              disabled={aiLoading}
              style={{
                padding: "10px 24px",
                borderRadius: "var(--radius-md)",
                background: aiLoading ? "var(--surface-elevated)" : "rgba(139,92,246,0.15)",
                color: aiLoading ? "var(--text-muted)" : "#a78bfa",
                fontWeight: 700,
                fontSize: 14,
                border: "1px solid rgba(139,92,246,0.3)",
                cursor: aiLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {aiLoading ? (
                <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
              ) : (
                <Sparkles style={{ width: 16, height: 16 }} />
              )}
              {aiLoading ? `Analyzing ${totalAffected} positions…` : `Analyze ${totalAffected} positions with AI`}
            </button>
          )}
          <a
            href="/fund/portfolio"
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent), var(--accent-container))",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            View Portfolio
          </a>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-elevated)",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: 14,
              border: "1px solid var(--border-strong)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RotateCcw style={{ width: 14, height: 14 }} />
            Import another
          </button>
        </div>
        {aiError && (
          <p style={{ marginTop: 16, fontSize: 12, color: "#f87171" }}>{aiError}</p>
        )}
      </div>

      {/* AI batch results */}
      {aiResults && aiResults.length > 0 && (
        <div style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(139,92,246,0.3)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            background: "rgba(139,92,246,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Sparkles style={{ width: 14, height: 14, color: "#a78bfa" }} />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a78bfa" }}>
              AI Analysis Results
            </span>
            {statusChanges.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fb923c", marginInlineStart: "auto" }}>
                {statusChanges.length} status change{statusChanges.length > 1 ? "s" : ""} suggested — review in portfolio
              </span>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Holding ID", "Suggested Status", "Confidence", "Next Action"].map((h) => (
                    <th key={h} style={{ padding: "8px 16px", textAlign: "start", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiResults.map((r) => (
                  <tr key={r.holdingId} style={{ borderBottom: "1px solid var(--border)", background: r.statusChanged ? "rgba(251,146,60,0.04)" : "transparent" }}>
                    <td style={{ padding: "8px 16px", fontFamily: "monospace", color: "var(--text-muted)", fontSize: 11 }}>
                      {r.holdingId.slice(-8)}
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <span style={{ fontWeight: 700, color: r.statusChanged ? "#fb923c" : "var(--text-primary)" }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 100,
                        background: r.confidence === "high" ? "rgba(34,197,94,0.12)" : r.confidence === "medium" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                        color: r.confidence === "high" ? "#22c55e" : r.confidence === "medium" ? "#f59e0b" : "#ef4444",
                      }}>
                        {r.confidence}
                      </span>
                    </td>
                    <td style={{ padding: "8px 16px", color: "var(--text-secondary)", maxWidth: 320 }}>
                      {r.nextAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: "-0.04em" }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
