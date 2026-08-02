import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceInsertIgnoreDuplicates, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { parseSupportAttachments, storeCustomerAttachments } from "@/lib/hospitality-support/attachments";
import { addCustomerReply, reopenConversation } from "@/lib/hospitality-support/client";
import { requireOwnedSupportRequest } from "@/lib/hospitality-support/repository";
import { safeIntegrationError, sha256 } from "@/lib/hospitality-support/security";
import { isPermanentlyClosed, statusAfterCustomerReply } from "@/lib/hospitality-support/status-mapper";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["applicant", "customer", "customer_company"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  const { id } = await context.params;
  let supportRequest;
  try {
    supportRequest = await requireOwnedSupportRequest(auth.context.customerId, id);
  } catch {
    return NextResponse.json({ error: "support_request_not_found" }, { status: 404 });
  }
  if (isPermanentlyClosed(supportRequest.status)) return NextResponse.json({ error: "support_request_closed" }, { status: 409 });
  if (!supportRequest.hospitality_support_conversation_id) return NextResponse.json({ error: "support_temporarily_unavailable" }, { status: 503 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const value = form.get("message");
  const message = typeof value === "string" ? value.trim().slice(0, 8_000) : "";
  const idempotencyKey = req.headers.get("idempotency-key") || String(form.get("idempotencyKey") || "");
  if (!message || !/^[a-zA-Z0-9_-]{8,200}$/.test(idempotencyKey)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  try {
    const attachments = await parseSupportAttachments(form);
    const prior = await serviceSelect<Array<{ id: string; status: string; hospitality_support_message_id: string | null }>>(
      `support_reply_submissions?support_request_id=eq.${encodeURIComponent(id)}&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=id,status,hospitality_support_message_id&limit=1`,
    );
    if (prior[0]?.status === "sent") return NextResponse.json({ ok: true, messageId: prior[0].hospitality_support_message_id });
    if (prior[0]?.status === "pending") return NextResponse.json({ ok: true, pending: true }, { status: 202 });
    let submissionId = prior[0]?.id;
    if (submissionId) {
      await serviceUpdate("support_reply_submissions", `id=eq.${submissionId}`, { status: "pending", error_code: null });
    } else {
      const inserted = await serviceInsertIgnoreDuplicates<Array<{ id: string }>>("support_reply_submissions", {
        support_request_id: id,
        customer_id: auth.context.customerId,
        idempotency_key: idempotencyKey,
        message_sha256: sha256(message),
        status: "pending",
      }, "support_request_id,idempotency_key");
      submissionId = inserted[0]?.id;
      if (!submissionId) return NextResponse.json({ ok: true, pending: true }, { status: 202 });
    }
    const customers = await serviceSelect<Array<{ email: string; full_name: string }>>(
      `customers?id=eq.${encodeURIComponent(auth.context.customerId)}&auth_user_id=eq.${encodeURIComponent(auth.context.user.id)}&select=email,full_name&limit=1`,
    );
    if (!customers[0]) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    if (supportRequest.status === "resolved") await reopenConversation(supportRequest.hospitality_support_conversation_id);
    const externalMessageId = await addCustomerReply({
      conversationId: supportRequest.hospitality_support_conversation_id,
      customerEmail: customers[0].email,
      customerName: customers[0].full_name,
      text: message,
      attachments: attachments.map((attachment) => attachment.input),
      reopen: supportRequest.status === "resolved",
    });
    const messageRows = await serviceInsert<Array<{ id: string }>>("support_messages", {
      support_request_id: id,
      customer_id: auth.context.customerId,
      hospitality_support_message_id: externalMessageId,
      entry_type: "customer",
      visibility: "customer",
      sender_name: customers[0].full_name,
      sender_role: "Customer",
      body: message,
      attachment_metadata: attachments.map((attachment) => ({ fileName: attachment.safeName, mimeType: attachment.file.type, size: attachment.file.size })),
      created_at: new Date().toISOString(),
    });
    await storeCustomerAttachments({
      authUserId: auth.context.user.id,
      customerId: auth.context.customerId,
      supportRequestId: id,
      supportMessageId: messageRows[0]?.id,
      attachments,
    });
    await Promise.all([
      serviceUpdate("support_reply_submissions", `id=eq.${submissionId}`, { status: "sent", hospitality_support_message_id: externalMessageId }),
      serviceUpdate("support_requests", `id=eq.${id}`, {
        status: statusAfterCustomerReply(),
        status_internal: "active",
        last_message_at: new Date().toISOString(),
        last_customer_message_at: new Date().toISOString(),
        latest_sender: "customer",
        customer_unread_count: 0,
        integration_status: "synced",
        resolved_at: null,
      }),
      serviceUpdate("support_notifications", `support_request_id=eq.${id}&read_at=is.null`, { delivery_status: "read", read_at: new Date().toISOString() }),
      serviceInsert("audit_logs", {
        actor_user_id: auth.context.user.id,
        action: supportRequest.status === "resolved" ? "support_request_reopened" : "customer_support_reply_submitted",
        resource_type: "support_request",
        resource_id: id,
        new_value: { message_id: externalMessageId, attachment_count: attachments.length, content_logged: false },
      }),
    ]);
    return NextResponse.json({ ok: true, messageId: externalMessageId }, { status: 201 });
  } catch (error) {
    const errorCode = safeIntegrationError(error);
    await serviceUpdate("support_reply_submissions", `support_request_id=eq.${id}&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`, {
      status: "failed",
      error_code: errorCode,
    }).catch(() => undefined);
    await serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "hospitality_support_integration_failed",
      resource_type: "support_request",
      resource_id: id,
      new_value: { error_code: errorCode, operation: "reply", content_logged: false },
    }).catch(() => undefined);
    return NextResponse.json({ error: "support_reply_failed" }, { status: 502 });
  }
}
