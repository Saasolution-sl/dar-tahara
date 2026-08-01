export type AccountCompletionEvidence = {
  stripeCustomerId: string | null | undefined;
  paymentMethodReadyAt: string | null | undefined;
  accountCompletedAt: string | null | undefined;
};

export function isAccountComplete(
  evidence: AccountCompletionEvidence,
): boolean {
  return Boolean(
    evidence.stripeCustomerId &&
      evidence.paymentMethodReadyAt &&
      evidence.accountCompletedAt,
  );
}
