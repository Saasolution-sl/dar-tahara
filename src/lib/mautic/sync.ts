/**
 * Sync orchestration: turn a Supabase lead into a synchronized Mautic contact.
 *
 * Pure of I/O beyond the injected client, so the whole state machine — success,
 * transient failure → retry_scheduled, permanent failure → permanently_failed —
 * is unit-tested with a fake client. The retry budget lives here; the caller
 * persists the returned status onto marketing_leads.
 */
import { mapLeadToMauticFields, tagsForLead } from "./mapping";
import { MauticApiError, type LeadForSync, type SyncResult } from "./types";
import type { MauticClient } from "./client";

/** After this many failed attempts, stop retrying and mark permanently_failed. */
export const MAX_SYNC_ATTEMPTS = 5;

export type SyncOptions = {
  /** How many times this lead has already been attempted (from Supabase). */
  priorAttempts?: number;
  /** Segment ids to add the contact to after upsert (optional). */
  segmentIds?: number[];
};

/**
 * Redact anything that could be PII before it reaches a log line. We only ever
 * emit the lead id, the step, and the coarse error class — never names, emails,
 * addresses or the API response body.
 */
function safeError(err: unknown): string {
  if (err instanceof MauticApiError) return `MauticApiError status=${err.status}`;
  if (err instanceof Error) return err.name;
  return "UnknownError";
}

export async function syncLeadToMautic(
  lead: LeadForSync,
  client: MauticClient,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const priorAttempts = options.priorAttempts ?? 0;
  const email = lead.normalizedEmail || lead.email;

  // Step 1: idempotent upsert by email.
  let contactId: number;
  let created: boolean;
  try {
    const result = await client.upsertContactByEmail(email, mapLeadToMauticFields(lead));
    contactId = result.contact.id;
    created = result.created;
  } catch (err) {
    return failure(err, "upsert", priorAttempts);
  }

  // Step 2: tags. A failure here is non-fatal to the contact existing — the
  // contact is already saved — but we still surface it so it can be retried.
  try {
    await client.addTags(contactId, tagsForLead(lead));
  } catch (err) {
    return { ...failure(err, "tags", priorAttempts), mauticContactId: contactId };
  }

  // Step 3: optional segment membership (dynamic segments recompute via cron, so
  // this is only needed for immediate/manual placement).
  if (options.segmentIds && options.segmentIds.length > 0) {
    try {
      for (const sid of options.segmentIds) {
        await client.addToSegment(contactId, sid);
      }
    } catch (err) {
      return { ...failure(err, "segment", priorAttempts), mauticContactId: contactId };
    }
  }

  return { status: "synchronized", mauticContactId: contactId, retryable: false };
  // `created` is intentionally not returned; callers key on mautic_contact_id
  // presence to know whether this was a first sync.
  void created;
}

function failure(
  err: unknown,
  step: SyncResult["failedStep"],
  priorAttempts: number,
): SyncResult {
  const retryable = err instanceof MauticApiError ? err.retryable : true;
  const attemptsSoFar = priorAttempts + 1;

  // Permanent error, or we've exhausted the retry budget → give up.
  if (!retryable || attemptsSoFar >= MAX_SYNC_ATTEMPTS) {
    return {
      status: retryable ? "permanently_failed" : "failed",
      retryable: false,
      error: safeError(err),
      failedStep: step,
    };
  }
  return {
    status: "retry_scheduled",
    retryable: true,
    error: safeError(err),
    failedStep: step,
  };
}
