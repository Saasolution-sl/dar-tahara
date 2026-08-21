import "server-only";

import { randomUUID } from "node:crypto";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";
export type SecurityEventType =
  | "authorization_denied"
  | "privileged_mfa_required"
  | "rate_limit_blocked"
  | "rate_limit_control_unavailable"
  | "security_configuration_error";

export type SecurityEvent = {
  eventId: string;
  occurredAt: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: "application";
  actorId: string | null;
  correlationId: string | null;
  metadata: Record<string, string | number | boolean | null>;
};

function safeMetadata(input: Record<string, unknown> | undefined) {
  const output: SecurityEvent["metadata"] = {};
  for (const [key, value] of Object.entries(input || {}).slice(0, 20)) {
    if (!/^[a-z][a-z0-9_]{0,63}$/i.test(key)) continue;
    if (value === null || typeof value === "number" || typeof value === "boolean") output[key] = value;
    else if (typeof value === "string") output[key] = value.slice(0, 200);
  }
  return output;
}

export function buildSecurityEvent(input: {
  type: SecurityEventType;
  severity: SecuritySeverity;
  actorId?: string | null;
  correlationId?: string | null;
  metadata?: Record<string, unknown>;
}, now = new Date()): SecurityEvent {
  return {
    eventId: randomUUID(),
    occurredAt: now.toISOString(),
    type: input.type,
    severity: input.severity,
    source: "application",
    actorId: input.actorId || null,
    correlationId: input.correlationId || null,
    metadata: safeMetadata(input.metadata),
  };
}

export async function emitSecurityEvent(input: Parameters<typeof buildSecurityEvent>[0]): Promise<void> {
  const event = buildSecurityEvent(input);
  console.warn(JSON.stringify({ scope: "security_event", ...event }));

  if (!(["high", "critical"] as SecuritySeverity[]).includes(event.severity)) return;
  const webhook = process.env.SECURITY_ALERT_WEBHOOK_URL;
  if (!webhook) {
    console.error(JSON.stringify({ scope: "security_alert_delivery", eventId: event.eventId, result: "not_configured" }));
    return;
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`status_${response.status}`);
  } catch (error) {
    console.error(JSON.stringify({
      scope: "security_alert_delivery",
      eventId: event.eventId,
      result: "failed",
      detail: error instanceof Error ? error.message.slice(0, 100) : "unknown",
    }));
  }
}
