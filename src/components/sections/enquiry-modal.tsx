"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle, Mail, Check } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { FrequencyKey } from "@/lib/pricing";
import { formatEuro } from "@/lib/pricing";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type EnquiryPayload = {
  mode: "book" | "quote";
  sizeM2: number;
  frequencyKey: FrequencyKey;
  frequencyLabel: string;
  visitsPerMonth: number;
  pricePerVisit: number | null;
  discountPercentage: number;
  monthlyTotal: number | null;
  effectivePricePerVisit: number | null;
  isCustom: boolean;
  /** Irregular per-stay plan: the total is a per-cleaning price. */
  perCleaning: boolean;
  /** Whether cleaning materials are included in the price. */
  materialsIncluded: boolean;
  /** Property is above the 250 m² estimator ceiling — quote only. */
  overMax: boolean;
};

export function EnquiryModal({
  open,
  onClose,
  payload,
  dict,
}: {
  open: boolean;
  onClose: () => void;
  payload: EnquiryPayload | null;
  dict: Dictionary;
}) {
  const e = dict.enquiry;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const firstFieldRef = React.useRef<HTMLInputElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    startDate: "",
    message: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [ready, setReady] = React.useState(false);

  // Focus management + Esc + basic focus trap.
  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 30);

    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        onClose();
        return;
      }
      if (ev.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) {
      setReady(false);
      setErrors({});
    }
  }, [open]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = e.required;
    if (!form.email.trim()) next.email = e.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = e.invalidEmail;
    if (!form.phone.trim()) next.phone = e.required;
    if (!form.location.trim()) next.location = e.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildMessage(): string {
    if (!payload) return "";
    const lines = [
      `New ${payload.mode === "book" ? "booking" : "quote"} request — Dar Tahara`,
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone/WhatsApp: ${form.phone}`,
      `Location: ${form.location}`,
      form.startDate ? `Preferred start: ${form.startDate}` : "",
      "",
      payload.overMax ? "Property size: over 250 m²" : `Property size: ${payload.sizeM2} m²`,
      payload.perCleaning
        ? `Plan: ${payload.frequencyLabel} (per-stay / on-demand)`
        : `Frequency: ${payload.frequencyLabel} (${payload.visitsPerMonth} visit(s)/month)`,
    ];
    if (payload.isCustom || payload.monthlyTotal === null) {
      lines.push("Estimate: Custom quotation (over 250 m²)");
    } else if (payload.perCleaning) {
      lines.push(
        `Price per week: ${formatEuro(payload.monthlyTotal)}`,
        "Includes: basic materials, cleaning supplies and toilet paper",
      );
    } else {
      lines.push(
        `Base price per cleaning: ${formatEuro(payload.pricePerVisit ?? 0)}`,
        `Discount: ${payload.discountPercentage}%`,
        `Estimated monthly total: ${formatEuro(payload.monthlyTotal)}`,
        `Effective price per visit: ${formatEuro(payload.effectivePricePerVisit ?? 0)}`,
      );
    }
    if (form.message.trim()) lines.push("", `Message: ${form.message}`);
    return lines.filter((l) => l !== "").join("\n");
  }

  function onSend(channel: "whatsapp" | "email") {
    if (!validate()) return;
    const message = buildMessage();
    if (channel === "whatsapp") {
      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    } else {
      const subject = encodeURIComponent(
        payload?.mode === "book" ? e.title : e.quoteTitle,
      );
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
    }
    setReady(true);
  }

  const title = payload?.mode === "quote" ? e.quoteTitle : e.title;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-lift sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2 id={titleId} className="font-serif text-xl text-foreground">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{e.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={e.close}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="no-scrollbar overflow-y-auto px-6 py-5">
              {/* Selection summary */}
              {payload ? (
                <div className="mb-6 rounded-xl bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {e.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                    <span className="text-foreground">{payload.overMax ? "> 250 m²" : `${payload.sizeM2} m²`}</span>
                    {payload.overMax ? null : <span className="text-foreground">{payload.frequencyLabel}</span>}
                    {payload.isCustom || payload.monthlyTotal === null ? (
                      <span className="text-accent">{e.customSelected}</span>
                    ) : (
                      <span className="font-medium text-foreground">
                        {payload.perCleaning ? dict.calculator.result.pricePerWeek : e.monthlyEstimate}: {formatEuro(payload.monthlyTotal)}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {ready ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg text-foreground">{e.successTitle}</h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">{e.successBody}</p>
                  <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onSend("whatsapp")}
                      className={cn(buttonVariants({ variant: "gold", size: "md" }), "flex-1")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {e.submitWhatsApp}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSend("email")}
                      className={cn(buttonVariants({ variant: "outline", size: "md" }), "flex-1")}
                    >
                      <Mail className="h-4 w-4" />
                      {e.submitEmail}
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    onSend("whatsapp");
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <Field
                    ref={firstFieldRef}
                    label={e.fields.name}
                    required
                    value={form.name}
                    error={errors.name}
                    onChange={(v) => update("name", v)}
                    autoComplete="name"
                  />
                  <Field
                    label={e.fields.email}
                    type="email"
                    required
                    value={form.email}
                    error={errors.email}
                    onChange={(v) => update("email", v)}
                    autoComplete="email"
                  />
                  <Field
                    label={e.fields.phone}
                    type="tel"
                    required
                    value={form.phone}
                    error={errors.phone}
                    onChange={(v) => update("phone", v)}
                    autoComplete="tel"
                  />
                  <Field
                    label={e.fields.location}
                    required
                    value={form.location}
                    error={errors.location}
                    onChange={(v) => update("location", v)}
                    autoComplete="address-level2"
                  />
                  <Field
                    label={e.fields.startDate}
                    type="date"
                    value={form.startDate}
                    onChange={(v) => update("startDate", v)}
                  />
                  <Field
                    label={e.fields.size}
                    value={payload ? String(payload.sizeM2) : ""}
                    onChange={() => {}}
                    readOnly
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {e.fields.message}
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(ev) => update("message", ev.target.value)}
                      placeholder={e.fields.messagePlaceholder}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="mt-2 flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                    <button
                      type="submit"
                      className={cn(buttonVariants({ variant: "primary", size: "lg" }), "flex-1")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {e.submitWhatsApp}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSend("email")}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1")}
                    >
                      <Mail className="h-4 w-4" />
                      {e.submitEmail}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  readOnly?: boolean;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, value, onChange, type = "text", required, error, autoComplete, readOnly },
  ref,
) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-accent" aria-hidden> *</span> : null}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(ev) => onChange(ev.target.value)}
        className={cn(
          "h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
          error ? "border-red-500/70" : "border-border",
          readOnly && "bg-secondary/50 text-muted-foreground",
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
});
