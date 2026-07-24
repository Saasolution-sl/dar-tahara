export type PasswordUpdateFailure =
  | "invalid_session"
  | "weak_password"
  | "same_password"
  | "update_failed";

type AuthErrorLike = {
  code?: string;
  name?: string;
};

const SESSION_ERROR_CODES = new Set([
  "bad_jwt",
  "session_expired",
  "session_not_found",
  "refresh_token_not_found",
  "refresh_token_already_used",
]);

export function classifyPasswordUpdateError(error: AuthErrorLike): PasswordUpdateFailure {
  if (error.code === "weak_password") return "weak_password";
  if (error.code === "same_password") return "same_password";
  if (error.name === "AuthSessionMissingError") return "invalid_session";
  if (error.code && SESSION_ERROR_CODES.has(error.code)) return "invalid_session";
  return "update_failed";
}
