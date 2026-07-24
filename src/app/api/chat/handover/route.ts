import { NextRequest, NextResponse } from "next/server";
import { createWebsiteHandover } from "@/lib/assistant/website-handover";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null) as {
    conversationId?: unknown;
    sessionId?: unknown;
    channel?: unknown;
  } | null;
  if (typeof body?.conversationId !== "string" || typeof body.sessionId !== "string"
    || !/^[0-9a-f-]{36}$/i.test(body.conversationId)
    || body.sessionId.length < 8 || body.sessionId.length > 200) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const limit = rateLimit(`assistant-handover:${body.sessionId.slice(0, 100)}:${clientIpFromHeaders(req.headers)}`);
  if (!limit.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  try {
    return NextResponse.json(await createWebsiteHandover({
      conversationId: body.conversationId,
      sessionId: body.sessionId,
      channel: body.channel === "phone" ? "phone" : "whatsapp",
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "handover_failed";
    return NextResponse.json(
      { error: message === "handover_forbidden" ? "forbidden" : "handover_failed" },
      { status: message === "handover_forbidden" ? 403 : 503 },
    );
  }
}
