"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal, accessible form primitives for the early-access form. Each associates
 * a <label> with its control and renders an error with aria-describedby so
 * screen readers announce it. Styling uses the shared design tokens.
 */

const controlBase =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/40 disabled:opacity-60";

export function FieldShell({
  id, label, error, hint, required, children,
}: {
  id: string; label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-accent" aria-hidden> *</span> : null}
      </label>
      {hint ? <p id={hintId} className="text-xs text-muted-foreground">{hint}</p> : null}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined,
          })
        : children}
      {error ? <p id={errId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlBase, className)} {...props} />,
);
TextInput.displayName = "TextInput";

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea className={cn(controlBase, "min-h-[88px] resize-y", className)} rows={3} {...rest} />;
}

export function Select({
  options, placeholder, className, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: Record<string, string>; placeholder?: string }) {
  return (
    <select className={cn(controlBase, "appearance-none bg-[length:1rem] pe-9", className)} {...rest}>
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {Object.entries(options).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}

export function CheckboxRow({
  id, label, checked, onChange, hint,
}: {
  id: string; label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-ring/40"
        />
        <span className="leading-relaxed">{label}</span>
      </label>
      {hint ? <p className="text-xs text-muted-foreground ps-8">{hint}</p> : null}
    </div>
  );
}

/** Single-choice card group (radio semantics). */
export function RadioCards({
  name, value, options, onChange, columns = 2,
}: {
  name: string; value?: string; options: Record<string, string>; onChange: (v: string) => void; columns?: 1 | 2 | 3;
}) {
  const cols = columns === 1 ? "sm:grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div role="radiogroup" className={cn("grid grid-cols-1 gap-2", cols)}>
      {Object.entries(options).map(([val, label]) => {
        const active = value === val;
        return (
          <label
            key={val}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition",
              active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-background hover:border-foreground/20",
            )}
          >
            <input
              type="radio"
              name={name}
              value={val}
              checked={active}
              onChange={() => onChange(val)}
              className="h-4 w-4 text-primary focus:ring-2 focus:ring-ring/40"
            />
            <span className="text-foreground">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Multi-choice chip group. */
export function CheckboxChips({
  options, values, onToggle,
}: {
  options: Record<string, string>; values: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(options).map(([val, label]) => {
        const active = values.includes(val);
        return (
          <button
            key={val}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(val)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-background text-foreground hover:border-foreground/20",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
