/**
 * Privacy-conscious analytics. Forwards named events to Plausible and/or a
 * dataLayer when present, and no-ops otherwise. NEVER pass an email address or
 * other personal data here, only coarse, non-identifying props (locale, source).
 */
export type AnalyticsEvent =
  | "popup_shown"
  | "popup_dismissed"
  | "mailing_list_signup_started"
  | "mailing_list_signup_completed"
  | "mailing_list_confirmation_completed"
  | "campaign_share_clicked"
  | "campaign_link_copied"
  | "language_detected"
  | "language_changed"
  // Early-access funnel (coarse, non-identifying, never pass PII as props).
  | "early_access_page_view"
  | "early_access_cta_clicked"
  | "early_access_form_started"
  | "early_access_form_submitted"
  // Address + map funnel. Coarse only, never a full address, coordinates,
  // phone number or email.
  | "billing_address_selected"
  | "billing_address_manual_entry_used"
  | "property_address_selected"
  | "property_pin_moved"
  // Smart-lock upsell funnel (coarse, non-identifying, never pass PII as props).
  | "smart_lock_offer_viewed"
  | "smart_lock_purchase_interest_selected"
  | "smart_lock_existing_lock_selected"
  | "smart_lock_declined"
  | "email_verified"
  | "referral_link_copied"
  | "whatsapp_share_clicked"
  // Subscription pause-request workflow (coarse only, never a reason,
  // date range or other PII as props).
  | "pause_request_started"
  | "pause_request_submitted"
  | "pause_request_approved"
  | "pause_request_rejected"
  | "subscription_paused"
  | "subscription_resumed";

type Props = Record<string, string | number | boolean>;

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    plausible?: (e: string, o?: { props: Props }) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  try {
    // GA4, `gtag` only exists once analytics consent has been granted, so
    // events fired before consent are simply never sent.
    if (typeof w.gtag === "function") w.gtag("event", event, props);
    if (typeof w.plausible === "function") w.plausible(event, { props });
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...props });
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, props);
    }
  } catch {
    /* analytics must never break the UI */
  }
}
