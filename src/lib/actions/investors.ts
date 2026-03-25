"use server";

import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import type { ActionResult } from "@/types";
import type { MondayInvestor, MondayBoardMeta } from "@/lib/monday";

export interface InvestorsResult {
  investors: MondayInvestor[];
  boardName: string;
}

/** Fetch LP investors from the configured Monday.com board. */
export async function getInvestors(): Promise<ActionResult<InvestorsResult>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  if (!process.env.MONDAY_API_TOKEN || !process.env.MONDAY_INVESTORS_BOARD_ID) {
    return actionError(
      "NOT_CONFIGURED",
      "Monday.com integration is not configured. Set MONDAY_API_TOKEN and MONDAY_INVESTORS_BOARD_ID in Railway."
    );
  }

  try {
    const { fetchMondayInvestors } = await import("@/lib/monday");
    const result = await fetchMondayInvestors();
    return actionSuccess(result);
  } catch (err) {
    return actionError(
      "MONDAY_ERROR",
      err instanceof Error ? err.message : "Failed to fetch Monday data"
    );
  }
}

/** List all Monday boards accessible with the token — for setup/discovery. */
export async function getMondayBoards(): Promise<ActionResult<MondayBoardMeta[]>> {
  const { error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  if (!process.env.MONDAY_API_TOKEN) {
    return actionError(
      "NOT_CONFIGURED",
      "MONDAY_API_TOKEN is not set in Railway environment variables."
    );
  }

  try {
    const { listMondayBoards } = await import("@/lib/monday");
    const boards = await listMondayBoards();
    return actionSuccess(boards);
  } catch (err) {
    return actionError(
      "MONDAY_ERROR",
      err instanceof Error ? err.message : "Failed to list Monday boards"
    );
  }
}
