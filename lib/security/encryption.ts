import crypto from "crypto";

// 32-byte key derived from server environment or fallback secret
const ENCRYPTION_SECRET =
  process.env.ENCRYPTION_KEY ||
  process.env.DATABASE_URL ||
  "stak-secure-publishing-credentials-key-2026";

// Derive a guaranteed 32-byte (256-bit) buffer using SHA-256
const KEY_BUFFER = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM

/**
 * Encrypts sensitive configuration or credentials server-side using AES-256-GCM.
 * The resulting string is formatted as `iv:authTag:encryptedHex`.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts server-stored ciphertext using AES-256-GCM.
 * Verifies authenticity with the GCM authentication tag.
 */
export function decryptSecret(cipherText: string): string | null {
  if (!cipherText) return null;

  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
      return null;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Failed to decrypt server credential:", err);
    return null;
  }
}

/**
 * Masks a sensitive token or key for client presentation without exposing raw data.
 * E.g., "ghp_1234567890abcdef" -> "ghp_••••••••cdef"
 */
export function maskSecret(secret: string): string {
  if (!secret) return "";
  if (secret.length <= 6) return "••••••";

  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

