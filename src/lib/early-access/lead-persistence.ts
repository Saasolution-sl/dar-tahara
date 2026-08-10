import "server-only";

import { serviceRpc } from "@/lib/supabase-rpc";
import { buildLeadRow } from "./mappers";
import { generateVerificationToken, hashToken, tokenExpiry } from "./token";
import type { Attribution } from "./attribution";
import type { EarlyAccessPayload } from "./schema";
import {
  EARLY_ACCESS_CONSENT_TYPES,
  EARLY_ACCESS_CONSENT_VERSION,
  EARLY_ACCESS_SOURCE,
  type EarlyAccessLeadPayload,
} from "./lead-schema";

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

  // Generated here rather than in SQL: only the hash is ever stored, and the
  // plaintext has to be returned to the caller to be emailed. If the lead turns
  // out to be verified already the function stores nothing and this is dropped.
  const verificationToken = generateVerificationToken();

  // One call, one transaction. Previously this was three PostgREST requests -
  // lead, consents, token - so a failure after the first left a lead recorded
  // with no consent behind it and no way to verify. `undefined` is stripped
  // because it is not valid JSON and the function treats a supplied key as an
  // instruction to write that column.
  const result = await serviceRpc<{ lead_id: string; already_verified: boolean } | null>(
    "persist_early_access_lead",
    {
      p_lead: Object.fromEntries(Object.entries(leadRow).filter(([, value]) => value !== undefined)),
      p_consent: {
        granted: true,
        policy_version: EARLY_ACCESS_CONSENT_VERSION,
        locale: context.locale ?? input.locale ?? "en",
        source: EARLY_ACCESS_SOURCE,
        request_metadata: context.requestMetadata ?? null,
      },
      p_consent_types: EARLY_ACCESS_CONSENT_TYPES,
      p_token_hash: await hashToken(verificationToken),
      p_token_expires_at: tokenExpiry(),
    },
  );

  if (!result?.lead_id) throw new Error("early_access_lead_persist_failed");

  return {
    leadId: result.lead_id,
    verificationToken: result.already_verified ? undefined : verificationToken,
    alreadyVerified: result.already_verified,
    onboardingPayload,
  };
}
