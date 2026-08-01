import { test } from "node:test";
import assert from "node:assert/strict";
import { renderTransactionalEmail } from "./transactional-email";

test("payment_required_suspended interpolates invoice reference, amount and the link-expiry date", () => {
  const { subject, html } = renderTransactionalEmail({
    template: "payment_required_suspended",
    locale: "en",
    name: "Sofia Martins",
    reference: "INV-2026-0042",
    amount: "€153.00",
    date: "06 Aug 2026",
    actionUrl: "https://www.dartahara.com/en/pay/abc123",
  });
  assert.match(subject, /INV-2026-0042/);
  assert.match(html, /INV-2026-0042/);
  assert.match(html, /€153\.00/);
  assert.match(html, /06 Aug 2026/);
  assert.match(html, /https:\/\/www\.dartahara\.com\/en\/pay\/abc123/);
});

test("payment_required_final_notice renders both the payment button and the secondary early-termination link", () => {
  const { html } = renderTransactionalEmail({
    template: "payment_required_final_notice",
    locale: "en",
    name: "Sofia Martins",
    reference: "INV-2026-0042",
    amount: "€153.00",
    date: "13 Aug 2026",
    actionUrl: "https://www.dartahara.com/en/pay/def456",
    secondaryActionUrl: "https://www.dartahara.com/en/cancel/ghi789",
  });
  assert.match(html, /Pay now/);
  assert.match(html, /Request early termination/);
  assert.match(html, /https:\/\/www\.dartahara\.com\/en\/pay\/def456/);
  assert.match(html, /https:\/\/www\.dartahara\.com\/en\/cancel\/ghi789/);
});

test("the secondary link is omitted when no secondaryActionUrl is given, even for a template that supports one", () => {
  const { html } = renderTransactionalEmail({
    template: "payment_required_final_notice",
    locale: "en",
    name: "Sofia Martins",
    reference: "INV-2026-0042",
    amount: "€153.00",
    date: "13 Aug 2026",
    actionUrl: "https://www.dartahara.com/en/pay/def456",
  });
  assert.doesNotMatch(html, /Request early termination/);
});

test("the secondary link never appears on a template with no secondaryCta copy, even if a URL is passed", () => {
  const { html } = renderTransactionalEmail({
    template: "payment_confirmation",
    locale: "en",
    name: "Sofia Martins",
    reference: "INV-2026-0042",
    amount: "€153.00",
    secondaryActionUrl: "https://www.dartahara.com/en/should-not-appear",
  });
  assert.doesNotMatch(html, /should-not-appear/);
});

test("payment_required_suspended and payment_required_final_notice render correctly in a non-English, RTL locale", () => {
  const suspended = renderTransactionalEmail({ template: "payment_required_suspended", locale: "ar", name: "سفيا", amount: "€153.00", date: "06 Aug 2026" });
  assert.match(suspended.html, /dir="rtl"/);
  assert.match(suspended.subject, /الدفع مطلوب/);
  const finalNotice = renderTransactionalEmail({ template: "payment_required_final_notice", locale: "ar", name: "سفيا", secondaryActionUrl: "https://example.com/cancel" });
  assert.match(finalNotice.html, /الإنهاء المبكر/);
});

test("final_settlement_generated interpolates reference, amount, deadline and the settlement payment link", () => {
  const { subject, html } = renderTransactionalEmail({
    template: "final_settlement_generated",
    locale: "en",
    name: "Sofia Martins",
    reference: "68F8B9AD",
    amount: "€1,067.28",
    date: "13 Aug 2026",
    actionUrl: "https://www.dartahara.com/en/pay/settlement123",
    originalTerm: "12",
    replacementTerm: "6",
    amountPaid: "€864.00",
    priceAdjustment: "€101.64",
    remainingTermAmount: "€965.64",
  });
  assert.match(subject, /68F8B9AD/);
  assert.match(html, /Early-Termination Settlement Invoice/);
  assert.match(html, /original 12-month contract/);
  assert.match(html, /6-month minimum term/);
  assert.match(html, /€864\.00/);
  assert.match(html, /€101\.64/);
  assert.match(html, /€965\.64/);
  assert.match(html, /€1,067\.28/);
  assert.match(html, /13 Aug 2026/);
  assert.match(html, /Non-payment/);
  assert.match(html, /https:\/\/www\.dartahara\.com\/en\/pay\/settlement123/);
});

test("cancellation_request_received and cancellation_completed render without requiring an action link", () => {
  const received = renderTransactionalEmail({ template: "cancellation_request_received", locale: "en", name: "Sofia Martins", reference: "68F8B9AD", amount: "€760.00" });
  assert.match(received.html, /€760\.00/);
  const completed = renderTransactionalEmail({ template: "cancellation_completed", locale: "en", name: "Sofia Martins", reference: "68F8B9AD" });
  assert.match(completed.subject, /cancelled/);
});

test("cancellation_voided and final_settlement_reminder are wired into every configured locale", () => {
  for (const locale of ["en", "nl", "fr", "ar", "es", "de", "pt"] as const) {
    const voided = renderTransactionalEmail({ template: "cancellation_voided", locale, name: "Sofia Martins", reference: "68F8B9AD" });
    assert.ok(voided.subject.length > 0);
    const reminder = renderTransactionalEmail({ template: "final_settlement_reminder", locale, name: "Sofia Martins", reference: "68F8B9AD", amount: "€760.00", date: "13 Aug 2026" });
    assert.ok(reminder.subject.length > 0);
  }
});
