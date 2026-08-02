import { addUtcMonthsClamped } from "@/lib/early-termination-calculator";

export type PrepaidRenewalStateInput = {
  billingInterval: "monthly" | "annual";
  subscriptionStatus: string;
  autoRenew: boolean;
  currentTermEnd: Date | null;
  renewalStatus: string | null;
  asOf: Date;
  leadDays: number;
};

export type PrepaidRenewalAction =
  | "none"
  | "request_payment"
  | "activate_paid_term"
  | "end_after_current_term";

export function computePrepaidRenewalDueAt(
  currentTermEnd: Date,
  leadDays: number,
): Date {
  return new Date(
    currentTermEnd.getTime() - Math.max(1, Math.trunc(leadDays)) * 86_400_000,
  );
}

export function computeNextPrepaidTerm(currentTermEnd: Date): {
  start: Date;
  end: Date;
} {
  return {
    start: new Date(currentTermEnd),
    end: addUtcMonthsClamped(currentTermEnd, 12),
  };
}

export function determinePrepaidRenewalAction(
  input: PrepaidRenewalStateInput,
): PrepaidRenewalAction {
  if (
    input.billingInterval !== "annual"
    || input.subscriptionStatus === "cancelled"
    || !input.currentTermEnd
  ) {
    return "none";
  }
  if (input.asOf.getTime() >= input.currentTermEnd.getTime()) {
    return input.autoRenew && input.renewalStatus === "paid"
      ? "activate_paid_term"
      : "end_after_current_term";
  }
  if (!input.autoRenew) return "none";
  const dueAt = computePrepaidRenewalDueAt(input.currentTermEnd, input.leadDays);
  if (
    input.asOf.getTime() >= dueAt.getTime()
    && input.renewalStatus !== "payment_requested"
    && input.renewalStatus !== "paid"
  ) {
    return "request_payment";
  }
  return "none";
}
