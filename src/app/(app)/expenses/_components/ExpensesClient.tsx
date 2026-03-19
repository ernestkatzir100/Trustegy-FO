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
  const [editingExpense, setEditingExpense] = useState<ExpenseWithEntity | null>(
    null
  );
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
    ? EXPENSE_CATEGORIES[summary.topCategory as ExpenseCategory]?.label ?? "—"
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
      <div className="flex gap-1 bg-cream-dark rounded-xl p-1 self-start">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              tab === tb.key
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
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
            <KpiCard
              label={t("totalThisMonth")}
              value={formatILS(summary.thisMonth)}
              icon={<Receipt className="w-4 h-4 text-text-tertiary" />}
            />
            <KpiCard
              label={t("totalThisYear")}
              value={formatILS(summary.totalYear)}
              icon={<TrendingUp className="w-4 h-4 text-text-tertiary" />}
            />
            <KpiCard
              label={t("recurringMonthly")}
              value={formatILS(summary.recurringMonthly)}
              icon={<RefreshCw className="w-4 h-4 text-text-tertiary" />}
            />
            <KpiCard
              label={t("topCategory")}
              value={topCategoryLabel}
              icon={<Award className="w-4 h-4 text-text-tertiary" />}
            />
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-cream-darker bg-white text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">{t("allCategories")}</option>
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

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="h-9 px-3 rounded-lg border border-cream-darker bg-white text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(Number(e.target.value))}
              className="h-9 px-3 rounded-lg border border-cream-darker bg-white text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value={0}>{t("allMonths")}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {t(`months.${String(m) as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"}`)}
                </option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t("description")}
                className="w-full h-9 ps-9 pe-3 rounded-lg border border-cream-darker bg-white text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="flex gap-2 ms-auto">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] text-text-secondary border border-cream-darker hover:bg-cream-dark transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t("importFile")}
              </button>
              <button
                onClick={() => {
                  setFormError(null);
                  setShowAddForm(true);
                }}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("addExpense")}
              </button>
            </div>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="rounded-2xl border border-gold/30 bg-white p-5 shadow-sm max-w-lg">
              <h3 className="text-[14px] font-semibold text-text-primary mb-3">
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
            <div className="rounded-2xl border border-gold/30 bg-white p-5 shadow-sm max-w-lg">
              <h3 className="text-[14px] font-semibold text-text-primary mb-3">
                {t("editExpense")}
              </h3>
              <ExpenseForm
                entities={entities}
                defaultValues={{
                  category: editingExpense.category as ExpenseCategory,
                  description: editingExpense.description ?? undefined,
                  vendorName: editingExpense.vendorName ?? undefined,
                  amount: editingExpense.amount / 100, // agorot → ILS
                  date: editingExpense.date,
                  entityId: editingExpense.entityId ?? undefined,
                  isRecurring: editingExpense.isRecurring,
                }}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setEditingExpense(null);
                  setFormError(null);
                }}
                error={formError}
                submitting={submitting}
              />
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-[13px] text-text-tertiary animate-pulse">
                {t("saving")}
              </span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-cream-darker bg-white shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cream-dark flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-text-tertiary" />
              </div>
              <p className="text-[14px] text-text-secondary">
                {t("noExpenses")}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-cream-darker bg-white shadow-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-cream-dark text-text-secondary">
                    <th className="text-start p-3 font-medium">{t("date")}</th>
                    <th className="text-start p-3 font-medium">
                      {t("description")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("vendor")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("category")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("entity")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("amount")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("recurring")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("source")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-t border-cream-darker hover:bg-cream/50 group"
                    >
                      <td className="p-3 font-mono text-[12px]" dir="ltr">
                        {expense.date}
                      </td>
                      <td className="p-3 max-w-[200px] truncate">
                        {expense.description}
                      </td>
                      <td className="p-3 max-w-[120px] truncate text-text-secondary">
                        {expense.vendorName}
                      </td>
                      <td className="p-3">
                        <CategoryBadge
                          category={expense.category as ExpenseCategory}
                        />
                      </td>
                      <td className="p-3 text-text-secondary text-[12px]">
                        {expense.entityName ?? "—"}
                      </td>
                      <td
                        className="p-3 font-mono font-medium text-text-primary"
                        dir="ltr"
                      >
                        {formatILS(expense.amount)}
                      </td>
                      <td className="p-3 text-[12px] text-text-secondary">
                        {expense.isRecurring ? t("yes") : t("no")}
                      </td>
                      <td className="p-3 text-[11px] text-text-tertiary">
                        {expense.importSource === "MANUAL"
                          ? t("manual")
                          : expense.importSource}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setFormError(null);
                              setEditingExpense(expense);
                              setShowAddForm(false);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-cream-dark transition-colors"
                            title={t("editExpense")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t("deleteConfirm"))) {
                                handleDelete(expense.id);
                              }
                            }}
                            disabled={deletingId === expense.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-status-red hover:bg-status-red-bg transition-colors disabled:opacity-50"
                            title={t("deleteConfirm")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
            <ImportModal
              onClose={() => {
                setShowImport(false);
                loadData();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
