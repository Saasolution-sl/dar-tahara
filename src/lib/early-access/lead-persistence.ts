import "server-only";

import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { buildLeadRow } from "./mappers";
import { generateVerificationToken, hashToken, tokenExpiry } from "./token";
import type { Attribution } from "./attribution";
import type { EarlyAccessPayload } from "./schema";
import {
  EARLY_ACCESS_CONSENT_VERSION,
  EARLY_ACCESS_SOURCE,
  type EarlyAccessLeadPayload,
} from "./lead-schema";

type LeadRow = {
  id: string;
  status: string;
  normalized_email: string;
  referral_code: string | null;
};

export function leadPayloadForExistingOnboarding(
  input: EarlyAccessLeadPayload,
  normalized: { firstName: string; email: string; city: string },
): EarlyAccessPayload {
  return {
    firstName: normalized.firstName,
    lastName: "",
    email: normalized.email,
    residenceCity: normalized.city,
    preferredContactMethod: "email",
    preferredLanguage: input.locale ?? "en",
    marketingConsent: true,
    // The displayed consent wording explicitly includes incomplete-onboarding
    // reminders. Keep this separate in the audit trail and session state.
    abandonedReminderConsent: true,
    locale: input.locale,
    src: input.src,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    utmContent: input.utmContent,
    utmTerm: input.utmTerm,
    referralCode: input.referralCode,
  };
}

export async function persistEarlyAccessLead(
  input: EarlyAccessLeadPayload,
  normalized: { firstName: string; email: string; cityId: string; city: string },
  context: {
    attribution: { first?: Attribution; last?: Attribution };
    requestMetadata?: unknown;
    locale?: string;
  },
): Promise<{
  leadId: string;
  verificationToken?: string;
  alreadyVerified: boolean;
  onboardingPayload: EarlyAccessPayload;
}> {
  const onboardingPayload = leadPayloadForExistingOnboarding(input, normalized);
  const leadRow = buildLeadRow(onboardingPayload, context.attribution);
  const existing = await serviceSelect<LeadRow[]>(
    `marketing_leads?normalized_email=eq.${encodeURIComponent(normalized.email)}&select=id,status,normalized_email,referral_code&limit=1`,
  ).catch(() => [] as LeadRow[]);

  let lead: LeadRow;
  if (existing.length) {
    const prior = existing[0];
    const patch = { ...leadRow };
    for (const key of Object.keys(patch)) {
      if (key.startsWith("first_") || patch[key] === undefined) delete patch[key];
    }
    if (prior.status !== "pending") delete patch.status;
    const updated = await serviceUpdate<LeadRow[]>("marketing_leads", `id=eq.${prior.id}`, patch);
    lead = updated[0] ?? prior;
  } else {
    const inserted = await serviceInsert<LeadRow[]>("marketing_leads", leadRow);
    lead = inserted[0];
  }
  if (!lead) throw new Error("early_access_lead_persist_failed");

  const consentCommon = {
    lead_id: lead.id,
    granted: true,
    policy_version: EARLY_ACCESS_CONSENT_VERSION,
    locale: context.locale ?? input.locale ?? "en",
    source: EARLY_ACCESS_SOURCE,
    request_metadata: context.requestMetadata ?? null,
  };
  await serviceInsert("lead_consents", [
    { ...consentCommon, consent_type: "marketing" },
    { ...consentCommon, consent_type: "onboarding_reminder" },
  ]);

  const alreadyVerified = lead.status !== "pending";
  let verificationToken: string | undefined;
  if (!alreadyVerified) {
    verificationToken = generateVerificationToken();
    await serviceInsert("email_verification_tokens", {
      lead_id: lead.id,
      token_hash: await hashToken(verificationToken),
      expires_at: tokenExpiry(),
    });
  }

  return { leadId: lead.id, verificationToken, alreadyVerified, onboardingPayload };
}
