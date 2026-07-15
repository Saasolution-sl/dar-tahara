import "server-only";
import { mauticFromEnv } from "@/lib/mautic/env";
import { syncLeadToMautic } from "@/lib/mautic/sync";
import { toLeadForSync } from "./mappers";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import type { EarlyAccessPayload } from "./schema";
import type { Attribution } from "./attribution";

type LeadRow = {
  id: string;
  normalized_email: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_phone: string | null;
  whatsapp_phone: string | null;
  preferred_contact_method: string | null;
  preferred_language: string | null;
  residence_city: string | null;
  status: string;
  referral_code: string | null;
  referred_by_code: string | null;
  verified_referral_count: number | null;
  mautic_sync_attempts: number | null;
  first_source_code: string | null;
  last_source_code: string | null;
  first_utm_source: string | null;
  last_utm_source: string | null;
  first_utm_medium: string | null;
  last_utm_medium: string | null;
  first_utm_campaign: string | null;
  last_utm_campaign: string | null;
  first_utm_content: string | null;
  last_utm_content: string | null;
  first_utm_term: string | null;
};

/**
 * Bridge Supabase → Mautic. Reads the freshly-persisted lead, syncs it to Mautic
 * via the tested sync layer, and writes the outcome (contact id + status) back
 * onto the lead so a failed sync can be reconciled later. Never throws to the
 * caller — the lead is already saved; sync is best-effort.
 */
export async function syncLeadAfterSubmit(
  leadId: string,
  _payload: EarlyAccessPayload,
  opts: { emailVerified: boolean },
): Promise<void> {
  const client = mauticFromEnv();
  if (!client) return; // Mautic not configured — leave the lead `pending`.

  const rows = await serviceSelect<LeadRow[]>(
    `marketing_leads?id=eq.${leadId}&select=*&limit=1`,
  ).catch(() => [] as LeadRow[]);
  const row = rows[0];
  if (!row) return;

  const lead = toLeadForSync(leadId, _payload, row as unknown as Record<string, unknown>, {
    emailVerified: opts.emailVerified,
    referralCode: row.referral_code,
    verifiedReferralCount: row.verified_referral_count ?? 0,
  });

  const priorAttempts = row.mautic_sync_attempts ?? 0;
  await serviceUpdate("marketing_leads", `id=eq.${leadId}`, { mautic_sync_status: "processing" }).catch(() => {});

  const result = await syncLeadToMautic(lead, client, { priorAttempts });

  await serviceUpdate("marketing_leads", `id=eq.${leadId}`, {
    mautic_sync_status: result.status,
    mautic_sync_attempts: priorAttempts + 1,
    ...(result.mauticContactId ? { mautic_contact_id: result.mauticContactId } : {}),
    ...(result.status === "synchronized" ? { mautic_synced_at: new Date().toISOString(), mautic_last_error: null } : {}),
    ...(result.error ? { mautic_last_error: result.error } : {}),
  }).catch(() => {});
}
