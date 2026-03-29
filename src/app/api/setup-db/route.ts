import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * ONE-TIME SETUP ENDPOINT
 * Creates the scrape_runs table if it doesn't exist.
 * Call once after deploy, then delete this file.
 *
 * Usage: POST /api/setup-db
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS scrape_runs (
        id          TEXT PRIMARY KEY,
        platform    TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'running',
        started_at  TEXT NOT NULL,
        completed_at TEXT,
        meta        JSONB,
        ai_summary  TEXT,
        error_message TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    return NextResponse.json({ ok: true, message: "scrape_runs table ready" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[setup-db]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
