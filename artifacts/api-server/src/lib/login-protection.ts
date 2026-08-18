import { and, desc, eq, gte, or, isNull, gt } from "drizzle-orm";
import { db, securityIpRulesTable, securityLoginAttemptsTable } from "@workspace/db";
import { getClientIp } from "./security";

const WINDOW_MS = 15 * 60 * 1000;

export type LoginProtection = {
  ipAddress: string;
  blocked: boolean;
  whitelisted: boolean;
  captchaRequired: boolean;
  preCaptchaFailures: number;
  postCaptchaFailures: number;
};

export async function inspectLoginProtection(req: any, username: string): Promise<LoginProtection> {
  const ipAddress = getClientIp(req);
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const [rule] = await db.select().from(securityIpRulesTable)
    .where(and(
      eq(securityIpRulesTable.ipAddress, ipAddress),
      eq(securityIpRulesTable.active, true),
      or(isNull(securityIpRulesTable.expiresAt), gt(securityIpRulesTable.expiresAt, now)),
    ))
    .orderBy(desc(securityIpRulesTable.createdAt))
    .limit(1);

  if (rule?.ruleType === "whitelist") {
    return { ipAddress, blocked: false, whitelisted: true, captchaRequired: false, preCaptchaFailures: 0, postCaptchaFailures: 0 };
  }
  if (rule?.ruleType === "blacklist") {
    return { ipAddress, blocked: true, whitelisted: false, captchaRequired: false, preCaptchaFailures: 0, postCaptchaFailures: 0 };
  }

  const attempts = await db.select().from(securityLoginAttemptsTable)
    .where(and(eq(securityLoginAttemptsTable.ipAddress, ipAddress), gte(securityLoginAttemptsTable.createdAt, cutoff)));
  const relevant = attempts.filter((attempt) => !attempt.success && (!attempt.username || attempt.username === username));
  const preCaptchaFailures = relevant.filter((attempt) => !attempt.captchaPassed).length;
  const postCaptchaFailures = relevant.filter((attempt) => attempt.captchaPassed).length;
  return {
    ipAddress,
    blocked: false,
    whitelisted: false,
    captchaRequired: preCaptchaFailures >= 5,
    preCaptchaFailures,
    postCaptchaFailures,
  };
}

export async function recordLoginAttempt(input: {
  ipAddress: string;
  username: string;
  success: boolean;
  captchaPassed: boolean;
  reason?: string;
}): Promise<void> {
  await db.insert(securityLoginAttemptsTable).values(input);
}

export async function blacklistAfterThreshold(input: {
  ipAddress: string;
  username: string;
  captchaPassed: boolean;
}): Promise<boolean> {
  if (!input.captchaPassed) return false;
  const cutoff = new Date(Date.now() - WINDOW_MS);
  const attempts = await db.select().from(securityLoginAttemptsTable)
    .where(and(
      eq(securityLoginAttemptsTable.ipAddress, input.ipAddress),
      gte(securityLoginAttemptsTable.createdAt, cutoff),
      eq(securityLoginAttemptsTable.success, false),
      eq(securityLoginAttemptsTable.captchaPassed, true),
    ));
  if (attempts.length < 5) return false;

  await db.insert(securityIpRulesTable).values({
    ipAddress: input.ipAddress,
    ruleType: "blacklist",
    reason: `Automatic lockout after repeated failed admin login attempts for ${input.username}`,
    active: true,
  }).onConflictDoUpdate({
    target: [securityIpRulesTable.ipAddress, securityIpRulesTable.ruleType],
    set: { active: true, reason: `Automatic lockout after repeated failed admin login attempts for ${input.username}`, updatedAt: new Date() },
  });
  return true;
}

export function createCaptcha(): { question: string; answer: string } {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}