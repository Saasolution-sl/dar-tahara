"use client";

import * as React from "react";
import { BookOpenCheck, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { KnowledgeBuilderClient } from "./knowledge-builder-client";

type AssistantMessage = { id: number; role: string; body: string; created_at: string; confidence?: number | null; intent?: string | null };
type Conversation = {
  id: string;
  channel: string;
  status: string;
  language: string;
  customer_name?: string | null;
  contact_handle?: string | null;
  last_intent?: string | null;
  handoff_reason?: string | null;
  last_message_at?: string | null;
  assistant_messages?: AssistantMessage[];
  source?: string;
  contact_id?: string;
  contact_blocked?: boolean;
  escalation?: { id?: string; status?: string; severity?: string; freescout_ticket_number?: string | null; last_error?: string | null };
};

export function AssistantAdminClient() {
  const [rows, setRows] = React.useState<Conversation[]>([]);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [knowledgeMode, setKnowledgeMode] = React.useState(false);

  async function load() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/assistant", { cache: "no-store" });
    if (!res.ok) setError(res.status === 401 ? "Sign in through the main operations portal first." : "Assistant admin data is not configured yet.");
    else setRows(await res.json());
    setBusy(false);
  }

  React.useEffect(() => {
    load();
  }, []);

  async function action(row: Conversation, name: string) {
    const note = name === "note" ? window.prompt("Internal note") || "" : "";
    const res = await fetch("/api/admin/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        action: name,
        note,
        source: row.source,
        contactId: row.contact_id,
        escalationId: row.escalation?.id,
      }),
    });
    if (!res.ok) setError((await res.json()).error || "Action failed");
    await load();
  }

  const filtered = rows.filter((row) => {
    const haystack = `${row.customer_name || ""} ${row.contact_handle || ""} ${row.last_intent || ""} ${row.handoff_reason || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "all" || row.status === status || row.escalation?.status === status);
  });

  if (knowledgeMode) return (
    <main className="min-h-screen bg-secondary/30 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => setKnowledgeMode(false)} className={buttonVariants({ variant: "outline", size: "sm" })}>← Conversation queue</button>
        <div className="mt-6"><KnowledgeBuilderClient /></div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-secondary/30 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-accent">
              <ShieldCheck className="h-4 w-4" /> Private operations
            </p>
            <h1 className="mt-2 font-serif text-4xl">Assistant conversations</h1>
            <p className="mt-1 text-sm text-muted-foreground">Website chat and WhatsApp conversations share one queue.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setKnowledgeMode(true)} className={buttonVariants({ variant: "primary", size: "md" })}><BookOpenCheck className="h-4 w-4" /> Knowledge Builder</button>
            <button onClick={load} disabled={busy} className={buttonVariants({ variant: "outline", size: "md" })}><RefreshCw className="h-4 w-4" /> Refresh</button>
          </div>
        </header>
        {error ? <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" className="min-w-64 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="awaiting_email">Awaiting email</option>
            <option value="escalated">Escalated</option>
            <option value="retry_pending">Failed / retry pending</option>
            <option value="closed">Closed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="mt-6 space-y-4">
          {filtered.map((row) => (
            <article key={row.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[.16em] text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /> {row.channel} · {row.language}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl">{row.customer_name || row.contact_handle || "Unknown customer"}</h2>
                  <p className="text-sm text-muted-foreground">{row.last_intent || "No intent"} · {row.handoff_reason || row.status}</p>
                  {row.escalation ? <p className="mt-1 text-xs text-muted-foreground">Support request {row.escalation.freescout_ticket_number || "pending"} · {row.escalation.status} · {row.escalation.severity}</p> : null}
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{row.status}</span>
              </div>
              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-xl bg-secondary/40 p-4">
                {(row.assistant_messages || []).slice(-8).map((message) => (
                  <div key={message.id} className="text-sm">
                    <span className="font-semibold">{message.role}</span>
                    {message.intent ? <span className="text-muted-foreground"> · {message.intent}</span> : null}
                    <p className="mt-1 whitespace-pre-line">{message.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.source === "whatsapp_support" ? (
                  <>
                    {row.escalation?.status === "retry_pending" ? <button onClick={() => action(row, "retry")} className={buttonVariants({ variant: "primary", size: "sm" })}>Retry support request</button> : null}
                    <button onClick={() => action(row, row.contact_blocked ? "unblock" : "block")} className={buttonVariants({ variant: "outline", size: "sm" })}>{row.contact_blocked ? "Unblock" : "Block 24h"}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => action(row, "takeover")} className={buttonVariants({ variant: "primary", size: "sm" })}>Take over</button>
                    <button onClick={() => action(row, "note")} className={buttonVariants({ variant: "outline", size: "sm" })}>Add note</button>
                    <button onClick={() => action(row, "reopen")} className={buttonVariants({ variant: "outline", size: "sm" })}>Return to automation</button>
                  </>
                )}
                <button onClick={() => action(row, "close")} className={buttonVariants({ variant: "ghost", size: "sm" })}>Close</button>
              </div>
            </article>
          ))}
          {!rows.length && !error ? <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No assistant conversations yet.</div> : null}
        </div>
      </div>
    </main>
  );
}
