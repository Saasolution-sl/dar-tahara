import "server-only";

import { randomUUID } from "node:crypto";
import { putObject } from "@/lib/cubbit/client";
import { serviceInsert } from "@/lib/supabase-rpc";
import {
  MAX_SUPPORT_ATTACHMENTS,
  safeAttachmentFilename,
  validateAttachment,
} from "./security";
import type { SupportAttachmentInput } from "./types";

export type ParsedSupportAttachment = {
  file: File;
  input: SupportAttachmentInput;
  safeName: string;
};

export async function parseSupportAttachments(formData: FormData): Promise<ParsedSupportAttachment[]> {
  const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_SUPPORT_ATTACHMENTS) throw new Error("too_many_attachments");
  return await Promise.all(files.map(async (file) => {
    const error = validateAttachment(file);
    if (error) throw new Error(error);
    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
      file,
      safeName: safeAttachmentFilename(file.name),
      input: {
        fileName: safeAttachmentFilename(file.name),
        mimeType: file.type,
        size: file.size,
        data: Buffer.from(bytes).toString("base64"),
      },
    };
  }));
}

export async function storeCustomerAttachments(input: {
  authUserId: string;
  customerId: string;
  supportRequestId: string;
  supportMessageId?: string | null;
  attachments: ParsedSupportAttachment[];
}): Promise<void> {
  if (!input.attachments.length) return;
  for (const attachment of input.attachments) {
    const storagePath = `support-attachments/${input.authUserId}/${input.supportRequestId}/${randomUUID()}-${attachment.safeName}`;
    try {
      await putObject(storagePath, Buffer.from(await attachment.file.arrayBuffer()), attachment.file.type);
    } catch {
      throw new Error("support_attachment_upload_failed");
    }
    await serviceInsert("support_attachments", {
      support_request_id: input.supportRequestId,
      support_message_id: input.supportMessageId || null,
      customer_id: input.customerId,
      storage_path: storagePath,
      storage_provider: "cubbit",
      original_filename: attachment.file.name,
      safe_filename: attachment.safeName,
      mime_type: attachment.file.type,
      size_bytes: attachment.file.size,
      visibility: "customer",
    });
  }
}
