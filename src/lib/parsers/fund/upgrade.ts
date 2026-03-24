/**
 * Upgrade / Prosper monthly report parser.
 *
 * Upgrade provides a pool of consumer loans. We store a single holding
 * (platform="upgrade") representing the entire pool, updated with the
 * aggregate principal balance from the daily positions file.
 *
 * Accepted files:
 *   - daily_positions_*.csv (preferred — per-loan principal balances)
 *   - Custom_summary_statement_monthly_*.xlsx (summary sheet has opening/closing balances)
 */
import * as XLSX from "xlsx";
import type { InsertHolding } from "@/lib/validations/fund";

function dollarsToCents(val: unknown): number | null {
  if (val == null || val === "") return null;
  const s = String(val).replace(/[$,]/g, "").trim();
  const n = Number(s);
  return isNaN(n) ? null : Math.round(Math.abs(n) * 100);
}

function parseCsv(buffer: Buffer): Record<string, string>[] {
  // Use xlsx to parse CSV — consistent with the rest of the parsers
  const wb = XLSX.read(buffer, { type: "buffer", raw: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
}

/** Parse the daily_positions CSV and sum principal balances of open accounts. */
function parseDailyPositions(buffer: Buffer): {
  totalPrincipalCents: number;
  openCount: number;
  chargedOffCount: number;
} {
  const rows = parseCsv(buffer);
  let totalPrincipalCents = 0;
  let openCount = 0;
  let chargedOffCount = 0;

  for (const row of rows) {
    const status = (row["account_status"] ?? row["Account Status"] ?? "").toUpperCase();
    const chargeOff = (row["charge_off_status"] ?? row["Charge Off Status"] ?? "").toUpperCase();
    const principal = dollarsToCents(
      row["principal_balance"] ?? row["Principal Balance"] ?? row["balance"]
    );

    if (principal == null) continue;

    if (status === "OPEN") {
      totalPrincipalCents += principal;
      openCount++;
    }

    if (chargeOff && chargeOff !== "" && chargeOff !== "NONE") {
      chargedOffCount++;
    }
  }

  return { totalPrincipalCents, openCount, chargedOffCount };
}

/** Parse the custom summary XLSX and extract the closing balance. */
function parseSummaryXlsx(buffer: Buffer): number | null {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });

  // Try "Custom_summary_statement" sheet first, then first sheet
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase().includes("summary")) ??
    wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  if (!ws) return null;

  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  // Look for a row with "closing balance" or "ending balance"
  for (const row of rows) {
    const rowArr = row as unknown[];
    for (let i = 0; i < rowArr.length; i++) {
      const cell = String(rowArr[i] ?? "").toLowerCase();
      if (cell.includes("closing") || cell.includes("ending")) {
        // Balance value is usually in the next non-null cell
        for (let j = i + 1; j < rowArr.length; j++) {
          const val = dollarsToCents(rowArr[j]);
          if (val != null && val > 0) return val;
        }
      }
    }
  }

  // Fallback: try "Daily Positions" sheet and sum
  const posSheet = wb.Sheets["Daily Positions"];
  if (posSheet) {
    const posRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(posSheet, {
      defval: null,
    });
    let total = 0;
    for (const row of posRows) {
      const val = dollarsToCents(
        row["principal_balance"] ?? row["Principal Balance"]
      );
      if (val != null) total += val;
    }
    if (total > 0) return total;
  }

  return null;
}

export interface UpgradeParseResult {
  holdings: InsertHolding[];
  reportDate: string | null;
  openCount?: number;
}

/** Auto-detect file type by name and parse accordingly. */
export function parseUpgrade(
  buffer: Buffer,
  fileName: string
): UpgradeParseResult {
  const name = fileName.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  let currentPrincipalCents: number | null = null;
  let openCount: number | undefined;

  if (name.includes("daily_positions") || name.endsWith(".csv")) {
    const result = parseDailyPositions(buffer);
    currentPrincipalCents = result.totalPrincipalCents;
    openCount = result.openCount;
  } else if (name.endsWith(".xlsx")) {
    currentPrincipalCents = parseSummaryXlsx(buffer);
  } else {
    // Try CSV parse as fallback
    try {
      const result = parseDailyPositions(buffer);
      currentPrincipalCents = result.totalPrincipalCents;
      openCount = result.openCount;
    } catch {
      throw new Error(`Unrecognized Upgrade file format: ${fileName}`);
    }
  }

  if (currentPrincipalCents == null) {
    throw new Error(
      `Could not extract principal balance from Upgrade file: ${fileName}`
    );
  }

  const holdings: InsertHolding[] = [
    {
      platform: "upgrade",
      // Use a stable offering ID so upsert matches the existing seed row
      offeringId: "PineappleLP-8876258",
      status: "PERFORMING",
      currentPrincipal: currentPrincipalCents,
      lastUpdateDate: today,
      lastUpdateSource: "excel_upload",
      lastUpdateText: openCount
        ? `${openCount} open consumer loans (aggregate pool)`
        : "Aggregate consumer loan pool",
      isRbnf: false,
      hurricaneDamage: false,
    },
  ];

  return { holdings, reportDate: today, openCount };
}
