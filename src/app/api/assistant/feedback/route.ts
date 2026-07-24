import { NextRequest, NextResponse } from "next/server";
import { isServiceRoleConfigured, serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: "feedback_not_configured" }, { status: 503 });
  const body = await req.json().catch(() => null) as {
    conversationId?: unknown;
    sessionId?: unknown;
    rating?: unknown;
  } | null;
  if (typeof body?.conversationId !== "string" || typeof body.sessionId !== "string"
    || !["helpful", "unhelpful"].includes(String(body.rating))) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const limit = rateLimit(`assistant-feedback:${body.sessionId.slice(0, 100)}:${clientIpFromHeaders(req.headers)}`);
  if (!limit.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const rows = await serviceSelect<Array<{ metadata: Record<string, unknown> | null }>>(
    `assistant_conversations?id=eq.${encodeURIComponent(body.conversationId)}&select=metadata&limit=1`,
  ).catch(() => []);
  if (!rows[0] || rows[0].metadata?.session_id !== body.sessionId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const latestMessages = await serviceSelect<Array<{
    id: number;
    confidence: number | null;
    metadata: Record<string, unknown> | null;
  }>>(
    `assistant_messages?conversation_id=eq.${encodeURIComponent(body.conversationId)}&role=eq.assistant&select=id,confidence,metadata&order=created_at.desc&limit=1`,
  ).catch(() => []);
  const latest = latestMessages[0];
  const rawSources = Array.isArray(latest?.metadata?.sources) ? latest.metadata.sources : [];
  const knowledgeArticleIds = rawSources.flatMap((source) => {
    if (!source || typeof source !== "object") return [];
    const id = (source as { id?: unknown }).id;
    return typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id) ? [id] : [];
  });
  const rawWebsiteSources = Array.isArray(latest?.metadata?.website_source_ids)
    ? latest.metadata.website_source_ids
    : [];
  const websiteSourceIds = rawWebsiteSources.filter((id): id is string =>
    typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id));
  if (latest?.id) {
    const existing = await serviceSelect<Array<{ id: number }>>(
      `assistant_feedback?conversation_id=eq.${encodeURIComponent(body.conversationId)}&message_id=eq.${latest.id}&select=id&limit=1`,
    ).catch(() => []);
    if (existing.length) return NextResponse.json({ ok: true, duplicate: true });
  }
  await serviceInsert("assistant_feedback", {
    conversation_id: body.conversationId,
    message_id: latest?.id || null,
    rating: body.rating,
    knowledge_article_ids: knowledgeArticleIds,
    website_source_ids: websiteSourceIds,
    answer_confidence: latest?.confidence || null,
    metadata: { source_count: knowledgeArticleIds.length, website_source_count: websiteSourceIds.length },
  });
  if (body.rating === "unhelpful") {
    for (const articleId of knowledgeArticleIds) {
      const articles = await serviceSelect<Array<{ quality_score: number }>>(
        `knowledge_articles?id=eq.${articleId}&select=quality_score&limit=1`,
      ).catch(() => []);
      if (articles[0]) {
        await serviceUpdate("knowledge_articles", `id=eq.${articleId}`, {
          quality_score: Math.max(0, Number(articles[0].quality_score || 0.9) - 0.03),
        }).catch(() => undefined);
      }
    }
  }
  await serviceInsert("assistant_audit_logs", {
    actor_type: "customer",
    actor_reference: "website",
    action: "answer_feedback_recorded",
    subject_table: "assistant_conversations",
    subject_id: body.conversationId,
    metadata: { rating: body.rating },
  });
  return NextResponse.json({ ok: true });
}
