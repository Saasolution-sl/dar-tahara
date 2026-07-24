"use client";

import * as React from "react";
import { Bot, MessageCircle, Send, ThumbsDown, ThumbsUp, UserRound, X } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button";
import {
  clearSelectedAssistantLanguage,
  readSelectedAssistantLanguage,
} from "@/lib/assistant/client-language";
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
};

type Message = { id: string; role: "assistant" | "customer"; body: string; automated?: boolean };
type Suggestion = { id: string; label: string; value: string; intent: string };
type Escalation = { required: boolean; reason: string | null; nextAction: string };

const FEEDBACK_LABELS: Record<Locale, { helpful: string; unhelpful: string; thanks: string }> = {
  en: { helpful: "Helpful", unhelpful: "Not helpful", thanks: "Thank you for your feedback" },
  nl: { helpful: "Nuttig", unhelpful: "Niet nuttig", thanks: "Bedankt voor uw feedback" },
  fr: { helpful: "Utile", unhelpful: "Pas utile", thanks: "Merci pour votre avis" },
  es: { helpful: "Útil", unhelpful: "No útil", thanks: "Gracias por su opinión" },
  de: { helpful: "Hilfreich", unhelpful: "Nicht hilfreich", thanks: "Danke für Ihr Feedback" },
  pt: { helpful: "Útil", unhelpful: "Não útil", thanks: "Obrigado pelo seu comentário" },
  ar: { helpful: "مفيد", unhelpful: "غير مفيد", thanks: "شكراً لملاحظاتك" },
};

const SUPPORT_LABELS: Record<Locale, { whatsapp: string; phone: string; error: string }> = {
  en: { whatsapp: "Continue on WhatsApp", phone: "Call Dar Tahara", error: "We could not prepare the handover. Please try again." },
  nl: { whatsapp: "Ga verder op WhatsApp", phone: "Bel Dar Tahara", error: "We konden de overdracht niet voorbereiden. Probeer het opnieuw." },
  fr: { whatsapp: "Continuer sur WhatsApp", phone: "Appeler Dar Tahara", error: "Nous n’avons pas pu préparer le transfert. Veuillez réessayer." },
  es: { whatsapp: "Continuar por WhatsApp", phone: "Llamar a Dar Tahara", error: "No pudimos preparar la transferencia. Inténtalo de nuevo." },
  de: { whatsapp: "Auf WhatsApp fortfahren", phone: "Dar Tahara anrufen", error: "Die Übergabe konnte nicht vorbereitet werden. Bitte versuchen Sie es erneut." },
  pt: { whatsapp: "Continuar no WhatsApp", phone: "Ligar para a Dar Tahara", error: "Não foi possível preparar a transferência. Tente novamente." },
  ar: { whatsapp: "المتابعة عبر واتساب", phone: "الاتصال بدار طهارة", error: "تعذر تجهيز التحويل. يرجى المحاولة مرة أخرى." },
};

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
  const [sessionLanguage, setSessionLanguage] = React.useState<Locale | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<Locale | null>(null);
  const [languageSelectionPending, setLanguageSelectionPending] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [escalation, setEscalation] = React.useState<Escalation | null>(null);
  const [handoffAvailable, setHandoffAvailable] = React.useState(false);
  const [handoffBusy, setHandoffBusy] = React.useState(false);
  const [unread, setUnread] = React.useState(false);
  const [feedbackByMessage, setFeedbackByMessage] = React.useState<Record<string, "helpful" | "unhelpful">>({});
  const [messages, setMessages] = React.useState<Message[]>(() => [
    { id: "welcome", role: "assistant", automated: true, body: copy.subtitle },
  ]);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, suggestions, busy, open]);

  React.useEffect(() => {
    const storedConversationId = window.localStorage.getItem("dar-tahara-assistant-conversation");
    const storedLanguage = window.localStorage.getItem("dar-tahara-assistant-language");
    const explicitlySelectedLanguage = readSelectedAssistantLanguage();
    setConversationId(storedConversationId);
    if (storedConversationId) {
      void fetch(`/api/chat/session/${encodeURIComponent(storedConversationId)}`, {
        headers: { "x-assistant-session-id": getSessionId() },
        cache: "no-store",
      }).then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json() as {
          messages?: Array<{ role: string; body: string; created_at: string }>;
        };
        const history = (payload.messages || []).flatMap((message) => {
          if (!["customer", "assistant"].includes(message.role) || !message.body) return [];
          return [{
            id: `${message.created_at}-${message.role}`,
            role: message.role as "customer" | "assistant",
            body: message.body,
            automated: message.role === "assistant",
          }];
        });
        if (history.length) setMessages(history);
      }).catch(() => undefined);
    }
    setSelectedLanguage(explicitlySelectedLanguage);
    if (explicitlySelectedLanguage) setSessionLanguage(explicitlySelectedLanguage);
    else if (storedLanguage && isLocale(storedLanguage)) setSessionLanguage(storedLanguage);
    setLanguageSelectionPending(window.localStorage.getItem("dar-tahara-assistant-language-pending") === "true");
  }, [locale]);

  async function ask(text: string, selectedSuggestionId?: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setSuggestions([]);
    setEscalation(null);
    setHandoffAvailable(false);
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
          sessionLanguage,
          selectedLanguage,
          selectedSuggestionId,
          languageSelectionPending,
          websitePath: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error("assistant_failed");
      const data = (await res.json()) as {
        conversationId: string;
        answer: string;
        locale: Locale;
        languageConfirmed: boolean;
        suggestions: Suggestion[];
        escalation: Escalation;
        handoffAvailable: boolean;
      };
      setConversationId(data.conversationId);
      window.localStorage.setItem("dar-tahara-assistant-conversation", data.conversationId);
      if (data.languageConfirmed && isLocale(data.locale)) {
        setSessionLanguage(data.locale);
        setSelectedLanguage(null);
        setLanguageSelectionPending(false);
        clearSelectedAssistantLanguage();
        window.localStorage.setItem("dar-tahara-assistant-language", data.locale);
        window.localStorage.removeItem("dar-tahara-assistant-language-pending");
      } else {
        setSessionLanguage(null);
        setLanguageSelectionPending(true);
        window.localStorage.removeItem("dar-tahara-assistant-language");
        window.localStorage.setItem("dar-tahara-assistant-language-pending", "true");
      }
      setMessages((items) => [
        ...items,
        { id: crypto.randomUUID(), role: "assistant", automated: true, body: data.answer },
      ]);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 4) : []);
      setEscalation(data.escalation || null);
      setHandoffAvailable(data.handoffAvailable === true || data.escalation?.required === true);
      if (!open) setUnread(true);
    } catch {
      setSuggestions([]);
      setEscalation(null);
      setHandoffAvailable(false);
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", automated: true, body: copy.error }]);
    } finally {
      setBusy(false);
    }
  }

  async function startHandoff(channel: "whatsapp" | "phone") {
    if (!conversationId || handoffBusy) return;
    setHandoffBusy(true);
    try {
      const response = await fetch("/api/chat/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          sessionId: getSessionId(),
          channel,
        }),
      });
      if (!response.ok) throw new Error("handover_failed");
      const payload = await response.json() as { whatsappUrl: string; phoneUrl: string };
      window.location.assign(channel === "phone" ? payload.phoneUrl : payload.whatsappUrl);
    } catch {
      setMessages((items) => [...items, {
        id: crypto.randomUUID(),
        role: "assistant",
        automated: true,
        body: SUPPORT_LABELS[activeLanguage].error,
      }]);
    } finally {
      setHandoffBusy(false);
    }
  }

  async function sendFeedback(messageId: string, rating: "helpful" | "unhelpful") {
    if (!conversationId || feedbackByMessage[messageId]) return;
    setFeedbackByMessage((current) => ({ ...current, [messageId]: rating }));
    const response = await fetch("/api/assistant/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, sessionId: getSessionId(), rating }),
    }).catch(() => null);
    if (!response?.ok) setFeedbackByMessage((current) => {
      const next = { ...current };
      delete next[messageId];
      return next;
    });
  }

  const activeLanguage = sessionLanguage || selectedLanguage || locale;
  const direction = activeLanguage === "ar" ? "rtl" : "ltr";

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label={copy.title}
          dir={direction}
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
          <div className="flex-1 space-y-4 overflow-y-auto bg-secondary/30 p-4" aria-live="polite">
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
                  {message.role === "assistant" && message.id !== "welcome" && conversationId ? (
                    <div className="mt-2 flex items-center gap-1 border-t border-border/60 pt-2">
                      {feedbackByMessage[message.id] ? <span className="text-[11px] text-muted-foreground">{FEEDBACK_LABELS[activeLanguage].thanks}</span> : <>
                        <button type="button" onClick={() => sendFeedback(message.id, "helpful")} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={FEEDBACK_LABELS[activeLanguage].helpful} title={FEEDBACK_LABELS[activeLanguage].helpful}><ThumbsUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => sendFeedback(message.id, "unhelpful")} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={FEEDBACK_LABELS[activeLanguage].unhelpful} title={FEEDBACK_LABELS[activeLanguage].unhelpful}><ThumbsDown className="h-3.5 w-3.5" /></button>
                      </>}
                    </div>
                  ) : null}
                </div>
                {message.role === "customer" ? <UserRound className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" /> : null}
              </article>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="h-5 w-5 text-primary" />
                <span className="inline-flex gap-1" aria-label={copy.automated}>
                  <span className="animate-pulse">●</span><span className="animate-pulse [animation-delay:150ms]">●</span><span className="animate-pulse [animation-delay:300ms]">●</span>
                </span>
              </div>
            ) : null}
            {!busy && suggestions.length ? (
              <div className="ms-7 flex flex-wrap gap-2" aria-label={copy.automated}>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busy}
                    onClick={() => ask(item.value, item.id)}
                    className="max-w-full whitespace-normal rounded-2xl border border-primary/30 bg-card px-3 py-2 text-start text-xs leading-snug text-foreground transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            {!busy && handoffAvailable ? (
              <div className="ms-7 rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
                {escalation?.required ? <p className="text-xs">{copy.human}</p> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={handoffBusy} onClick={() => startHandoff("whatsapp")} className={buttonVariants({ variant: "primary", size: "sm" })}>
                    <MessageCircle className="h-4 w-4" /> {SUPPORT_LABELS[activeLanguage].whatsapp}
                  </button>
                  <button type="button" disabled={handoffBusy} onClick={() => startHandoff("phone")} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    {SUPPORT_LABELS[activeLanguage].phone}
                  </button>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border bg-card p-4">
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
                dir={direction}
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
