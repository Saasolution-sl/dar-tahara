import { NextRequest, NextResponse } from "next/server";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { emitSecurityEvent } from "@/lib/security-events";

export async function POST(req: NextRequest) {
  const limit = await rateLimitShared(`csp-report:${clientIpFromHeaders(req.headers)}`, { windowMs: 60_000, max: 30 });
  if (!limit.allowed) return new NextResponse(null, { status: 204 });
  const report = await req.json().catch(() => null) as Record<string, unknown> | null;
  const body = report && typeof report["csp-report"] === "object"
    ? report["csp-report"] as Record<string, unknown>
    : report;
  await emitSecurityEvent({
    type: "csp_violation",
    severity: "medium",
    metadata: {
      violated_directive: body?.["violated-directive"],
      effective_directive: body?.["effective-directive"],
      disposition: body?.disposition,
      status_code: body?.["status-code"],
    },
  });
  return new NextResponse(null, { status: 204 });
}
