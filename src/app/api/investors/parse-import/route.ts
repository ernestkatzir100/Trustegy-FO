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

    // ── Parse all files server-side ────────────────────────────────────────────
    const invBuf = await investorsFile.arrayBuffer();
    const rawInvestors = parseInvestorsSheet(invBuf).map((p) => p.row);
    const { merged, needsReview } = dedupeInvestors(rawInvestors);

    let parsedDist: ReturnType<typeof parseDistributorsSheet> = [];
    if (distributorsFile) {
      const buf = await distributorsFile.arrayBuffer();
      parsedDist = parseDistributorsSheet(buf);
    }

    let parsedPositions: ReturnType<typeof parseTransactionsSheet> = [];
    if (transactionsFile) {
      const buf = await transactionsFile.arrayBuffer();
      parsedPositions = parseTransactionsSheet(buf);
    }

    let parsedRedemptions: ReturnType<typeof parseDistributionsSheet> = [];
    if (distributionsFile) {
      const buf = await distributionsFile.arrayBuffer();
      parsedRedemptions = parseDistributionsSheet(buf);
    }

    // ── 1. Distributors ────────────────────────────────────────────────────────
    let distCount = 0;
    const distIdMap = new Map<string, string>();
    if (parsedDist.length > 0) {
      const inserted = await db
        .insert(distributors)
        .values(parsedDist)
        .onConflictDoNothing()
        .returning();
      distCount = inserted.length;
      inserted.forEach((d) => distIdMap.set(d.name, d.id));
    }

    // ── 2. Investors ───────────────────────────────────────────────────────────
    let invCount = 0;
    const investorIdMap = new Map<string, string>();

    if (merged.length > 0) {
      const toInsert = merged.map((inv) => ({
        ...inv,
        distributorId: inv.distributorId ? distIdMap.get(inv.distributorId) ?? null : null,
      }));

      const inserted = await db
        .insert(investors)
        .values(toInsert)
        .onConflictDoNothing()
        .returning();
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
    console.error("parse-import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 500 }
    );
  }
}
