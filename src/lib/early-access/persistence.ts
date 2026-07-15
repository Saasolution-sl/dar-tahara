import "server-only";
import {
  serviceUpsert,
  serviceInsert,
  serviceUpdate,
  serviceSelect,
  serviceDelete,
} from "@/lib/supabase-rpc";
import {
  buildLeadRow,
  buildBillingRow,
  buildPropertyRow,
  buildServiceRow,
  buildAccessRow,
  buildConsentRows,
} from "./mappers";
import { generateVerificationToken, hashToken, tokenExpiry } from "./token";
import type { EarlyAccessPayload } from "./schema";
import type { Attribution } from "./attribution";

type LeadRow = { id: string; normalized_email: string; referral_code: string | null; status: string };

/**
 * Persist a validated submission across the early-access tables, using the
 * service role (which bypasses the deny-by-default RLS). The lead is the
 * idempotent anchor: upserted by normalized_email so a repeat submission updates
 * the same lead instead of duplicating it, and its child rows are replaced rather
 * than accumulated. Returns the lead id and the RAW verification token (the DB
 * only ever holds the hash).
 */
export async function persistSubmission(
  p: EarlyAccessPayload,
  ctx: { attribution: { first?: Attribution; last?: Attribution }; requestMetadata?: unknown; policyVersion?: string },
): Promise<{ leadId: string; verificationToken: string; alreadyVerified: boolean }> {
  const leadRow = buildLeadRow(p, ctx.attribution);

  // Upsert the lead. On conflict we merge, but we must NOT clobber first-touch
  // attribution or a verified status set on a prior submission, so strip those
  // keys when a lead already exists.
  const existing = await serviceSelect<LeadRow[]>(
    `marketing_leads?normalized_email=eq.${encodeURIComponent(String(leadRow.normalized_email))}&select=id,normalized_email,referral_code,status&limit=1`,
  ).catch(() => [] as LeadRow[]);

  let lead: LeadRow;
  if (existing.length > 0) {
    const prior = existing[0];
    // Do not overwrite first-touch columns or an already-verified status.
    const patch = { ...leadRow };
    for (const k of Object.keys(patch)) {
      if (k.startsWith("first_")) delete (patch as Record<string, unknown>)[k];
    }
    if (prior.status !== "pending") delete (patch as Record<string, unknown>).status;
    const updated = await serviceUpdate<LeadRow[]>(
      "marketing_leads",
      `id=eq.${prior.id}`,
      patch,
    );
    lead = updated[0] ?? prior;
  } else {
    const inserted = await serviceInsert<LeadRow[]>("marketing_leads", leadRow);
    lead = inserted[0];
  }

  const leadId = lead.id;

  // Replace child rows so a resubmission doesn't accumulate duplicates. Access
  // rows cascade from properties, so deleting properties clears them too.
  await Promise.all([
    serviceDelete("billing_profiles", `lead_id=eq.${leadId}`),
    serviceDelete("lead_service_preferences", `lead_id=eq.${leadId}`),
    serviceDelete("cleaning_properties", `lead_id=eq.${leadId}`),
  ]);

  await serviceInsert("billing_profiles", buildBillingRow(leadId, p));

  const propertyRows = await serviceInsert<Array<{ id: string }>>(
    "cleaning_properties",
    buildPropertyRow(leadId, p),
  );
  const propertyId = propertyRows[0]?.id;

  await serviceInsert("lead_service_preferences", buildServiceRow(leadId, propertyId, p));
  if (propertyId) {
    await serviceInsert("property_access_preferences", buildAccessRow(propertyId, p));
  }

  // Consent is append-only (audit trail) — never deleted on resubmit.
  await serviceInsert("lead_consents", buildConsentRows(leadId, p, {
    policyVersion: ctx.policyVersion,
    locale: p.locale,
    requestMetadata: ctx.requestMetadata,
  }));

  // Issue a fresh verification token (only the hash is stored).
  const token = generateVerificationToken();
  await serviceInsert("email_verification_tokens", {
    lead_id: leadId,
    token_hash: await hashToken(token),
    expires_at: tokenExpiry(),
  });

  return { leadId, verificationToken: token, alreadyVerified: lead.status !== "pending" };
}

/** Count verification tokens issued to a lead within the window (resend throttle). */
export async function recentTokenCount(leadId: string, withinMs: number): Promise<number> {
  const since = new Date(Date.now() - withinMs).toISOString();
  const rows = await serviceSelect<Array<{ id: string }>>(
    `email_verification_tokens?lead_id=eq.${leadId}&created_at=gte.${encodeURIComponent(since)}&select=id`,
  ).catch(() => [] as Array<{ id: string }>);
  return rows.length;
}
