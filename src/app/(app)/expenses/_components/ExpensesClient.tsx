"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Upload,
  Pencil,
  Trash2,
  Search,
  Receipt,
  TrendingUp,
  RefreshCw,
  Award,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CategoryBadge } from "./CategoryBadge";
import { ExpenseForm, type ExpenseFormData } from "./ExpenseForm";
import { ImportModal } from "./ImportModal";
import { CategoryAnalysis } from "./CategoryAnalysis";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type ExpenseWithEntity,
} from "@/lib/actions/expenses";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/expense-categorizer";
import { formatILS } from "@/lib/money";

interface Props {
  entities: { id: string; name: string }[];
}

type Tab = "list" | "analysis" | "recurring";

const inputStyle = {
  background: "var(--bg-tint)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
} as const;

export function ExpensesClient({ entities }: Props) {
  const t = useTranslations("expenses");

  // State
  const [tab, setTab] = useState<Tab>("list");
  const [expenses, setExpenses] = useState<ExpenseWithEntity[]>([]);
  const [summary, setSummary] = useState({
    totalYear: 0,
    thisMonth: 0,
    recurringMonthly: 0,
    topCategory: null as string | null,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");

  // Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithEntity | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getExpenses({
      category: categoryFilter || undefined,
      year: yearFilter || undefined,
      month: monthFilter || undefined,
      search: searchFilter || undefined,
      recurringOnly: tab === "recurring",
    });
    if (result.data) {
      setExpenses(result.data.expenses);
      setSummary(result.data.summary);
    }
    setLoading(false);
  }, [categoryFilter, yearFilter, monthFilter, searchFilter, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  async function handleCreate(data: ExpenseFormData) {
    setFormError(null);
    setSubmitting(true);
    const result = await createExpense(data);
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setShowAddForm(false);
    loadData();
  }

  async function handleUpdate(data: ExpenseFormData) {
    if (!editingExpense) return;
    setFormError(null);
    setSubmitting(true);
    const result = await updateExpense(editingExpense.id, data);
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setEditingExpense(null);
    loadData();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteExpense(id);
    setDeletingId(null);
    loadData();
  }

  const topCategoryLabel = summary.topCategory
    ? EXPENSE_CATEGORIES[summary.topCategory as ExpenseCategory]?.label ?? summary.topCategory
    : "—";

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const tabs: { key: Tab; label: string }[] = [
    { key: "list", label: t("tab_list") },
    { key: "analysis", label: t("tab_analysis") },
    { key: "recurring", label: t("tab_recurring") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 self-start" style={{ background: "var(--bg-muted)" }}>
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className="transition-colors"
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: tab === tb.key ? "rgba(13,148,136,0.12)" : "transparent",
              color: tab === tb.key ? "#0d9488" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "analysis" ? (
        <CategoryAnalysis />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label={t("totalThisMonth")} value={formatILS(summary.thisMonth)} icon={Receipt} />
            <KpiCard label={t("totalThisYear")} value={formatILS(summary.totalYear)} icon={TrendingUp} />
            <KpiCard label={t("recurringMonthly")} value={formatILS(summary.recurringMonthly)} icon={RefreshCw} />
            <KpiCard label={t("topCategory")} value={topCategoryLabel} icon={Award} />
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ ...inputStyle, height: 36, padding: "0 12px" }}
            >
              <option value="">{t("allCategories")}</option>
              {(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, { label: string }][]).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              style={{ ...inputStyle, height: 36, padding: "0 12px" }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(Number(e.target.value))}
              style={{ ...inputStyle, height: 36, padding: "0 12px" }}
            >
              <option value={0}>{t("allMonths")}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {t(`months.${String(m) as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"}`)}
                </option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t("description")}
                style={{ ...inputStyle, width: "100%", height: 36, paddingInlineStart: 36, paddingInlineEnd: 12 }}
              />
            </div>

            <div className="flex gap-2 ms-auto">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 transition-colors"
                style={{ height: 36, padding: "0 12px", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", border: "1px solid var(--border-strong)", background: "transparent", cursor: "pointer" }}
              >
                <Upload style={{ width: 16, height: 16 }} />
                {t("importFile")}
              </button>
              <button
                onClick={() => { setFormError(null); setShowAddForm(true); }}
                className="flex items-center gap-1.5 transition-colors"
                style={{ height: 36, padding: "0 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--accent-teal)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                {t("addExpense")}
              </button>
            </div>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="rounded-2xl p-5 max-w-lg" style={{ background: "var(--surface-card)", border: "1px solid var(--accent-teal)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                {t("addExpense")}
              </h3>
              <ExpenseForm
                entities={entities}
                onSubmit={handleCreate}
                onCancel={() => setShowAddForm(false)}
                error={formError}
                submitting={submitting}
              />
            </div>
          )}

          {/* Edit form */}
          {editingExpense && (
            <div className="rounded-2xl p-5 max-w-lg" style={{ background: "var(--surface-card)", border: "1px solid var(--accent-teal)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                {t("editExpense")}
              </h3>
              <ExpenseForm
                entities={entities}
                defaultValues={{
                  category: editingExpense.category as ExpenseCategory,
                  description: editingExpense.description ?? undefined,
                  vendorName: editingExpense.vendorName ?? undefined,
                  amount: editingExpense.amount / 100,
                  date: editingExpense.date,
                  entityId: editingExpense.entityId ?? undefined,
                  isRecurring: editingExpense.isRecurring,
                }}
                onSubmit={handleUpdate}
                onCancel={() => { setEditingExpense(null); setFormError(null); }}
                error={formError}
                submitting={submitting}
              />
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="animate-pulse" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                {t("saving")}
              </span>
            </div>
          ) : expenses.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center justify-center mb-4" style={{ width: 48, height: 48, borderRadius: 16, background: "var(--bg-tint)" }}>
                <Receipt style={{ width: 24, height: 24, color: "var(--text-tertiary)" }} />
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{t("noExpenses")}</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}>
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-subtle)" }}>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("date")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("description")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("vendor")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("category")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("entity")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("amount")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("recurring")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("source")}</th>
                    <th className="text-start p-3" style={{ fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="group transition-colors"
                      style={{ borderTop: "1px solid var(--bg-tint)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="p-3 font-mono" dir="ltr" style={{ fontSize: 12, color: "var(--text-primary)" }}>{expense.date}</td>
                      <td className="p-3 max-w-[200px] truncate" style={{ color: "var(--text-primary)" }}>{expense.description}</td>
                      <td className="p-3 max-w-[120px] truncate" style={{ color: "var(--text-secondary)" }}>{expense.vendorName}</td>
                      <td className="p-3"><CategoryBadge category={expense.category as ExpenseCategory} /></td>
                      <td className="p-3" style={{ color: "var(--text-secondary)", fontSize: 12 }}>{expense.entityName ?? "—"}</td>
                      <td className="p-3 font-mono" dir="ltr" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatILS(expense.amount)}</td>
                      <td className="p-3" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{expense.isRecurring ? t("yes") : t("no")}</td>
                      <td className="p-3" style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{expense.importSource === "MANUAL" ? t("manual") : expense.importSource}</td>
                      <td className="p-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setFormError(null); setEditingExpense(expense); setShowAddForm(false); }}
                            className="flex items-center justify-center transition-colors"
                            style={{ width: 28, height: 28, borderRadius: 8, color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
                            title={t("editExpense")}
                          >
                            <Pencil style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            onClick={() => { if (confirm(t("deleteConfirm"))) handleDelete(expense.id); }}
                            disabled={deletingId === expense.id}
                            className="flex items-center justify-center transition-colors disabled:opacity-50"
                            style={{ width: 28, height: 28, borderRadius: 8, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}
                            title={t("deleteConfirm")}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Import Modal */}
          {showImport && (
            <ImportModal onClose={() => { setShowImport(false); loadData(); }} />
          )}
        </>
      )}
    </div>
  );
}
