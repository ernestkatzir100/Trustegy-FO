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

    // ── 1. Distributors ────────────────────────────────────────────────────────
    let distCount = 0;
    const distIdMap = new Map<string, string>();
    if (parsedDist.length > 0) {
      // Deduplicate within-batch by name (PostgreSQL ON CONFLICT can't handle same-batch dupes)
      const seenDistNames = new Set<string>();
      const uniqueDist = parsedDist.filter((d) => {
        if (seenDistNames.has(d.row.name)) return false;
        seenDistNames.add(d.row.name);
        return true;
      });
      const inserted = await db
        .insert(distributors)
        .values(uniqueDist.map((d) => d.row))
        .onConflictDoNothing()
        .returning();
      distCount = inserted.length;
      inserted.forEach((d) => distIdMap.set(d.name, d.id));
    }

    // ── 2. Investors ───────────────────────────────────────────────────────────
    let invCount = 0;
    const investorIdMap = new Map<string, string>();

    if (merged.length > 0) {
      // Deduplicate within-batch by partnerId → email → displayName
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
          const batchMsg = batchErr instanceof Error ? batchErr.message : String(batchErr);
          console.error(`Investor batch ${i}-${i + 50} failed:`, batchMsg.split("Failed query:")[0].trim());
          // Try rows individually to skip bad ones
          for (const row of batch) {
            try {
              const r = await db.insert(investors).values([row]).onConflictDoNothing().returning();
              inserted.push(...r);
            } catch (rowErr) {
              const rowMsg = rowErr instanceof Error ? rowErr.message : String(rowErr);
              console.error(`Skipping investor "${row.displayName}":`, rowMsg.split("Failed query:")[0].trim().slice(0, 200));
            }
          }
        }
      }
      invCount = inserted.length;

      inserted.forEach((inv) => {
        if (inv.partnerId) investorIdMap.set(`pid:${inv.partnerId}`, inv.id);
        if (inv.email) investorIdMap.set(`em:${inv.email.toLowerCase()}`, inv.id);
        investorIdMap.set(`name:${inv.displayName}`, inv.id);
      });

      // Also load existing investors so re-imports don't drop positions
      const existing = await db
        .select({ id: investors.id, partnerId: investors.partnerId, email: investors.email, displayName: investors.displayName })
        .from(investors);
      existing.forEach((inv) => {
        if (inv.partnerId && !investorIdMap.has(`pid:${inv.partnerId}`))
          investorIdMap.set(`pid:${inv.partnerId}`, inv.id);
        if (inv.email && !investorIdMap.has(`em:${inv.email.toLowerCase()}`))
          investorIdMap.set(`em:${inv.email.toLowerCase()}`, inv.id);
        if (!investorIdMap.has(`name:${inv.displayName}`))
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
    const positionsToInsert = parsedPositions
      .map((p) => {
        const invId = resolveInvestorId(p.partnerId, p.investorEmail, p.investorName);
        if (!invId) return null;
        return { ...p.row, investorId: invId } as InsertInvestorPosition;
      })
      .filter((p): p is InsertInvestorPosition => p !== null);

    for (let i = 0; i < positionsToInsert.length; i += 500) {
      const batch = positionsToInsert.slice(i, i + 500);
      await db.insert(investorPositions).values(batch).onConflictDoNothing();
      posCount += batch.length;
    }

    // ── 4. Redemptions ─────────────────────────────────────────────────────────
    let redCount = 0;
    const redemptionsToInsert = parsedRedemptions
      .map((r) => {
        const invId = resolveInvestorId(null, r.investorEmail, r.investorName);
        if (!invId) return null;
        return { ...r.row, investorId: invId } as InsertRedemption;
      })
      .filter((r): r is InsertRedemption => r !== null);

    if (redemptionsToInsert.length > 0) {
      await db.insert(redemptions).values(redemptionsToInsert).onConflictDoNothing();
      redCount = redemptionsToInsert.length;
    }

    return NextResponse.json({
      investorCount: invCount,
      distributorCount: distCount,
      positionCount: posCount,
      redemptionCount: redCount,
      reviewNeededCount: needsReview.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("parse-import error:", msg);
    // Extract the postgres error: it appears before " Failed query:" in Drizzle errors
    const pgMsg = msg.includes("Failed query:")
      ? msg.split("Failed query:")[0].trim().slice(-300)
      : msg.slice(0, 300);
    return NextResponse.json(
      { error: pgMsg || msg.slice(0, 300) },
      { status: 500 }
    );
  }
}
