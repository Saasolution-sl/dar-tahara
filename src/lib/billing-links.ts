import "server-only";

import { serviceInsert } from "@/lib/supabase-rpc";
import { generatePaymentLinkToken, computePaymentLinkExpiry, computeExpiryInDays } from "@/lib/billing-lifecycle";
import type { BillingPolicy } from "@/lib/billing-policy";
import { site } from "@/lib/site";

export type PaymentLinkType =
  | "first_notice"
  | "second_notice"
  | "final_settlement"
  | "prepaid_renewal";

export type CreatedPaymentLink = { id: string; token: string; url: string; expiresAt: Date };

/**
 * Inserts a new payment_links row and returns its public redemption URL.
 * The Stripe Checkout Session itself is created lazily, only when the
 * customer actually clicks the link (see pay-link/[token]/route.ts), this
 * function never talks to Stripe.
 *
 * `windowDaysOverride` lets a final-settlement link use its own resolution
 * window (policy.finalSettlementPaymentWindowDays, e.g. 14 days) instead of
 * the regular dunning window, the link's own expiry is then the same clock
 * as the settlement's default deadline, not a separate, shorter one.
 */
export async function createPaymentLinkRecord(
  invoiceId: string,
  linkType: PaymentLinkType,
  policy: BillingPolicy,
  windowDaysOverride?: number,
): Promise<CreatedPaymentLink> {
  const token = generatePaymentLinkToken();
  const expiresAt = windowDaysOverride ? computeExpiryInDays(new Date(), windowDaysOverride) : computePaymentLinkExpiry(new Date(), policy);
  const [row] = await serviceInsert<{ id: string }[]>("payment_links", {
    invoice_id: invoiceId,
    token,
    link_type: linkType,
    expires_at: expiresAt.toISOString(),
  });
  const root = (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, "");
  return { id: row.id, token, url: `${root}/api/account/invoices/pay-link/${token}`, expiresAt };
}
