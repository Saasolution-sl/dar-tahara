import "server-only";

import { createHmac } from "node:crypto";
import { rateLimit, type RateLimitPolicy } from "@/lib/mailing-list";
import { emitSecurityEvent } from "@/lib/security-events";
import { serviceRpc } from "@/lib/supabase-rpc";

export type RateLimitResult = { allowed: boolean; retryAfterMs: number };
type RateLimitRow = { allowed: boolean; retry_after_ms: number | string };

export function rateLimitKeyDigest(key: string, secret: string): string {
  if (secret.length < 32) throw new Error("rate_limit_key_secret_too_short");
  return createHmac("sha256", secret).update(key).digest("hex");
}

export async function rateLimitShared(
  key: string,
  options: Partial<RateLimitPolicy> = {},
): Promise<RateLimitResult> {
  const policy: RateLimitPolicy = {
    windowMs: options.windowMs ?? 60_000,
    max: options.max ?? 5,
  };
  const secret = process.env.RATE_LIMIT_KEY_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      await emitSecurityEvent({ type: "rate_limit_control_unavailable", severity: "high", metadata: { reason: "key_secret_missing" } });
      return { allowed: false, retryAfterMs: policy.windowMs };
    }
    return rateLimit(key, Date.now(), policy);
  }

  try {
    const rows = await serviceRpc<RateLimitRow[]>("consume_rate_limit", {
      p_key_hash: rateLimitKeyDigest(key, secret),
      p_window_seconds: Math.max(1, Math.ceil(policy.windowMs / 1000)),
      p_max_requests: policy.max,
    });
    const row = rows[0];
    if (!row) throw new Error("rate_limit_result_missing");
    if (!row.allowed) {
      await emitSecurityEvent({ type: "rate_limit_blocked", severity: "medium", metadata: { key_digest: rateLimitKeyDigest(key, secret).slice(0, 16) } });
    }
    return { allowed: row.allowed, retryAfterMs: Math.max(0, Number(row.retry_after_ms) || 0) };
  } catch (error) {
    console.error("[shared-rate-limit]", error instanceof Error ? error.message : "unavailable");
    if (process.env.NODE_ENV === "production") {
      await emitSecurityEvent({ type: "rate_limit_control_unavailable", severity: "high", metadata: { reason: "rpc_failed" } });
      return { allowed: false, retryAfterMs: policy.windowMs };
    }
    return rateLimit(key, Date.now(), policy);
  }
}
