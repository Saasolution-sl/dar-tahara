import { NextRequest, NextResponse } from "next/server";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { isServiceRoleConfigured } from "@/lib/supabase-rpc";
import {
  createOrRestoreSignupSession,
  updateSignupSession,
} from "@/lib/early-access/funnel-server";
import { isOpaqueToken, isSessionId, type SessionCredentials } from "@/lib/early-access/funnel";
import { isLikelyBot } from "@/lib/early-access/page-views";

export const runtime = "nodejs";

function credentials(input: unknown): SessionCredentials | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const raw = input as Record<string, unknown>;
  return isSessionId(raw.id) && isOpaqueToken(raw.token)
    ? { id: raw.id, token: raw.token }
    : undefined;
}

function limited(req: NextRequest, scope: string, highFrequency = false) {
  const ip = clientIpFromHeaders(req.headers);
  return rateLimit(
    `${scope}:${ip}`,
    Date.now(),
    highFrequency ? { windowMs: 60_000, max: 120 } : undefined,
  );
}

export async function POST(req: NextRequest) {
  const limit = limited(req, "ea-session-create");
  if (!limit.allowed) return NextResponse.json({ ok: false }, { status: 429 });
  if (isLikelyBot(req.headers.get("user-agent"))) return NextResponse.json({ ok: false });
  if (!isServiceRoleConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const result = await createOrRestoreSignupSession({
      credentials: credentials(body.credentials),
      attribution: body.attribution,
      referrer: body.referrer,
      locale: body.locale,
      userAgent: req.headers.get("user-agent"),
    });
    return NextResponse.json({ ok: true, ...result }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    console.error("[early-access/session] create failed");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Autosave is debounced but legitimately emits more than the generic five
  // requests/minute used for unauthenticated forms. Every mutation below also
  // requires an unguessable per-session token.
  const limit = limited(req, "ea-session-update", true);
  if (!limit.allowed) return NextResponse.json({ ok: false }, { status: 429 });
  if (!isServiceRoleConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const creds = credentials(body?.credentials);
  if (!body || !creds) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const result = await updateSignupSession({
      credentials: creds,
      partialPayload: body.partialPayload,
      currentStep: body.currentStep,
      currentStepIndex: body.currentStepIndex,
      highestCompletedStep: body.highestCompletedStep,
      clientRevision: body.clientRevision,
      event: body.event,
    });
    return NextResponse.json(result, {
      status: result.ok ? 200 : 404,
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    console.error("[early-access/session] update failed");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
