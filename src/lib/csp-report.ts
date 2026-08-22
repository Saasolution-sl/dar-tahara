type CspMetadata = Record<string, string | number | boolean | null>;

function text(value: unknown, maximum = 100): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maximum) : null;
}
function safeOrigin(value: unknown): string | null {
  const candidate = text(value, 2_000);
  if (!candidate) return null;
  if (["inline", "eval", "data", "blob", "self"].includes(candidate)) return candidate;
  try {
    const parsed = new URL(candidate);
    return ["http:", "https:", "ws:", "wss:"].includes(parsed.protocol) ? parsed.origin : null;
  } catch {
    return null;
  }
}

function routeClass(value: unknown): string {
  const candidate = text(value, 2_000);
  if (!candidate) return "unknown";
  try {
    const path = new URL(candidate).pathname;
    if (path === "/login" || path.startsWith("/forgot-password") || path.startsWith("/reset-password")) return "authentication";
    if (path.startsWith("/security/")) return "security";
    if (path === "/account" || path.startsWith("/account/")) return "customer_portal";
    if (path === "/admin" || path.startsWith("/admin/")) return "admin_portal";
    if (path === "/manager" || path.startsWith("/manager/")) return "manager_portal";
    if (path === "/regional-manager" || path.startsWith("/regional-manager/")) return "regional_manager_portal";
    if (path === "/assessment" || path.startsWith("/assessment/")) return "assessment_portal";
    if (path.startsWith("/api/")) return "api";
    return "public";
  } catch {
    return "unknown";
  }
}

export function sanitizeCspReport(body: Record<string, unknown> | null | undefined): CspMetadata {
  const statusCode = Number(body?.["status-code"]);
  const lineNumber = Number(body?.["line-number"]);
  return {
    violated_directive: text(body?.["violated-directive"]),
    effective_directive: text(body?.["effective-directive"]),
    disposition: text(body?.disposition, 20),
    status_code: Number.isInteger(statusCode) && statusCode >= 0 && statusCode <= 599 ? statusCode : null,
    document_origin: safeOrigin(body?.["document-uri"]),
    blocked_origin: safeOrigin(body?.["blocked-uri"]),
    source_origin: safeOrigin(body?.["source-file"]),
    route_class: routeClass(body?.["document-uri"]),
    line_number: Number.isInteger(lineNumber) && lineNumber > 0 && lineNumber < 10_000_000 ? lineNumber : null,
  };
}
