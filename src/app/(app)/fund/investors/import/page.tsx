"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  parseInvestorsSheet,
  parseDistributorsSheet,
  parseTransactionsSheet,
  parseDistributionsSheet,
  dedupeInvestors,
  type ParsedInvestor,
  type ParsedPosition,
  type ParsedRedemption,
  type ParsedDistributor,
} from "@/lib/import-investors";
import { bulkImportInvestors } from "@/lib/actions/investors";
import type { InsertInvestor } from "@/db/schema/investors";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "upload" | "preview" | "done";

interface ParsedFiles {
  investors: ParsedInvestor[];
  distributors: ParsedDistributor[];
  positions: ParsedPosition[];
  redemptions: ParsedRedemption[];
  reviewNeeded: Array<{ a: InsertInvestor; b: InsertInvestor; reason: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileSlot({
  label,
  hint,
  file,
  onFile,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "16px 20px",
        background: file ? "rgba(34,197,94,0.06)" : "var(--surface-elevated)",
        border: `1px dashed ${file ? "#22c55e" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{file ? "✅" : "📂"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {file ? file.name : hint}
          </div>
        </div>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InvestorImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // File slots
  const [investorsFile, setInvestorsFile] = useState<File | null>(null);
  const [distributorsFile, setDistributorsFile] = useState<File | null>(null);
  const [transactionsFile, setTransactionsFile] = useState<File | null>(null);
  const [distributionsFile, setDistributionsFile] = useState<File | null>(null);

  // Parsed data
  const [parsed, setParsed] = useState<ParsedFiles | null>(null);
  const [importResult, setImportResult] = useState<{
    investorCount: number;
    distributorCount: number;
    positionCount: number;
    redemptionCount: number;
  } | null>(null);

  const readBuffer = (file: File): Promise<ArrayBuffer> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target!.result as ArrayBuffer);
      reader.onerror = rej;
      reader.readAsArrayBuffer(file);
    });

  const handleParse = () => {
    if (!investorsFile) {
      setError("Investor register file is required.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const invBuf = await readBuffer(investorsFile);
        const rawInvestors = parseInvestorsSheet(invBuf).map((p) => p.row);
        const { merged, needsReview } = dedupeInvestors(rawInvestors);

        let parsedDist: ParsedDistributor[] = [];
        if (distributorsFile) {
          const buf = await readBuffer(distributorsFile);
          parsedDist = parseDistributorsSheet(buf);
        }

        let parsedPositions: ParsedPosition[] = [];
        if (transactionsFile) {
          const buf = await readBuffer(transactionsFile);
          parsedPositions = parseTransactionsSheet(buf);
        }

        let parsedRedemptions: ParsedRedemption[] = [];
        if (distributionsFile) {
          const buf = await readBuffer(distributionsFile);
          parsedRedemptions = parseDistributionsSheet(buf);
        }

        setParsed({
          investors: merged.map((row) => ({ row })),
          distributors: parsedDist,
          positions: parsedPositions,
          redemptions: parsedRedemptions,
          reviewNeeded: needsReview,
        });
        setStep("preview");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse files");
      }
    });
  };

  const handleImport = () => {
    if (!parsed) return;
    setError(null);

    startTransition(async () => {
      try {
        // Attach lookup keys to positions and redemptions so the action can resolve investor IDs
        const positionsWithKeys = parsed.positions.map((p) => ({
          ...p.row,
          _partnerId: p.partnerId ?? undefined,
          _email: p.investorEmail ?? undefined,
          _name: p.investorName,
        }));

        const redemptionsWithKeys = parsed.redemptions.map((r) => ({
          ...r.row,
          _email: r.investorEmail ?? undefined,
          _name: r.investorName,
        }));

        const result = await bulkImportInvestors({
          investors: parsed.investors.map((i) => i.row),
          distributors: parsed.distributors.map((d) => d.row),
          positions: positionsWithKeys as never,
          redemptions: redemptionsWithKeys as never,
        });

        if (result.error) {
          setError(result.error.message);
          return;
        }

        setImportResult(result.data);
        setStep("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed");
      }
    });
  };

  // ── Step: Upload ─────────────────────────────────────────────────────────

  if (step === "upload") {
    return (
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
            Import Investor Data
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            One-time migration from Monday.com exports. Upload your board exports below.
            The investor register is required; the rest are optional.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FileSlot
            label="Investor Register *"
            hint="ניהול משקיעים — required"
            file={investorsFile}
            onFile={setInvestorsFile}
          />
          <FileSlot
            label="Distributors"
            hint="ניהול מפיצים — optional"
            file={distributorsFile}
            onFile={setDistributorsFile}
          />
          <FileSlot
            label="Transactions (עסקאות)"
            hint="Monthly performance snapshots — optional, large file"
            file={transactionsFile}
            onFile={setTransactionsFile}
          />
          <FileSlot
            label="Distributions / Redemptions (חלוקות)"
            hint="Capital returned to investors — optional"
            file={distributionsFile}
            onFile={setDistributionsFile}
          />
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
          onClick={handleParse}
          disabled={!investorsFile || isPending}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: investorsFile && !isPending ? "pointer" : "not-allowed",
            opacity: investorsFile && !isPending ? 1 : 0.5,
            alignSelf: "flex-start",
          }}
        >
          {isPending ? "Parsing files…" : "Parse & Preview →"}
        </button>
      </div>
    );
  }

  // ── Step: Preview ─────────────────────────────────────────────────────────

  if (step === "preview" && parsed) {
    const reviewCount = parsed.investors.filter((i) => i.row.dedupStatus === "review_needed").length;
    const cleanCount = parsed.investors.length - reviewCount;

    return (
      <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
            Preview Import
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Review the parsed data before committing to the database.
          </p>
        </div>

        {/* Summary card */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            padding: "20px 24px",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 12 }}>
            Import Summary
          </div>
          <SummaryRow label="Investors (ready)" value={cleanCount} />
          <SummaryRow label="Investors (need review)" value={reviewCount} />
          <SummaryRow label="Distributors" value={parsed.distributors.length} />
          <SummaryRow label="Monthly positions (full history)" value={parsed.positions.length} />
          <SummaryRow label="Redemptions" value={parsed.redemptions.length} />
        </div>

        {/* Review-needed list */}
        {reviewCount > 0 && (
          <div
            style={{
              background: "rgba(234,179,8,0.06)",
              border: "1px solid rgba(234,179,8,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#eab308", marginBottom: 10 }}>
              ⚠ {reviewCount} investor{reviewCount !== 1 ? "s" : ""} flagged for review
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px" }}>
              These records have no Partner ID or email — they will be imported with status
              &ldquo;review_needed&rdquo; and can be merged manually from the investor list.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {parsed.investors
                .filter((i) => i.row.dedupStatus === "review_needed")
                .slice(0, 10)
                .map((i, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    {i.row.displayName}
                  </div>
                ))}
              {reviewCount > 10 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  … and {reviewCount - 10} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample investors table */}
        <div
          style={{
            background: "var(--surface-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--text-muted)",
            }}
          >
            Sample investors (first 10)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Partner ID", "Email", "Currency", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "start",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        fontSize: 10,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.investors.slice(0, 10).map((i, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px", color: "var(--text-primary)", fontWeight: 600 }}>
                      {i.row.displayName}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      {i.row.partnerId ?? "—"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>
                      {i.row.email ?? "—"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
                      {i.row.currencyClass}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {i.row.dedupStatus === "review_needed" ? (
                        <span style={{ color: "#eab308", fontSize: 11, fontWeight: 700 }}>Review</span>
                      ) : (
                        <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>✓ Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setStep("upload")}
            disabled={isPending}
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleImport}
            disabled={isPending}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending
              ? `Importing ${parsed.investors.length + parsed.positions.length} records…`
              : `Confirm Import →`}
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Done ────────────────────────────────────────────────────────────

  if (step === "done" && importResult) {
    return (
      <div style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 24 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
            Import complete
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SummaryRow label="Investors imported" value={importResult.investorCount} />
            <SummaryRow label="Distributors imported" value={importResult.distributorCount} />
            <SummaryRow label="Monthly positions" value={importResult.positionCount} />
            <SummaryRow label="Redemptions" value={importResult.redemptionCount} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.push("/fund/investors")}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View Investors →
          </button>
        </div>
      </div>
    );
  }

  return null;
}
