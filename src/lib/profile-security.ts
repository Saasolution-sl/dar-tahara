export type PaymentCredentialInput = {
  accountEmail: string | null | undefined;
  enteredEmail: unknown;
  password: unknown;
};

export type PaymentCredentialValidation =
  | { ok: true; email: string; password: string }
  | { ok: false; error: "invalid_credentials" };

export function validatePaymentCredentials(
  input: PaymentCredentialInput,
): PaymentCredentialValidation {
  const accountEmail = input.accountEmail?.trim().toLowerCase() || "";
  const enteredEmail =
    typeof input.enteredEmail === "string"
      ? input.enteredEmail.trim().toLowerCase()
      : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (
    !accountEmail ||
    enteredEmail !== accountEmail ||
    password.length < 8 ||
    password.length > 200
  ) {
    return { ok: false, error: "invalid_credentials" };
  }

  return { ok: true, email: enteredEmail, password };
}

export function cleanProfileText(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export function cleanCountryCode(value: unknown): string {
  const country = cleanProfileText(value, 20).toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : "";
}
