import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import {
  serviceInsert,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { parseSupportAttachments, storeCustomerAttachments } from "@/lib/hospitality-support/attachments";
import { createSupportConversation, hospitalitySupportConfigured } from "@/lib/hospitality-support/client";
import { validateRelatedOwnership } from "@/lib/hospitality-support/repository";
import { safeIntegrationError } from "@/lib/hospitality-support/security";
import { syncConversation } from "@/lib/hospitality-support/sync";
import { SUPPORT_CATEGORIES, type SupportCategory, type SupportRequestRow } from "@/lib/hospitality-support/types";

type CustomerRow = {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone: string;
  preferred_language: string;
};

function field(form: FormData, name: string, max: number): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalId(form: FormData, name: string): string | null {
  const value = field(form, name, 100);
  return /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value) ? value : null;
}

export async function GET() {
  const auth = await authorizeApi(["applicant", "customer", "customer_company"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  const rows = await serviceSelect<SupportRequestRow[]>(
    `support_requests?customer_id=eq.${encodeURIComponent(auth.context.customerId)}&select=*&order=last_message_at.desc.nullslast,created_at.desc`,
  );
  return NextResponse.json({ requests: rows });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["applicant", "customer", "customer_company"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const customerId = auth.context.customerId;
  if (!customerId) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  if (!hospitalitySupportConfigured()) return NextResponse.json({ error: "support_temporarily_unavailable" }, { status: 503 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const subject = field(form, "subject", 160);
  const description = field(form, "description", 8_000);
  const categoryValue = field(form, "category", 50);
  const idempotencyKey = req.headers.get("idempotency-key") || field(form, "idempotencyKey", 200);
  if (!subject || !description || !SUPPORT_CATEGORIES.includes(categoryValue as SupportCategory)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_-]{8,200}$/.test(idempotencyKey)) {
    return NextResponse.json({ error: "invalid_idempotency_key" }, { status: 400 });
  }

  try {
    const attachments = await parseSupportAttachments(form);
    const customers = await serviceSelect<CustomerRow[]>(
      `customers?id=eq.${encodeURIComponent(customerId)}&auth_user_id=eq.${encodeURIComponent(auth.context.user.id)}&select=id,auth_user_id,email,full_name,phone,preferred_language&limit=1`,
    );
    const customer = customers[0];
    if (!customer) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    const relatedInput = {
      propertyId: optionalId(form, "relatedPropertyId"),
      subscriptionId: optionalId(form, "relatedSubscriptionId"),
      invoiceId: optionalId(form, "relatedInvoiceId"),
      appointmentId: optionalId(form, "relatedAppointmentId"),
      paymentId: optionalId(form, "relatedPaymentId"),
    };
    const relatedContext = await validateRelatedOwnership(customerId, relatedInput);
    const existing = await serviceSelect<SupportRequestRow[]>(
      `support_requests?customer_id=eq.${encodeURIComponent(customerId)}&creation_idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=*&limit=1`,
    );
    let supportRequest = existing[0];
    if (supportRequest?.hospitality_support_conversation_id) {
      return NextResponse.json({ ok: true, requestId: supportRequest.id, publicReference: supportRequest.public_reference }, { status: 200 });
    }
    if (!supportRequest) {
      const id = randomUUID();
      const externalReference = `DT-SUPPORT-${customerId}-${id}`;
      const inserted = await serviceInsert<SupportRequestRow[]>("support_requests", {
        id,
        customer_id: customerId,
        external_reference: externalReference,
        subject,
        message: description,
        category: categoryValue,
        status: "waiting_support",
        status_internal: "creating",
        related_property_id: relatedInput.propertyId,
        related_subscription_id: relatedInput.subscriptionId,
        related_invoice_id: relatedInput.invoiceId,
        related_appointment_id: relatedInput.appointmentId,
        related_payment_id: relatedInput.paymentId,
        preferred_contact_method: field(form, "preferredContactMethod", 50) || null,
        contact_phone: field(form, "phone", 40) || customer.phone || null,
        latest_sender: "customer",
        last_message_at: new Date().toISOString(),
        last_customer_message_at: new Date().toISOString(),
        integration_status: "pending",
        creation_idempotency_key: idempotencyKey,
      });
      supportRequest = inserted[0];
    }
    if (!supportRequest) throw new Error("support_request_insert_failed");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_BASE_URL || req.nextUrl.origin;
    const created = await createSupportConversation({
      subject,
      description,
      customerName: customer.full_name,
      customerEmail: customer.email,
      customerAccountId: customer.id,
      customerReference: customer.id,
      category: categoryValue as SupportCategory,
      preferredLanguage: customer.preferred_language,
      preferredContactMethod: supportRequest.preferred_contact_method,
      phone: supportRequest.contact_phone,
      externalReference: supportRequest.external_reference,
      publicReference: supportRequest.public_reference,
      portalUrl: new URL(`/account/support/${supportRequest.id}`, siteUrl).toString(),
      relatedContext,
      attachments: attachments.map((attachment) => attachment.input),
    });
    const updatedRows = await serviceUpdate<SupportRequestRow[]>("support_requests", `id=eq.${supportRequest.id}`, {
      hospitality_support_conversation_id: created.conversationId,
      hospitality_support_ticket_number: created.ticketNumber,
      hospitality_support_customer_id: created.customerId,
      status_internal: "active",
      status: "waiting_support",
      integration_status: "synced",
    });
    supportRequest = updatedRows[0] || { ...supportRequest, hospitality_support_conversation_id: created.conversationId };
    await syncConversation(supportRequest).catch(() => undefined);
    await storeCustomerAttachments({
      authUserId: auth.context.user.id,
      customerId,
      supportRequestId: supportRequest.id,
      attachments,
    });
    await serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "support_request_created",
      resource_type: "support_request",
      resource_id: supportRequest.id,
      new_value: { public_reference: supportRequest.public_reference, category: categoryValue, attachment_count: attachments.length, content_logged: false },
    });
    return NextResponse.json({ ok: true, requestId: supportRequest.id, publicReference: supportRequest.public_reference }, { status: 201 });
  } catch (error) {
    const code = safeIntegrationError(error);
    const rows = await serviceSelect<SupportRequestRow[]>(
      `support_requests?customer_id=eq.${encodeURIComponent(customerId)}&creation_idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=id&limit=1`,
    ).catch(() => []);
    if (rows[0]) {
      await serviceUpdate("support_requests", `id=eq.${rows[0].id}`, { integration_status: "failed" }).catch(() => undefined);
      await serviceInsert("audit_logs", {
        actor_user_id: auth.context.user.id,
        action: "hospitality_support_integration_failed",
        resource_type: "support_request",
        resource_id: rows[0].id,
        new_value: { error_code: code, operation: "create", content_logged: false },
      }).catch(() => undefined);
    }
    return NextResponse.json({ error: code.startsWith("related_") ? code : "support_submission_failed" }, { status: code.startsWith("related_") ? 403 : 502 });
  }
}
