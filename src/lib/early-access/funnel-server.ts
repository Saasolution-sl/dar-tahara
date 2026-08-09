import "server-only";

import { createHash, randomBytes } from "node:crypto";
import {
  serviceInsert,
  serviceInsertIgnoreDuplicates,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { parseAttribution, type Attribution } from "./attribution";
import {
  coarseClient,
  emailAssociation,
  isOpaqueToken,
  isActiveTokenExpiry,
  isSessionId,
  isStepId,
  sanitizeEvent,
  sanitizePartialPayload,
  type FunnelEventInput,
  type SessionCredentials,
  type SignupSessionStatus,
} from "./funnel";
import type { EarlyAccessPayload, StepId } from "./schema";

export type SignupSessionRow = {
  id: string;
  client_token_hash: string;
  lead_id: string | null;
  mautic_contact_id: number | null;
  email: string | null;
  normalized_email: string | null;
  email_present: boolean;
  reminder_consent: boolean;
  status: SignupSessionStatus;
  current_step: StepId;
  current_step_index: number;
  highest_completed_step: number;
  client_revision: number;
  partial_payload: Partial<EarlyAccessPayload>;
  locale: string | null;
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
  resumed_at: string | null;
  opted_out_at: string | null;
  reminder_count: number;
  reminder_1_queued_at: string | null;
  reminder_2_queued_at: string | null;
  reminder_claimed_at: string | null;
  reminder_claimed_number: 1 | 2 | null;
  resume_token_hash: string | null;
  resume_token_expires_at: string | null;
  feedback_token_hash: string | null;
  feedback_token_expires_at: string | null;
};

const SESSION_SELECT = [
  "id", "client_token_hash", "lead_id", "mautic_contact_id", "email",
  "normalized_email", "email_present", "reminder_consent", "status",
  "current_step", "current_step_index", "highest_completed_step",
  "client_revision",
  "partial_payload", "locale", "started_at", "last_activity_at",
  "completed_at", "abandoned_at", "resumed_at", "opted_out_at",
  "reminder_count", "reminder_1_queued_at", "reminder_2_queued_at",
  "reminder_claimed_at", "reminder_claimed_number",
  "resume_token_hash", "resume_token_expires_at", "feedback_token_hash",
  "feedback_token_expires_at",
].join(",");

export function generateSessionToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function cleanAttribution(input: unknown): Attribution {
  const params = new URLSearchParams();
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const raw = input as Record<string, unknown>;
    const keys: Array<[string, string]> = [
      ["sourceCode", "src"], ["utmSource", "utm_source"],
      ["utmMedium", "utm_medium"], ["utmCampaign", "utm_campaign"],
      ["utmContent", "utm_content"], ["utmTerm", "utm_term"],
    ];
    for (const [source, target] of keys) {
      if (typeof raw[source] === "string") params.set(target, raw[source].slice(0, 200));
    }
  }
  return parseAttribution(params);
}

function referrerHost(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    return new URL(value).hostname.toLowerCase().slice(0, 255);
  } catch {
    return undefined;
  }
}

export async function verifiedSignupSession(
  credentials: SessionCredentials | null | undefined,
): Promise<SignupSessionRow | null> {
  if (!credentials || !isSessionId(credentials.id) || !isOpaqueToken(credentials.token)) return null;
  const tokenHash = hashSessionToken(credentials.token);
  const rows = await serviceSelect<SignupSessionRow[]>(
    `early_access_signup_sessions?id=eq.${credentials.id}&client_token_hash=eq.${tokenHash}&select=${SESSION_SELECT}&limit=1`,
  ).catch(() => [] as SignupSessionRow[]);
  return rows[0] ?? null;
}

export async function createOrRestoreSignupSession(input: {
  credentials?: SessionCredentials;
  attribution?: unknown;
  referrer?: unknown;
  locale?: unknown;
  userAgent?: string | null;
}): Promise<{
  credentials: SessionCredentials;
  restored: boolean;
  partialPayload: Partial<EarlyAccessPayload>;
  currentStep: StepId;
  currentStepIndex: number;
  clientRevision: number;
}> {
  const existing = await verifiedSignupSession(input.credentials);
  if (existing && existing.status !== "completed" && existing.status !== "opted_out") {
    const resumed = existing.status === "abandoned_eligible" || existing.status === "reminder_sent";
    if (resumed) {
      const now = new Date().toISOString();
      await serviceUpdate("early_access_signup_sessions", `id=eq.${existing.id}`, {
        status: "resumed",
        resumed_at: now,
        last_activity_at: now,
      });
      await recordFunnelEvent(existing.id, {
        eventName: "early_access_resumed",
        idempotencyKey: `resumed:${now.slice(0, 16)}`,
        stepId: existing.current_step,
        stepIndex: existing.current_step_index,
      });
    }
    return {
      credentials: input.credentials as SessionCredentials,
      restored: true,
      partialPayload: sanitizePartialPayload(existing.partial_payload),
      currentStep: existing.current_step,
      currentStepIndex: existing.current_step_index,
      clientRevision: existing.client_revision,
    };
  }

  const token = generateSessionToken();
  const attribution = cleanAttribution(input.attribution);
  const client = coarseClient(input.userAgent);
  const locale = typeof input.locale === "string" ? input.locale.slice(0, 10) : "en";
  const rows = await serviceInsert<SignupSessionRow[]>("early_access_signup_sessions", {
    client_token_hash: hashSessionToken(token),
    source_code: attribution.sourceCode,
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
    utm_content: attribution.utmContent,
    utm_term: attribution.utmTerm,
    referrer_host: referrerHost(input.referrer),
    device_type: client.deviceType,
    browser: client.browser,
    operating_system: client.operatingSystem,
    locale,
  });
  const row = rows[0];
  if (!row) throw new Error("signup_session_create_failed");
  await recordFunnelEvent(row.id, {
    eventName: "early_access_viewed",
    idempotencyKey: "session:viewed",
    stepId: "contact",
    stepIndex: 0,
  });
  return {
    credentials: { id: row.id, token },
    restored: false,
    partialPayload: {},
    currentStep: "contact",
    currentStepIndex: 0,
    clientRevision: 0,
  };
}

export async function updateSignupSession(input: {
  credentials: SessionCredentials;
  partialPayload?: unknown;
  currentStep?: unknown;
  currentStepIndex?: unknown;
  highestCompletedStep?: unknown;
  clientRevision?: unknown;
  event?: unknown;
}): Promise<{ ok: boolean; resumed: boolean }> {
  const session = await verifiedSignupSession(input.credentials);
  if (!session || session.status === "completed" || session.status === "opted_out") {
    return { ok: false, resumed: false };
  }

  const now = new Date().toISOString();
  const partial = input.partialPayload === undefined
    ? sanitizePartialPayload(session.partial_payload)
    : sanitizePartialPayload(input.partialPayload);
  const association = emailAssociation(partial);
  const stepId = isStepId(input.currentStep) ? input.currentStep : session.current_step;
  const requestedIndex = Number(input.currentStepIndex);
  const currentStepIndex = Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex <= 6
    ? requestedIndex : session.current_step_index;
  const requestedHighest = Number(input.highestCompletedStep);
  const highestCompletedStep = Number.isInteger(requestedHighest)
    ? Math.max(session.highest_completed_step, Math.min(6, Math.max(-1, requestedHighest)))
    : session.highest_completed_step;
  const resumed = session.status === "abandoned_eligible" || session.status === "reminder_sent";
  const proposedRevision = Number(input.clientRevision);
  const clientRevision = Number.isSafeInteger(proposedRevision) && proposedRevision >= 0
    ? proposedRevision
    : session.client_revision + 1;

  await serviceUpdate(
    "early_access_signup_sessions",
    `id=eq.${session.id}&client_revision=lt.${clientRevision}&status=in.(in_progress,resumed,abandoned_eligible,reminder_sent)&completed_at=is.null&opted_out_at=is.null`,
    {
    partial_payload: partial,
    email: association.email ?? null,
    normalized_email: association.normalizedEmail ?? null,
    email_present: association.emailPresent,
    reminder_consent: association.reminderConsent,
    current_step: stepId,
    current_step_index: currentStepIndex,
    highest_completed_step: highestCompletedStep,
    client_revision: clientRevision,
    last_activity_at: now,
    ...(resumed ? { status: "resumed", resumed_at: now } : {}),
    },
  );

  if (resumed) {
    await recordFunnelEvent(session.id, {
      eventName: "early_access_resumed",
      idempotencyKey: `resumed:${now.slice(0, 16)}`,
      stepId,
      stepIndex: currentStepIndex,
    });
  }
  const event = sanitizeEvent(input.event);
  if (event) await recordFunnelEvent(session.id, event);
  return { ok: true, resumed };
}

export async function recordFunnelEvent(sessionId: string, raw: FunnelEventInput): Promise<void> {
  const event = sanitizeEvent(raw);
  if (!event || !isSessionId(sessionId)) return;
  const row: Record<string, unknown> = {
    signup_session_id: sessionId,
    event_name: event.eventName,
    idempotency_key: event.idempotencyKey,
    step_id: event.stepId,
    step_index: event.stepIndex,
    field_name: event.fieldName,
    error_type: event.errorType,
    error_code: event.errorCode,
    duration_ms: event.durationMs,
    total_duration_ms: event.totalDurationMs,
    metadata: event.metadata ?? {},
  };
  if (event.idempotencyKey) {
    await serviceInsertIgnoreDuplicates("early_access_funnel_events", row, "signup_session_id,idempotency_key");
  } else {
    await serviceInsert("early_access_funnel_events", row);
  }
}

export async function completeSignupSession(
  credentials: SessionCredentials | null | undefined,
  leadId: string,
): Promise<void> {
  const session = await verifiedSignupSession(credentials);
  if (!session || session.status === "opted_out") return;
  const now = new Date().toISOString();
  await serviceUpdate("early_access_signup_sessions", `id=eq.${session.id}`, {
    status: "completed",
    lead_id: leadId,
    completed_at: now,
    last_activity_at: now,
    completed_after_reminder: session.reminder_count > 0,
    partial_payload: {},
    resume_token_hash: null,
    resume_token_expires_at: null,
    feedback_token_hash: null,
    feedback_token_expires_at: null,
    reminder_claimed_at: null,
    reminder_claimed_number: null,
  });
  await recordFunnelEvent(session.id, {
    eventName: "early_access_completed",
    idempotencyKey: "session:completed",
    stepId: "review",
    stepIndex: 6,
    totalDurationMs: Date.now() - Date.parse(session.started_at),
  });
}

export async function updateSessionMauticContactFromLead(leadId: string): Promise<void> {
  const rows = await serviceSelect<Array<{ mautic_contact_id: number | null }>>(
    `marketing_leads?id=eq.${leadId}&select=mautic_contact_id&limit=1`,
  ).catch(() => [] as Array<{ mautic_contact_id: number | null }>);
  const contactId = rows[0]?.mautic_contact_id;
  if (!contactId) return;
  await serviceUpdate("early_access_signup_sessions", `lead_id=eq.${leadId}`, {
    mautic_contact_id: contactId,
  }).catch(() => {});
}

export async function signupSessionByResumeToken(token: string): Promise<SignupSessionRow | null> {
  if (!isOpaqueToken(token)) return null;
  const rows = await serviceSelect<SignupSessionRow[]>(
    `early_access_signup_sessions?resume_token_hash=eq.${hashSessionToken(token)}&select=${SESSION_SELECT}&limit=1`,
  ).catch(() => [] as SignupSessionRow[]);
  const row = rows[0];
  if (!row || !isActiveTokenExpiry(row.resume_token_expires_at)) return null;
  if (row.status === "completed" || row.status === "opted_out") return null;
  return row;
}

export async function resumeSignupSession(token: string): Promise<{
  credentials: SessionCredentials;
  partialPayload: Partial<EarlyAccessPayload>;
  currentStep: StepId;
  currentStepIndex: number;
  clientRevision: number;
} | null> {
  const session = await signupSessionByResumeToken(token);
  if (!session) return null;
  const clientToken = generateSessionToken();
  const now = new Date().toISOString();
  await serviceUpdate("early_access_signup_sessions", `id=eq.${session.id}&resume_token_hash=eq.${hashSessionToken(token)}`, {
    client_token_hash: hashSessionToken(clientToken),
    status: "resumed",
    resumed_at: now,
    last_activity_at: now,
    resume_token_hash: null,
    resume_token_expires_at: null,
  });
  await recordFunnelEvent(session.id, {
    eventName: "early_access_resumed",
    idempotencyKey: `resume-link:${hashSessionToken(token).slice(0, 16)}`,
    stepId: session.current_step,
    stepIndex: session.current_step_index,
  });
  return {
    credentials: { id: session.id, token: clientToken },
    partialPayload: sanitizePartialPayload(session.partial_payload),
    currentStep: session.current_step,
    currentStepIndex: session.current_step_index,
    clientRevision: session.client_revision,
  };
}

export async function signupSessionByFeedbackToken(token: string): Promise<SignupSessionRow | null> {
  if (!isOpaqueToken(token)) return null;
  const rows = await serviceSelect<SignupSessionRow[]>(
    `early_access_signup_sessions?feedback_token_hash=eq.${hashSessionToken(token)}&select=${SESSION_SELECT}&limit=1`,
  ).catch(() => [] as SignupSessionRow[]);
  const row = rows[0];
  if (!row || !isActiveTokenExpiry(row.feedback_token_expires_at)) return null;
  if (row.status === "completed") return null;
  return row;
}
