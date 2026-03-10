import type { ActionResult } from "@/types";

/**
 * Helper to create an error ActionResult.
 */
export function actionError<T>(
  code: string,
  message: string
): ActionResult<T> {
  return { data: null, error: { code, message } };
}

/**
 * Helper to create a success ActionResult.
 */
export function actionSuccess<T>(data: T): ActionResult<T> {
  return { data, error: null };
}
