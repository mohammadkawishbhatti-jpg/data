import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const LEGACY_SALTS = ["prime_salt_2024", "prime_customer_salt_2024"];

export function legacySha256(plain: string, salt = LEGACY_SALTS[0]): string {
  return crypto.createHash("sha256").update(plain + salt).digest("hex");
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scryptAsync(plain, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(stored: string | null | undefined, plain: string): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (!stored) return { valid: false, needsUpgrade: false };

  if (stored.startsWith("scrypt$")) {
    const [, salt, expectedHex] = stored.split("$");
    if (!salt || !expectedHex) return { valid: false, needsUpgrade: false };
    const actual = await scryptAsync(plain, salt, 64) as Buffer;
    const expected = Buffer.from(expectedHex, "hex");
    return {
      valid: expected.length === actual.length && crypto.timingSafeEqual(expected, actual),
      needsUpgrade: false,
    };
  }

  const valid = LEGACY_SALTS.some((salt) => {
    const expected = legacySha256(plain, salt);
    return expected.length === stored.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(stored));
  });
  return { valid, needsUpgrade: valid };
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (first || req.socket?.remoteAddress || "unknown").trim().replace(/^::ffff:/, "");
}