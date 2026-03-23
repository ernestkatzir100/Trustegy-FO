"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { parseImportFile, type ParsedRow } from "@/lib/import-parsers";
import { importExpenses } from "@/lib/actions/expenses";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/expense-categorizer";

interface ImportModalProps {
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const inputStyle = {
  background: "var(--bg-tint)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  color: "var(--text-primary)",
  outline: "none",
} as const;

export function ImportModal({ onClose }: ImportModalProps) {
  const t = useTranslations("expenses");
  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<string>("BANK_MIZRAHI");
  const [rows, setRows] = useState<(ParsedRow & { included: boolean })[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseInfo, setParseInfo] = useState({ total: 0, skipped: 0, account: "" });
  const [importResult, setImportResult] = useState<{
    imported: number;
    duplicates: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await parseImportFile(file);
      setRows(result.rows.map((r) => ({ ...r, included: true })));
      setParseErrors(result.errors);
      setParseInfo({
        total: result.totalRows,
        skipped: result.skippedRows,
        account: result.accountInfo,
      });
      setStep(2);
    } catch {
      setParseErrors(["שגיאה בקריאת הקובץ"]);
    } finally {
      setLoading(false);
    }
  }

  function toggleRow(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, included: !r.included } : r))
    );
  }

  function updateCategory(index: number, category: ExpenseCategory) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, category } : r))
    );
  }

  async function handleImport() {
    setLoading(true);
    const toImport = rows
      .filter((r) => r.included)
      .map((r) => ({
        date: r.date,
        description: r.description,
        vendor_name: r.vendor_name,
        amount: r.amount,
        category: r.category,
        source,
      }));

    const result = await importExpenses(toImport);
    if (result.data) {
      setImportResult(result.data);
    }
    setStep(3);
    setLoading(false);
  }

  const includedCount = rows.filter((r) => r.included).length;
  const excludedCount = rows.length - includedCount;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col" style={{ background: "var(--surface-card)", borderRadius: 16, border: "1px solid var(--border-strong)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {t("import_title")}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-colors"
            style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <X style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Source selector */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("import_selectSource")}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "BANK_MIZRAHI", label: t("import_bankMizrahi") },
                    { value: "CREDIT_MAX", label: t("import_creditMax") },
                    { value: "GENERIC", label: t("import_generic") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSource(opt.value)}
                      className="transition-colors"
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        fontSize: 13,
                        border: source === opt.value ? "1px solid rgba(13,148,136,0.4)" : "1px solid var(--border-subtle)",
                        background: source === opt.value ? "rgba(13,148,136,0.12)" : "transparent",
                        color: source === opt.value ? "#0d9488" : "var(--text-secondary)",
                        fontWeight: source === opt.value ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File input */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("import_selectFile")}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl cursor-pointer transition-colors"
                  style={{ border: "2px dashed var(--border-strong)" }}
                >
                  <Upload style={{ width: 32, height: 32, color: "var(--text-tertiary)" }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {t("import_acceptFormats")}
                  </span>
                  {loading && (
                    <span className="animate-pulse" style={{ fontSize: 12, color: "#0d9488" }}>
                      {t("saving")}
                    </span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {parseErrors.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.12)" }}>
                  <AlertCircle style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
                  <div className="flex flex-col gap-1">
                    {parseErrors.map((err, i) => (
                      <p key={i} style={{ fontSize: 12, color: "#ef4444" }}>{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4" style={{ fontSize: 13 }}>
                {parseInfo.account && (
                  <span style={{ color: "var(--text-secondary)" }}>{parseInfo.account}</span>
                )}
                <span style={{ color: "#22c55e", fontWeight: 600 }}>
                  {includedCount} {t("import_identified")}
                </span>
                {excludedCount > 0 && (
                  <span style={{ color: "var(--text-tertiary)" }}>
                    {excludedCount} {t("import_skipped")}
                  </span>
                )}
              </div>

              {/* Preview table */}
              <div className="overflow-auto rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
                <table className="w-full" style={{ fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-subtle)" }}>
                      <th className="text-start p-2" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("import_include")}</th>
                      <th className="text-start p-2" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("date")}</th>
                      <th className="text-start p-2" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("description")}</th>
                      <th className="text-start p-2" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("vendor")}</th>
                      <th className="text-start p-2" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("amount")}</th>
                      <th className="text-start p-2" style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>{t("category")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid var(--bg-tint)",
                          opacity: row.included ? 1 : 0.4,
                        }}
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={row.included}
                            onChange={() => toggleRow(i)}
                            style={{ width: 14, height: 14, accentColor: "#0d9488" }}
                          />
                        </td>
                        <td className="p-2 font-mono" dir="ltr" style={{ color: "var(--text-primary)" }}>{row.date}</td>
                        <td className="p-2 max-w-[200px] truncate" style={{ color: "var(--text-primary)" }}>{row.description}</td>
                        <td className="p-2 max-w-[120px] truncate" style={{ color: "var(--text-secondary)" }}>{row.vendor_name}</td>
                        <td className="p-2 font-mono" dir="ltr" style={{ color: "var(--text-primary)" }}>
                          {row.amount.toLocaleString("he-IL", { style: "currency", currency: "ILS" })}
                        </td>
                        <td className="p-2">
                          <select
                            value={row.category}
                            onChange={(e) => updateCategory(i, e.target.value as ExpenseCategory)}
                            style={{ ...inputStyle, fontSize: 11, height: 28, padding: "0 8px" }}
                          >
                            {(
                              Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, { label: string }][]
                            ).map(([key, { label }]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(34,197,94,0.15)" }}>
                <Check style={{ width: 24, height: 24, color: "#22c55e" }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                {t("import_results")}
              </h3>
              <div className="flex gap-6" style={{ fontSize: 14 }}>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>
                    {importResult?.imported ?? 0}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{t("import_imported")}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-tertiary)" }}>
                    {importResult?.duplicates ?? 0}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{t("import_duplicates")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="transition-colors"
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", border: "1px solid var(--border-strong)", background: "transparent", cursor: "pointer" }}
            >
              {t("import_back")}
            </button>
          ) : <div />}

          {step === 2 && (
            <button
              onClick={handleImport}
              disabled={loading || includedCount === 0}
              className="transition-colors disabled:opacity-50"
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none", cursor: "pointer" }}
            >
              {loading ? t("saving") : `${t("import_confirm")} (${includedCount})`}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={onClose}
              className="transition-colors"
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none", cursor: "pointer" }}
            >
              {t("import_close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
