import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "dar_tahara_admin";

function equal(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function signature(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_TOKEN;
  if (!secret) return "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createAdminSession(): string {
  const expires = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const value = String(expires);
  return `${value}.${signature(value)}`;
}

export function isAdminAuthorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return false;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (bearer && equal(bearer, expected)) return true;
  const token = req.cookies.get(ADMIN_COOKIE)?.value || "";
  const [expires, supplied] = token.split(".");
  return Boolean(
    expires && supplied && Number(expires) > Date.now() / 1000 && equal(supplied, signature(expires)),
  );
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_API_TOKEN && (process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_TOKEN));
}
