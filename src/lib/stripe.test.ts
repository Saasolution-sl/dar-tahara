import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyStripeSignature, pauseStripeSubscription, resumeStripeSubscription, createInvoicePaymentCheckoutSession, cancelStripeSubscription, setStripeSubscriptionCancelAtPeriodEnd, createAuthorizedSubscriptionSchedule, createAssessmentCheckoutSession, retrieveStripeCustomerPaymentDetails, createPaymentMethodSetupCheckoutSession } from "./stripe";

test("Stripe webhook signatures verify against the unmodified raw body", () => {
  const body = JSON.stringify({ id: "evt_123", type: "checkout.session.completed" });
  const timestamp = 1_750_000_000;
  const secret = "whsec_test_value";
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  assert.equal(
    verifyStripeSignature(body, `t=${timestamp},v1=${signature}`, secret, timestamp * 1000),
    true,
  );
  assert.equal(
    verifyStripeSignature(`${body} `, `t=${timestamp},v1=${signature}`, secret, timestamp * 1000),
    false,
  );
});

test("Stripe webhook signatures reject stale timestamps", () => {
  const body = "{}";
  const secret = "whsec_test_value";
  const signature = createHmac("sha256", secret).update(`100.${body}`).digest("hex");
  assert.equal(verifyStripeSignature(body, `t=100,v1=${signature}`, secret, 1_000_000), false);
});

test("pauseStripeSubscription posts pause_collection[behavior]=void and the resume timestamp to the correct subscription", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";
  let capturedBody = "";
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    capturedUrl = String(url);
    capturedBody = String(init.body);
    return new Response(JSON.stringify({ id: "sub_123", object: "subscription", status: "active", pause_collection: { behavior: "void", resumes_at: 1234567890 } }), { status: 200 });
  }) as typeof fetch;
  const resumesAt = new Date("2026-10-01T00:00:00Z");
  const expectedUnix = Math.floor(resumesAt.getTime() / 1000);
  try {
    const result = await pauseStripeSubscription({
      subscriptionId: "sub_123",
      resumesAt,
      idempotencyKey: "pause_test_1",
    });
    assert.equal(capturedUrl, "https://api.stripe.com/v1/subscriptions/sub_123");
    assert.match(capturedBody, /pause_collection%5Bbehavior%5D=void/);
    assert.match(capturedBody, new RegExp(`pause_collection%5Bresumes_at%5D=${expectedUnix}`));
    assert.equal(result.pause_collection?.behavior, "void");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("resumeStripeSubscription clears pause_collection with an empty value", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedBody = "";
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    capturedBody = String(init.body);
    return new Response(JSON.stringify({ id: "sub_123", object: "subscription", status: "active", pause_collection: null }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await resumeStripeSubscription({ subscriptionId: "sub_123", idempotencyKey: "resume_test_1" });
    assert.equal(capturedBody, "pause_collection=");
    assert.equal(result.pause_collection, null);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("cancelStripeSubscription sends a DELETE to the correct subscription with an idempotency key", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedIdempotencyKey = "";
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    capturedUrl = String(url);
    capturedMethod = String(init.method);
    capturedIdempotencyKey = String((init.headers as Record<string, string>)["Idempotency-Key"]);
    return new Response(JSON.stringify({ id: "sub_123", object: "subscription", status: "canceled" }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await cancelStripeSubscription({ subscriptionId: "sub_123", idempotencyKey: "cancel_test_1" });
    assert.equal(capturedUrl, "https://api.stripe.com/v1/subscriptions/sub_123");
    assert.equal(capturedMethod, "DELETE");
    assert.equal(capturedIdempotencyKey, "cancel_test_1");
    assert.equal(result.status, "canceled");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("setStripeSubscriptionCancelAtPeriodEnd disables provider auto-renewal without ending the paid term", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody = "";
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    capturedUrl = String(url);
    capturedMethod = String(init.method);
    capturedBody = String(init.body);
    return new Response(JSON.stringify({ id: "sub_annual", object: "subscription", status: "active", cancel_at_period_end: true }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await setStripeSubscriptionCancelAtPeriodEnd({
      subscriptionId: "sub_annual",
      cancelAtPeriodEnd: true,
      idempotencyKey: "prepaid_manual_renewal_test",
    });
    assert.equal(capturedUrl, "https://api.stripe.com/v1/subscriptions/sub_annual");
    assert.equal(capturedMethod, "POST");
    assert.equal(capturedBody, "cancel_at_period_end=true");
    assert.equal(result.cancel_at_period_end, true);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("createInvoicePaymentCheckoutSession creates a one-off payment-mode session for the exact outstanding amount, tagged with the invoice and payment-link ids", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedBody = "";
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    capturedBody = String(init.body);
    return new Response(JSON.stringify({ id: "cs_test_1", object: "checkout.session", url: "https://checkout.stripe.com/pay/cs_test_1", mode: "payment", payment_status: "unpaid", status: "open", customer: null, payment_intent: null, subscription: null, client_reference_id: null, metadata: {} }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await createInvoicePaymentCheckoutSession({
      invoiceId: "inv_1",
      paymentLinkId: "link_1",
      customerEmail: "sofia@example.com",
      locale: "en",
      amountCents: 15300,
      invoiceReference: "STMT-2026-07-TEST",
    });
    assert.equal(result.id, "cs_test_1");
    assert.match(capturedBody, /mode=payment/);
    assert.match(capturedBody, /line_items%5B0%5D%5Bprice_data%5D%5Bunit_amount%5D=15300/);
    assert.match(capturedBody, /metadata%5Binvoice_id%5D=inv_1/);
    assert.match(capturedBody, /metadata%5Bpayment_link_id%5D=link_1/);
    assert.match(capturedBody, /metadata%5Bkind%5D=invoice_payment_link/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("settlement Checkout is explicitly labelled as an early-termination settlement", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedBody = "";
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    capturedBody = String(init.body);
    return new Response(JSON.stringify({ id: "cs_test_settlement", object: "checkout.session", url: "https://checkout.stripe.com/pay/cs_test_settlement", mode: "payment", payment_status: "unpaid", status: "open", customer: null, payment_intent: null, subscription: null, client_reference_id: null, metadata: {} }), { status: 200 });
  }) as typeof fetch;
  try {
    await createInvoicePaymentCheckoutSession({
      invoiceId: "inv_settlement",
      paymentLinkId: "link_settlement",
      customerEmail: "sofia@example.com",
      locale: "en",
      amountCents: 106728,
      invoiceReference: "ETS-2026-EXAMPLE",
      invoiceType: "early_termination_settlement",
    });
    assert.match(capturedBody, /Early-Termination\+Settlement/);
    assert.match(capturedBody, /106728/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("assessment Checkout saves a card for later off-session authorization without starting a subscription", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedBody = "";
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    capturedBody = String(init.body);
    return new Response(JSON.stringify({
      id: "cs_assessment",
      object: "checkout.session",
      url: "https://checkout.stripe.com/pay/cs_assessment",
      mode: "payment",
      payment_status: "unpaid",
      status: "open",
      customer: null,
      payment_intent: null,
      subscription: null,
      client_reference_id: "assessment_1",
      metadata: {},
    }), { status: 200 });
  }) as typeof fetch;
  try {
    await createAssessmentCheckoutSession({
      assessmentId: "assessment_1",
      reference: "DTH-2607-10001",
      customerEmail: "sofia@example.com",
      stripeCustomerId: "cus_existing",
      locale: "en",
      amountCents: 4900,
      preferredDate: "2026-08-03",
      returnToAccount: true,
    });
    assert.match(capturedBody, /mode=payment/);
    assert.match(capturedBody, /payment_method_types%5B0%5D=card/);
    assert.match(capturedBody, /payment_intent_data%5Bsetup_future_usage%5D=off_session/);
    assert.match(capturedBody, /customer=cus_existing/);
    assert.doesNotMatch(capturedBody, /customer_email=/);
    assert.doesNotMatch(capturedBody, /customer_creation=/);
    assert.match(capturedBody, /success_url=.*account%2Fproperties/);
    assert.match(capturedBody, /cancel_url=.*account%2Fsubscriptions/);
    assert.doesNotMatch(capturedBody, /mode=subscription/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("mandatory payment details use Stripe setup mode without charging the customer", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedBody = "";
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    capturedBody = String(init.body);
    return new Response(JSON.stringify({
      id: "cs_setup",
      object: "checkout.session",
      url: "https://checkout.stripe.com/setup/cs_setup",
      mode: "setup",
      payment_status: "no_payment_required",
      status: "open",
      customer: "cus_123",
      payment_intent: null,
      setup_intent: null,
      subscription: null,
      client_reference_id: null,
      metadata: {},
    }), { status: 200 });
  }) as typeof fetch;
  try {
    await createPaymentMethodSetupCheckoutSession({
      customerId: "cus_123",
      darTaharaCustomerId: "11111111-1111-1111-1111-111111111111",
      locale: "en",
      requestOrigin: "http://localhost:3000",
    });
    assert.match(capturedBody, /mode=setup/);
    assert.match(capturedBody, /customer=cus_123/);
    assert.match(capturedBody, /payment_method_types%5B0%5D=card/);
    assert.match(capturedBody, /metadata%5Bkind%5D=payment_method_setup/);
    assert.match(
      capturedBody,
      /metadata%5Bcustomer_id%5D=11111111-1111-1111-1111-111111111111/,
    );
    assert.doesNotMatch(capturedBody, /line_items/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("customer payment details expose only a masked default-method summary", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";
  globalThis.fetch = (async (url: string) => {
    capturedUrl = String(url);
    return new Response(JSON.stringify({
      id: "cus_123",
      invoice_settings: {
        default_payment_method: {
          id: "pm_secret_identifier",
          type: "card",
          billing_details: { name: "Test Customer" },
          card: {
            brand: "visa",
            last4: "4242",
            exp_month: 7,
            exp_year: 2030,
          },
        },
      },
    }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await retrieveStripeCustomerPaymentDetails("cus_123");
    assert.match(
      capturedUrl,
      /customers\/cus_123\?expand\[\]=invoice_settings\.default_payment_method/,
    );
    assert.deepEqual(result, {
      type: "card",
      label: "Visa",
      last4: "4242",
      expMonth: 7,
      expYear: 2030,
      billingName: "Test Customer",
    });
    assert.equal("id" in (result || {}), false);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

test("authorized subscription uses a future-start schedule for the Friday charge and no trial", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; body: string; idempotencyKey: string }> = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({
      url: String(url),
      body: String(init.body),
      idempotencyKey: String((init.headers as Record<string, string>)["Idempotency-Key"]),
    });
    if (String(url).endsWith("/prices")) {
      return new Response(JSON.stringify({ id: "price_monthly", object: "price" }), { status: 200 });
    }
    return new Response(JSON.stringify({
      id: "sub_sched_123",
      object: "subscription_schedule",
      status: "not_started",
      subscription: null,
      start_date: 1785492000,
      metadata: { subscription_id: "11111111-1111-1111-1111-111111111111" },
    }), { status: 200 });
  }) as typeof fetch;
  try {
    await createAuthorizedSubscriptionSchedule({
      subscriptionId: "11111111-1111-1111-1111-111111111111",
      assessmentId: "22222222-2222-2222-2222-222222222222",
      proposalId: "33333333-3333-3333-3333-333333333333",
      customerId: "cus_123",
      paymentMethodId: "pm_123",
      frequencyLabel: "biweekly",
      billingInterval: "monthly",
      amountCents: 23800,
      currency: "eur",
      startsAt: new Date("2026-07-31T10:00:00Z"),
      contractDurationMonths: 12,
    });
    assert.equal(calls.length, 2);
    assert.match(calls[0].body, /recurring%5Binterval%5D=month/);
    assert.match(calls[0].body, /unit_amount=23800/);
    assert.equal(calls[1].url, "https://api.stripe.com/v1/subscription_schedules");
    assert.match(calls[1].body, /start_date=1785492000/);
    assert.match(calls[1].body, /default_settings%5Bdefault_payment_method%5D=pm_123/);
    assert.match(calls[1].body, /phases%5B0%5D%5Biterations%5D=12/);
    assert.match(calls[1].body, /metadata%5Bsubscription_id%5D=11111111-1111-1111-1111-111111111111/);
    assert.doesNotMatch(calls[1].body, /trial/);
    assert.equal(
      calls[1].idempotencyKey,
      "authorized_subscription_schedule_11111111-1111-1111-1111-111111111111",
    );
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.STRIPE_SECRET_KEY;
  }
});
