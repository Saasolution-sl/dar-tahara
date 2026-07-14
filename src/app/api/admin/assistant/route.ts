import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { loadAssistantAdminRows, updateAssistantConversation, updateWhatsAppSupportConversation } from "@/lib/assistant/service";

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
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    action?: string;
    note?: string;
    source?: string;
    contactId?: string;
    escalationId?: string;
  } | null;
  if (!body?.id || !body.action) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!["takeover", "close", "reopen", "note", "block", "unblock", "retry"].includes(body.action)) {
    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  }
  try {
    if (body.source === "whatsapp_support") {
      await updateWhatsAppSupportConversation(
        body.id,
        body.action as "close" | "block" | "unblock" | "retry",
        body.contactId,
        body.escalationId,
      );
    } else {
      await updateAssistantConversation(body.id, body.action, body.note);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "assistant_admin_not_configured" }, { status: 503 });
  }
}
