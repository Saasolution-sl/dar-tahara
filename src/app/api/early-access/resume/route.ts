import { NextRequest, NextResponse } from "next/server";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { isOpaqueToken } from "@/lib/early-access/funnel";
import { resumeSignupSession } from "@/lib/early-access/funnel-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  if (!(await rateLimitShared(`ea-resume:${ip}`)).allowed) return NextResponse.json({ ok: false }, { status: 429 });
  const body = await req.json().catch(() => null) as { token?: unknown } | null;
  if (!isOpaqueToken(body?.token)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const resumed = await resumeSignupSession(body.token);
    if (!resumed) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, restored: true, ...resumed }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    console.error("[early-access/resume] failed");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
