import { NextRequest, NextResponse } from "next/server";
import { loadWebsiteSession } from "@/lib/assistant/website-handover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = req.headers.get("x-assistant-session-id") || "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || sessionId.length < 8 || sessionId.length > 200) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  try {
    return NextResponse.json(await loadWebsiteSession({ conversationId: id, sessionId }));
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}
