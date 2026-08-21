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
  setup_intent?: string | null;
  subscription: string | null;
  amount_total?: number | null;
  currency?: string | null;
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

export type StripeCustomer = { id: string; email: string | null; name: string | null };

export async function createStripeCustomer(input: {
  customerId: string;
  email: string;
  name: string;
}): Promise<StripeCustomer> {
  const p = new URLSearchParams();
  p.set("email", input.email);
  p.set("name", input.name);
  p.set("metadata[dar_tahara_customer_id]", input.customerId);
  return stripePost<StripeCustomer>("customers", p, `customer_${input.customerId}`);
}

export async function createPaymentMethodSetupCheckoutSession(input: {
  customerId: string;
  darTaharaCustomerId: string;
  locale: Locale;
  requestOrigin?: string;
}): Promise<StripeCheckoutSession> {
  const root = baseUrl(input.requestOrigin);
  const p = new URLSearchParams();
  p.set("mode", "setup");
  p.set("customer", input.customerId);
  p.set("locale", input.locale);
  p.set("payment_method_types[0]", "card");
  p.set("metadata[kind]", "payment_method_setup");
  p.set("metadata[customer_id]", input.darTaharaCustomerId);
  p.set(
    "success_url",
    `${root}/account/profile?paymentSetup=success&session_id={CHECKOUT_SESSION_ID}`,
  );
  p.set(
    "cancel_url",
    `${root}/account/profile?paymentSetup=cancelled`,
  );
  return stripePost<StripeCheckoutSession>(
    "checkout/sessions",
    p,
    `payment_method_setup_${input.darTaharaCustomerId}`,
  );
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

async function stripeGet<T>(path: string): Promise<T> {
  const res = await fetch(`${STRIPE_API}/${path}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
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
  stripeCustomerId?: string;
  locale: Locale;
  amountCents: number;
  doorlockInstallationPriceCents?: number;
  preferredDate: string;
  requestOrigin?: string;
  returnToAccount?: boolean;
}): Promise<StripeCheckoutSession> {
  const root = baseUrl(input.requestOrigin);
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("locale", input.locale); // Stripe-hosted Checkout matches the site language
  p.set("client_reference_id", input.assessmentId);
  if (input.stripeCustomerId) {
    p.set("customer", input.stripeCustomerId);
    p.set("customer_update[address]", "auto");
    p.set("customer_update[name]", "auto");
  } else {
    p.set("customer_email", input.customerEmail);
    p.set("customer_creation", "always");
  }
  p.set("billing_address_collection", "required");
  p.set("phone_number_collection[enabled]", "true");
  p.set("invoice_creation[enabled]", "true");
  p.set("payment_method_types[0]", "card");
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
  p.set(
    "success_url",
    input.returnToAccount
      ? `${root}/account/properties?assessment=payment_complete&session_id={CHECKOUT_SESSION_ID}`
      : `${root}/${input.locale}/assessment/confirmation?session_id={CHECKOUT_SESSION_ID}`,
  );
  p.set(
    "cancel_url",
    input.returnToAccount
      ? `${root}/account/subscriptions?assessment=cancelled`
      : `${root}/${input.locale}?assessment=cancelled#calculator`,
  );
  p.set(
    "custom_text[submit][message]",
    "Payment confirms your Initial Home Assessment and securely saves the payment method. No subscription charge is made unless both parties approve the assessment and you later authorize automatic payments.",
  );
  return stripePost<StripeCheckoutSession>("checkout/sessions", p, `assessment_checkout_${input.assessmentId}`);
}

export type StripePaymentIntent = {
  id: string;
  customer: string | null;
  payment_method: string | null;
  status: string;
};

export type StripeSetupIntent = {
  id: string;
  customer: string | null;
  payment_method: string | null;
  status: string;
};

export async function retrievePaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
  return stripeGet<StripePaymentIntent>(
    `payment_intents/${encodeURIComponent(paymentIntentId)}`,
  );
}

export async function retrieveSetupIntent(
  setupIntentId: string,
): Promise<StripeSetupIntent> {
  return stripeGet<StripeSetupIntent>(
    `setup_intents/${encodeURIComponent(setupIntentId)}`,
  );
}

export async function setCustomerDefaultPaymentMethod(input: {
  customerId: string;
  paymentMethodId: string;
  idempotencyKey: string;
}): Promise<StripeCustomer> {
  const params = new URLSearchParams();
  params.set("invoice_settings[default_payment_method]", input.paymentMethodId);
  return stripePost<StripeCustomer>(
    `customers/${encodeURIComponent(input.customerId)}`,
    params,
    input.idempotencyKey,
  );
}

export async function createDeepCleanCheckoutSession(input: {
  deepCleanRequestId: string;
  customerEmail: string;
  locale: Locale;
  amountCents: number;
  requestedDate: string;
  requestOrigin?: string;
}): Promise<StripeCheckoutSession> {
  const root = baseUrl(input.requestOrigin);
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("locale", input.locale);
  p.set("client_reference_id", input.deepCleanRequestId);
  p.set("customer_email", input.customerEmail);
  p.set("customer_creation", "always");
  p.set("invoice_creation[enabled]", "true");
  const descriptor = process.env.STRIPE_STATEMENT_DESCRIPTOR;
  if (descriptor) p.set("payment_intent_data[statement_descriptor_suffix]", descriptor.slice(0, 22));
  if (taxEnabled()) {
    p.set("automatic_tax[enabled]", "true");
    p.set("customer_update[address]", "auto");
  }
  p.set("line_items[0][price_data][currency]", defaultCurrency());
  p.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  p.set("line_items[0][price_data][product_data][name]", "Dar Tahara deep cleaning visit");
  p.set(
    "line_items[0][price_data][product_data][description]",
    `One-off deep cleaning visit requested for ${input.requestedDate}.`,
  );
  p.set("line_items[0][quantity]", "1");
  p.set("metadata[kind]", "deep_clean");
  p.set("metadata[deep_clean_request_id]", input.deepCleanRequestId);
  p.set("success_url", `${root}/account/subscriptions?deepClean=paid`);
  p.set("cancel_url", `${root}/account/subscriptions?deepClean=cancelled`);
  return stripePost<StripeCheckoutSession>("checkout/sessions", p, `deep_clean_checkout_${input.deepCleanRequestId}`);
}

export async function createSubscriptionCheckoutSession(input: {
  subscriptionId: string;
  assessmentId: string;
  customerId: string;
  locale: Locale;
  frequencyLabel: string;
  billingInterval: BillingInterval;
  amountCents: number;
  initialAmountCents?: number;
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
  if (input.initialAmountCents && input.initialAmountCents > 0) {
    p.set("line_items[1][price_data][currency]", defaultCurrency());
    p.set("line_items[1][price_data][unit_amount]", String(input.initialAmountCents));
    p.set("line_items[1][price_data][product_data][name]", "Dar Tahara onboarding and approved one-time services");
    p.set("line_items[1][quantity]", "1");
  }
  p.set("metadata[kind]", "subscription");
  p.set("metadata[assessment_id]", input.assessmentId);
  p.set("metadata[subscription_id]", input.subscriptionId);
  p.set("subscription_data[metadata][assessment_id]", input.assessmentId);
  p.set("subscription_data[metadata][subscription_id]", input.subscriptionId);
  p.set("success_url", `${root}/${input.locale}/assessment/confirmation?subscription=activated`);
  p.set("cancel_url", `${root}/${input.locale}/assessment/confirmation?subscription=pending`);
  return stripePost<StripeCheckoutSession>("checkout/sessions", p, `subscription_checkout_${input.subscriptionId}`);
}

type StripePrice = {
  id: string;
  object: "price";
};

export type StripeSubscriptionSchedule = {
  id: string;
  object: "subscription_schedule";
  status: string;
  subscription: string | null;
  start_date?: number;
  phases?: Array<{ start_date: number; end_date: number }>;
  metadata: Record<string, string>;
};

async function createSubscriptionPrice(input: {
  subscriptionId: string;
  frequencyLabel: string;
  billingInterval: BillingInterval;
  amountCents: number;
  currency: string;
}): Promise<StripePrice> {
  const params = new URLSearchParams();
  params.set("currency", input.currency.toLowerCase());
  params.set("unit_amount", String(input.amountCents));
  params.set("recurring[interval]", input.billingInterval === "annual" ? "year" : "month");
  params.set(
    "product_data[name]",
    `Dar Tahara ${input.frequencyLabel} home-care subscription`,
  );
  params.set("metadata[dar_tahara_subscription_id]", input.subscriptionId);
  return stripePost<StripePrice>(
    "prices",
    params,
    `subscription_recurring_price_${input.subscriptionId}`,
  );
}

async function createSubscriptionInitialPrice(input: {
  subscriptionId: string;
  amountCents: number;
  currency: string;
}): Promise<StripePrice> {
  const params = new URLSearchParams();
  params.set("currency", input.currency.toLowerCase());
  params.set("unit_amount", String(input.amountCents));
  params.set(
    "product_data[name]",
    "Dar Tahara approved onboarding and one-time services",
  );
  params.set("metadata[dar_tahara_subscription_id]", input.subscriptionId);
  return stripePost<StripePrice>(
    "prices",
    params,
    `subscription_initial_price_${input.subscriptionId}`,
  );
}

/**
 * Schedules the accepted subscription to start and collect its first payment
 * on a future Friday. This is a future-start schedule, not a free trial:
 * service remains unavailable until the first invoice.paid webhook.
 */
export async function createAuthorizedSubscriptionSchedule(input: {
  subscriptionId: string;
  assessmentId: string;
  proposalId: string;
  customerId: string;
  paymentMethodId: string;
  frequencyLabel: string;
  billingInterval: BillingInterval;
  amountCents: number;
  initialAmountCents?: number;
  currency: string;
  startsAt: Date;
  contractDurationMonths: number;
}): Promise<StripeSubscriptionSchedule> {
  const recurringPrice = await createSubscriptionPrice(input);
  const initialPrice = input.initialAmountCents && input.initialAmountCents > 0
    ? await createSubscriptionInitialPrice({
        subscriptionId: input.subscriptionId,
        amountCents: input.initialAmountCents,
        currency: input.currency,
      })
    : null;
  const params = new URLSearchParams();
  params.set("customer", input.customerId);
  params.set("start_date", String(Math.floor(input.startsAt.getTime() / 1000)));
  params.set("end_behavior", "release");
  params.set("default_settings[collection_method]", "charge_automatically");
  params.set(
    "default_settings[default_payment_method]",
    input.paymentMethodId,
  );
  if (taxEnabled()) params.set("default_settings[automatic_tax][enabled]", "true");
  params.set("phases[0][items][0][price]", recurringPrice.id);
  params.set("phases[0][items][0][quantity]", "1");
  params.set(
    "phases[0][iterations]",
    String(
      input.billingInterval === "annual"
        ? Math.max(1, Math.ceil(input.contractDurationMonths / 12))
        : input.contractDurationMonths,
    ),
  );
  params.set("phases[0][proration_behavior]", "none");
  params.set("phases[0][metadata][subscription_id]", input.subscriptionId);
  params.set("phases[0][metadata][assessment_id]", input.assessmentId);
  params.set("phases[0][metadata][proposal_id]", input.proposalId);
  if (initialPrice) {
    params.set("phases[0][add_invoice_items][0][price]", initialPrice.id);
    params.set("phases[0][add_invoice_items][0][quantity]", "1");
  }
  params.set("metadata[kind]", "authorized_subscription");
  params.set("metadata[subscription_id]", input.subscriptionId);
  params.set("metadata[assessment_id]", input.assessmentId);
  params.set("metadata[proposal_id]", input.proposalId);
  return stripePost<StripeSubscriptionSchedule>(
    "subscription_schedules",
    params,
    `authorized_subscription_schedule_${input.subscriptionId}`,
  );
}

export async function retrieveStripeSubscription(
  subscriptionId: string,
): Promise<StripeSubscription & { metadata?: Record<string, string> }> {
  return stripeGet<StripeSubscription & { metadata?: Record<string, string> }>(
    `subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
}

/**
 * AC maintenance add-on: unlike the base subscription price (created fresh
 * per subscription via createSubscriptionPrice), this is a single fixed
 * price reused across every customer, so it is created once (see
 * scripts/setup-ac-addon-price.ts) and referenced by ID from configuration,
 * matching "the Stripe Price is the billing authority" rather than
 * scattering the amount through the app. Never hardcode this ID in frontend
 * code; it's read server-side only.
 */
export function acAddonPriceId(): string {
  const id = process.env.STRIPE_AC_ADDON_PRICE_ID;
  if (!id) throw new Error("ac_addon_price_not_configured");
  return id;
}

/** One-time setup: creates the fixed recurring AC add-on Price (and its Product). Not called at request time, only from the setup script. */
export async function createAcAddonPrice(): Promise<StripePrice & { product: string }> {
  const params = new URLSearchParams();
  params.set("currency", defaultCurrency());
  params.set("unit_amount", "400");
  params.set("recurring[interval]", "month");
  params.set("product_data[name]", "Additional Air Conditioning Maintenance");
  params.set(
    "product_data[metadata][description]",
    "Twice-yearly preventative maintenance cleaning for one additional registered air-conditioning unit at the subscribed Dar Tahara property.",
  );
  params.set("metadata[service_type]", "ac_maintenance");
  params.set("metadata[billing_type]", "subscription_addon");
  params.set("metadata[frequency]", "twice_yearly");
  params.set("metadata[unit_type]", "air_conditioner");
  params.set("metadata[brand]", "dar_tahara");
  return stripePost<StripePrice & { product: string }>("prices", params, "ac_addon_price_setup_v1");
}

export type StripeSubscriptionItem = {
  id: string;
  object: "subscription_item";
  subscription: string;
  price: { id: string };
  quantity: number;
};

/** Lists the live items on a subscription, used to find (or confirm the absence of) the AC add-on item before adding/updating/removing it. */
export async function listSubscriptionItems(subscriptionId: string): Promise<StripeSubscriptionItem[]> {
  const res = await stripeGet<{ data: StripeSubscriptionItem[] }>(
    `subscription_items?subscription=${encodeURIComponent(subscriptionId)}`,
  );
  return res.data;
}

/** Finds the AC add-on item on a subscription, if one exists (by price ID, not by array position). */
export async function findAcAddonSubscriptionItem(subscriptionId: string): Promise<StripeSubscriptionItem | null> {
  const items = await listSubscriptionItems(subscriptionId);
  const priceId = acAddonPriceId();
  return items.find((item) => item.price.id === priceId) ?? null;
}

/**
 * Adds the AC add-on as a new item on an already-live subscription (going
 * from 0 to N>0 paid units). Quantity must be the caller's database-computed
 * paid-unit count (computeAdditionalAcCount in ac-maintenance.ts), never
 * incremented/decremented directly, so Stripe can never drift from the DB.
 */
export async function addAcAddonSubscriptionItem(input: {
  subscriptionId: string;
  quantity: number;
  idempotencyKey: string;
}): Promise<StripeSubscriptionItem> {
  const params = new URLSearchParams();
  params.set("subscription", input.subscriptionId);
  params.set("price", acAddonPriceId());
  params.set("quantity", String(input.quantity));
  params.set("proration_behavior", "create_prorations");
  params.set("metadata[service_type]", "ac_maintenance");
  return stripePost<StripeSubscriptionItem>("subscription_items", params, input.idempotencyKey);
}

/** Updates the quantity of an existing AC add-on item (adding/removing paid units while at least one remains). */
export async function updateAcAddonSubscriptionItemQuantity(input: {
  subscriptionItemId: string;
  quantity: number;
  idempotencyKey: string;
}): Promise<StripeSubscriptionItem> {
  const params = new URLSearchParams();
  params.set("quantity", String(input.quantity));
  params.set("proration_behavior", "create_prorations");
  return stripePost<StripeSubscriptionItem>(
    `subscription_items/${encodeURIComponent(input.subscriptionItemId)}`, params, input.idempotencyKey,
  );
}

/** Removes the AC add-on item entirely (going from N>0 paid units to 0). */
export async function removeAcAddonSubscriptionItem(input: {
  subscriptionItemId: string;
  idempotencyKey: string;
}): Promise<{ id: string; deleted: boolean }> {
  return stripeDelete<{ id: string; deleted: boolean }>(
    `subscription_items/${encodeURIComponent(input.subscriptionItemId)}?proration_behavior=create_prorations`,
    input.idempotencyKey,
  );
}

/**
 * One-off Checkout Session for paying a specific outstanding invoice via a
 * secure payment link. Created fresh at redemption time (never pre-created
 * and stored), the `payment_links` row's own `expires_at` is the real
 * 7-day authority; this session only needs to live long enough for one
 * checkout attempt. `success`/`cancel` land back on the (non-locale-prefixed)
 * customer portal, matching how `/account/*` routes are structured.
 */
export async function createInvoicePaymentCheckoutSession(input: {
  invoiceId: string;
  paymentLinkId: string;
  customerEmail: string;
  locale: Locale;
  amountCents: number;
  invoiceReference: string;
  invoiceType?: "standard" | "early_termination_settlement" | "prepaid_renewal";
  requestOrigin?: string;
}): Promise<StripeCheckoutSession> {
  const root = baseUrl(input.requestOrigin);
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("locale", input.locale);
  p.set("customer_email", input.customerEmail);
  p.set("invoice_creation[enabled]", "true");
  const descriptor = process.env.STRIPE_STATEMENT_DESCRIPTOR;
  if (descriptor) p.set("payment_intent_data[statement_descriptor_suffix]", descriptor.slice(0, 22));
  p.set("line_items[0][price_data][currency]", defaultCurrency());
  p.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  const productName = input.invoiceType === "early_termination_settlement"
    ? `Dar Tahara Early-Termination Settlement ${input.invoiceReference}`
    : input.invoiceType === "prepaid_renewal"
      ? `Dar Tahara Prepaid Renewal ${input.invoiceReference}`
      : `Dar Tahara invoice ${input.invoiceReference}`;
  const description = input.invoiceType === "early_termination_settlement"
    ? "Itemized settlement for the confirmed early termination of a monthly-paid fixed-term contract."
    : input.invoiceType === "prepaid_renewal"
      ? "Advance payment for the next prepaid subscription term. The next term begins only after successful payment."
      : "Outstanding balance for your Dar Tahara home-care subscription.";
  p.set("line_items[0][price_data][product_data][name]", productName);
  p.set(
    "line_items[0][price_data][product_data][description]",
    description,
  );
  p.set("line_items[0][quantity]", "1");
  p.set("metadata[kind]", "invoice_payment_link");
  p.set("metadata[invoice_id]", input.invoiceId);
  p.set("metadata[payment_link_id]", input.paymentLinkId);
  p.set("success_url", `${root}/account/invoices?payment=success`);
  p.set("cancel_url", `${root}/account/invoices?payment=cancelled`);
  return stripePost<StripeCheckoutSession>("checkout/sessions", p, `invoice_payment_${input.paymentLinkId}`);
}

export type StripePortalSession = { id: string; url: string };

type StripePaymentMethod = {
  id: string;
  type: string;
  billing_details?: { name?: string | null } | null;
  card?: {
    brand?: string | null;
    last4?: string | null;
    exp_month?: number | null;
    exp_year?: number | null;
  } | null;
  sepa_debit?: { last4?: string | null } | null;
};

type StripeCustomerWithPaymentMethod = {
  id: string;
  invoice_settings?: {
    default_payment_method?: string | StripePaymentMethod | null;
  } | null;
};

export type StripePaymentMethodSummary = {
  type: string;
  label: string;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  billingName: string | null;
};

function paymentMethodSummary(
  method: StripePaymentMethod,
): StripePaymentMethodSummary {
  const brand = method.card?.brand?.replaceAll("_", " ") || "";
  const label = method.type === "card"
    ? brand
      ? brand.replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "Card"
    : method.type === "sepa_debit"
      ? "SEPA Direct Debit"
      : method.type.replaceAll("_", " ");
  return {
    type: method.type,
    label,
    last4: method.card?.last4 || method.sepa_debit?.last4 || null,
    expMonth: method.card?.exp_month || null,
    expYear: method.card?.exp_year || null,
    billingName: method.billing_details?.name || null,
  };
}

/**
 * Returns only a masked, customer-safe summary of the Stripe default payment
 * method. Full payment credentials never leave Stripe and Stripe resource IDs
 * are intentionally omitted from the return value.
 */
export async function retrieveStripeCustomerPaymentDetails(
  customerId: string,
): Promise<StripePaymentMethodSummary | null> {
  const customer = await stripeGet<StripeCustomerWithPaymentMethod>(
    `customers/${encodeURIComponent(customerId)}?expand[]=invoice_settings.default_payment_method`,
  );
  const defaultMethod =
    customer.invoice_settings?.default_payment_method || null;
  if (!defaultMethod) return null;
  const method = typeof defaultMethod === "string"
    ? await stripeGet<StripePaymentMethod>(
        `payment_methods/${encodeURIComponent(defaultMethod)}`,
      )
    : defaultMethod;
  return paymentMethodSummary(method);
}

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

export type StripeSubscription = {
  id: string;
  object: "subscription";
  status: string;
  pause_collection: { behavior: string; resumes_at: number | null } | null;
  cancel_at_period_end?: boolean;
  current_period_start?: number;
  current_period_end?: number;
};

/**
 * Suspends billing collection on an existing subscription until `resumesAt`,
 * using Stripe's native `pause_collection`, Stripe itself stops generating
 * invoices and resumes automatically at that timestamp, no external cron
 * needed for the billing side. Callers must treat this as the source of
 * truth for whether billing actually stopped: only write our own
 * `subscriptions.status = 'paused'` after this call succeeds, never before.
 */
export async function pauseStripeSubscription(input: {
  subscriptionId: string;
  resumesAt: Date;
  idempotencyKey: string;
}): Promise<StripeSubscription> {
  const p = new URLSearchParams();
  p.set("pause_collection[behavior]", "void");
  p.set("pause_collection[resumes_at]", String(Math.floor(input.resumesAt.getTime() / 1000)));
  return stripePost<StripeSubscription>(
    `subscriptions/${encodeURIComponent(input.subscriptionId)}`, p, input.idempotencyKey,
  );
}

/**
 * Clears `pause_collection`, resuming billing immediately, used for an
 * admin-initiated early resume. (A pause approved with a future `resumesAt`
 * resumes on its own via Stripe; this is only needed to resume BEFORE that.)
 */
export async function resumeStripeSubscription(input: {
  subscriptionId: string;
  idempotencyKey: string;
}): Promise<StripeSubscription> {
  const p = new URLSearchParams();
  // Empty value clears an object-typed parameter in Stripe's update API.
  p.set("pause_collection", "");
  return stripePost<StripeSubscription>(
    `subscriptions/${encodeURIComponent(input.subscriptionId)}`, p, input.idempotencyKey,
  );
}

/**
 * Enables or disables Stripe's own boundary renewal. Prepaid subscriptions
 * are set to cancel at period end while the app requests the next term one
 * month in advance, preventing a second automatic charge at the boundary.
 */
export async function setStripeSubscriptionCancelAtPeriodEnd(input: {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
  idempotencyKey: string;
}): Promise<StripeSubscription> {
  const params = new URLSearchParams();
  params.set("cancel_at_period_end", input.cancelAtPeriodEnd ? "true" : "false");
  return stripePost<StripeSubscription>(
    `subscriptions/${encodeURIComponent(input.subscriptionId)}`,
    params,
    input.idempotencyKey,
  );
}

async function stripeDelete<T>(path: string, idempotencyKey?: string): Promise<T> {
  const res = await fetch(`${STRIPE_API}/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
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

/**
 * Immediately, permanently cancels the real Stripe subscription, used once
 * an early-termination settlement is fully resolved (paid, or zero owed).
 * Idempotent: cancelling an already-cancelled subscription just returns its
 * current (already-canceled) state rather than erroring, so a retried
 * confirm/webhook never fails on this step.
 */
export async function cancelStripeSubscription(input: {
  subscriptionId: string;
  idempotencyKey: string;
}): Promise<StripeSubscription> {
  return stripeDelete<StripeSubscription>(
    `subscriptions/${encodeURIComponent(input.subscriptionId)}`, input.idempotencyKey,
  );
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
