import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.TOTP_ENCRYPTION_KEY;
  if (!key || Buffer.from(key, "hex").length !== 32) {
    throw new Error("TOTP_ENCRYPTION_KEY must be 64 hex chars (32 bytes)");
  }
  return Buffer.from(key, "hex");
}

export function encryptSecret(plaintext: Uint8Array): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    encrypted.toString("base64"),
    tag.toString("base64"),
  ].join(":");
}

export function decryptSecret(stored: string): Uint8Array {
  const [ivB64, ciphertextB64, tagB64] = stored.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tag);
  return new Uint8Array(
    Buffer.concat([decipher.update(ciphertext), decipher.final()])
  );
}
