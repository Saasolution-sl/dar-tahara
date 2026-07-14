import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { loadAssistantAdminRows, updateAssistantConversation } from "@/lib/assistant/service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await loadAssistantAdminRows());
  } catch {
    return NextResponse.json({ error: "assistant_admin_not_configured" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string; action?: string; note?: string } | null;
  if (!body?.id || !body.action) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!["takeover", "close", "reopen", "note"].includes(body.action)) {
    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  }
  try {
    await updateAssistantConversation(body.id, body.action, body.note);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "assistant_admin_not_configured" }, { status: 503 });
  }
}
