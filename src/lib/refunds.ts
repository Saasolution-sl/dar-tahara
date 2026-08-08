/**
 * Refund request validation, pure logic shared by the admin route and tests.
 */
export const REFUND_REASONS = ["duplicate", "fraudulent", "requested_by_customer"] as const;
export type RefundReason = (typeof REFUND_REASONS)[number];

export type RefundRequest = {
  paymentIntentId: string;
  amountCents?: number; // omitted = full refund
  reason?: RefundReason;
  note?: string;
};

export type RefundValidation =
  | { ok: true; value: RefundRequest }
  | { ok: false; error: "not_refundable" | "invalid_amount" | "bad_request" };

/**
 * Validate an admin refund against the paid amount and payment state.
 * Only `paid` or `partially_refunded` payments with a payment intent are refundable.
 */
export function validateRefundRequest(
  body: unknown,
  context: { paidCents: number; paymentStatus: string; paymentIntentId: string | null },
): RefundValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "bad_request" };
  const b = body as Record<string, unknown>;

  if (!context.paymentIntentId || !["paid", "partially_refunded"].includes(context.paymentStatus)) {
    return { ok: false, error: "not_refundable" };
  }

  let amountCents: number | undefined;
  if (b.amountCents !== undefined && b.amountCents !== null) {
    const n = typeof b.amountCents === "number" ? b.amountCents : Number(b.amountCents);
    if (!Number.isInteger(n) || n <= 0 || n > context.paidCents) {
      return { ok: false, error: "invalid_amount" };
    }
    amountCents = n;
  }

  const reason = REFUND_REASONS.includes(b.reason as RefundReason) ? (b.reason as RefundReason) : undefined;
  const note = typeof b.note === "string" && b.note.trim() ? b.note.trim().slice(0, 500) : undefined;

  return { ok: true, value: { paymentIntentId: context.paymentIntentId, amountCents, reason, note } };
}
