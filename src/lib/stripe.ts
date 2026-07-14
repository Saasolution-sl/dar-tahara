import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Locale } from "@/i18n/config";
import type { BillingInterval } from "./assessment";
import { site } from "./site";

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  url: string | null;
  mode: "payment" | "subscription" | "setup";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired";
  customer: string | null;
  payment_intent: string | null;
  subscription: string | null;
  client_reference_id: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata: Record<string, string>;
};

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("stripe_not_configured");
  return key;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

function baseUrl(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || site.url;
  if (process.env.NODE_ENV !== "production" && requestOrigin) return requestOrigin.replace(/\/$/, "");
  return configured.replace(/\/$/, "");
}

/** Settlement/checkout currency, centralised in configuration (default EUR). */
export function defaultCurrency(): string {
  return (process.env.STRIPE_DEFAULT_CURRENCY || "eur").toLowerCase();
}

/** Whether to enable Stripe Tax automatic calculation (opt-in via env). */
function taxEnabled(): boolean {
  return process.env.STRIPE_TAX_ENABLED === "true";
}

async function stripePost<T>(
  path: string,
  params: URLSearchParams,
  idempotencyKey?: string,
): Promise<T> {
  const res = await fetch(`${STRIPE_API}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      // Idempotency prevents duplicate resources from retries / double clicks.
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: params,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof (data.error as { message?: unknown } | undefined)?.message === "string"
      ? (data.error as { message: string }).message
      : `stripe_http_${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function createAssessmentCheckoutSession(input: {
  assessmentId: string;
  reference: string;
  customerEmail: string;
  locale: Locale;
  amountCents: number;
  doorlockInstallationPriceCents?: number;
  preferredDate: string;
  requestOrigin?: string;
}): Promise<StripeCheckoutSession> {
  const root = baseUrl(input.requestOrigin);
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("locale", input.locale); // Stripe-hosted Checkout matches the site language
  p.set("client_reference_id", input.assessmentId);
  p.set("customer_email", input.customerEmail);
  p.set("customer_creation", "always");
  p.set("billing_address_collection", "required");
  p.set("phone_number_collection[enabled]", "true");
  p.set("invoice_creation[enabled]", "true");
  p.set("payment_intent_data[setup_future_usage]", "off_session");
  const descriptor = process.env.STRIPE_STATEMENT_DESCRIPTOR;
  if (descriptor) p.set("payment_intent_data[statement_descriptor_suffix]", descriptor.slice(0, 22));
  if (taxEnabled()) {
    p.set("automatic_tax[enabled]", "true");
    p.set("customer_update[address]", "auto");
  }
  p.set("line_items[0][price_data][currency]", defaultCurrency());
  p.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  p.set("line_items[0][price_data][product_data][name]", "Dar Tahara Initial Home Assessment");
  p.set(
    "line_items[0][price_data][product_data][description]",
    `Premium onboarding visit ${input.reference}: professional home assessment and initial deep clean where required.`,
  );
  p.set("line_items[0][quantity]", "1");
  if (input.doorlockInstallationPriceCents && input.doorlockInstallationPriceCents > 0) {
    p.set("line_items[1][price_data][currency]", defaultCurrency());
    p.set("line_items[1][price_data][unit_amount]", String(input.doorlockInstallationPriceCents));
    p.set("line_items[1][price_data][product_data][name]", "Dar Tahara smart door-lock installation");
    p.set(
      "line_items[1][price_data][product_data][description]",
      "Optional installation service for a TTLock-compatible Wi-Fi enabled door lock. Requires an active internet connection at the property.",
    );
    p.set("line_items[1][quantity]", "1");
  }
  p.set("metadata[kind]", "home_assessment");
  p.set("metadata[assessment_id]", input.assessmentId);
  p.set("metadata[reference]", input.reference);
  p.set("metadata[preferred_date]", input.preferredDate);
  p.set("metadata[doorlock_installation_requested]", input.doorlockInstallationPriceCents && input.doorlockInstallationPriceCents > 0 ? "true" : "false");
  p.set("success_url", `${root}/${input.locale}/assessment/confirmation?session_id={CHECKOUT_SESSION_ID}`);
  p.set("cancel_url", `${root}/${input.locale}?assessment=cancelled#calculator`);
  p.set(
    "custom_text[submit][message]",
    "Payment confirms your Initial Home Assessment. Your ongoing subscription begins only after the assessment outcome is approved.",
  );
  return stripePost<StripeCheckoutSession>("checkout/sessions", p, `assessment_checkout_${input.assessmentId}`);
}

export async function createSubscriptionCheckoutSession(input: {
  subscriptionId: string;
  assessmentId: string;
  customerId: string;
  locale: Locale;
  frequencyLabel: string;
  billingInterval: BillingInterval;
  amountCents: number;
  requestOrigin?: string;
}): Promise<StripeCheckoutSession> {
  const root = baseUrl(input.requestOrigin);
  const p = new URLSearchParams();
  p.set("mode", "subscription");
  p.set("locale", input.locale);
  p.set("customer", input.customerId);
  p.set("client_reference_id", input.subscriptionId);
  p.set("billing_address_collection", "auto");
  if (taxEnabled()) {
    p.set("automatic_tax[enabled]", "true");
    p.set("customer_update[address]", "auto");
  }
  p.set("line_items[0][price_data][currency]", defaultCurrency());
  p.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  p.set("line_items[0][price_data][recurring][interval]", input.billingInterval === "annual" ? "year" : "month");
  p.set("line_items[0][price_data][product_data][name]", `Dar Tahara ${input.frequencyLabel} home-care subscription`);
  p.set("line_items[0][quantity]", "1");
  p.set("metadata[kind]", "subscription");
  p.set("metadata[assessment_id]", input.assessmentId);
  p.set("metadata[subscription_id]", input.subscriptionId);
  p.set("subscription_data[metadata][assessment_id]", input.assessmentId);
  p.set("subscription_data[metadata][subscription_id]", input.subscriptionId);
  p.set("success_url", `${root}/${input.locale}/assessment/confirmation?subscription=activated`);
  p.set("cancel_url", `${root}/${input.locale}/assessment/confirmation?subscription=pending`);
  return stripePost<StripeCheckoutSession>("checkout/sessions", p, `subscription_checkout_${input.subscriptionId}`);
}

export type StripePortalSession = { id: string; url: string };

/**
 * Stripe Customer Portal session for a verified customer. The caller MUST have
 * already confirmed ownership of `customerId`. Lets the customer update their
 * payment method, view invoices and manage/cancel their subscription.
 */
export async function createBillingPortalSession(input: {
  customerId: string;
  locale: Locale;
  returnUrl: string;
}): Promise<StripePortalSession> {
  const p = new URLSearchParams();
  p.set("customer", input.customerId);
  p.set("return_url", input.returnUrl);
  p.set("locale", input.locale);
  const configuration = process.env.STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID;
  if (configuration) p.set("configuration", configuration);
  return stripePost<StripePortalSession>("billing_portal/sessions", p);
}

export type StripeRefund = {
  id: string;
  object: "refund";
  amount: number;
  currency: string;
  status: string;
  charge: string | null;
  payment_intent: string | null;
};

/**
 * Refund a payment (full or partial). `amountCents` omitted = full refund.
 * An idempotency key prevents accidental double refunds on retry.
 */
export async function createRefund(input: {
  paymentIntentId: string;
  amountCents?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  idempotencyKey: string;
  internalReason?: string;
}): Promise<StripeRefund> {
  const p = new URLSearchParams();
  p.set("payment_intent", input.paymentIntentId);
  if (typeof input.amountCents === "number") p.set("amount", String(input.amountCents));
  if (input.reason) p.set("reason", input.reason);
  if (input.internalReason) p.set("metadata[internal_reason]", input.internalReason.slice(0, 200));
  return stripePost<StripeRefund>("refunds", p, input.idempotencyKey);
}

/** Retrieve a Checkout Session server-side (authoritative success verification). */
export async function retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
  const res = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(`stripe_http_${res.status}`);
  return data as unknown as StripeCheckoutSession;
}

export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  endpointSecret: string,
  nowMs = Date.now(),
  toleranceSeconds = 300,
): boolean {
  const parts = signatureHeader.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Math.floor(nowMs / 1000) - Number(timestamp)) > toleranceSeconds) return false;
  const expected = createHmac("sha256", endpointSecret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const actual = Buffer.from(signature);
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  });
}

export function parseStripeEvent(rawBody: string, signatureHeader: string): StripeEvent {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !verifyStripeSignature(rawBody, signatureHeader, secret)) {
    throw new Error("invalid_stripe_signature");
  }
  const event = JSON.parse(rawBody) as StripeEvent;
  if (!event.id || !event.type || !event.data?.object) throw new Error("invalid_stripe_event");
  return event;
}
