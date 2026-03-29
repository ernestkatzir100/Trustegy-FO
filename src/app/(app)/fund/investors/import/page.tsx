"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── File slot ────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ImportResult {
  investorCount: number;
  distributorCount: number;
  positionCount: number;
  redemptionCount: number;
  reviewNeededCount: number;
}

export default function InvestorImportPage() {
  const router = useRouter();
  const [investorsFile, setInvestorsFile] = useState<File | null>(null);
  const [distributorsFile, setDistributorsFile] = useState<File | null>(null);
  const [transactionsFile, setTransactionsFile] = useState<File | null>(null);
  const [distributionsFile, setDistributionsFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!investorsFile) {
      setError("Investor register file is required.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress("Uploading files to server…");

    try {
      const fd = new FormData();
      fd.append("investors", investorsFile);
      if (distributorsFile) fd.append("distributors", distributorsFile);
      if (transactionsFile) fd.append("transactions", transactionsFile);
      if (distributionsFile) fd.append("distributions", distributionsFile);

      setProgress("Parsing and importing data (this may take a minute for large files)…");

      const res = await fetch("/api/investors/parse-import", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Import failed");
      }

      setResult(json as ImportResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  if (result) {
    return (
      <div style={{ maxWidth: 480 }}>
        <div
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ fontSize: 24 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
            Import complete
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Investors imported", result.investorCount],
              ["Distributors imported", result.distributorCount],
              ["Positions imported", result.positionCount],
              ["Distributions imported", result.redemptionCount],
              result.reviewNeededCount > 0
                ? ["Needs manual review", result.reviewNeededCount]
                : null,
            ]
              .filter((x): x is [string, number] => x !== null)
              .map(([label, value]) => (
                <div
                  key={label as string}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {value}
                  </span>
                </div>
              ))}
          </div>
          <button
            onClick={() => router.push("/fund/investors")}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            View Investors →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
          Import from Monday.com
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Upload the 4 Monday board exports. Files are parsed on the server — no browser memory limits.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FileSlot
          label="1 · Investor Register (required)"
          hint="LP list board — partner IDs, names, emails, fund class"
          file={investorsFile}
          onFile={setInvestorsFile}
        />
        <FileSlot
          label="2 · Distributors"
          hint="Distributor/agent board — names, fees, contacts"
          file={distributorsFile}
          onFile={setDistributorsFile}
        />
        <FileSlot
          label="3 · Positions / APEX 901"
          hint="Monthly NAV and performance data per investor"
          file={transactionsFile}
          onFile={setTransactionsFile}
        />
        <FileSlot
          label="4 · Distributions / Redemptions"
          hint="חלוקות — payment history per investor"
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

      {loading && progress && (
        <div
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 13,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
          {progress}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading || !investorsFile}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "12px 28px",
          fontSize: 14,
          fontWeight: 700,
          cursor: loading || !investorsFile ? "not-allowed" : "pointer",
          opacity: loading || !investorsFile ? 0.5 : 1,
          alignSelf: "flex-start",
        }}
      >
        {loading ? "Importing…" : `Import ${[investorsFile, distributorsFile, transactionsFile, distributionsFile].filter(Boolean).length} file(s) →`}
      </button>
    </div>
  );
}
