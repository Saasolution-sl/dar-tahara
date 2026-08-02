"use client";

import * as React from "react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ReasonCategory = "construction" | "major_renovation" | "property_damage" | "inaccessible" | "other";
const REASONS: ReasonCategory[] = ["construction", "major_renovation", "property_damage", "inaccessible", "other"];

export function PauseRequestButton({ copy, subscriptionId }: { copy: PortalCopy["pause"]; subscriptionId: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonVariants({ variant: "outline", size: "sm" })}>{copy.requestButton}</button>
      {open ? (
        <PauseRequestModal
          copy={copy}
          subscriptionId={subscriptionId}
          onClose={() => setOpen(false)}
          onSubmitted={() => { setTimeout(() => location.reload(), 1200); }}
        />
      ) : null}
    </>
  );
}

export function PauseRequestModal({
  copy, subscriptionId, onClose, onSubmitted,
}: {
  copy: PortalCopy["pause"];
  subscriptionId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reasonCategory, setReasonCategory] = React.useState<ReasonCategory | "">("");
  const [reasonDescription, setReasonDescription] = React.useState("");
  const [requestedStartDate, setRequestedStartDate] = React.useState("");
  const [requestedEndDate, setRequestedEndDate] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = React.useState("");

  React.useEffect(() => { track("pause_request_started"); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/account/pause-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, reasonCategory, reasonDescription, requestedStartDate, requestedEndDate }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
    if (!res.ok || !data.id) {
      setError(copy.errors[data.error || ""] || copy.errors.bad_request);
      setStatus("idle");
      return;
    }
    if (file) {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (userId) {
          const path = `${userId}/${data.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage.from("pause-request-attachments").upload(path, file);
          if (!uploadError) {
            const { data: customer } = await supabase.from("customers").select("id").eq("auth_user_id", userId).maybeSingle();
            if (customer) {
              await supabase.from("pause_request_attachments").insert({
                pause_request_id: data.id, customer_id: customer.id, uploaded_by: userId,
                storage_path: path, original_filename: file.name, mime_type: file.type, size_bytes: file.size,
              });
            }
          }
        }
      } catch {
        // The pause request itself already succeeded; a failed attachment upload is not fatal.
      }
    }
    track("pause_request_submitted");
    setStatus("done");
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={copy.modalTitle}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{copy.modalTitle}</h2>
          <button onClick={onClose} aria-label={copy.cancel} className="text-muted-foreground hover:text-foreground">×</button>
        </div>
        {status === "done" ? (
          <p className="mt-6 text-sm">{copy.success}</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <fieldset>
              <legend className="text-sm font-medium">{copy.reasonLabel}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {REASONS.map((reason) => (
                  <label key={reason} className={cn("cursor-pointer rounded-xl border border-border p-3 text-sm", reasonCategory === reason && "border-primary bg-primary/5")}>
                    <input type="radio" name="reasonCategory" value={reason} checked={reasonCategory === reason} onChange={() => setReasonCategory(reason)} className="sr-only" required />
                    {copy.reasons[reason]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              {copy.descriptionLabel}
              <textarea value={reasonDescription} onChange={(e) => setReasonDescription(e.target.value)} required maxLength={2000} rows={4} className="input mt-2 h-auto py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                {copy.startLabel}
                <input type="date" value={requestedStartDate} onChange={(e) => setRequestedStartDate(e.target.value)} required className="input mt-2" />
              </label>
              <label className="block text-sm">
                {copy.endLabel}
                <input type="date" value={requestedEndDate} onChange={(e) => setRequestedEndDate(e.target.value)} required className="input mt-2" />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">{copy.maxMonthsNote}</p>
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className={buttonVariants({ variant: "outline", size: "md" })}>{copy.cancel}</button>
              <button type="submit" disabled={status === "submitting"} className={buttonVariants({ variant: "primary", size: "md" })}>{status === "submitting" ? copy.submitting : copy.submit}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
