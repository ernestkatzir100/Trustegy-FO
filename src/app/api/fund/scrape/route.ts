import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guard";

// Long timeout — Playwright login + scraping can take 1-3 minutes
export const maxDuration = 300;

/**
 * POST /api/fund/scrape?platform=upright
 *
 * Triggers a live scrape of the specified platform.
 * Also accepts a CRON_SECRET header for scheduled runs:
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  // Auth: either a valid user session OR the CRON_SECRET header
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Authorized via cron secret — skip session check
  } else {
    const { error } = await requireAuth();
    if (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const platform = req.nextUrl.searchParams.get("platform") ?? "upright";

  if (!["upright", "sharestates", "upgrade"].includes(platform)) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }

  try {
    if (platform === "upright") {
      const { triggerUprightScrape } = await import("@/lib/actions/scrape");
      const result = await triggerUprightScrape();

      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      return NextResponse.json(result.data);
    }

    // Sharestates and Upgrade scrapers — coming soon
    return NextResponse.json(
      { error: `${platform} scraper not yet implemented` },
      { status: 501 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[scrape route] ${platform} failed:`, msg);
    return NextResponse.json({ error: msg.slice(0, 300) }, { status: 500 });
  }
}
