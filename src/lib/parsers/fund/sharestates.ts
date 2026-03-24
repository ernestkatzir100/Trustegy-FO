/**
 * Sharestates Investor Portfolio Report parser.
 *
 * Sheet layout:
 *   "Current Loan Holdings" — row 3 = headers, rows 4+ = loan data
 *   "Loan Updates"          — row 2 = headers, rows 3+ = service log entries
 *
 * All money values in USD dollars → converted to cents.
 */
import * as XLSX from "xlsx";
import type { HoldingStatus } from "@/db/schema/fund";
import type { InsertHolding } from "@/lib/validations/fund";

function dollarsToCents(val: unknown): number | null {
  if (val == null || val === "") return null;
  // Strip currency formatting ($, commas) if stored as string
  const s = String(val).replace(/[$,]/g, "").trim();
  const n = Number(s);
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
}

function tooBp(val: unknown): number | null {
  if (val == null || val === "") return null;
  // APR may be stored as "12%" or 0.12 or 12.0
  let s = String(val).replace(/%/g, "").trim();
  let n = Number(s);
  if (isNaN(n)) return null;
  // If value > 1, treat as a percentage (e.g. 12.5 → 12.5%)
  if (n > 1) n = n / 100;
  return Math.round(n * 10000);
}

function serialToIso(serial: number): string {
  return new Date((serial - 25569) * 86400 * 1000).toISOString().split("T")[0];
}

function dateValue(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return serialToIso(raw);
  return String(raw).trim() || null;
}

function mapSharestatesStatus(loanStatus: string): HoldingStatus {
  const s = loanStatus.toLowerCase().trim();
  if (s === "current") return "PERFORMING";
  if (s.includes("sold") && s.includes("completed")) return "SETTLED";
  if (s.startsWith("reo")) return "REO";
  if (s.includes("foreclosure")) return "FORECLOSURE_MID";
  if (s.includes("bankruptcy")) return "BANKRUPTCY";
  if (s.includes("late") || s.includes("past due")) return "LATE_PAYMENT";
  return "PERFORMING";
}

interface ServiceLogEntry {
  date: string;
  text: string;
}

/** Extract the most recent service log entry for each loan from the Loan Updates sheet. */
function extractLoanUpdates(ws: XLSX.WorkSheet): Map<string, ServiceLogEntry> {
  const updates = new Map<string, ServiceLogEntry>();
  if (!ws) return updates;

  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  // Row 0 = header, rows 1+ = data (0-indexed)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(4, rows.length); i++) {
    const row = rows[i] as unknown[];
    if (row.some((c) => String(c ?? "").toLowerCase().includes("loan number"))) {
      headerIdx = i;
      break;
    }
  }

  const headers = (rows[headerIdx] as unknown[]).map((h) =>
    String(h ?? "").toLowerCase().trim()
  );
  const loanNumCol = headers.findIndex((h) => h.includes("loan number"));

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const loanNum = String(row[loanNumCol] ?? "").trim();
    if (!loanNum) continue;

    let latestDate: string | null = null;
    let latestText: string | null = null;

    // Service log columns: "service log N - date" / "service log N - update"
    for (let j = 0; j < headers.length; j++) {
      const h = headers[j];
      if (h.includes("service log") && h.includes("- date")) {
        const dateRaw = row[j];
        const textRaw = row[j + 1]; // next col is the text
        if (!dateRaw) continue;

        const dateStr = dateValue(dateRaw);
        if (!dateStr) continue;

        // Keep the latest (lexicographic comparison works for ISO dates)
        if (!latestDate || dateStr > latestDate) {
          latestDate = dateStr;
          latestText = textRaw ? String(textRaw).trim() : null;
        }
      }
    }

    if (latestDate) {
      updates.set(loanNum, { date: latestDate, text: latestText ?? "" });
    }
  }

  return updates;
}

export interface SharestatesParseResult {
  holdings: InsertHolding[];
  reportDate: string | null;
}

export function parseSharestates(buffer: Buffer): SharestatesParseResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });

  const holdingsSheetName = wb.SheetNames.find((n) =>
    n.toLowerCase().includes("current loan") || n.toLowerCase().includes("holdings")
  );
  if (!holdingsSheetName) {
    throw new Error(
      `Sheet "Current Loan Holdings" not found. Available: ${wb.SheetNames.join(", ")}`
    );
  }

  const ws = wb.Sheets[holdingsSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  // Find header row (row 3 in the actual file = index 2 or 3 depending on blank rows)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const row = rows[i] as unknown[];
    if (row.some((c) => String(c ?? "").toLowerCase().includes("loan number"))) {
      headerIdx = i;
      break;
    }
  }

  const headers = (rows[headerIdx] as unknown[]).map((h) =>
    String(h ?? "").toLowerCase().trim()
  );

  function col(keywords: string[], fallback = -1): number {
    for (const kw of keywords) {
      const idx = headers.findIndex((h) => h.includes(kw));
      if (idx >= 0) return idx;
    }
    return fallback;
  }

  const C = {
    loanNumber: col(["loan number"], 0),
    loanNoteId: col(["loan note id", "note id"], 1),
    fundingDate: col(["funding date"], 2),
    maturityDate: col(["maturity date"], 3),
    apr: col(["apr", "interest rate", "rate"], 4),
    streetAddress: col(["street address", "address", "property"], 5),
    loanStatus: col(["loan status", "status"], 6),
    daysPastDue: col(["days past due", "dpd"], 7),
    outstanding: col(["outstanding principal", "principal balance", "principal"], 8),
  };

  // Load service log updates from second sheet
  const updatesSheetName = wb.SheetNames.find((n) =>
    n.toLowerCase().includes("loan update") || n.toLowerCase().includes("update")
  );
  const loanUpdates = updatesSheetName
    ? extractLoanUpdates(wb.Sheets[updatesSheetName])
    : new Map<string, ServiceLogEntry>();

  const today = new Date().toISOString().split("T")[0];
  const holdings: InsertHolding[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const loanNumber = String(row[C.loanNumber] ?? "").trim();
    if (!loanNumber) continue;

    const statusRaw = String(row[C.loanStatus] ?? "").trim();
    const status = mapSharestatesStatus(statusRaw);
    const serviceLog = loanUpdates.get(loanNumber);

    holdings.push({
      platform: "sharestates",
      offeringId: loanNumber,
      propertyAddress: row[C.streetAddress]
        ? String(row[C.streetAddress]).trim()
        : null,
      accrualDate: dateValue(row[C.fundingDate]),
      maturityDate: dateValue(row[C.maturityDate]),
      apr: tooBp(row[C.apr]),
      currentPrincipal: dollarsToCents(row[C.outstanding]),
      status,
      subStatus: statusRaw !== "Current" ? statusRaw : null,
      lastUpdateDate: serviceLog?.date ?? today,
      lastUpdateSource: "excel_upload",
      lastUpdateText: serviceLog?.text ?? null,
      isRbnf: false,
      hurricaneDamage: false,
    });
  }

  return { holdings, reportDate: today };
}
