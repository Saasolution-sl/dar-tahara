/**
 * Campaign-source link management (brief §28) — pure domain logic.
 *
 * A "campaign source" maps an opaque tracking code (e.g. wa_tng_001) to a human
 * label and a set of UTM parameters, so a distributed link can be attributed
 * back to the exact WhatsApp group / partner / flyer it came from. This module
 * validates the input and builds the public trackable URL; storage + the admin
 * UI live elsewhere. Deliberately minimal — Mautic remains the marketing backend.
 */
import { site } from "@/lib/site";

export const SOURCE_CHANNELS = [
  "whatsapp", "facebook", "instagram", "tiktok", "telegram",
  "email", "sms", "qr", "partner", "influencer", "flyer", "event", "paid", "other",
] as const;

export type CampaignSourceInput = {
  internalName: string;
  sourceCode: string;
  sourceChannel?: string;
  sourceType?: string;
  responsiblePerson?: string;
  partnerName?: string;
  influencerName?: string;
  city?: string;
  region?: string;
  targetAudience?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  campaignCost?: number | null;
  costCurrency?: string;
  notes?: string;
};

export type ValidationResult =
  | { ok: true; value: CampaignSourceInput }
  | { ok: false; errors: Record<string, string> };

// A source code must be safe in a URL and easy to type from a flyer.
const CODE_RE = /^[a-z0-9][a-z0-9_-]{1,48}$/;

function clean(v: unknown, max = 200): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

/** Validate + normalise a raw source payload from the admin form. */
export function validateCampaignSource(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const internalName = clean(b.internalName, 200);
  if (!internalName) errors.internalName = "required";

  const sourceCode = (clean(b.sourceCode, 48) ?? "").toLowerCase();
  if (!sourceCode) errors.sourceCode = "required";
  else if (!CODE_RE.test(sourceCode)) errors.sourceCode = "invalid_code";

  if (b.sourceChannel && !(SOURCE_CHANNELS as readonly string[]).includes(String(b.sourceChannel))) {
    errors.sourceChannel = "invalid";
  }

  const cost = b.campaignCost;
  let campaignCost: number | null = null;
  if (cost !== undefined && cost !== null && cost !== "") {
    const n = Number(cost);
    if (Number.isNaN(n) || n < 0) errors.campaignCost = "invalid";
    else campaignCost = n;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      internalName: internalName!,
      sourceCode,
      sourceChannel: clean(b.sourceChannel, 40),
      sourceType: clean(b.sourceType, 40),
      responsiblePerson: clean(b.responsiblePerson, 120),
      partnerName: clean(b.partnerName, 160),
      influencerName: clean(b.influencerName, 160),
      city: clean(b.city, 120),
      region: clean(b.region, 120),
      targetAudience: clean(b.targetAudience, 200),
      // UTMs default sensibly from the code/channel when not given.
      utmSource: clean(b.utmSource, 120) ?? clean(b.sourceChannel, 120),
      utmMedium: clean(b.utmMedium, 120),
      utmCampaign: clean(b.utmCampaign, 120) ?? "early_access_2026",
      utmContent: clean(b.utmContent, 120) ?? sourceCode,
      utmTerm: clean(b.utmTerm, 120),
      campaignCost,
      costCurrency: (clean(b.costCurrency, 3) ?? "EUR").toUpperCase(),
      notes: clean(b.notes, 1000),
    },
  };
}

/**
 * Build the public, trackable early-access URL for a source. `src` carries the
 * internal code; the utm_* params drive Mautic + GA attribution. Locale defaults
 * to a neutral path the site's language detection resolves.
 */
export function buildTrackedUrl(
  src: Pick<CampaignSourceInput, "sourceCode" | "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "utmTerm">,
  opts: { locale?: string; baseUrl?: string } = {},
): string {
  const base = (opts.baseUrl ?? site.url).replace(/\/$/, "");
  const locale = opts.locale ?? "en";
  const params = new URLSearchParams();
  params.set("src", src.sourceCode);
  const utm: Array<[string, string | undefined]> = [
    ["utm_source", src.utmSource],
    ["utm_medium", src.utmMedium],
    ["utm_campaign", src.utmCampaign],
    ["utm_content", src.utmContent],
    ["utm_term", src.utmTerm],
  ];
  for (const [k, v] of utm) if (v) params.set(k, v);
  return `${base}/${locale}/early-access?${params.toString()}`;
}

/** Map validated input to the campaign_sources table row shape. */
export function toCampaignSourceRow(v: CampaignSourceInput): Record<string, unknown> {
  return {
    internal_name: v.internalName,
    source_code: v.sourceCode,
    source_channel: v.sourceChannel,
    source_type: v.sourceType,
    responsible_person: v.responsiblePerson,
    partner_name: v.partnerName,
    influencer_name: v.influencerName,
    city: v.city,
    region: v.region,
    target_audience: v.targetAudience,
    utm_source: v.utmSource,
    utm_medium: v.utmMedium,
    utm_campaign: v.utmCampaign,
    utm_content: v.utmContent,
    utm_term: v.utmTerm,
    campaign_cost: v.campaignCost,
    cost_currency: v.costCurrency,
    status: "active",
    notes: v.notes,
  };
}
