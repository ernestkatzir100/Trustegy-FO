import { pgTable, text, integer, jsonb } from "drizzle-orm/pg-core";
import { id, timestamps } from "../helpers";
import type { Platform } from "./fund";

export type ScrapeStatus = "running" | "success" | "partial" | "failed";

export interface ScrapeRunMeta {
  holdingsFound: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  durationMs: number;
}

/**
 * Log of every automated or manual platform scrape run.
 * Lets us see history, detect failures, and show "last updated" on the monitor.
 */
export const scrapeRuns = pgTable("scrape_runs", {
  id: id(),

  platform: text("platform").$type<Platform>().notNull(),
  status: text("status").$type<ScrapeStatus>().notNull().default("running"),

  /** ISO date string when the run was triggered */
  startedAt: text("started_at").notNull(),
  /** ISO date string when the run completed (null while running) */
  completedAt: text("completed_at"),

  /** Summary counts and errors, stored as JSONB */
  meta: jsonb("meta").$type<ScrapeRunMeta>(),

  /** AI-generated narrative summary of what changed this run */
  aiSummary: text("ai_summary"),

  /** Error message if status = failed */
  errorMessage: text("error_message"),

  ...timestamps,
});

export type ScrapeRun = typeof scrapeRuns.$inferSelect;
export type InsertScrapeRun = typeof scrapeRuns.$inferInsert;
