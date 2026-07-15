import "server-only";
import { mauticFromEnv } from "@/lib/mautic/env";
import { syncLeadToMautic } from "@/lib/mautic/sync";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import type { LeadForSync } from "@/lib/mautic/types";

type FullLeadRow = Record<string, unknown> & {
  id: string; normalized_email: string; email: string;
  first_name: string; last_name: string; status: string;
  referral_code: string | null; verified_referral_count: number | null;
  mautic_sync_attempts: number | null;
};

/**
 * Re-sync a lead to Mautic after it becomes VERIFIED: flips email_verified → yes,
 * swaps unverified-lead → verified-lead tag and pushes the referral code + count.
 * The verified welcome campaign in Mautic is triggered by that field change.
 * Reads the persisted row so it reflects the just-written referral code + status.
 */
export async function syncVerifiedLead(leadId: string): Promise<void> {
  const client = mauticFromEnv();
  if (!client) return;

  const rows = await serviceSelect<FullLeadRow[]>(
    `marketing_leads?id=eq.${leadId}&select=*&limit=1`,
  ).catch(() => [] as FullLeadRow[]);
  const row = rows[0];
  if (!row) return;

  const lead: LeadForSync = {
    id: leadId,
    normalizedEmail: String(row.normalized_email),
    email: String(row.email),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    mobilePhone: (row.mobile_phone as string) ?? null,
    whatsappPhone: (row.whatsapp_phone as string) ?? null,
    preferredContactMethod: (row.preferred_contact_method as string) ?? null,
    preferredLanguage: (row.preferred_language as string) ?? null,
    residenceCountry: (row.residence_country as string) ?? null,
    status: "verified",
    emailVerified: true,
    referralCode: (row.referral_code as string) ?? null,
    referredByCode: (row.referred_by_code as string) ?? null,
    verifiedReferralCount: (row.verified_referral_count as number) ?? 0,
    firstUtmSource: (row.first_utm_source as string) ?? null,
    lastUtmSource: (row.last_utm_source as string) ?? null,
  };

  const priorAttempts = row.mautic_sync_attempts ?? 0;
  const result = await syncLeadToMautic(lead, client, { priorAttempts });

  await serviceUpdate("marketing_leads", `id=eq.${leadId}`, {
    mautic_sync_status: result.status,
    mautic_sync_attempts: priorAttempts + 1,
    ...(result.mauticContactId ? { mautic_contact_id: result.mauticContactId } : {}),
    ...(result.status === "synchronized"
      ? { mautic_synced_at: new Date().toISOString(), mautic_last_error: null }
      : {}),
    ...(result.error ? { mautic_last_error: result.error } : {}),
  }).catch(() => {});
}
