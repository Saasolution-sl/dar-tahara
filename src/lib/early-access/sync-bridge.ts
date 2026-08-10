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
 * caller, the lead is already saved; sync is best-effort.
 */
export async function syncLeadAfterSubmit(
  leadId: string,
  _payload: EarlyAccessPayload,
  opts: { emailVerified: boolean },
): Promise<void> {
  const client = mauticFromEnv();
  if (!client) return; // Mautic not configured, leave the lead `pending`.

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

/** Retry durable leads whose synchronous Mautic call was unavailable/transient. */
export async function reconcilePendingMauticLeads(limit = 50): Promise<{
  attempted: number;
  failures: number;
}> {
  if (!mauticFromEnv()) return { attempted: 0, failures: 0 };
  const candidates = await serviceSelect<Array<{ id: string; status: string }>>(
    `marketing_leads?mautic_sync_status=in.(pending,retry_scheduled)&select=id,status&order=updated_at.asc&limit=${Math.max(1, Math.min(200, limit))}`,
  ).catch(() => [] as Array<{ id: string; status: string }>);
  let failures = 0;
  for (const candidate of candidates) {
    try {
      const payload = await onboardingPayloadFromDatabase(candidate.id);
      if (!payload) continue;
      await syncLeadAfterSubmit(candidate.id, payload, { emailVerified: candidate.status !== "pending" });
    } catch {
      failures += 1;
    }
  }
  return { attempted: candidates.length, failures };
}

async function onboardingPayloadFromDatabase(leadId: string): Promise<EarlyAccessPayload | null> {
  const [leads, billings, properties, services] = await Promise.all([
    serviceSelect<Array<Record<string, unknown>>>(`marketing_leads?id=eq.${leadId}&select=*&limit=1`),
    serviceSelect<Array<Record<string, unknown>>>(`billing_profiles?lead_id=eq.${leadId}&select=*&limit=1`).catch(() => []),
    serviceSelect<Array<Record<string, unknown>>>(`cleaning_properties?lead_id=eq.${leadId}&select=*&limit=1`).catch(() => []),
    serviceSelect<Array<Record<string, unknown>>>(`lead_service_preferences?lead_id=eq.${leadId}&select=*&limit=1`).catch(() => []),
  ]);
  const lead = leads[0];
  if (!lead) return null;
  const billing = billings[0] ?? {};
  const property = properties[0] ?? {};
  const service = services[0] ?? {};
  const propertyId = typeof property.id === "string" ? property.id : undefined;
  const accessRows = propertyId
    ? await serviceSelect<Array<Record<string, unknown>>>(`property_access_preferences?property_id=eq.${propertyId}&select=*&limit=1`).catch(() => [])
    : [];
  const access = accessRows[0] ?? {};
  return {
    firstName: String(lead.first_name ?? ""),
    lastName: String(lead.last_name ?? ""),
    email: String(lead.email ?? ""),
    residenceCity: stringValue(lead.residence_city),
    preferredContactMethod: stringValue(lead.preferred_contact_method) ?? "email",
    preferredLanguage: stringValue(lead.preferred_language) ?? "en",
    billingRecipientType: stringValue(billing.recipient_type),
    billingCountry: stringValue(billing.country_code),
    billingCity: stringValue(billing.city),
    propertyCity: stringValue(property.city),
    propertyCityId: stringValue(property.city_id),
    propertyCityManualName: stringValue(property.manual_city_name),
    propertyRegion: stringValue(property.region),
    propertyCountry: stringValue(property.country_code) ?? "MA",
    propertyType: stringValue(property.property_type),
    sizeM2: numberValue(property.size_m2),
    occupancyType: stringValue(property.occupancy_type),
    propertyCondition: stringValue(property.property_condition),
    serviceTypes: Array.isArray(service.service_types) ? service.service_types.filter((value): value is string => typeof value === "string") : [],
    desiredFrequency: stringValue(service.desired_frequency),
    expectedStartPeriod: stringValue(service.expected_start_period),
    accessMethod: stringValue(access.access_method),
    smartLockInterest: stringValue(access.smart_lock_interest),
    existingLockBrand: stringValue(access.existing_lock_brand),
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
