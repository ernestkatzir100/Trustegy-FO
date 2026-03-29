/**
 * Upright investor portal scraper.
 *
 * Reads credentials from environment variables:
 *   UPRIGHT_USERNAME   — your login email
 *   UPRIGHT_PASSWORD   — your login password
 *   UPRIGHT_PORTAL_URL — base URL (default: https://app.upright.us)
 *   UPRIGHT_DEBUG=1    — saves screenshots to /tmp for selector debugging
 *
 * Returns InsertHolding[] — same shape as the Excel parser, so
 * importFundHoldings() handles both data sources identically.
 *
 * ── Selector notes ──────────────────────────────────────────────────────────
 * Upright's portal is a React SPA. Selectors use text-content matching where
 * possible to survive minor CSS/class name changes.
 *
 * To update selectors after a UI change:
 *  1. Set UPRIGHT_DEBUG=1 in Railway
 *  2. Trigger a scrape run from /fund/monitor
 *  3. Check Railway logs for "screenshot saved" paths
 *  4. Update the SELECTORS constant below
 */

import type { InsertHolding } from "@/lib/validations/fund";
import type { HoldingStatus } from "@/db/schema/fund";

// ─── Config ──────────────────────────────────────────────────────────────────

const PORTAL_URL =
  process.env.UPRIGHT_PORTAL_URL ?? "https://app.upright.us";

const DEBUG = process.env.UPRIGHT_DEBUG === "1";

/**
 * CSS / locator selectors — update these if Upright changes their UI.
 *
 * Auth: AWS Cognito hosted UI at auth.uam.upright.us
 * Cognito uses name="username" for the email field (not type="email").
 * The submit button is an <input type="Submit"> not a <button>.
 */
const SELECTORS = {
  // Cognito hosted UI — these are stable across Cognito deployments
  emailInput: 'input[name="username"]',
  passwordInput: 'input[name="password"]',
  submitButton: 'input[type="Submit"], input[type="submit"]',
  // After OAuth redirect back to app.upright.us
  postLoginSignal:
    'nav, [class*="dashboard"], [class*="portfolio"], [class*="holdings"], table, [class*="home"]',
  holdingsTable:
    'table, [class*="holdings-table"], [class*="portfolio-table"], [class*="loan-list"]',
  tableHeaderCells: 'thead th, thead td',
  tableBodyRows: 'tbody tr',
  tableBodyCells: 'td',
  // app.upright.us navigation — try common labels
  portfolioNavLink:
    'a:has-text("Portfolio"), a:has-text("Holdings"), a:has-text("My Investments"), a:has-text("Investments"), nav a[href*="portfolio"], nav a[href*="holdings"], nav a[href*="investment"]',
  detailNotes:
    '[class*="note"], [class*="update"], [class*="comment"], [class*="status-text"], [class*="service"]',
};

// ─── Result type ──────────────────────────────────────────────────────────────

export interface UprightScrapeResult {
  holdings: InsertHolding[];
  runDate: string;
  errors: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapUprightStatus(rawStatus: string, notes: string): HoldingStatus {
  const s = rawStatus.toLowerCase().trim();
  const n = notes.toLowerCase();

  if (s.includes("settled") || s.includes("paid off") || s.includes("completed"))
    return "SETTLED";
  if (s.includes("reo") && n.includes("under contract")) return "REO_UNDER_CONTRACT";
  if (s.includes("reo") && (n.includes("listed") || n.includes("for sale")))
    return "REO_LISTED";
  if (s.includes("reo")) return "REO";
  if (s.includes("payoff") || n.includes("payoff expected") || n.includes("pay off"))
    return "PAYOFF_EXPECTED";
  if (s.includes("workout") || n.includes("workout")) return "BORROWER_WORKOUT";
  if (s.includes("bankruptcy") || n.includes("bankruptcy")) return "BANKRUPTCY";
  if (s.includes("title") || n.includes("title issue")) return "TITLE_ISSUE";
  if (s.includes("foreclosure") || s.includes("foreclosing")) {
    if (n.includes("early") || n.includes("filed")) return "FORECLOSURE_EARLY";
    if (n.includes("late") || n.includes("sale date") || n.includes("auction"))
      return "FORECLOSURE_LATE";
    return "FORECLOSURE_MID";
  }
  if (s.includes("loss mitigation") || s.includes("mitigation")) return "LOSS_MITIGATION";
  if (s.includes("late") || s.includes("delinquent")) return "LATE_PAYMENT";
  if (s.includes("note sale")) return "NOTE_SALE";
  if (s.includes("partial")) return "PARTIAL_RECOVERY";
  if (s.includes("written off") || s.includes("write off")) return "WRITTEN_OFF";

  return "PERFORMING";
}

function parseDollars(text: string): number | null {
  if (!text) return null;
  const n = parseFloat(text.replace(/[$,\s]/g, ""));
  return isNaN(n) || n <= 0 ? null : Math.round(n * 100);
}

function parsePercent(text: string): number | null {
  if (!text) return null;
  const n = parseFloat(text.replace(/[%\s]/g, ""));
  if (isNaN(n)) return null;
  const decimal = n > 1 ? n / 100 : n;
  return Math.round(decimal * 10000);
}

function parseDate(text: string): string | null {
  if (!text || text === "—" || text === "-" || text === "N/A") return null;
  try {
    const d = new Date(text.trim());
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

function colIdx(headers: string[], keywords: string[]): number {
  for (const kw of keywords) {
    const idx = headers.findIndex((h) => h.includes(kw));
    if (idx >= 0) return idx;
  }
  return -1;
}

// ─── Main scraper ─────────────────────────────────────────────────────────────

export async function scrapeUpright(): Promise<UprightScrapeResult> {
  const username = process.env.UPRIGHT_USERNAME;
  const password = process.env.UPRIGHT_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "UPRIGHT_USERNAME and UPRIGHT_PASSWORD environment variables must be set"
    );
  }

  const runDate = new Date().toISOString().split("T")[0];
  const errors: string[] = [];

  // Lazy-load Playwright so it only loads in Node.js runtime (not browser bundles)
  const { chromium } = await import("playwright");

  // PLAYWRIGHT_BROWSERS_PATH tells Playwright where to find its managed Chromium.
  // In Railway it is set to /app/.playwright-browsers (installed during build).
  // CHROMIUM_EXECUTABLE_PATH overrides to an absolute binary path if needed.
  // Fallback: set PLAYWRIGHT_BROWSERS_PATH to the known Railway install path so
  // new services without the env var still work.
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH && !process.env.CHROMIUM_EXECUTABLE_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = "/app/.playwright-browsers";
  }
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || undefined;
  console.log(`[upright scraper] executablePath=${executablePath ?? "playwright default"}, PLAYWRIGHT_BROWSERS_PATH=${process.env.PLAYWRIGHT_BROWSERS_PATH ?? "not set"}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  async function screenshot(label: string) {
    if (!DEBUG) return;
    const path = `/tmp/upright-${label}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`[upright scraper] screenshot: ${path}`);
  }

  try {
    // ── 1. Open login page ──────────────────────────────────────────────────
    console.log(`[upright scraper] opening ${PORTAL_URL}`);
    await page.goto(PORTAL_URL, { waitUntil: "networkidle", timeout: 30_000 });
    await screenshot("01-login");

    // ── 2. Fill credentials ─────────────────────────────────────────────────
    const emailInput = page.locator(SELECTORS.emailInput).first();
    await emailInput.waitFor({ state: "visible", timeout: 10_000 });
    await emailInput.fill(username);

    await page.locator(SELECTORS.passwordInput).first().fill(password);
    await screenshot("02-filled");

    await page.locator(SELECTORS.submitButton).first().click();
    await page.waitForSelector(SELECTORS.postLoginSignal, { timeout: 20_000 });
    await screenshot("03-authenticated");
    console.log("[upright scraper] login OK");

    // ── 3. Navigate to holdings page if not already there ───────────────────
    if (!page.url().match(/portfolio|holdings|investments/i)) {
      try {
        await page.locator(SELECTORS.portfolioNavLink).first().click();
        await page.waitForLoadState("networkidle", { timeout: 15_000 });
        await screenshot("04-portfolio");
      } catch {
        // Already on the correct page or single-page navigation not needed
      }
    }

    await page.waitForSelector(SELECTORS.holdingsTable, { timeout: 20_000 });
    await screenshot("05-table");

    // ── 4. Read table headers ───────────────────────────────────────────────
    const headerCells = page.locator(
      `${SELECTORS.holdingsTable} ${SELECTORS.tableHeaderCells}`
    );
    const headerTexts = (await headerCells.allTextContents()).map((t) =>
      t.trim().toLowerCase()
    );
    console.log(`[upright scraper] headers: ${headerTexts.join(" | ")}`);

    const COL = {
      offeringId: colIdx(headerTexts, ["offering id", "loan id", "id", "loan #"]),
      address: colIdx(headerTexts, ["address", "property"]),
      city: colIdx(headerTexts, ["city"]),
      state: colIdx(headerTexts, ["state"]),
      status: colIdx(headerTexts, ["status", "performing"]),
      originalInvestment: colIdx(headerTexts, ["original", "invested", "investment amount"]),
      currentPrincipal: colIdx(headerTexts, ["principal", "outstanding", "current balance"]),
      maturityDate: colIdx(headerTexts, ["maturity", "due date"]),
      apr: colIdx(headerTexts, ["yield", "apr", "rate"]),
      lastPaymentDate: colIdx(headerTexts, ["last payment date", "payment date"]),
      lastPaymentAmount: colIdx(headerTexts, ["last payment amount", "payment amount"]),
      notes: colIdx(headerTexts, ["notes", "update", "comments"]),
    };

    console.log(`[upright scraper] col map: ${JSON.stringify(COL)}`);

    // ── 5. Read each row ────────────────────────────────────────────────────
    const tableRows = page.locator(
      `${SELECTORS.holdingsTable} ${SELECTORS.tableBodyRows}`
    );
    const rowCount = await tableRows.count();
    console.log(`[upright scraper] ${rowCount} rows found`);

    const holdings: InsertHolding[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      const cells = row.locator(SELECTORS.tableBodyCells);
      const cellCount = await cells.count();
      if (cellCount < 3) continue;

      const cellTexts: string[] = [];
      for (let j = 0; j < cellCount; j++) {
        cellTexts.push((await cells.nth(j).textContent()) ?? "");
      }

      const getCell = (idx: number) =>
        idx >= 0 && idx < cellTexts.length ? cellTexts[idx].trim() : "";

      const offeringId = getCell(COL.offeringId);
      if (!offeringId || offeringId.toLowerCase() === "n/a") continue;

      const rawStatus = getCell(COL.status);
      const notes = getCell(COL.notes);

      holdings.push({
        platform: "upright",
        offeringId,
        propertyAddress: getCell(COL.address) || null,
        city: getCell(COL.city) || null,
        state: getCell(COL.state) || null,
        originalInvestment: parseDollars(getCell(COL.originalInvestment)),
        currentPrincipal: parseDollars(getCell(COL.currentPrincipal)),
        maturityDate: parseDate(getCell(COL.maturityDate)),
        apr: parsePercent(getCell(COL.apr)),
        lastPaymentDate: parseDate(getCell(COL.lastPaymentDate)),
        lastPaymentAmount: parseDollars(getCell(COL.lastPaymentAmount)),
        subStatus: notes || rawStatus || null,
        lastUpdateText: notes || null,
        status: mapUprightStatus(rawStatus, notes),
        lastUpdateDate: runDate,
        lastUpdateSource: "web_scrape",
        isRbnf: offeringId.toLowerCase().includes("rbnf"),
        hurricaneDamage: false,
      });
    }

    // ── 6. Enrich NPL loans with detail-page notes ──────────────────────────
    const nplLoans = holdings.filter(
      (h) =>
        h.status !== "PERFORMING" &&
        h.status !== "SETTLED" &&
        h.status !== "WRITTEN_OFF"
    );

    if (nplLoans.length > 0) {
      console.log(`[upright scraper] enriching ${nplLoans.length} NPL loans`);

      for (const holding of nplLoans) {
        try {
          const rowWithId = page
            .locator(`tr:has-text("${holding.offeringId}") a`)
            .first();
          if ((await rowWithId.count()) === 0) continue;

          await rowWithId.click();
          await page.waitForLoadState("networkidle", { timeout: 10_000 });
          await screenshot(`06-detail-${holding.offeringId}`);

          const noteTexts = await page
            .locator(SELECTORS.detailNotes)
            .allTextContents()
            .catch(() => [] as string[]);

          if (noteTexts.length > 0) {
            holding.lastUpdateText = noteTexts
              .map((t) => t.trim())
              .filter(Boolean)
              .join(" | ")
              .slice(0, 500);
          }

          await page.goBack({ waitUntil: "networkidle", timeout: 10_000 });
          await page.waitForSelector(SELECTORS.holdingsTable, { timeout: 10_000 });
        } catch (detailErr) {
          errors.push(
            `Detail page failed for ${holding.offeringId}: ${
              detailErr instanceof Error ? detailErr.message : String(detailErr)
            }`
          );
        }
      }
    }

    console.log(
      `[upright scraper] complete — ${holdings.length} holdings, ${errors.length} errors`
    );
    return { holdings, runDate, errors };
  } catch (err) {
    await screenshot("error");
    throw err;
  } finally {
    await browser.close();
  }
}
