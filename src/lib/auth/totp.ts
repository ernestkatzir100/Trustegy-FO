"use server";

import { randomBytes } from "crypto";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { twoFactorAuth } from "@/db/schema/auth";
import { requireAuth } from "@/lib/auth/guard";
import { actionError, actionSuccess } from "@/lib/actions";
import { encryptSecret, decryptSecret } from "./crypto";
import type { ActionResult } from "@/types";

const TOTP_ISSUER = "Shefa";
const TOTP_INTERVAL = 30;
const TOTP_DIGITS = 6;
const GRACE_PERIOD = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function setupTOTP(): Promise<
  ActionResult<{ qrDataUrl: string; secret: string }>
> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  // Check if already enabled
  const existing = await db
    .select({ enabled: twoFactorAuth.enabled })
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId))
    .limit(1);

  if (existing.length > 0 && existing[0].enabled) {
    return actionError("ALREADY_ENABLED", "אימות דו-שלבי כבר מופעל");
  }

  // Generate 20-byte secret (160-bit, RFC 6238 standard)
  const secretBytes = randomBytes(20);
  const encrypted = encryptSecret(secretBytes);

  // Create or update the TOTP record (upsert: if exists but not enabled, replace)
  if (existing.length > 0) {
    await db
      .update(twoFactorAuth)
      .set({
        encryptedSecret: encrypted,
        enabled: false,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(twoFactorAuth.userId, userId));
  } else {
    await db.insert(twoFactorAuth).values({
      userId,
      encryptedSecret: encrypted,
      enabled: false,
    });
  }

  // Generate the otpauth URI and QR code
  const uri = createTOTPKeyURI(
    TOTP_ISSUER,
    userId,
    secretBytes,
    TOTP_INTERVAL,
    TOTP_DIGITS
  );
  const qrDataUrl = await QRCode.toDataURL(uri);

  // Encode secret as base32 for manual entry
  const base32Secret = encodeBase32(secretBytes);

  return actionSuccess({ qrDataUrl, secret: base32Secret });
}

export async function verifyAndEnableTOTP(
  code: string
): Promise<ActionResult<null>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const record = await db
    .select()
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId))
    .limit(1);

  if (record.length === 0) {
    return actionError("NOT_FOUND", "לא נמצאה הגדרת אימות דו-שלבי");
  }

  if (record[0].enabled) {
    return actionError("ALREADY_ENABLED", "אימות דו-שלבי כבר מופעל");
  }

  const secretBytes = decryptSecret(record[0].encryptedSecret);

  const isValid = verifyTOTPWithGracePeriod(
    secretBytes,
    TOTP_INTERVAL,
    TOTP_DIGITS,
    code,
    GRACE_PERIOD
  );

  if (!isValid) {
    return actionError("INVALID_CODE", "קוד שגוי. נסה שוב.");
  }

  await db
    .update(twoFactorAuth)
    .set({ enabled: true, updatedAt: new Date() })
    .where(eq(twoFactorAuth.userId, userId));

  return actionSuccess(null);
}

export async function verifyTOTPCode(
  code: string
): Promise<ActionResult<null>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const record = await db
    .select()
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId))
    .limit(1);

  if (record.length === 0 || !record[0].enabled) {
    return actionError("NOT_ENABLED", "אימות דו-שלבי לא מופעל");
  }

  // Check lockout
  if (record[0].lockedUntil && record[0].lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (record[0].lockedUntil.getTime() - Date.now()) / 60000
    );
    return actionError(
      "LOCKED",
      `חשבון נעול. נסה שוב בעוד ${minutesLeft} דקות.`
    );
  }

  const secretBytes = decryptSecret(record[0].encryptedSecret);

  const isValid = verifyTOTPWithGracePeriod(
    secretBytes,
    TOTP_INTERVAL,
    TOTP_DIGITS,
    code,
    GRACE_PERIOD
  );

  if (!isValid) {
    const newAttempts = record[0].failedAttempts + 1;
    const updates: Record<string, unknown> = {
      failedAttempts: newAttempts,
      lastFailedAttempt: new Date(),
      updatedAt: new Date(),
    };

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.lockedUntil = new Date(
        Date.now() + LOCKOUT_MINUTES * 60 * 1000
      );
    }

    await db
      .update(twoFactorAuth)
      .set(updates)
      .where(eq(twoFactorAuth.userId, userId));

    return actionError("INVALID_CODE", "קוד שגוי. נסה שוב.");
  }

  // Reset failed attempts on success
  await db
    .update(twoFactorAuth)
    .set({
      failedAttempts: 0,
      lastFailedAttempt: null,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(twoFactorAuth.userId, userId));

  return actionSuccess(null);
}

export async function disableTOTP(): Promise<ActionResult<null>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  await db
    .delete(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId));

  return actionSuccess(null);
}

export async function hasTOTPEnabled(): Promise<ActionResult<boolean>> {
  const { userId, error } = await requireAuth();
  if (error) return actionError(error.code, error.message);

  const record = await db
    .select({ enabled: twoFactorAuth.enabled })
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId))
    .limit(1);

  return actionSuccess(record.length > 0 && record[0].enabled);
}

// Base32 encoding (RFC 4648)
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encodeBase32(data: Uint8Array): string {
  let result = "";
  let bits = 0;
  let value = 0;

  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_CHARS[(value >>> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 0x1f];
  }

  return result;
}
