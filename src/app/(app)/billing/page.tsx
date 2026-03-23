import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { BillingClient, type Milestone } from "./_components/BillingClient";

/* ── Demo data (no DB table yet) ────────────────────────── */
const DEMO_MILESTONES: Milestone[] = [
  { project: "בניין רוטשילד 42", stage: "שלב 1 - תכנון", date: "2026-01-15", amount: 125000, vat: 21250, status: "paid", invoice: "INV-2026-001" },
  { project: "בניין רוטשילד 42", stage: "שלב 2 - ביצוע", date: "2026-03-01", amount: 250000, vat: 42500, status: "billed", invoice: "INV-2026-012" },
  { project: "פרויקט השקעות צפון", stage: "ייעוץ ראשוני", date: "2026-04-01", amount: 85000, vat: 14450, status: "pending", invoice: null },
  { project: "תיק השקעות גלובלי", stage: "דמי ניהול Q1", date: "2026-03-31", amount: 45000, vat: 7650, status: "paid", invoice: "INV-2026-008" },
  { project: "מגדל עזריאלי", stage: "שלב סופי", date: "2025-12-15", amount: 420000, vat: 71400, status: "paid", invoice: "INV-2025-045" },
  { project: "ליווי עסקה דרום", stage: "הצעת מחיר", date: "2026-05-01", amount: 95000, vat: 16150, status: "pending", invoice: null },
];

export default async function BillingPage() {
  void (await getTranslations("modules"));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            חיוב
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            ניהול אבני דרך וחשבוניות
          </p>
        </div>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          הוסף אבן דרך
        </button>
      </div>

      {/* ── Interactive content (client) ────────────────── */}
      <BillingClient milestones={DEMO_MILESTONES} />
    </div>
  );
}
