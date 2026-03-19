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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg border border-cream-darker w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-darker">
          <h2 className="text-[16px] font-semibold text-text-primary">
            {t("import_title")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cream-dark transition-colors"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* Source selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-text-secondary">
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
                      className={`px-4 py-2 rounded-lg text-[13px] border transition-colors ${
                        source === opt.value
                          ? "border-gold bg-gold/10 text-gold-dark font-medium"
                          : "border-cream-darker text-text-secondary hover:bg-cream-dark"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File input */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-text-secondary">
                  {t("import_selectFile")}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-cream-darker hover:border-gold/50 cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-text-tertiary" />
                  <span className="text-[13px] text-text-secondary">
                    {t("import_acceptFormats")}
                  </span>
                  {loading && (
                    <span className="text-[12px] text-gold animate-pulse">
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
                <div className="flex items-start gap-2 p-3 rounded-lg bg-status-red-bg">
                  <AlertCircle className="w-4 h-4 text-status-red flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    {parseErrors.map((err, i) => (
                      <p key={i} className="text-[12px] text-status-red">
                        {err}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-[13px]">
                {parseInfo.account && (
                  <span className="text-text-secondary">
                    {parseInfo.account}
                  </span>
                )}
                <span className="text-status-green font-medium">
                  {includedCount} {t("import_identified")}
                </span>
                {excludedCount > 0 && (
                  <span className="text-text-tertiary">
                    {excludedCount} {t("import_skipped")}
                  </span>
                )}
              </div>

              {/* Preview table */}
              <div className="overflow-auto rounded-xl border border-cream-darker">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-cream-dark text-text-secondary">
                      <th className="text-start p-2 font-medium">
                        {t("import_include")}
                      </th>
                      <th className="text-start p-2 font-medium">
                        {t("date")}
                      </th>
                      <th className="text-start p-2 font-medium">
                        {t("description")}
                      </th>
                      <th className="text-start p-2 font-medium">
                        {t("vendor")}
                      </th>
                      <th className="text-start p-2 font-medium">
                        {t("amount")}
                      </th>
                      <th className="text-start p-2 font-medium">
                        {t("category")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-t border-cream-darker ${
                          !row.included ? "opacity-40" : ""
                        }`}
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={row.included}
                            onChange={() => toggleRow(i)}
                            className="w-3.5 h-3.5 rounded border-cream-darker text-gold focus:ring-gold"
                          />
                        </td>
                        <td className="p-2 font-mono" dir="ltr">
                          {row.date}
                        </td>
                        <td className="p-2 max-w-[200px] truncate">
                          {row.description}
                        </td>
                        <td className="p-2 max-w-[120px] truncate">
                          {row.vendor_name}
                        </td>
                        <td className="p-2 font-mono" dir="ltr">
                          {row.amount.toLocaleString("he-IL", {
                            style: "currency",
                            currency: "ILS",
                          })}
                        </td>
                        <td className="p-2">
                          <select
                            value={row.category}
                            onChange={(e) =>
                              updateCategory(
                                i,
                                e.target.value as ExpenseCategory
                              )
                            }
                            className="text-[11px] h-7 px-2 rounded border border-cream-darker bg-cream focus:outline-none focus:ring-1 focus:ring-gold"
                          >
                            {(
                              Object.entries(EXPENSE_CATEGORIES) as [
                                ExpenseCategory,
                                { label: string },
                              ][]
                            ).map(([key, { label }]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
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
              <div className="w-12 h-12 rounded-full bg-status-green-bg flex items-center justify-center">
                <Check className="w-6 h-6 text-status-green" />
              </div>
              <h3 className="text-[16px] font-semibold text-text-primary">
                {t("import_results")}
              </h3>
              <div className="flex gap-6 text-[14px]">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[20px] font-semibold text-status-green">
                    {importResult?.imported ?? 0}
                  </span>
                  <span className="text-text-secondary">
                    {t("import_imported")}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[20px] font-semibold text-text-tertiary">
                    {importResult?.duplicates ?? 0}
                  </span>
                  <span className="text-text-secondary">
                    {t("import_duplicates")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-cream-darker">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg text-[13px] text-text-secondary border border-cream-darker hover:bg-cream-dark transition-colors"
            >
              {t("import_back")}
            </button>
          )}
          {step !== 2 && <div />}

          {step === 2 && (
            <button
              onClick={handleImport}
              disabled={loading || includedCount === 0}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {loading
                ? t("saving")
                : `${t("import_confirm")} (${includedCount})`}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
            >
              {t("import_close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
