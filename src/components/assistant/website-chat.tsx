"use client";

import * as React from "react";
import { Bot, CalendarCheck, Calculator, MessageCircle, Send, UserRound, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatCopy = {
  title: string;
  subtitle: string;
  open: string;
  close: string;
  placeholder: string;
  send: string;
  automated: string;
  human: string;
  error: string;
  quickActions: readonly string[];
};

type Message = { id: string; role: "assistant" | "customer"; body: string; automated?: boolean };

function getSessionId() {
  const key = "dar-tahara-assistant-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
}

export function WebsiteChat({ locale, copy }: { locale: Locale; copy: ChatCopy }) {
  const [open, setOpen] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [unread, setUnread] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(() => [
    { id: "welcome", role: "assistant", automated: true, body: copy.subtitle },
  ]);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  async function ask(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setMessages((items) => [...items, { id: crypto.randomUUID(), role: "customer", body: message }]);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          locale,
          conversationId,
          sessionId: getSessionId(),
          websitePath: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error("assistant_failed");
      const data = (await res.json()) as { conversationId: string; answer: string };
      setConversationId(data.conversationId);
      setMessages((items) => [
        ...items,
        { id: crypto.randomUUID(), role: "assistant", automated: true, body: data.answer },
      ]);
      if (!open) setUnread(true);
    } catch {
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", automated: true, body: copy.error }]);
    } finally {
      setBusy(false);
    }
  }

  function openCalculator() {
    setOpen(false);
    const calculator = document.getElementById("calculator");
    if (calculator) {
      calculator.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.location.assign(`/${locale}#calculator`);
  }

  function openBooking() {
    setOpen(false);
    const calculator = document.getElementById("calculator");
    if (calculator) {
      window.dispatchEvent(new CustomEvent("dar-tahara:open-booking"));
      calculator.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.location.assign(`/${locale}?assistant=book-assessment#calculator`);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label={copy.title}
          className="flex h-[min(680px,calc(100dvh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-lift"
        >
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <Bot className="h-4 w-4" /> {copy.automated}
              </p>
              <h2 className="mt-1 font-serif text-xl">{copy.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label={copy.close}
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto bg-secondary/30 p-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={cn("flex gap-2", message.role === "customer" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" ? <Bot className="mt-1 h-5 w-5 shrink-0 text-primary" /> : null}
                <div
                  className={cn(
                    "max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "customer" ? "bg-primary text-primary-foreground" : "border border-border bg-card",
                  )}
                >
                  {message.body}
                  {message.automated ? <p className="mt-2 text-[11px] opacity-70">{copy.automated}</p> : null}
                </div>
                {message.role === "customer" ? <UserRound className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" /> : null}
              </article>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {copy.quickActions.slice(0, 4).map((action, index) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => (index === 1 ? openCalculator() : index === 3 ? openBooking() : ask(action))}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {index === 1 ? <Calculator className="mr-1 inline h-3.5 w-3.5" /> : null}
                  {index === 3 ? <CalendarCheck className="mr-1 inline h-3.5 w-3.5" /> : null}
                  {action}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={copy.placeholder}
                className="input min-w-0 flex-1"
                aria-label={copy.placeholder}
              />
              <button type="submit" disabled={busy || !input.trim()} className={buttonVariants({ variant: "primary", size: "md" })} aria-label={copy.send}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setUnread(false);
          }}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }), "relative rounded-full shadow-lift")}
          aria-label={copy.open}
        >
          <MessageCircle className="h-5 w-5" />
          {copy.open}
          {unread ? <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-card" /> : null}
        </button>
      )}
    </div>
  );
}
