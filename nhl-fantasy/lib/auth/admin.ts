import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "nhl-fantasy-admin-session";

export function isAdminConfigured() {
  return !!process.env.ADMIN_PASSWORD && !!process.env.ADMIN_SESSION_SECRET;
}

export function isValidAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  return safeCompare(password, expected);
}

export function getAdminSessionToken() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!sessionSecret || !adminPassword) {
    throw new Error("ADMIN_PASSWORD and ADMIN_SESSION_SECRET must be configured.");
  }

  return createHmac("sha256", sessionSecret)
    .update(`nhl-fantasy-admin:${adminPassword}`)
    .digest("hex");
}

export function isValidAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    return safeCompare(token, getAdminSessionToken());
  } catch {
    return false;
  }
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
