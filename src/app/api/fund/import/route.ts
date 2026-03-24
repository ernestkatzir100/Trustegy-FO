/**
 * POST /api/fund/import/preview
 *
 * Parses an uploaded Excel / CSV file, diffs against existing DB holdings,
 * and returns a preview payload. No DB writes happen here.
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { fundHoldings } from "@/db/schema/fund";
import { parseUpright } from "@/lib/parsers/fund/upright";
import { parseSharestates } from "@/lib/parsers/fund/sharestates";
import { parseUpgrade } from "@/lib/parsers/fund/upgrade";
import type { Platform } from "@/db/schema/fund";
import type { InsertHolding } from "@/lib/validations/fund";

export type ImportPreviewRow = {
  offeringId: string;
  isNew: boolean;
  existingId?: string;
  // Fields that differ from existing (or all fields for new rows)
  changes: Partial<InsertHolding>;
  parsed: InsertHolding;
};

export type ImportPreviewResult = {
  platform: Platform;
  rows: ImportPreviewRow[];
  newCount: number;
  updateCount: number;
  reportDate: string | null;
};

function detectPlatform(fileName: string): Platform | null {
  const n = fileName.toLowerCase();
  if (n.includes("upright") || n.includes("ftf") || n.includes("pineapple entropy monthly")) {
    return "upright";
  }
  if (n.includes("sharestates") || n.includes("investor_portfolio")) {
    return "sharestates";
  }
  if (n.includes("upgrade") || n.includes("prosper") || n.includes("daily_positions") || n.includes("custom_summary")) {
    return "upgrade";
  }
  return null;
}

const TRACKED_FIELDS = [
  "currentPrincipal",
  "status",
  "subStatus",
  "maturityDate",
  "lastUpdateText",
  "apr",
  "arv",
  "loanToArv",
  "propertyAddress",
] as const;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const platformOverride = formData.get("platform") as Platform | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const fileName = file.name;
  const platform = platformOverride ?? detectPlatform(fileName);

  if (!platform) {
    return NextResponse.json(
      {
        error: `Cannot detect platform from filename "${fileName}". Try renaming or selecting the platform manually.`,
      },
      { status: 422 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: InsertHolding[] = [];
  let reportDate: string | null = null;

  try {
    if (platform === "upright") {
      const result = parseUpright(buffer);
      parsed = result.holdings;
      reportDate = result.reportDate;
    } else if (platform === "sharestates") {
      const result = parseSharestates(buffer);
      parsed = result.holdings;
      reportDate = result.reportDate;
    } else if (platform === "upgrade") {
      const result = parseUpgrade(buffer, fileName);
      parsed = result.holdings;
      reportDate = result.reportDate;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  if (parsed.length === 0) {
    return NextResponse.json({ error: "No holdings found in file" }, { status: 422 });
  }

  // Fetch existing holdings for this platform to diff
  const existing = await db
    .select()
    .from(fundHoldings)
    .where(eq(fundHoldings.platform, platform));

  const existingMap = new Map(existing.map((h) => [h.offeringId, h]));

  const rows: ImportPreviewRow[] = parsed.map((p) => {
    const ex = existingMap.get(p.offeringId);
    if (!ex) {
      return { offeringId: p.offeringId, isNew: true, changes: p, parsed: p };
    }

    // Compute field-level diff
    const changes: Partial<InsertHolding> = {};
    for (const field of TRACKED_FIELDS) {
      const newVal = p[field];
      const oldVal = ex[field];
      if (newVal !== undefined && newVal !== oldVal) {
        (changes as Record<string, unknown>)[field] = newVal;
      }
    }

    return {
      offeringId: p.offeringId,
      isNew: false,
      existingId: ex.id,
      changes,
      parsed: p,
    };
  });

  const newCount = rows.filter((r) => r.isNew).length;
  const updateCount = rows.filter((r) => !r.isNew && Object.keys(r.changes).length > 0).length;

  const result: ImportPreviewResult = {
    platform,
    rows,
    newCount,
    updateCount,
    reportDate,
  };

  return NextResponse.json(result);
}
