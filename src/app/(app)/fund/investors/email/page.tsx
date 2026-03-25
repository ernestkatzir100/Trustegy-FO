"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getInvestors, getEmailTemplates, sendInvestorEmail } from "@/lib/actions/investors";
import type { InvestorWithLatestPosition, SendEmailResult } from "@/lib/actions/investors";
import type { EmailTemplate } from "@/db/schema/investors";

// ─── Template defaults ────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES = [
  {
    id: "tpl_distribution",
    name: "Distribution Notice",
    type: "distribution" as const,
    subjectTemplate: "Pineapple Fund — Distribution Notice",
    bodyTemplate:
      "Dear {{name}},\n\nWe are pleased to inform you that a distribution has been processed to your account.\n\nDistribution amount: {{amount}}\nDate: {{date}}\n\nPlease contact us if you have any questions.\n\nBest regards,\nPineapple Fund Management",
  },
  {
    id: "tpl_capital_call",
    name: "Capital Call",
    type: "capital_call" as const,
    subjectTemplate: "Pineapple Fund — Capital Call Notice",
    bodyTemplate:
      "Dear {{name}},\n\nThis is a capital call notice. Please arrange payment of your capital call amount by the due date below.\n\nCall amount: {{amount}}\nDue date: {{date}}\nPayment instructions: {{bank_details}}\n\nBest regards,\nPineapple Fund Management",
  },
  {
    id: "tpl_statement",
    name: "Quarterly Statement",
    type: "statement" as const,
    subjectTemplate: "Pineapple Fund — Q{{quarter}} {{year}} Statement",
    bodyTemplate:
      "Dear {{name}},\n\nPlease find attached your quarterly statement for Q{{quarter}} {{year}}.\n\nCurrent NAV: {{nav}}\nNet return YTD: {{ytd_return}}\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nPineapple Fund Management",
  },
  {
    id: "tpl_general",
    name: "General Update",
    type: "general" as const,
    subjectTemplate: "Pineapple Fund — Update",
    bodyTemplate: "Dear {{name}},\n\n\n\nBest regards,\nPineapple Fund Management",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateOption = (typeof DEFAULT_TEMPLATES)[number] | EmailTemplate;

// ─── Sub-components ───────────────────────────────────────────────────────────

function InvestorChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        background: "rgba(99,102,241,0.12)",
        color: "#818cf8",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {name}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#818cf8",
          padding: 0,
          fontSize: 14,
          lineHeight: 1,
          opacity: 0.7,
        }}
      >
        ×
      </button>
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EmailComposePage() {
  return (
    <Suspense>
      <EmailComposeInner />
    </Suspense>
  );
}

function EmailComposeInner() {
  const searchParams = useSearchParams();
  const preselectedIds = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  const [isPending, startTransition] = useTransition();
  const [investors, setInvestors] = useState<InvestorWithLatestPosition[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>(DEFAULT_TEMPLATES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preselectedIds));
  const [search, setSearch] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>([]);
  const [sendResult, setSendResult] = useState<SendEmailResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load investors + templates
  useEffect(() => {
    setLoading(true);
    Promise.all([getInvestors(), getEmailTemplates()]).then(([invRes, tplRes]) => {
      if (!invRes.error) setInvestors(invRes.data);
      if (!tplRes.error && tplRes.data.length > 0) {
        setTemplates([...DEFAULT_TEMPLATES, ...tplRes.data]);
      }
      setLoading(false);
    });
  }, []);

  const filtered = investors.filter(
    (i) =>
      !search ||
      i.displayName.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedInvestors = investors.filter((i) => selectedIds.has(i.id));

  const applyTemplate = (tpl: TemplateOption) => {
    setSelectedTemplateId(tpl.id);
    setSubject(tpl.subjectTemplate);
    setBody(tpl.bodyTemplate);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    if (selectedIds.size === 0) {
      setError("Select at least one investor.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await sendInvestorEmail({
        investorIds: Array.from(selectedIds),
        subject,
        body,
        templateId: selectedTemplateId ?? undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }
      setSendResult(result.data);
    });
  };

  if (sendResult) {
    return (
      <div style={{ maxWidth: 500 }}>
        <div
          style={{
            background: sendResult.failed === 0 ? "rgba(34,197,94,0.06)" : "rgba(234,179,8,0.06)",
            border: `1px solid ${sendResult.failed === 0 ? "rgba(34,197,94,0.3)" : "rgba(234,179,8,0.3)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 24 }}>{sendResult.failed === 0 ? "✅" : "⚠️"}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
            {sendResult.sent} email{sendResult.sent !== 1 ? "s" : ""} sent
            {sendResult.failed > 0 && `, ${sendResult.failed} failed`}
          </div>
          {sendResult.errors.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sendResult.errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: "#ef4444" }}>
                  {e}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setSendResult(null)}
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--text-secondary)",
              alignSelf: "flex-start",
            }}
          >
            Compose Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
        Compose Email
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left: investor picker */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            flex: "0 0 280px",
            minWidth: 240,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
              Recipients
            </span>
            <button
              onClick={() => {
                if (selectedIds.size === filtered.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(filtered.map((i) => i.id)));
                }
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                color: "var(--text-muted)",
                padding: 0,
              }}
            >
              {selectedIds.size === filtered.length ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
            <input
              placeholder="Search investors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                No investors found
              </div>
            ) : (
              filtered.map((inv) => (
                <label
                  key={inv.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    background: selectedIds.has(inv.id) ? "rgba(99,102,241,0.06)" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(inv.id)}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(inv.id);
                      else next.delete(inv.id);
                      setSelectedIds(next);
                    }}
                    style={{ accentColor: "var(--accent)", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inv.displayName}
                    </div>
                    {inv.email && (
                      <div style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {inv.email}
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>

          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
            {selectedIds.size} selected
          </div>
        </div>

        {/* Right: compose */}
        <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Template picker */}
          <div
            style={{
              background: "var(--surface-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Template
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setSelectedTemplateId(null);
                  setSubject("");
                  setBody("");
                }}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: `1px solid ${!selectedTemplateId ? "var(--accent)" : "var(--border)"}`,
                  background: !selectedTemplateId ? "rgba(99,102,241,0.12)" : "var(--surface-elevated)",
                  color: !selectedTemplateId ? "var(--accent)" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Free-form
              </button>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  style={{
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `1px solid ${selectedTemplateId === tpl.id ? "var(--accent)" : "var(--border)"}`,
                    background: selectedTemplateId === tpl.id ? "rgba(99,102,241,0.12)" : "var(--surface-elevated)",
                    color: selectedTemplateId === tpl.id ? "var(--accent)" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected recipients chips */}
          {selectedInvestors.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selectedInvestors.slice(0, 8).map((inv) => (
                <InvestorChip
                  key={inv.id}
                  name={inv.displayName}
                  onRemove={() => {
                    const next = new Set(selectedIds);
                    next.delete(inv.id);
                    setSelectedIds(next);
                  }}
                />
              ))}
              {selectedInvestors.length > 8 && (
                <span style={{ fontSize: 12, color: "var(--text-muted)", padding: "3px 6px" }}>
                  +{selectedInvestors.length - 8} more
                </span>
              )}
            </div>
          )}

          {/* Subject */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject…"
              style={{
                width: "100%",
                background: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--text-primary)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Body */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={12}
              style={{
                width: "100%",
                background: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--text-primary)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Use {"{{name}}"}, {"{{nav}}"}, {"{{date}}"}, {"{{amount}}"} as placeholders
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Attachments
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {attachments.map((att, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px",
                    background: "var(--surface-elevated)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <span style={{ flex: 1, color: "var(--text-secondary)" }}>📎 {att.name}</span>
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "var(--surface-elevated)",
                  border: "1px dashed var(--border)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                + Add attachment (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // In production, upload to blob storage and get URL
                    // For now, store filename only — URL populated on upload
                    const url = URL.createObjectURL(file);
                    setAttachments((prev) => [...prev, { name: file.name, url }]);
                  }}
                />
              </label>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={isPending || selectedIds.size === 0 || !subject || !body}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: isPending || selectedIds.size === 0 || !subject || !body ? "not-allowed" : "pointer",
              opacity: isPending || selectedIds.size === 0 || !subject || !body ? 0.5 : 1,
              alignSelf: "flex-start",
            }}
          >
            {isPending
              ? `Sending to ${selectedIds.size}…`
              : `Send to ${selectedIds.size} investor${selectedIds.size !== 1 ? "s" : ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
