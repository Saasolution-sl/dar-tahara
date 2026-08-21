const TRUSTED_HTTPS_ORIGINS = [
  "https://challenges.cloudflare.com",
  "https://js.stripe.com",
  "https://hooks.stripe.com",
  "https://maps.googleapis.com",
  "https://maps.gstatic.com",
  "https://images.unsplash.com",
  "https://plus.unsplash.com",
];

function safeOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

function safeReportUri(value: string | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return safeOrigin(value) ? value : null;
}

export function buildContentSecurityPolicy(options: {
  supabaseUrl?: string;
  reportUri?: string;
} = {}) {
  const supabaseOrigin = safeOrigin(options.supabaseUrl);
  const connectOrigins = ["'self'", ...TRUSTED_HTTPS_ORIGINS, ...(supabaseOrigin ? [supabaseOrigin, supabaseOrigin.replace("https://", "wss://")] : [])];
  const reportUri = safeReportUri(options.reportUri);
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://maps.googleapis.com https://maps.gstatic.com",
    "frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com",
    `connect-src ${[...new Set(connectOrigins)].join(" ")}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' blob:",
    "upgrade-insecure-requests",
    ...(reportUri ? [`report-uri ${reportUri}`] : []),
  ].join("; ");
}

export function applyContentSecurityPolicy(response: Response) {
  const enforced = process.env.CSP_ENFORCE === "true";
  response.headers.set(
    enforced ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    buildContentSecurityPolicy({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      reportUri: process.env.CSP_REPORT_URI || "/api/security/csp-report",
    }),
  );
  return response;
}
