export const SUPPORT_CATEGORIES = [
  "cleaning_service",
  "subscription",
  "appointment",
  "invoice",
  "payment",
  "key_management",
  "smart_lock",
  "property_details",
  "employee_feedback",
  "damage_missing_item",
  "complaint",
  "technical_issue",
  "account_access",
  "other",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];
export type CustomerSupportStatus =
  | "open"
  | "waiting_support"
  | "waiting_customer"
  | "in_progress"
  | "resolved"
  | "closed";

export type SupportAttachmentInput = {
  fileName: string;
  mimeType: string;
  data: string;
  size: number;
};

export type CreateConversationInput = {
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerAccountId: string;
  customerReference: string;
  category: SupportCategory;
  preferredLanguage: string;
  preferredContactMethod?: string | null;
  phone?: string | null;
  externalReference: string;
  publicReference: string;
  portalUrl: string;
  relatedContext: Record<string, string | null | undefined>;
  attachments: SupportAttachmentInput[];
};

export type AddCustomerReplyInput = {
  conversationId: string;
  customerEmail: string;
  customerName: string;
  text: string;
  attachments: SupportAttachmentInput[];
  reopen: boolean;
};

export type HospitalityAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url?: string;
};

export type HospitalityThread = {
  id: string;
  type: "customer" | "support" | "system" | "call";
  body: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  attachments: HospitalityAttachment[];
  callMetadata?: Record<string, unknown>;
};

export type HospitalityConversation = {
  id: string;
  number: string | null;
  customerId: string | null;
  subject: string;
  status: string;
  mailboxName: string | null;
  assigneeName: string | null;
  updatedAt: string;
  createdAt: string;
  tags: string[];
  threads: HospitalityThread[];
};

export type CreatedConversation = {
  conversationId: string;
  ticketNumber: string | null;
  customerId: string | null;
};

export type SupportRequestRow = {
  id: string;
  customer_id: string;
  public_reference: string;
  external_reference: string;
  hospitality_support_conversation_id: string | null;
  hospitality_support_customer_id: string | null;
  hospitality_support_ticket_number: string | null;
  subject: string;
  message: string;
  category: SupportCategory;
  status: CustomerSupportStatus;
  status_internal: string;
  priority: string | null;
  related_property_id: string | null;
  related_subscription_id: string | null;
  related_invoice_id: string | null;
  related_appointment_id: string | null;
  related_payment_id: string | null;
  assigned_department: string | null;
  preferred_contact_method: string | null;
  contact_phone: string | null;
  next_expected_action: string | null;
  resolution_summary: string | null;
  last_message_at: string | null;
  last_customer_message_at: string | null;
  last_support_message_at: string | null;
  customer_unread_count: number;
  latest_sender: "customer" | "support" | "system" | "call" | null;
  integration_status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
};
