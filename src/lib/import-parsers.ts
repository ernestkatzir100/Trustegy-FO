import * as XLSX from "xlsx";
import {
  categorizeExpense,
  type ExpenseCategory,
} from "./expense-categorizer";

export type ImportSource = "BANK_MIZRAHI" | "CREDIT_MAX" | "GENERIC";

export interface ParsedRow {
  date: string;
  description: string;
  vendor_name: string;
  amount: number;
  category: ExpenseCategory;
  confidence: "HIGH" | "LOW";
  raw: Record<string, unknown>;
}

export interface ParseResult {
  rows: ParsedRow[];
  source: ImportSource;
  accountInfo: string;
  totalRows: number;
  skippedRows: number;
  errors: string[];
}

function parseDate(raw: unknown): string | null {
  if (!raw) return null;
  const s = String(raw).trim();

  // DD/MM/YY
  const short = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (short) {
    const year =
      parseInt(short[3]) >= 50 ? `19${short[3]}` : `20${short[3]}`;
    return `${year}-${short[2].padStart(2, "0")}-${short[1].padStart(2, "0")}`;
  }

  // DD/MM/YYYY
  const full = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (full)
    return `${full[3]}-${full[2].padStart(2, "0")}-${full[1].padStart(2, "0")}`;

  return null;
}

function parseAmount(raw: unknown): number {
  if (raw === null || raw === undefined || raw === "") return 0;
  if (typeof raw === "number") return raw;
  return parseFloat(String(raw).replace(/[,\s₪$]/g, "")) || 0;
}

function addCategory(
  row: Omit<ParsedRow, "category" | "confidence">
): ParsedRow {
  const { category, confidence } = categorizeExpense(
    row.description,
    row.vendor_name
  );
  return { ...row, category, confidence };
}

/**
 * Bank Mizrahi: AccountActivity.xls (HTML disguised as XLS)
 * Columns: תאריך | תאריך ערך | סוג תנועה | זכות | חובה | יתרה בש"ח | אסמכתא
 */
function parseMizrahi(buffer: ArrayBuffer): ParseResult {
  const errors: string[] = [];
  let skippedRows = 0;
  const rows: ParsedRow[] = [];

  const wb = XLSX.read(buffer, { type: "array", cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
  });

  const accountInfo = String(allRows[2]?.[1] || "").trim();

  const headerIndices: number[] = [];
  allRows.forEach((row, i) => {
    if (
      Array.isArray(row) &&
      String(row[0]).trim() === "תאריך" &&
      String(row[2]).trim() === "סוג תנועה"
    ) {
      headerIndices.push(i);
    }
  });

  if (headerIndices.length === 0) {
    errors.push("לא נמצאו כותרות טבלה בקובץ הבנק");
    return {
      rows,
      source: "BANK_MIZRAHI",
      accountInfo,
      totalRows: 0,
      skippedRows: 0,
      errors,
    };
  }

  for (const headerIdx of headerIndices) {
    let i = headerIdx + 1;
    while (i < allRows.length) {
      const row = allRows[i] as string[];
      i++;
      const dateRaw = row[0];
      const description = String(row[2] || "").trim();
      const creditRaw = row[3];
      const debitRaw = row[4];

      if (!dateRaw && !description) break;
      if (
        description.includes("תנועות היום") ||
        description.includes("תנועות אחרונות")
      )
        break;

      const date = parseDate(dateRaw);
      if (!date) {
        skippedRows++;
        continue;
      }
      if (!description) {
        skippedRows++;
        continue;
      }

      const debit = parseAmount(debitRaw);
      const credit = parseAmount(creditRaw);
      const amount = debit > 0 ? debit : credit > 0 ? -credit : 0;
      if (amount === 0) {
        skippedRows++;
        continue;
      }

      rows.push(
        addCategory({
          date,
          description,
          vendor_name: description,
          amount,
          raw: { dateRaw, description, debit: debitRaw, credit: creditRaw },
        })
      );
    }
  }

  return {
    rows,
    source: "BANK_MIZRAHI",
    accountInfo,
    totalRows: rows.length + skippedRows,
    skippedRows,
    errors,
  };
}

/**
 * MAX Credit Card: כל_הכרטיסים.xlsx
 * Sheet: חיובים בשקלים, headers on row 3, data from row 4
 */
function parseMaxCredit(buffer: ArrayBuffer): ParseResult {
  const errors: string[] = [];
  let skippedRows = 0;
  const rows: ParsedRow[] = [];

  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = "חיובים בשקלים";

  if (!wb.SheetNames.includes(sheetName)) {
    errors.push(`גיליון "${sheetName}" לא נמצא`);
    return {
      rows,
      source: "CREDIT_MAX",
      accountInfo: "",
      totalRows: 0,
      skippedRows: 0,
      errors,
    };
  }

  const ws = wb.Sheets[sheetName];
  const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
  });

  const accountInfo = String(allRows[0]?.[0] || "").trim();
  const headers = (allRows[2] as string[]).map((h) =>
    String(h || "").trim()
  );

  const colMap = {
    txDate: headers.indexOf("תאריך העסקה"),
    vendor: headers.indexOf("בית העסק"),
    chargedAmount: headers.indexOf("סכום החיוב"),
  };

  if (
    colMap.txDate === -1 ||
    colMap.vendor === -1 ||
    colMap.chargedAmount === -1
  ) {
    errors.push(`עמודות חסרות. נמצאו: ${headers.join(" | ")}`);
    return {
      rows,
      source: "CREDIT_MAX",
      accountInfo,
      totalRows: 0,
      skippedRows: 0,
      errors,
    };
  }

  for (let i = 3; i < allRows.length; i++) {
    const row = allRows[i] as unknown[];
    const dateRaw = row[colMap.txDate];
    const vendor = String(row[colMap.vendor] || "").trim();
    const amount = parseAmount(row[colMap.chargedAmount]);

    if (!dateRaw && !vendor) {
      skippedRows++;
      continue;
    }
    const date = parseDate(dateRaw);
    if (!date || !vendor || amount <= 0) {
      skippedRows++;
      continue;
    }

    const cleanVendor = vendor.includes("~")
      ? vendor
          .split("~")
          .pop()!
          .replace(/[.\s]+$/, "")
          .trim()
      : vendor;

    rows.push(
      addCategory({
        date,
        description: vendor,
        vendor_name: cleanVendor,
        amount,
        raw: { dateRaw, vendor, amount: row[colMap.chargedAmount] },
      })
    );
  }

  return {
    rows,
    source: "CREDIT_MAX",
    accountInfo,
    totalRows: rows.length + skippedRows,
    skippedRows,
    errors,
  };
}

export async function parseImportFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();
  const text = await new Blob([buffer]).text().catch(() => "");

  if (name.includes("כל_הכרטיסים") || name.includes("הכרטיסים"))
    return parseMaxCredit(buffer);
  if (
    name.includes("accountactivity") ||
    name.includes("account_activity")
  )
    return parseMizrahi(buffer);
  if (
    text.includes("יתרה ותנועות בחשבון") ||
    text.includes("מספר חשבון")
  )
    return parseMizrahi(buffer);
  if (text.includes("חיובים בשקלים")) return parseMaxCredit(buffer);

  // Generic XLSX fallback
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<
    string,
    unknown
  >[];
  const rows: ParsedRow[] = [];
  for (const row of data) {
    const keys = Object.keys(row);
    const dateKey = keys.find(
      (k) => k.includes("תאריך") || k.toLowerCase().includes("date")
    );
    const descKey = keys.find(
      (k) =>
        k.includes("תיאור") ||
        k.includes("עסק") ||
        k.toLowerCase().includes("desc")
    );
    const amountKey = keys.find(
      (k) =>
        k.includes("חובה") ||
        k.includes("סכום") ||
        k.toLowerCase().includes("amount")
    );
    if (!dateKey || !amountKey) continue;
    const date = parseDate(row[dateKey]);
    const amount = parseAmount(row[amountKey]);
    if (!date || amount <= 0) continue;
    const desc = descKey ? String(row[descKey] || "") : "";
    rows.push(
      addCategory({
        date,
        description: desc,
        vendor_name: desc,
        amount,
        raw: row,
      })
    );
  }
  return {
    rows,
    source: "GENERIC",
    accountInfo: "",
    totalRows: data.length,
    skippedRows: data.length - rows.length,
    errors: [],
  };
}
