/**
 * Referral lifecycle: which states exist, which transitions are legal, and
 * which referrals actually earn money.
 *
 * Pure logic with no database or Stripe knowledge, so every rule in brief §3
 * and §4 is testable without a fixture. The service layer decides *when* to
 * call these; this module decides whether the result is allowed.
 *
 * The load-bearing rule is `countsTowardReward`. A referral earns a discount
 * only when it is QUALIFIED *and* its fraud status is not BLOCKED. Those are two
 * independent axes on purpose: an admin can freeze a suspicious referral without
 * destroying the record of what happened, and a referral under REVIEW keeps
 * paying out until someone decides otherwise, because withholding a legitimate
 * customer's earned reward while an investigation runs is the worse failure.
 */

export const REFERRAL_STATUSES = [
  "CLICKED",
  "SIGNED_UP",
  "PAYMENT_PENDING",
  "QUALIFIED",
  "REJECTED",
  "REVOKED",
] as const;
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const REFERRAL_FRAUD_STATUSES = ["CLEAR", "REVIEW", "BLOCKED"] as const;
export type ReferralFraudStatus = (typeof REFERRAL_FRAUD_STATUSES)[number];

/**
 * Legal transitions.
 *
 * Forward progress is the funnel. REJECTED and REVOKED are reachable from
 * anywhere that could plausibly need them, and both are reversible by an admin
 * (brief §4) because a wrong rejection must be fixable without a database edit.
 *
 * QUALIFIED -> QUALIFIED is deliberately absent: re-qualifying an already
 * qualified referral is the double-credit bug, and the state machine refuses it
 * rather than relying on every caller to check first.
 */
const TRANSITIONS: Record<ReferralStatus, readonly ReferralStatus[]> = {
  CLICKED: ["SIGNED_UP", "REJECTED", "REVOKED"],
  SIGNED_UP: ["PAYMENT_PENDING", "QUALIFIED", "REJECTED", "REVOKED"],
  PAYMENT_PENDING: ["QUALIFIED", "REJECTED", "REVOKED"],
  QUALIFIED: ["REVOKED", "REJECTED"],
  // Admin restore paths. A rejected or revoked referral can be put back.
  REJECTED: ["QUALIFIED", "REVOKED"],
  REVOKED: ["QUALIFIED", "REJECTED"],
};

/** Terminal for reward purposes: these never earn, whatever the fraud status. */
const NON_EARNING: readonly ReferralStatus[] = [
  "CLICKED",
  "SIGNED_UP",
  "PAYMENT_PENDING",
  "REJECTED",
  "REVOKED",
];

export function isReferralStatus(value: string): value is ReferralStatus {
  return (REFERRAL_STATUSES as readonly string[]).includes(value);
}

export function isReferralFraudStatus(value: string): value is ReferralFraudStatus {
  return (REFERRAL_FRAUD_STATUSES as readonly string[]).includes(value);
}

export type TransitionResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Whether a status change is legal.
 *
 * A no-op transition (same state to same state) is reported as NOT allowed but
 * with a distinct reason, so an idempotent caller can treat "already there" as
 * success while a genuine illegal move still fails loudly.
 */
export function canTransition(from: ReferralStatus, to: ReferralStatus): TransitionResult {
  if (from === to) return { allowed: false, reason: "already_in_state" };
  if (!TRANSITIONS[from].includes(to)) {
    return { allowed: false, reason: `illegal_transition_${from}_to_${to}` };
  }
  return { allowed: true };
}

/**
 * Does this referral earn the referrer 2.5 points?
 *
 * BLOCKED overrides QUALIFIED. REVIEW does not: see the module note.
 */
export function countsTowardReward(
  status: ReferralStatus,
  fraudStatus: ReferralFraudStatus,
): boolean {
  if (fraudStatus === "BLOCKED") return false;
  return status === "QUALIFIED";
}

/** Qualified, non-blocked referrals in a set. The number the reward engine takes. */
export function countQualified(
  referrals: ReadonlyArray<{ status: ReferralStatus; fraudStatus: ReferralFraudStatus }>,
): number {
  return referrals.filter((r) => countsTowardReward(r.status, r.fraudStatus)).length;
}

export type QualificationInput = {
  currentStatus: ReferralStatus;
  fraudStatus: ReferralFraudStatus;
  /** True once the referred customer's early-access assessment payment settled. */
  paymentSettled: boolean;
  /** Same person on both ends, by customer id or normalized email. */
  isSelfReferral: boolean;
  /** This referred customer already has a counted referral from anyone. */
  alreadyReferred: boolean;
};

export type QualificationDecision =
  | { qualify: true }
  | { qualify: false; reason: string; suggestedFraudStatus?: ReferralFraudStatus };

/**
 * Should a referral become QUALIFIED right now?
 *
 * Every guard in brief §3's "do not award for" list resolves here, so the rules
 * live in one readable place instead of being scattered across the webhook, the
 * signup handler and the admin action.
 */
export function evaluateQualification(input: QualificationInput): QualificationDecision {
  if (input.isSelfReferral) {
    return { qualify: false, reason: "self_referral", suggestedFraudStatus: "BLOCKED" };
  }
  if (input.alreadyReferred) {
    // The referred person was already credited to someone. Crediting again would
    // pay two referrers for one customer.
    return { qualify: false, reason: "duplicate_referral", suggestedFraudStatus: "REVIEW" };
  }
  if (input.fraudStatus === "BLOCKED") {
    return { qualify: false, reason: "fraud_blocked" };
  }
  if (!input.paymentSettled) {
    // Clicks, signups and abandoned checkouts all land here.
    return { qualify: false, reason: "payment_not_settled" };
  }
  if (input.currentStatus === "QUALIFIED") {
    return { qualify: false, reason: "already_qualified" };
  }
  const move = canTransition(input.currentStatus, "QUALIFIED");
  if (!move.allowed) return { qualify: false, reason: move.reason };
  return { qualify: true };
}

/**
 * What a settled payment going bad should do.
 *
 * Refund and chargeback both revoke; a chargeback additionally flags for review
 * because it is a stronger signal of abuse than a customer-service refund.
 */
export function evaluateReversal(input: {
  currentStatus: ReferralStatus;
  reason: "refund" | "chargeback";
}): { revoke: boolean; fraudStatus?: ReferralFraudStatus; skipReason?: string } {
  if (input.currentStatus === "REVOKED") {
    return { revoke: false, skipReason: "already_revoked" };
  }
  if (!canTransition(input.currentStatus, "REVOKED").allowed) {
    return { revoke: false, skipReason: `cannot_revoke_from_${input.currentStatus}` };
  }
  return {
    revoke: true,
    fraudStatus: input.reason === "chargeback" ? "REVIEW" : undefined,
  };
}
