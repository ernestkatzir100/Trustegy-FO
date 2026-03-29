/**
 * Monday.com Excel export parser for investor data migration.
 * Handles all 4 boards: investors, distributors, distributions, transactions.
 * Uses ExcelJS for memory-efficient SAX-based parsing (avoids V8 string limit).
 *
 * Dedup strategy:
 *   1. Partner ID (External PartnerId "8910-01-XXX") — primary key
 *   2. Email — fallback
 *   3. Remainder → dedupStatus = "review_needed"
 */
import ExcelJS from "exceljs";
import type {
  InsertInvestor,
  InsertDistributor,
  InsertInvestorPosition,
  InsertRedemption,
} from "@/db/schema/investors";

// ─── Raw row types ────────────────────────────────────────────────────────────

type RawRow = Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[,\s]/g, ""));
  return isFinite(n) ? n : null;
}

/** Convert a monetary float (e.g. 1234.56) to integer cents/agorot */
function toCents(v: unknown): number | null {
  const n = num(v);
  return n == null ? null : Math.round(n * 100);
}

/** Convert a percentage (e.g. 1.25) to basis points */
function toBps(v: unknown): number | null {
  const n = num(v);
  return n == null ? null : Math.round(n * 100);
}

function parseDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = str(v);
  // DD/MM/YYYY
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  return null;
}

/** Extract a scalar value from an ExcelJS cell */
function cellValue(cell: ExcelJS.Cell): unknown {
  const v = cell.value;
  if (v == null) return null;
  if (typeof v === "object") {
    // RichText
    if ("richText" in v) {
      return (v as ExcelJS.CellRichTextValue).richText
        .map((r: { text: string }) => r.text)
        .join("");
    }
    // Formula result
    if ("result" in v) {
      const res = (v as ExcelJS.CellFormulaValue).result;
      return res instanceof Error ? null : res;
    }
    // Hyperlink
    if ("text" in v && "hyperlink" in v) {
      return (v as ExcelJS.CellHyperlinkValue).text;
    }
    // SharedString
    if ("sharedFormula" in v) return null;
    // Date passthrough
    if (v instanceof Date) return v;
  }
  return v;
}

/** Parse a workbook buffer into an array of RawRow objects using ExcelJS */
async function parseWorkbookRows(buffer: ArrayBuffer): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS expects a plain Buffer; convert from ArrayBuffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (workbook.xlsx as any).load(Buffer.from(buffer) as unknown);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  // Collect all rows as arrays of values
  const allRows: unknown[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cells[colNumber - 1] = cellValue(cell);
    });
    allRows.push(cells);
  });

  if (allRows.length === 0) return [];

  // Find header row: first row with ≥5 non-empty cells
  let headerIdx = 0;
  for (let i = 0; i < Math.min(allRows.length, 10); i++) {
    const nonEmpty = allRows[i].filter(
      (c) => c != null && str(c) !== ""
    ).length;
    if (nonEmpty >= 5) {
      headerIdx = i;
      break;
    }
  }

  const headers = allRows[headerIdx].map((c) =>
    c == null ? "" : str(c)
  );

  return allRows.slice(headerIdx + 1).map((cells) => {
    const row: RawRow = {};
    headers.forEach((h, i) => {
      if (h) row[h] = cells[i] ?? null;
    });
    return row;
  });
}

// ─── Column name normalizer ───────────────────────────────────────────────────

/** Case-insensitive partial match against a list of candidates */
function col(row: RawRow, ...candidates: string[]): unknown {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const lower = cand.toLowerCase();
    const key = keys.find((k) => k.toLowerCase().includes(lower));
    if (key !== undefined) return row[key];
  }
  return null;
}

// ─── Parse distributors board ─────────────────────────────────────────────────

export interface ParsedDistributor {
  row: InsertDistributor;
  mondayId?: string;
}

export async function parseDistributorsSheet(buffer: ArrayBuffer): Promise<ParsedDistributor[]> {
  const rows = await parseWorkbookRows(buffer);

  return rows
    .filter((r) => {
      const name = str(col(r, "name", "שם")).toLowerCase().trim();
      return name.length > 0 && !MONDAY_SKIP_NAMES.has(name);
    })
    .map((r, i) => {
      const name = str(col(r, "name", "שם"));
      return {
        mondayId: String(i),
        row: {
          name,
          email: str(col(r, "email", "אי מייל מפיץ", "אימייל")) || null,
          emailSecondary: str(col(r, "secondary", "משני")) || null,
          phoneMobile: str(col(r, "נייד", "mobile")) || null,
          phoneLandline: str(col(r, "קוי", "landline")) || null,
          type: str(col(r, "סוג", "type")) || null,
          contractType: str(col(r, "contract", "חוזה")) || null,
          feeVolumeBps: toCents(col(r, "היקף", "volume")),
          feeRedemptionBps: toCents(col(r, "נפרעים", "redemption")),
          feeSuccessBps: toCents(col(r, "הצלחה", "success")),
          mondayId: null,
        },
      };
    });
}

// ─── Parse investors board ────────────────────────────────────────────────────

export interface ParsedInvestor {
  row: InsertInvestor;
}

/** Monday.com board exports include artifact rows we should skip */
const MONDAY_SKIP_NAMES = new Set(["subitems", "name", "שם", "ישות משקיעה", ""]);

export async function parseInvestorsSheet(buffer: ArrayBuffer): Promise<ParsedInvestor[]> {
  const rows = await parseWorkbookRows(buffer);

  return rows
    .filter((r) => {
      const name = str(col(r, "name", "שם", "ישות משקיעה")).toLowerCase().trim();
      // Skip blank rows, Monday "Subitems" separator rows, and header-like rows
      return name.length > 0 && !MONDAY_SKIP_NAMES.has(name);
    })
    .map((r) => {
      const rawName = str(col(r, "name", "שם", "ישות משקיעה"));
      // Detect Hebrew by Unicode range
      const isHebrew = /[\u0590-\u05FF]/.test(rawName);

      const partnerId = str(col(r, "partner id", "partnerid", "#partner")) || null;
      const email = str(col(r, "email")) || null;
      const status = "active"; // always active on import — status managed in-app
      const currencyRaw = str(col(r, "קלאס מטבע", "currency class", "מטבע"));
      const currencyClass = currencyRaw.toUpperCase().includes("USD") ? "USD" : "ILS";

      const qualified = str(col(r, "כשיר", "qualified"));
      const beneficiary = str(col(r, "ניצע", "beneficiary"));

      return {
        row: {
          nameEn: isHebrew ? "" : rawName,
          nameHe: isHebrew ? rawName : null,
          displayName: rawName,
          partnerId,
          email,
          emailSecondary: str(col(r, "secondary email", "מייל משני")) || null,
          phoneMobile: str(col(r, "טלפון נייד", "mobile")) || null,
          phoneLandline: str(col(r, "טלפון קוי", "landline")) || null,
          investorType: str(col(r, "סוג משקיע", "investor type")) || null,
          isQualified: /כן|yes|true|✓/i.test(qualified),
          isBeneficiary: /כן|yes|true|✓/i.test(beneficiary),
          idNumber: str(col(r, "תעודת זהות", "id number")) || null,
          address: str(col(r, "כתובת", "address")) || null,
          currencyClass,
          managementFeeClass: str(col(r, "קלאס דמי ניהול", "management fee class")) || null,
          status,
          fundManagerApproved: /אישור|approved/i.test(str(col(r, "אישור מנהל"))),
          joinDate: parseDate(col(r, "חודש הצטרפות", "join")),
          interestAccrualDate: parseDate(col(r, "צובר ריבית", "accrual")),
          bankName: str(col(r, "בנק ממנו", "bank")) || null,
          bankBranch: str(col(r, "מספר סניף", "branch")) || null,
          bankAccount: str(col(r, "מספר חשבון", "account")) || null,
          referringAgent: str(col(r, "סוכן פיננסי", "referring")) || null,
          mondayId: null,
          dedupStatus: "clean",
          portalEnabled: false,
        } satisfies InsertInvestor,
      };
    });
}

// ─── Parse transactions board (עסקאות) ────────────────────────────────────────

export interface ParsedPosition {
  row: InsertInvestorPosition;
  investorName: string;
  investorEmail: string | null;
  partnerId: string | null;
}

export async function parseTransactionsSheet(buffer: ArrayBuffer): Promise<ParsedPosition[]> {
  const rows = await parseWorkbookRows(buffer);

  return rows
    .filter((r) => {
      const name = (str(col(r, "ישות משקיעה")) || str(col(r, "name", "שם"))).toLowerCase().trim();
      return name.length > 0 && !MONDAY_SKIP_NAMES.has(name);
    })
    .map((r) => {
      const investorName =
        str(col(r, "ישות משקיעה")) || str(col(r, "name", "שם"));
      const investorEmail = str(col(r, "email")) || null;
      const partnerId = str(col(r, "partner id", "partnerid", "external partnerid")) || null;

      const className = str(col(r, "class name")) || null;
      const currencyRaw = str(col(r, "קלאס מטבעי", "class currency", "currency"));
      const currencyClass = currencyRaw.toUpperCase().includes("USD") ? "USD" : "ILS";

      const rateRaw = num(col(r, "שער דולר", "usd/nis", "exchange rate"));
      const exchangeRate = rateRaw ? Math.round(rateRaw * 10000) : null;

      // Returns — stored as decimals in source (e.g. -0.0203 = -2.03%)
      const grossMtd = num(col(r, "gross mtd"));
      const netMtd = num(col(r, "net mtd"));
      const netYtd = num(col(r, "net ytd"));
      const netItd = num(col(r, "net itd"));

      return {
        investorName,
        investorEmail,
        partnerId,
        row: {
          investorId: "", // filled in after investor insert
          dataDate: parseDate(col(r, "תאריך נתונים", "data date")) ?? "1970-01-01",
          className,
          currencyClass,
          managementFeeClass: str(col(r, "קלאס דמי ניהול", "management fee class")) || null,
          originalInvestmentNis: toCents(col(r, "השקעה מקורית", "original investment")),
          navNis: toCents(col(r, "nav nis", "nis calculated")),
          navUsd: toCents(col(r, "nav usd", "$calculated")),
          beginningNav: toCents(col(r, "beginning nav")),
          endingNav: toCents(col(r, "ending nav")),
          exchangeRate,
          grossMtdBps: grossMtd != null ? Math.round(grossMtd * 10000) : null,
          netMtdBps: netMtd != null ? Math.round(netMtd * 10000) : null,
          netYtdBps: netYtd != null ? Math.round(netYtd * 10000) : null,
          netItdBps: netItd != null ? Math.round(netItd * 10000) : null,
          monthlyPerfFee: toCents(col(r, "דמי הצלחה חודשיים", "monthly performance")),
          cumulativePerfFee: toCents(col(r, "דמי הצלחה מצטברים", "cumulative")),
          mgmtFeeTotal: toCents(col(r, "סה\"כ דמי ניהול", "total management")),
          redemptionFeePayable: toCents(col(r, "נפרעים לתשלום", "redemption fee payable")),
          perfFeePayable: toCents(col(r, "הצלחה לתשלום", "performance fee payable")),
          volumeFeePayable: toCents(col(r, "היקף לתשלום", "volume fee payable")),
          fundAllocationBps: toBps(col(r, "אחוז מהקרן", "fund allocation")),
          apexSource: false,
        } satisfies InsertInvestorPosition,
      };
    });
}

// ─── Parse distributions board (חלוקות) ──────────────────────────────────────

export interface ParsedRedemption {
  row: InsertRedemption;
  investorName: string;
  investorEmail: string | null;
  sourceBoardName: string;
}

export async function parseDistributionsSheet(
  buffer: ArrayBuffer,
  boardName = "חלוקות"
): Promise<ParsedRedemption[]> {
  const rows = await parseWorkbookRows(buffer);

  return rows
    .filter((r) => {
      const name = str(col(r, "name", "שם")).toLowerCase().trim();
      return name.length > 0 && !MONDAY_SKIP_NAMES.has(name);
    })
    .map((r) => {
      const investorName = str(col(r, "name", "שם"));
      const investorEmail = str(col(r, "email")) || null;
      const currencyRaw = str(col(r, "מטבע", "currency"));
      const currency = currencyRaw.toUpperCase() === "USD" ? "USD" : "ILS";

      return {
        investorName,
        investorEmail,
        sourceBoardName: boardName,
        row: {
          investorId: "", // filled in after investor insert
          distributorId: null,
          date: parseDate(col(r, "תאריך", "date")),
          currency,
          amountUsd: toCents(col(r, "העברה דולרית", "dollar transfer")),
          amountNis: toCents(col(r, "העברה שקלית", "nis transfer")),
          investmentAmountUsd: toCents(col(r, "סכום השקעה דולרי", "investment amount usd")),
          investmentAmountNis: toCents(col(r, "סכום השקעה שקלי", "investment amount nis")),
          distributionUsd: toCents(col(r, "חלוקה דולרית", "distribution usd")),
          status: str(col(r, "status", "סטאטוס")) || null,
          sourceBoardName: boardName,
        } satisfies InsertRedemption,
      };
    });
}

// ─── Dedup engine ─────────────────────────────────────────────────────────────

export interface DedupeResult {
  merged: InsertInvestor[];
  needsReview: Array<{ a: InsertInvestor; b: InsertInvestor; reason: string }>;
}

/**
 * Deduplicates a list of parsed investors:
 *  1. Merge by partnerId
 *  2. Merge by email (fallback)
 *  3. Flag remaining name-only duplicates for manual review
 */
export function dedupeInvestors(investors: InsertInvestor[]): DedupeResult {
  const byPartnerId = new Map<string, InsertInvestor>();
  const byEmail = new Map<string, InsertInvestor>();
  const needsReview: DedupeResult["needsReview"] = [];
  const merged: InsertInvestor[] = [];

  for (const inv of investors) {
    // 1. Partner ID match
    if (inv.partnerId) {
      const existing = byPartnerId.get(inv.partnerId);
      if (existing) {
        // Merge: prefer English name when available
        if (!existing.nameEn && inv.nameEn) existing.nameEn = inv.nameEn;
        if (!existing.nameHe && inv.nameHe) existing.nameHe = inv.nameHe;
        if (!existing.email && inv.email) existing.email = inv.email;
        continue;
      }
      byPartnerId.set(inv.partnerId, inv);
      continue;
    }

    // 2. Email match
    if (inv.email) {
      const existing = byEmail.get(inv.email.toLowerCase());
      if (existing) {
        if (!existing.nameEn && inv.nameEn) existing.nameEn = inv.nameEn;
        if (!existing.nameHe && inv.nameHe) existing.nameHe = inv.nameHe;
        continue;
      }
      byEmail.set(inv.email.toLowerCase(), inv);
      continue;
    }

    // 3. No stable key — flag for manual review
    inv.dedupStatus = "review_needed";
    merged.push(inv);
  }

  // Combine partner-keyed and email-keyed maps, dedup between them by email
  for (const inv of byPartnerId.values()) {
    if (inv.email) {
      const emailMatch = byEmail.get(inv.email.toLowerCase());
      if (emailMatch) {
        // Merge email-keyed into partner-keyed record
        if (!inv.nameEn && emailMatch.nameEn) inv.nameEn = emailMatch.nameEn;
        if (!inv.nameHe && emailMatch.nameHe) inv.nameHe = emailMatch.nameHe;
        byEmail.delete(inv.email.toLowerCase());
      }
    }
    merged.push(inv);
  }

  for (const inv of byEmail.values()) {
    merged.push(inv);
  }

  return { merged, needsReview };
}

// ─── Import summary ───────────────────────────────────────────────────────────

export interface ImportSummary {
  investors: number;
  distributors: number;
  positions: number;
  redemptions: number;
  reviewNeeded: number;
}
