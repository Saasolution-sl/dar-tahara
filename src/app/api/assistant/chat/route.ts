import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { answerAssistant } from "@/lib/assistant/service";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as {
    message?: unknown;
    locale?: unknown;
    conversationId?: unknown;
    sessionId?: unknown;
    sessionLanguage?: unknown;
    selectedLanguage?: unknown;
    selectedSuggestionId?: unknown;
    languageSelectionPending?: unknown;
    websitePath?: unknown;
  } | null;

  const message = typeof body?.message === "string" ? body.message : "";
  if (!message.trim()) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }
  const limit = rateLimit(`assistant-chat:${typeof body?.sessionId === "string" ? body.sessionId.slice(0, 100) : clientIpFromHeaders(req.headers)}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
    });
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
    selectedSuggestionId: typeof body?.selectedSuggestionId === "string" ? body.selectedSuggestionId.slice(0, 120) : null,
    languageSelectionPending: body?.languageSelectionPending === true,
    websitePath: typeof body?.websitePath === "string" ? body.websitePath : null,
  });

  return NextResponse.json({
    conversationId: reply.conversationId,
    answer: reply.answer,
    message: reply.answer,
    locale: reply.locale,
    language: reply.locale,
    languageConfirmed: reply.languageConfirmed,
    languageChanged: reply.languageChanged,
    intent: reply.intent,
    answerCategory: reply.answerCategory,
    handoffAvailable: reply.handoffRequired
      || reply.answerCategory === "missing_business_knowledge"
      || reply.confidence < Number(process.env.ASSISTANT_CONFIDENCE_THRESHOLD || 0.6),
    suggestions: reply.suggestions,
    suggestedActions: reply.suggestedActions,
    escalation: {
      required: reply.escalation.required,
      reason: reply.escalation.reason,
      nextAction: reply.escalation.nextAction,
      next_action: reply.escalation.nextAction,
    },
  });
}
