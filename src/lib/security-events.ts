import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { isServiceRoleConfigured, serviceInsert } from "@/lib/supabase-rpc";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";
export type SecurityEventType =
  | "authorization_denied"
  | "privileged_mfa_required"
  | "rate_limit_blocked"
  | "rate_limit_control_unavailable"
  | "security_configuration_error"
  | "file_upload_rejected"
  | "csp_violation"
  | "control_drift_detected"
  | "retention_control_blocked";

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
    if (/(password|secret|token|authorization|cookie|content|body|email|phone|address|name)/i.test(key)) continue;
    if (value === null || typeof value === "number" || typeof value === "boolean") output[key] = value;
    else if (typeof value === "string") output[key] = value.slice(0, 200);
  }
  return output;
}

async function deliver(url: string, event: SecurityEvent, scope: string) {
  try {
    const deliveryToken = process.env.SECURITY_EVENT_DELIVERY_TOKEN;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(deliveryToken ? { Authorization: `Bearer ${deliveryToken}` } : {}),
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`status_${response.status}`);
  } catch (error) {
    console.error(JSON.stringify({
      scope,
      eventId: event.eventId,
      result: "failed",
      detail: error instanceof Error ? error.message.slice(0, 100) : "unknown",
    }));
  }
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

  if (isServiceRoleConfigured()) {
    const serialized = JSON.stringify(event);
    await serviceInsert("security_event_log", {
      event_id: event.eventId,
      occurred_at: event.occurredAt,
      event_type: event.type,
      severity: event.severity,
      source: event.source,
      actor_id: event.actorId,
      correlation_id: event.correlationId,
      metadata: event.metadata,
      payload_sha256: createHash("sha256").update(serialized).digest("hex"),
    }).catch((error) => console.error(JSON.stringify({
      scope: "security_log_persistence",
      eventId: event.eventId,
      result: "failed",
      detail: error instanceof Error ? error.message.slice(0, 100) : "unknown",
    })));
  }

  const logSink = process.env.SECURITY_LOG_SINK_URL;
  if (logSink) await deliver(logSink, event, "security_log_delivery");

  if (!(["high", "critical"] as SecuritySeverity[]).includes(event.severity)) return;
  const webhook = process.env.SECURITY_ALERT_WEBHOOK_URL;
  if (!webhook) {
    console.error(JSON.stringify({ scope: "security_alert_delivery", eventId: event.eventId, result: "not_configured" }));
    return;
  }

  await deliver(webhook, event, "security_alert_delivery");
}
