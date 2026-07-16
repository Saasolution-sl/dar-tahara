import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { answerAssistant } from "@/lib/assistant/service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    message?: unknown;
    locale?: unknown;
    conversationId?: unknown;
    sessionId?: unknown;
    sessionLanguage?: unknown;
    selectedLanguage?: unknown;
    languageSelectionPending?: unknown;
    websitePath?: unknown;
  } | null;

  const message = typeof body?.message === "string" ? body.message : "";
  if (!message.trim()) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  const locale = typeof body?.locale === "string" && isLocale(body.locale) ? body.locale : "en";
  const reply = await answerAssistant({
    channel: "website",
    message,
    locale,
    conversationId: typeof body?.conversationId === "string" ? body.conversationId : null,
    sessionId: typeof body?.sessionId === "string" ? body.sessionId : null,
    sessionLanguage: typeof body?.sessionLanguage === "string" && isLocale(body.sessionLanguage) ? body.sessionLanguage : null,
    selectedLanguage: typeof body?.selectedLanguage === "string" && isLocale(body.selectedLanguage) ? body.selectedLanguage : null,
    languageSelectionPending: body?.languageSelectionPending === true,
    websitePath: typeof body?.websitePath === "string" ? body.websitePath : null,
  });

  return NextResponse.json(reply);
}
