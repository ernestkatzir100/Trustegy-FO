"use server";

import { db } from "@/db";
import {
  investors,
  distributors,
  investorPositions,
  redemptions,
  emailTemplates,
  emailLogs,
  type Investor,
  type Distributor,
  type InvestorPosition,
  type Redemption,
  type EmailTemplate,
  type EmailLog,
  type InsertInvestor,
  type InsertDistributor,
  type InsertInvestorPosition,
  type InsertRedemption,
  type InsertEmailLog,
} from "@/db/schema/investors";
import { eq, desc, asc, inArray, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import type { ActionResult } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvestorWithLatestPosition extends Investor {
  latestPosition: InvestorPosition | null;
  distributor: Distributor | null;
  redemptionCount: number;
}

export interface InvestorDetail extends InvestorWithLatestPosition {
  positions: InvestorPosition[];
  allRedemptions: Redemption[];
  emailHistory: EmailLog[];
}

export interface BulkImportPayload {
  investors: InsertInvestor[];
  distributors: InsertDistributor[];
  positions: InsertInvestorPosition[];
  redemptions: InsertRedemption[];
}

export interface BulkImportResult {
  investorCount: number;
  distributorCount: number;
  positionCount: number;
  redemptionCount: number;
}

// ─── Investor list ────────────────────────────────────────────────────────────

export async function getInvestors(): Promise<
  ActionResult<InvestorWithLatestPosition[]>
> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const rows = await db.select().from(investors).orderBy(asc(investors.displayName));

    const allDistributors = await db.select().from(distributors);
    const distMap = new Map(allDistributors.map((d) => [d.id, d]));

    // Latest position per investor
    const latestPositions = await db
      .selectDistinctOn([investorPositions.investorId], {
        pos: investorPositions,
      })
      .from(investorPositions)
      .orderBy(
        investorPositions.investorId,
        desc(investorPositions.dataDate)
      );
    const posMap = new Map(latestPositions.map((r) => [r.pos.investorId, r.pos]));

    // Redemption counts
    const counts = await db
      .select({
        investorId: redemptions.investorId,
        count: sql<number>`count(*)::int`,
      })
      .from(redemptions)
      .groupBy(redemptions.investorId);
    const countMap = new Map(counts.map((c) => [c.investorId, c.count]));

    return actionSuccess(
      rows.map((inv) => ({
        ...inv,
        latestPosition: posMap.get(inv.id) ?? null,
        distributor: inv.distributorId ? (distMap.get(inv.distributorId) ?? null) : null,
        redemptionCount: countMap.get(inv.id) ?? 0,
      }))
    );
  } catch (err) {
    return actionError(
      "DB_ERROR",
      err instanceof Error ? err.message : "Failed to fetch investors"
    );
  }
}

// ─── Investor detail ──────────────────────────────────────────────────────────

export async function getInvestorDetail(
  investorId: string
): Promise<ActionResult<InvestorDetail>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const [inv] = await db
      .select()
      .from(investors)
      .where(eq(investors.id, investorId))
      .limit(1);

    if (!inv) return actionError("NOT_FOUND", "Investor not found");

    const [positions, allRedemptions, emailHistory, allDistributors] =
      await Promise.all([
        db
          .select()
          .from(investorPositions)
          .where(eq(investorPositions.investorId, investorId))
          .orderBy(desc(investorPositions.dataDate)),
        db
          .select()
          .from(redemptions)
          .where(eq(redemptions.investorId, investorId))
          .orderBy(desc(redemptions.date)),
        db
          .select()
          .from(emailLogs)
          .where(eq(emailLogs.investorId, investorId))
          .orderBy(desc(emailLogs.sentAt)),
        db.select().from(distributors),
      ]);

    const distMap = new Map(allDistributors.map((d) => [d.id, d]));

    return actionSuccess({
      ...inv,
      latestPosition: positions[0] ?? null,
      distributor: inv.distributorId ? (distMap.get(inv.distributorId) ?? null) : null,
      redemptionCount: allRedemptions.length,
      positions,
      allRedemptions,
      emailHistory,
    });
  } catch (err) {
    return actionError(
      "DB_ERROR",
      err instanceof Error ? err.message : "Failed to fetch investor"
    );
  }
}

// ─── Bulk import ──────────────────────────────────────────────────────────────

export async function bulkImportInvestors(
  payload: BulkImportPayload
): Promise<ActionResult<BulkImportResult>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    // 1. Distributors
    let distCount = 0;
    const distIdMap = new Map<string, string>(); // name → db id
    if (payload.distributors.length > 0) {
      const inserted = await db
        .insert(distributors)
        .values(payload.distributors)
        .onConflictDoNothing()
        .returning();
      distCount = inserted.length;
      inserted.forEach((d) => distIdMap.set(d.name, d.id));
    }

    // 2. Investors — resolve distributor FK
    let invCount = 0;
    const investorIdMap = new Map<string, string>(); // partnerId|email → db id
    if (payload.investors.length > 0) {
      const toInsert = payload.investors.map((inv) => {
        const distId =
          inv.distributorId ? distIdMap.get(inv.distributorId) ?? null : null;
        return { ...inv, distributorId: distId };
      });

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

      // Also fetch existing investors that were skipped by onConflictDoNothing
      // so positions/redemptions for already-imported investors are not dropped
      const partnerIds = toInsert.map((i) => i.partnerId).filter(Boolean) as string[];
      const emails = toInsert.map((i) => i.email).filter(Boolean) as string[];
      if (partnerIds.length > 0 || emails.length > 0) {
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
    }

    // Helper: resolve investor ID from position/redemption lookup keys
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

    // 3. Positions
    let posCount = 0;
    const positionsToInsert = payload.positions
      .map((p) => {
        const invId = resolveInvestorId(
          (p as InsertInvestorPosition & { _partnerId?: string })._partnerId,
          (p as InsertInvestorPosition & { _email?: string })._email,
          (p as InsertInvestorPosition & { _name?: string })._name ?? ""
        );
        if (!invId) return null;
        return { ...p, investorId: invId };
      })
      .filter((p): p is InsertInvestorPosition => p !== null);

    if (positionsToInsert.length > 0) {
      // Insert in batches of 500 to stay under param limits
      for (let i = 0; i < positionsToInsert.length; i += 500) {
        const batch = positionsToInsert.slice(i, i + 500);
        await db.insert(investorPositions).values(batch).onConflictDoNothing();
        posCount += batch.length;
      }
    }

    // 4. Redemptions
    let redCount = 0;
    const redemptionsToInsert = payload.redemptions
      .map((r) => {
        const invId = resolveInvestorId(
          null,
          (r as InsertRedemption & { _email?: string })._email,
          (r as InsertRedemption & { _name?: string })._name ?? ""
        );
        if (!invId) return null;
        return { ...r, investorId: invId };
      })
      .filter((r): r is InsertRedemption => r !== null);

    if (redemptionsToInsert.length > 0) {
      await db.insert(redemptions).values(redemptionsToInsert).onConflictDoNothing();
      redCount = redemptionsToInsert.length;
    }

    return actionSuccess({
      investorCount: invCount,
      distributorCount: distCount,
      positionCount: posCount,
      redemptionCount: redCount,
    });
  } catch (err) {
    return actionError(
      "IMPORT_ERROR",
      err instanceof Error ? err.message : "Bulk import failed"
    );
  }
}

// ─── Investor update ──────────────────────────────────────────────────────────

export async function updateInvestor(
  investorId: string,
  data: Partial<InsertInvestor>
): Promise<ActionResult<Investor>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const [updated] = await db
      .update(investors)
      .set(data)
      .where(eq(investors.id, investorId))
      .returning();
    if (!updated) return actionError("NOT_FOUND", "Investor not found");
    return actionSuccess(updated);
  } catch (err) {
    return actionError(
      "DB_ERROR",
      err instanceof Error ? err.message : "Update failed"
    );
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

export async function getEmailTemplates(): Promise<ActionResult<EmailTemplate[]>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const rows = await db
      .select()
      .from(emailTemplates)
      .orderBy(asc(emailTemplates.name));
    return actionSuccess(rows);
  } catch (err) {
    return actionError("DB_ERROR", err instanceof Error ? err.message : "Failed");
  }
}

// ─── Send email ───────────────────────────────────────────────────────────────

export interface SendEmailPayload {
  investorIds: string[];
  subject: string;
  body: string;
  templateId?: string;
  attachments?: Array<{ name: string; content: string }>; // base64-encoded file content
}

export interface SendEmailResult {
  sent: number;
  failed: number;
  errors: string[];
}

export async function sendInvestorEmail(
  payload: SendEmailPayload
): Promise<ActionResult<SendEmailResult>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const targets = await db
      .select({ id: investors.id, email: investors.email, displayName: investors.displayName })
      .from(investors)
      .where(inArray(investors.id, payload.investorIds));

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const target of targets) {
      if (!target.email) {
        errors.push(`${target.displayName}: no email address`);
        failed++;
        continue;
      }

      try {
        // Interpolate per-recipient placeholders
        const today = new Date().toLocaleDateString("he-IL");
        const interpolate = (text: string) =>
          text
            .replace(/\{\{name\}\}/g, target.displayName)
            .replace(/\{\{date\}\}/g, today);

        const resolvedSubject = interpolate(payload.subject);
        const resolvedBody = interpolate(payload.body);

        const attachmentList = payload.attachments?.map((a) => ({
          filename: a.name,
          content: a.content, // base64 — Resend accepts this directly
        }));

        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "Pineapple Fund <noreply@pineapplefund.co.il>",
          to: target.email,
          subject: resolvedSubject,
          html: resolvedBody.replace(/\n/g, "<br>"),
          attachments: attachmentList,
        });

        const log: InsertEmailLog = {
          investorId: target.id,
          templateId: payload.templateId ?? null,
          subject: resolvedSubject,
          body: resolvedBody,
          attachments: payload.attachments ? JSON.stringify(payload.attachments) : null,
          sentBy: userId,
          sentAt: new Date(),
          resendMessageId: result.data?.id ?? null,
          status: result.error ? "failed" : "sent",
        };
        await db.insert(emailLogs).values(log);

        if (result.error) {
          errors.push(`${target.displayName}: ${result.error.message}`);
          failed++;
        } else {
          sent++;
        }
      } catch (e) {
        errors.push(`${target.displayName}: ${e instanceof Error ? e.message : "unknown error"}`);
        failed++;
      }
    }

    return actionSuccess({ sent, failed, errors });
  } catch (err) {
    return actionError(
      "EMAIL_ERROR",
      err instanceof Error ? err.message : "Email send failed"
    );
  }
}

// ─── Import count ─────────────────────────────────────────────────────────────

export async function getInvestorImportStatus(): Promise<
  ActionResult<{ investorCount: number; positionCount: number; imported: boolean }>
> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const [{ count: invCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(investors);
    const [{ count: posCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(investorPositions);

    return actionSuccess({
      investorCount: invCount,
      positionCount: posCount,
      imported: invCount > 0,
    });
  } catch (err) {
    return actionError("DB_ERROR", err instanceof Error ? err.message : "Failed");
  }
}

// ─── QA Data ──────────────────────────────────────────────────────────────────

export interface QAInvestorRow {
  id: string;
  partnerId: string | null;
  nameEn: string;
  nameHe: string | null;
  email: string | null;
  status: string;
  currencyClass: string;
  joinDate: string | null;
  hasPartnerIdFlag: boolean;
  hasNameEnFlag: boolean;
  hasNameHeFlag: boolean;
  hasEmailFlag: boolean;
  hasNov25Position: boolean;
  positionCount: number;
  lastPositionDate: string | null;
  issues: string[];
}

export interface InvestorQAData {
  investors: QAInvestorRow[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    hasPartnerId: number;
    hasNameEn: number;
    hasNameHe: number;
    hasEmail: number;
    hasNov25: number;
    score: number; // 0–100
  };
  latestImportDate: string | null;
}

export async function getInvestorQAData(): Promise<ActionResult<InvestorQAData>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  try {
    const [allInvestors, nov25Ids, positionStats] = await Promise.all([
      db.select().from(investors).orderBy(asc(investors.displayName)),
      // Investor IDs that have at least one November 2025 position
      db
        .selectDistinct({ investorId: investorPositions.investorId })
        .from(investorPositions)
        .where(sql`${investorPositions.dataDate} >= '2025-11-01'`),
      // Position count + last date per investor
      db
        .select({
          investorId: investorPositions.investorId,
          count: sql<number>`count(*)::int`,
          lastDate: sql<string>`max(${investorPositions.dataDate})`,
        })
        .from(investorPositions)
        .groupBy(investorPositions.investorId),
    ]);

    const nov25Set = new Set(nov25Ids.map((r) => r.investorId));
    const posMap = new Map(positionStats.map((r) => [r.investorId, r]));

    const qaRows: QAInvestorRow[] = allInvestors.map((inv) => {
      const pos = posMap.get(inv.id);
      const hasPartnerIdFlag = !!inv.partnerId;
      const hasNameEnFlag = !!(inv.nameEn && inv.nameEn.trim());
      const hasNameHeFlag = !!(inv.nameHe && inv.nameHe.trim());
      const hasEmailFlag = !!(inv.email && inv.email.trim());
      const hasNov25Position = nov25Set.has(inv.id);

      const issues: string[] = [];
      if (!hasPartnerIdFlag) issues.push("Missing partner ID");
      if (!hasNameHeFlag) issues.push("Missing Hebrew name");
      if (!hasEmailFlag) issues.push("No email");
      if (!hasNov25Position && inv.status === "active") issues.push("No Nov 2025 position");

      return {
        id: inv.id,
        partnerId: inv.partnerId,
        nameEn: inv.nameEn,
        nameHe: inv.nameHe,
        email: inv.email,
        status: inv.status,
        currencyClass: inv.currencyClass,
        joinDate: inv.joinDate,
        hasPartnerIdFlag,
        hasNameEnFlag,
        hasNameHeFlag,
        hasEmailFlag,
        hasNov25Position,
        positionCount: pos?.count ?? 0,
        lastPositionDate: pos?.lastDate ?? null,
        issues,
      };
    });

    const total = qaRows.length;
    const active = qaRows.filter((r) => r.status === "active").length;
    const hasPartnerId = qaRows.filter((r) => r.hasPartnerIdFlag).length;
    const hasNameEn = qaRows.filter((r) => r.hasNameEnFlag).length;
    const hasNameHe = qaRows.filter((r) => r.hasNameHeFlag).length;
    const hasEmail = qaRows.filter((r) => r.hasEmailFlag).length;
    const hasNov25 = qaRows.filter((r) => r.hasNov25Position).length;

    // Score: weighted average of critical field coverage (active investors only)
    const activeRows = qaRows.filter((r) => r.status === "active");
    const activeTotal = activeRows.length || 1;
    const scoreComponents = [
      (activeRows.filter((r) => r.hasPartnerIdFlag).length / activeTotal) * 30,
      (activeRows.filter((r) => r.hasNameEnFlag).length / activeTotal) * 25,
      (activeRows.filter((r) => r.hasNameHeFlag).length / activeTotal) * 20,
      (activeRows.filter((r) => r.hasEmailFlag).length / activeTotal) * 15,
      (activeRows.filter((r) => r.hasNov25Position).length / activeTotal) * 10,
    ];
    const score = Math.round(scoreComponents.reduce((a, b) => a + b, 0));

    // Most recent import date
    const latestImportDate = positionStats.length > 0
      ? positionStats.reduce((max, r) => (r.lastDate > max ? r.lastDate : max), "")
      : null;

    return actionSuccess({
      investors: qaRows.sort((a, b) => b.issues.length - a.issues.length),
      summary: { total, active, inactive: total - active, hasPartnerId, hasNameEn, hasNameHe, hasEmail, hasNov25, score },
      latestImportDate,
    });
  } catch (err) {
    return actionError("DB_ERROR", err instanceof Error ? err.message : "Failed to fetch QA data");
  }
}
