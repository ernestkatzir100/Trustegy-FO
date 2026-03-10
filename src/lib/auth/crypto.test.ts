import { describe, expect, it, beforeAll } from "vitest";
import { encryptSecret, decryptSecret } from "./crypto";

// Set a test encryption key (32 bytes = 64 hex chars)
beforeAll(() => {
  process.env.TOTP_ENCRYPTION_KEY =
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";
});

describe("encryptSecret / decryptSecret", () => {
  it("encrypts and decrypts a secret correctly", () => {
    const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const encrypted = encryptSecret(original);
    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toEqual(original);
  });

  it("produces different ciphertext for the same input (random IV)", () => {
    const original = new Uint8Array([10, 20, 30, 40, 50]);
    const encrypted1 = encryptSecret(original);
    const encrypted2 = encryptSecret(original);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("handles a 20-byte TOTP secret (RFC 6238)", () => {
    const secret = new Uint8Array(20);
    for (let i = 0; i < 20; i++) secret[i] = i * 13;
    const encrypted = encryptSecret(secret);
    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toEqual(secret);
  });

  it("encrypted format is iv:ciphertext:tag (3 parts)", () => {
    const original = new Uint8Array([1, 2, 3]);
    const encrypted = encryptSecret(original);
    const parts = encrypted.split(":");
    expect(parts.length).toBe(3);
  });
});
