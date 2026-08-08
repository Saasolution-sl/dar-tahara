"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Clock3, MessageCircle, Paperclip, Phone, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { SupportCopy } from "@/i18n/support-copy";
import { relatedFieldsForCategory } from "@/lib/hospitality-support/support-relations";
import type { CustomerSupportStatus, SupportCategory, SupportRequestRow } from "@/lib/hospitality-support/types";
import { SUPPORT_CATEGORIES } from "@/lib/hospitality-support/types";
import { cn } from "@/lib/utils";

type Option = { id: string; label: string };
type RelatedOptions = { properties: Option[]; subscriptions: Option[]; invoices: Option[]; appointments: Option[]; payments: Option[] };
type OverviewRequest = SupportRequestRow & { relatedLabel?: string | null };

function upload(url: string, formData: FormData, idempotencyKey: string, onProgress: (value: number) => void): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Idempotency-Key", idempotencyKey);
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(xhr.responseText || "{}"); } catch { /* safe generic error */ }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => resolve({ ok: false, status: 0, data: {} });
    xhr.send(formData);
  });
}

function StatusPill({ status, copy }: { status: CustomerSupportStatus; copy: SupportCopy }) {
  const tones: Record<CustomerSupportStatus, string> = {
    open:"bg-sky-100 text-sky-800", waiting_support:"bg-amber-100 text-amber-900", waiting_customer:"bg-violet-100 text-violet-900",
    in_progress:"bg-blue-100 text-blue-900", resolved:"bg-emerald-100 text-emerald-900", closed:"bg-slate-200 text-slate-700",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones[status])}>{copy.statusLabels[status]}</span>;
}

function dateTime(value: string | null, locale: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(locale, { dateStyle:"medium", timeStyle:"short" }).format(new Date(value));
}

function RelatedSelect({ name, label, options }: { name: string; label: string; options: Option[] }) {
  if (!options.length) return null;
  return <label className="block text-sm font-medium">{label}<select name={name} className="input mt-2"><option value="">Select</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>;
}

export function SupportOverview({ initialRequests, related, copy, locale, openNew = false }: { initialRequests: OverviewRequest[]; related: RelatedOptions; copy: SupportCopy; locale: string; openNew?: boolean }) {
  const [showForm, setShowForm] = React.useState(openNew);
  const [filter, setFilter] = React.useState("all");
  const [sort, setSort] = React.useState("latest");
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState("");
  const [category, setCategory] = React.useState<SupportCategory | "">("");
  const [idempotencyKey, setIdempotencyKey] = React.useState(() => crypto.randomUUID());
  const relatedFields = relatedFieldsForCategory(category);

  const requests = React.useMemo(() => {
    const matches = initialRequests.filter((request) => {
      if (filter === "all") return true;
      if (filter === "open") return ["open","waiting_support","in_progress"].includes(request.status);
      return request.status === filter;
    });
    return matches.sort((a, b) => {
      if (sort === "created") return b.created_at.localeCompare(a.created_at);
      const left = a.last_message_at || a.updated_at || a.created_at;
      const right = b.last_message_at || b.updated_at || b.created_at;
      return sort === "oldest" ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [filter, initialRequests, sort]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const files = data.getAll("attachments").filter((value) => value instanceof File && value.size > 0) as File[];
    if (files.length > 5 || files.some((file) => file.size > 10 * 1024 * 1024)) { setError(copy.attachmentError); return; }
    setBusy(true); setError(""); setProgress(0);
    const result = await upload("/api/account/support", data, idempotencyKey, setProgress);
    if (result.ok && typeof result.data.requestId === "string") {
      setIdempotencyKey(crypto.randomUUID());
      location.assign(`/account/support/${result.data.requestId}`);
      return;
    }
    setError(result.data.error === "attachment_type" || result.data.error === "attachment_size" ? copy.attachmentError : result.status === 503 ? copy.unavailable : copy.createFailed);
    setBusy(false);
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-serif text-4xl">{copy.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.intro}</p></div><button type="button" onClick={() => setShowForm(true)} className={cn(buttonVariants({variant:"primary",size:"md"}),"shrink-0")}><Plus className="mr-2 h-4 w-4"/>{copy.newRequest}</button></div>
    {showForm ? <section className="rounded-2xl border border-border bg-card p-5 shadow-soft"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">{copy.newRequest}</h2><button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground">{copy.cancel}</button></div><form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="block text-sm font-medium md:col-span-2">{copy.subject}<input name="subject" required maxLength={160} className="input mt-2"/></label>
      <label className="block text-sm font-medium">{copy.category}<select name="category" required value={category} onChange={(event) => setCategory(event.target.value as SupportCategory)} className="input mt-2"><option value="" disabled>Select</option>{SUPPORT_CATEGORIES.map((categoryOption) => <option key={categoryOption} value={categoryOption}>{copy.categoryLabels[categoryOption]}</option>)}</select></label>
      <label className="block text-sm font-medium">{copy.contactMethod} <span className="font-normal text-muted-foreground">({copy.optional})</span><select name="preferredContactMethod" className="input mt-2"><option value="">Select</option>{Object.entries(copy.contactMethods).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-sm font-medium md:col-span-2">{copy.description}<textarea name="description" required maxLength={8000} rows={7} className="input mt-2 h-auto py-3" placeholder={copy.descriptionHint}/></label>
      {relatedFields.includes("property") ? <RelatedSelect name="relatedPropertyId" label={copy.property} options={related.properties}/> : null}
      {relatedFields.includes("subscription") ? <RelatedSelect name="relatedSubscriptionId" label={copy.subscription} options={related.subscriptions}/> : null}
      {relatedFields.includes("invoice") ? <RelatedSelect name="relatedInvoiceId" label={copy.invoice} options={related.invoices}/> : null}
      {relatedFields.includes("appointment") ? <RelatedSelect name="relatedAppointmentId" label={copy.appointment} options={related.appointments}/> : null}
      {relatedFields.includes("payment") ? <RelatedSelect name="relatedPaymentId" label={copy.payment} options={related.payments}/> : null}
      <label className="block text-sm font-medium">{copy.phone} <span className="font-normal text-muted-foreground">({copy.optional})</span><input name="phone" type="tel" className="input mt-2"/></label>
      <label className="block text-sm font-medium md:col-span-2">{copy.attachments} <span className="font-normal text-muted-foreground">({copy.optional})</span><input name="attachments" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,video/mp4" className="mt-2 block w-full rounded-xl border border-border bg-background p-3 text-sm"/><span className="mt-2 block text-xs text-muted-foreground">{copy.attachmentError}</span></label>
      <div className="md:col-span-2"><button disabled={busy} className={buttonVariants({variant:"primary",size:"md"})}>{busy ? (progress ? copy.uploading.replace("{progress}",String(progress)) : copy.submitting) : copy.submit}</button>{error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}</div>
    </form></section> : null}
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"><label className="text-sm font-medium">{copy.filterLabel}<select value={filter} onChange={(event) => setFilter(event.target.value)} className="input ml-2 w-auto"><option value="all">{copy.all}</option><option value="open">{copy.statusLabels.open}</option><option value="waiting_customer">{copy.statusLabels.waiting_customer}</option><option value="resolved">{copy.statusLabels.resolved}</option><option value="closed">{copy.statusLabels.closed}</option></select></label><label className="text-sm font-medium sm:ml-auto">{copy.sortLabel}<select value={sort} onChange={(event) => setSort(event.target.value)} className="input ml-2 w-auto"><option value="latest">{copy.latest}</option><option value="oldest">{copy.oldest}</option><option value="created">{copy.createdSort}</option></select></label></div>
    {requests.length ? <div className="grid gap-4">{requests.map((request) => <Link key={request.id} href={`/account/support/${request.id}`} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold tracking-wide text-primary">{request.public_reference}</span>{request.customer_unread_count ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{request.customer_unread_count} {copy.unread}</span> : null}</div><h2 className="mt-2 font-serif text-xl group-hover:text-primary">{request.subject}</h2>{request.relatedLabel ? <p className="mt-1 text-sm text-muted-foreground">{request.relatedLabel}</p> : null}</div><StatusPill status={request.status} copy={copy}/></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5"/>{copy.updatedLabel}: {dateTime(request.last_message_at || request.updated_at,locale)}</span><span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5"/>{request.latest_sender === "support" ? copy.latestFromSupport : copy.latestFromCustomer}</span>{request.assigned_department ? <span>{request.assigned_department}</span> : null}</div></Link>)}</div> : <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><MessageCircle className="mx-auto h-9 w-9 text-primary"/><h2 className="mt-4 font-serif text-2xl">{copy.emptyTitle}</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{copy.emptyBody}</p><button type="button" onClick={() => setShowForm(true)} className={cn(buttonVariants({variant:"primary",size:"md"}),"mt-5")}>{copy.newRequest}</button></section>}
  </div>;
}

type MessageRow = { id:string; entry_type:"customer"|"support"|"system"|"call"; sender_name:string|null; sender_role:string|null; body:string; created_at:string };
type AttachmentRow = { id:string; support_message_id:string|null; safe_filename:string; mime_type:string; size_bytes:number };

export function SupportConversation({ request, messages, attachments, copy, locale }: { request: SupportRequestRow; messages: MessageRow[]; attachments: AttachmentRow[]; copy: SupportCopy; locale: string }) {
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState("");
  const [idempotencyKey, setIdempotencyKey] = React.useState(() => crypto.randomUUID());
  React.useEffect(() => { if (request.customer_unread_count) fetch(`/api/account/support/${request.id}/read`, { method:"POST" }).catch(() => undefined); }, [request.customer_unread_count, request.id]);

  async function reply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError(""); setProgress(0);
    const result = await upload(`/api/account/support/${request.id}/reply`, data, idempotencyKey, setProgress);
    if (result.ok) { setIdempotencyKey(crypto.randomUUID()); form.reset(); location.reload(); return; }
    setError(result.data.error === "attachment_type" || result.data.error === "attachment_size" ? copy.attachmentError : copy.replyFailed);
    setBusy(false);
  }

  return <div className="space-y-6"><Link href="/account/support" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4"/>{copy.back}</Link><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-primary">{request.public_reference}</p><h1 className="mt-1 font-serif text-4xl">{request.subject}</h1></div><StatusPill status={request.status} copy={copy}/></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-2xl border border-border bg-card p-5 shadow-soft"><h2 className="font-serif text-2xl">{copy.conversation}</h2><div className="mt-5 space-y-4">{messages.map((message) => { const own=message.entry_type==="customer"; const call=message.entry_type==="call"; const system=message.entry_type==="system"; const files=attachments.filter((item) => item.support_message_id===message.id); return <article key={message.id} className={cn("rounded-2xl p-4",own?"ml-4 bg-primary/10 sm:ml-16":call?"border border-amber-200 bg-amber-50":system?"border border-dashed border-border bg-secondary/40":"mr-4 bg-secondary/70 sm:mr-16")}><div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="inline-flex items-center gap-1.5 font-semibold">{call?<Phone className="h-3.5 w-3.5"/>:null}{call?copy.callRecord:system?copy.systemEvent:own?copy.customerRole:copy.supportRole}</span><time className="text-muted-foreground">{dateTime(message.created_at,locale)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.body}</p>{files.length?<div className="mt-3 flex flex-wrap gap-2">{files.map((file)=><a key={file.id} href={`/api/account/support/${request.id}/attachments/${file.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-primary hover:underline"><Paperclip className="h-3.5 w-3.5"/>{file.safe_filename}</a>)}</div>:null}</article>; })}</div>
      {request.status === "closed" ? <div className="mt-6 rounded-xl bg-secondary p-4 text-sm"><p>{copy.closedExplanation}</p><Link href={`/account/support?new=1&followUp=${encodeURIComponent(request.public_reference)}`} className={cn(buttonVariants({variant:"primary",size:"sm"}),"mt-3")}>{copy.createFollowUp}</Link></div> : <form onSubmit={reply} className="mt-6 border-t border-border pt-5"><label className="block text-sm font-medium">{copy.reply}<textarea name="message" required maxLength={8000} rows={5} className="input mt-2 h-auto py-3" placeholder={copy.replyPlaceholder}/></label><label className="mt-3 block text-sm font-medium">{copy.attachments} <span className="font-normal text-muted-foreground">({copy.optional})</span><input name="attachments" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,video/mp4" className="mt-2 block w-full rounded-xl border border-border bg-background p-3 text-sm"/></label><button disabled={busy} className={cn(buttonVariants({variant:"primary",size:"md"}),"mt-4")}>{busy?(progress?copy.uploading.replace("{progress}",String(progress)):copy.submitting):copy.sendReply}</button>{error?<p role="alert" className="mt-3 text-sm text-destructive">{error}</p>:null}</form>}
    </section><aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-soft"><h2 className="font-serif text-xl">{copy.information}</h2><dl className="mt-4 space-y-4 text-sm"><Info label={copy.reference} value={request.public_reference}/><Info label={copy.createdLabel} value={dateTime(request.created_at,locale)}/><Info label={copy.updatedLabel} value={dateTime(request.last_message_at||request.updated_at,locale)}/><Info label={copy.department} value={request.assigned_department||copy.none}/><Info label={copy.priority} value={request.priority ? copy.priorityLabels[request.priority as keyof typeof copy.priorityLabels] || copy.none : copy.none}/><Info label={copy.contactMethod} value={request.preferred_contact_method ? copy.contactMethods[request.preferred_contact_method as keyof typeof copy.contactMethods] || copy.none : copy.none}/><Info label={copy.nextAction} value={request.next_expected_action||copy.statusLabels[request.status]}/>{request.resolution_summary?<Info label={copy.resolution} value={request.resolution_summary}/>:null}</dl></aside></div></div>;
}

function Info({ label, value }: { label:string; value:string }) { return <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 leading-5">{value}</dd></div>; }
