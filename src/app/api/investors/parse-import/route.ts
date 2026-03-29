import { NextRequest, NextResponse } from "next/server";
import {
  parseInvestorsSheet,
  parseDistributorsSheet,
  parseTransactionsSheet,
  parseDistributionsSheet,
  dedupeInvestors,
} from "@/lib/import-investors";
import { db } from "@/db";
import {
  investors,
  distributors,
  investorPositions,
  redemptions,
} from "@/db/schema/investors";
import type {
  InsertInvestorPosition,
  InsertRedemption,
} from "@/db/schema/investors";
import { requireAuth } from "@/lib/auth/guard";

export const maxDuration = 300; // 5 min for large files

/** Extract the real PostgreSQL error from a Drizzle error string. */
function pgError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Failed query:")) {
    return msg.split("Failed query:")[0].trim().slice(0, 300) || msg.slice(0, 300);
  }
  return msg.slice(0, 300);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  try {
    const formData = await req.formData();

    const investorsFile = formData.get("investors") as File | null;
    const distributorsFile = formData.get("distributors") as File | null;
    const transactionsFile = formData.get("transactions") as File | null;
    const distributionsFile = formData.get("distributions") as File | null;

    if (!investorsFile) {
      return NextResponse.json({ error: "Investor register file is required" }, { status: 400 });
    }

    const dryRun = req.nextUrl.searchParams.get("dry_run") === "1";

    // ── Parse all files server-side (ExcelJS — streaming, no string limit) ──────
    const rawInvestors = (await parseInvestorsSheet(await investorsFile.arrayBuffer())).map((p) => p.row);
    const { merged, needsReview } = dedupeInvestors(rawInvestors);

    // Dry-run: return parsed data without touching the DB
    if (dryRun) {
      return NextResponse.json({
        investorCount: merged.length,
        sampleInvestors: merged.slice(0, 5),
        reviewNeededCount: needsReview.length,
      });
    }

    let parsedDist: Awaited<ReturnType<typeof parseDistributorsSheet>> = [];
    if (distributorsFile) {
      parsedDist = await parseDistributorsSheet(await distributorsFile.arrayBuffer());
    }

    let parsedPositions: Awaited<ReturnType<typeof parseTransactionsSheet>> = [];
    if (transactionsFile) {
      parsedPositions = await parseTransactionsSheet(await transactionsFile.arrayBuffer());
    }

    let parsedRedemptions: Awaited<ReturnType<typeof parseDistributionsSheet>> = [];
    if (distributionsFile) {
      parsedRedemptions = await parseDistributionsSheet(await distributionsFile.arrayBuffer());
    }

    // ── Pre-load existing investors BEFORE any inserts (fresh connection) ────────
    // This populates investorIdMap for re-imports so positions aren't dropped.
    const investorIdMap = new Map<string, string>();
    try {
      const existing = await db
        .select({ id: investors.id, partnerId: investors.partnerId, email: investors.email, displayName: investors.displayName })
        .from(investors);
      existing.forEach((inv) => {
        if (inv.partnerId) investorIdMap.set(`pid:${inv.partnerId}`, inv.id);
        if (inv.email) investorIdMap.set(`em:${inv.email.toLowerCase()}`, inv.id);
        investorIdMap.set(`name:${inv.displayName}`, inv.id);
      });
    } catch (selErr) {
      // Non-fatal: log and continue. investorIdMap will be built from newly inserted rows.
      console.error("Pre-load existing investors failed (non-fatal):", pgError(selErr));
    }

    // ── 1. Distributors ────────────────────────────────────────────────────────
    let distCount = 0;
    const distIdMap = new Map<string, string>();
    const distErrors: string[] = [];

    if (parsedDist.length > 0) {
      const seenDistNames = new Set<string>();
      const uniqueDist = parsedDist.filter((d) => {
        if (seenDistNames.has(d.row.name)) return false;
        seenDistNames.add(d.row.name);
        return true;
      });
      try {
        const inserted = await db
          .insert(distributors)
          .values(uniqueDist.map((d) => d.row))
          .onConflictDoNothing()
          .returning();
        distCount = inserted.length;
        inserted.forEach((d) => distIdMap.set(d.name, d.id));
      } catch (distBatchErr) {
        const batchMsg = pgError(distBatchErr);
        distErrors.push(batchMsg);
        console.error("Distributor batch insert failed:", batchMsg);
        // Row-by-row fallback
        for (const d of uniqueDist) {
          try {
            const rows = await db.insert(distributors).values([d.row]).onConflictDoNothing().returning();
            distCount += rows.length;
            rows.forEach((r) => distIdMap.set(r.name, r.id));
          } catch (rowErr) {
            distErrors.push(`"${d.row.name}": ${pgError(rowErr)}`);
          }
        }
      }
    }

    // ── 2. Investors ───────────────────────────────────────────────────────────
    let invCount = 0;
    const invErrors: string[] = [];

    if (merged.length > 0) {
      const seenInvKeys = new Set<string>();
      const uniqueMerged = merged.filter((inv) => {
        const key = inv.partnerId
          ? `pid:${inv.partnerId}`
          : inv.email
          ? `em:${inv.email.toLowerCase()}`
          : `name:${inv.displayName}`;
        if (seenInvKeys.has(key)) return false;
        seenInvKeys.add(key);
        return true;
      });

      const toInsert = uniqueMerged.map((inv) => ({
        ...inv,
        distributorId: inv.distributorId ? distIdMap.get(inv.distributorId) ?? null : null,
      }));

      const inserted: typeof investors.$inferSelect[] = [];
      for (let i = 0; i < toInsert.length; i += 50) {
        const batch = toInsert.slice(i, i + 50);
        try {
          const rows = await db.insert(investors).values(batch).onConflictDoNothing().returning();
          inserted.push(...rows);
        } catch (batchErr) {
          console.error(`Investor batch ${i}–${i + 50} failed:`, pgError(batchErr));
          for (const row of batch) {
            try {
              const r = await db.insert(investors).values([row]).onConflictDoNothing().returning();
              inserted.push(...r);
            } catch (rowErr) {
              const errLine = `"${row.displayName}": ${pgError(rowErr)}`;
              invErrors.push(errLine);
              console.error("Skipping investor:", errLine);
            }
          }
        }
      }
      invCount = inserted.length;

      // Add newly inserted investors to the map (overwrite any stale pre-load entries)
      inserted.forEach((inv) => {
        if (inv.partnerId) investorIdMap.set(`pid:${inv.partnerId}`, inv.id);
        if (inv.email) investorIdMap.set(`em:${inv.email.toLowerCase()}`, inv.id);
        investorIdMap.set(`name:${inv.displayName}`, inv.id);
      });
    }

    const resolveInvestorId = (
      partnerId: string | null | undefined,
      email: string | null | undefined,
      name: string
    ): string | null => {
      if (partnerId) {
        const id = investorIdMap.get(`pid:${partnerId}`);
        if (id) return id;
      }
      if (email) {
        const id = investorIdMap.get(`em:${email.toLowerCase()}`);
        if (id) return id;
      }
      return investorIdMap.get(`name:${name}`) ?? null;
    };

    // ── 3. Positions ───────────────────────────────────────────────────────────
    let posCount = 0;
    const posErrors: string[] = [];
    const positionsToInsert = parsedPositions
      .map((p) => {
        const invId = resolveInvestorId(p.partnerId, p.investorEmail, p.investorName);
        if (!invId) return null;
        return { ...p.row, investorId: invId } as InsertInvestorPosition;
      })
      .filter((p): p is InsertInvestorPosition => p !== null);

    for (let i = 0; i < positionsToInsert.length; i += 500) {
      const batch = positionsToInsert.slice(i, i + 500);
      try {
        await db.insert(investorPositions).values(batch).onConflictDoNothing();
        posCount += batch.length;
      } catch (posErr) {
        posErrors.push(`batch ${i}–${i + 500}: ${pgError(posErr)}`);
        console.error(`Position batch ${i}–${i + 500} failed:`, pgError(posErr));
      }
    }

    // ── 4. Redemptions ─────────────────────────────────────────────────────────
    let redCount = 0;
    const redErrors: string[] = [];
    const redemptionsToInsert = parsedRedemptions
      .map((r) => {
        const invId = resolveInvestorId(null, r.investorEmail, r.investorName);
        if (!invId) return null;
        return { ...r.row, investorId: invId } as InsertRedemption;
      })
      .filter((r): r is InsertRedemption => r !== null);

    if (redemptionsToInsert.length > 0) {
      try {
        await db.insert(redemptions).values(redemptionsToInsert).onConflictDoNothing();
        redCount = redemptionsToInsert.length;
      } catch (redErr) {
        redErrors.push(pgError(redErr));
        console.error("Redemption insert failed:", pgError(redErr));
      }
    }

    return NextResponse.json({
      investorCount: invCount,
      distributorCount: distCount,
      positionCount: posCount,
      redemptionCount: redCount,
      reviewNeededCount: needsReview.length,
      // Debug info — remove after successful import
      ...(invErrors.length > 0 && { investorErrors: invErrors.slice(0, 20) }),
      ...(distErrors.length > 0 && { distributorErrors: distErrors.slice(0, 10) }),
      ...(posErrors.length > 0 && { positionErrors: posErrors.slice(0, 5) }),
      ...(redErrors.length > 0 && { redemptionErrors: redErrors.slice(0, 5) }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("parse-import unhandled error:", msg.slice(0, 500));
    return NextResponse.json(
      { error: pgError(err) },
      { status: 500 }
    );
  }
}
