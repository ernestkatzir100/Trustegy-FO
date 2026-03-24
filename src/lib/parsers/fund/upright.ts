/**
 * Upright / FTF monthly Excel report parser.
 *
 * Expected sheet: "Active Holdings"
 * All money values in the report are in USD dollars — converted to cents here.
 * APR / LTV ratios are decimals (0.12 = 12%) — converted to basis points here.
 */
import * as XLSX from "xlsx";
import type { HoldingStatus } from "@/db/schema/fund";
import type { InsertHolding } from "@/lib/validations/fund";

// Excel serial date → ISO date string
function serialToIso(serial: number): string {
  // Excel epoch is Jan 0, 1900 (with the intentional 1900-leap-year bug = offset 25569 from Unix epoch)
  const ms = (serial - 25569) * 86400 * 1000;
  return new Date(ms).toISOString().split("T")[0];
}

function dollarsToCents(val: unknown): number | null {
  if (val == null || val === "") return null;
  const n = Number(val);
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
}

function tooBp(val: unknown): number | null {
  if (val == null || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : Math.round(n * 10000);
}

function dateValue(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return serialToIso(raw);
  return String(raw).trim() || null;
}

function mapStatus(perf: string, additional: string): HoldingStatus {
  const a = additional.toLowerCase();
  const p = perf.toLowerCase();

  if (p === "performing" && !a) return "PERFORMING";

  if (a.includes("reo") && (a.includes("sold") || a.includes("completed"))) return "SETTLED";
  if (a.includes("reo under contract") || a.includes("under contract")) return "REO_UNDER_CONTRACT";
  if (a.includes("reo listed") || a.includes("reo - listed")) return "REO_LISTED";
  if (a.includes("reo")) return "REO";
  if (a.includes("payoff") || a.includes("pay off")) return "PAYOFF_EXPECTED";
  if (a.includes("workout")) return "BORROWER_WORKOUT";
  if (a.includes("loss mitigation") || a.includes("rbnf")) return "LOSS_MITIGATION";
  if (a.includes("bankruptcy")) return "BANKRUPTCY";
  if (a.includes("title")) return "TITLE_ISSUE";
  if (a.includes("foreclosure")) return "FORECLOSURE_MID";
  if (a.includes("late")) return "LATE_PAYMENT";

  return "PERFORMING";
}

export interface UprightParseResult {
  holdings: InsertHolding[];
  reportDate: string | null;
}

export function parseUpright(buffer: Buffer): UprightParseResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });

  const sheetName = wb.SheetNames.find((n) =>
    n.toLowerCase().includes("active holdings")
  );
  if (!sheetName) {
    throw new Error(
      `Sheet "Active Holdings" not found. Available: ${wb.SheetNames.join(", ")}`
    );
  }

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  if (rows.length < 2) return { holdings: [], reportDate: null };

  // Find the header row — look for "Offering" keyword
  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i] as unknown[];
    if (row.some((c) => String(c ?? "").toLowerCase().includes("offering"))) {
      headerIdx = i;
      break;
    }
  }

  const headers = (rows[headerIdx] as unknown[]).map((h) =>
    String(h ?? "").toLowerCase().trim()
  );

  // Resolve a column index by trying multiple keywords in order
  function col(keywords: string[], fallback: number): number {
    for (const kw of keywords) {
      const idx = headers.findIndex((h) => h.includes(kw));
      if (idx >= 0) return idx;
    }
    return fallback;
  }

  const C = {
    offeringId: col(["offering id", "offeringid"], 5),
    originalInvestment: col(["original investment amount", "original investment"], 7),
    apr: col(["yield"], 10),
    investmentDate: col(["investment date"], 11),
    maturityDate: col(["maturity date"], 21),
    performing: col(["performing vs. non-performing", "performing vs non"], 23),
    additional: col(["additional performing", "additional"], 24),
    state: col(["state"], 26),
    city: col(["city"], 27),
    zip: col(["zip"], 28),
    propertyType: col(["property type"], 29),
    currentPrincipal: col(
      ["principal outstanding at month end", "principal outstanding"],
      32
    ),
    arv: col(["ftf arv"], 38),
    loanToArv: col(["lt arv", "loan to arv"], 41),
    borrowerId: col(["borrower id", "borrowerid"], 42),
  };

  const today = new Date().toISOString().split("T")[0];
  const holdings: InsertHolding[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const offeringId = String(row[C.offeringId] ?? "").trim();
    if (!offeringId) continue;

    const perf = String(row[C.performing] ?? "").trim();
    const additional = String(row[C.additional] ?? "").trim();
    const status = mapStatus(perf, additional);

    const loanToArvRaw = row[C.loanToArv];
    const loanToArv =
      loanToArvRaw != null ? Math.round(Number(loanToArvRaw) * 10000) : null;

    holdings.push({
      platform: "upright",
      offeringId,
      city: row[C.city] ? String(row[C.city]).trim() : null,
      state: row[C.state] ? String(row[C.state]).trim() : null,
      zip: row[C.zip] ? String(row[C.zip]).trim() : null,
      propertyType: row[C.propertyType] ? String(row[C.propertyType]).trim() : null,
      originalInvestment: dollarsToCents(row[C.originalInvestment]),
      currentPrincipal: dollarsToCents(row[C.currentPrincipal]),
      accrualDate: dateValue(row[C.investmentDate]),
      maturityDate: dateValue(row[C.maturityDate]),
      apr: tooBp(row[C.apr]),
      status,
      subStatus: additional || null,
      lastUpdateDate: today,
      lastUpdateSource: "excel_upload",
      borrowerName: row[C.borrowerId] ? String(row[C.borrowerId]).trim() : null,
      arv: dollarsToCents(row[C.arv]),
      loanToArv: isNaN(loanToArv!) ? null : loanToArv,
      isRbnf:
        additional.toLowerCase().includes("rbnf") ||
        offeringId.toLowerCase().includes("rbnf"),
      hurricaneDamage: false,
    });
  }

  return { holdings, reportDate: today };
}
