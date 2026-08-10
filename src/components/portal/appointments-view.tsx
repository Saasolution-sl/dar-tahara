"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PortalCard } from "@/components/portal/portal-shell";
import type { PortalCopy } from "@/i18n/portal-copy";
import type { AppointmentDisplayState } from "@/lib/appointment-state";
import { cn } from "@/lib/utils";

export type AppointmentRow = {
  id: string;
  state: AppointmentDisplayState;
  timing: "exact" | "window";
  /** YYYY-MM-DD the row sits on in the month grid. */
  calendarDate: string;
  /** Already localised on the server so the grid stays a pure renderer. */
  dateLabel: string;
  timeLabel: string | null;
  windowLabel: string;
  propertyId: string;
  propertyLabel: string;
  employeeNumber: string | null;
  upcoming: boolean;
};

export type AppointmentPropertyOption = { value: string; label: string };

type Props = {
  copy: PortalCopy;
  rows: AppointmentRow[];
  properties: AppointmentPropertyOption[];
  selectedProperty: string | null;
  selectedState: string | null;
  /** Unfiltered booking count, so "no appointments" and "filters match none" stay distinguishable. */
  totalCount: number;
  view: "month" | "agenda";
  monthLabel: string;
  previousMonth: string;
  nextMonth: string;
  weekdayLabels: string[];
  /** Leading blanks before day 1, then the day cells for the anchor month. */
  monthDays: { date: string; dayLabel: string }[];
  leadingBlanks: number;
};

/** Every badge pairs its colour with the translated state label - never colour alone. */
const STATE_TONE: Record<AppointmentDisplayState, string> = {
  planning: "bg-secondary text-secondary-foreground",
  confirmed: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-muted text-muted-foreground",
  awaiting_update: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  suspended: "bg-red-500/15 text-red-700 dark:text-red-400",
  forfeited: "bg-red-500/15 text-red-700 dark:text-red-400",
};

/** States caused by an unpaid subscription, which share the red treatment. */
function isBlocked(state: AppointmentDisplayState): boolean {
  return state === "suspended" || state === "forfeited";
}

function StateBadge({ state, copy }: { state: AppointmentDisplayState; copy: PortalCopy }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        STATE_TONE[state],
      )}
    >
      {copy.appointments.states[state]}
    </span>
  );
}

export function AppointmentsView({
  copy,
  rows,
  properties,
  selectedProperty,
  selectedState,
  totalCount,
  view,
  monthLabel,
  previousMonth,
  nextMonth,
  weekdayLabels,
  monthDays,
  leadingBlanks,
}: Props) {
  const ac = copy.appointments;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  const byDate = new Map<string, AppointmentRow[]>();
  for (const row of rows) {
    byDate.set(row.calendarDate, [...(byDate.get(row.calendarDate) || []), row]);
  }
  // `rows` arrive soonest-first. Upcoming reads naturally that way (the next
  // visit at the top); past reads better newest-first, so it is reversed.
  const upcoming = rows.filter((row) => row.upcoming);
  const past = rows.filter((row) => !row.upcoming).reverse();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">{ac.title}</h1>
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {(["month", "agenda"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setParam("view", mode === "agenda" ? "agenda" : "")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                view === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {ac[mode]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <div>
          <label htmlFor="appointment-property" className="mb-2 block text-sm font-medium">
            {ac.filterProperty}
          </label>
          <select
            id="appointment-property"
            value={selectedProperty || ""}
            onChange={(event) => setParam("property", event.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:opacity-70"
          >
            <option value="">{ac.allProperties}</option>
            {properties.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="appointment-state" className="mb-2 block text-sm font-medium">
            {ac.filterStatus}
          </label>
          <select
            id="appointment-state"
            value={selectedState || ""}
            onChange={(event) => setParam("state", event.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:opacity-70"
          >
            <option value="">{ac.allStatuses}</option>
            {(Object.keys(ac.states) as AppointmentDisplayState[]).map((state) => (
              <option key={state} value={state}>
                {ac.states[state]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="mt-7">
          <PortalCard title={ac.title}>
            <p className="text-sm text-muted-foreground">{ac.empty}</p>
          </PortalCard>
        </div>
      ) : null}

      {/*
        Rendered whenever the customer has any appointments at all, even if the
        current filters match none. Gating these on the *filtered* count made
        the month/agenda toggle silently do nothing on an empty result, which
        reads as a broken control rather than an empty list.
      */}
      {totalCount > 0 && view === "month" ? (
        <section className="mt-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl">{monthLabel}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setParam("month", previousMonth)}
                className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {ac.previous}
              </button>
              <button
                type="button"
                onClick={() => setParam("month", "")}
                className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {ac.today}
              </button>
              <button
                type="button"
                onClick={() => setParam("month", nextMonth)}
                className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {ac.next}
              </button>
            </div>
          </div>

          {/* The grid is desktop-only: on a phone the agenda below is the usable view. */}
          <div
            className="mt-4 hidden grid-cols-7 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid"
            role="grid"
            aria-label={`${ac.title} — ${monthLabel}`}
          >
            {weekdayLabels.map((label) => (
              <div key={label} className="bg-secondary/60 px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
                {label}
              </div>
            ))}
            {Array.from({ length: leadingBlanks }).map((_, index) => (
              <div key={`blank-${index}`} className="min-h-24 bg-card/40" />
            ))}
            {monthDays.map((day) => (
              <div key={day.date} className="min-h-24 bg-card p-1.5" role="gridcell">
                <span className="text-xs font-semibold text-muted-foreground">{day.dayLabel}</span>
                <div className="mt-1 flex flex-col gap-1">
                  {(byDate.get(day.date) || []).map((row) => (
                    <Link
                      key={row.id}
                      href={`/account/appointments/${row.id}`}
                      className={cn(
                        "block rounded-lg px-1.5 py-1 text-[11px] leading-tight transition-colors",
                        isBlocked(row.state)
                          ? "border border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400"
                          : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground",
                      )}
                      aria-label={`${row.propertyLabel} — ${ac.states[row.state]}`}
                    >
                      {row.timeLabel || ac.timeToBeConfirmed}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 sm:hidden">
            <AgendaList copy={copy} rows={rows} />
          </div>
        </section>
      ) : null}

      {totalCount > 0 && view === "agenda" ? (
        <div className="mt-7 space-y-8">
          <section>
            <h2 className="font-serif text-xl">{ac.upcoming}</h2>
            <div className="mt-3">
              {upcoming.length ? (
                <AgendaList copy={copy} rows={upcoming} />
              ) : (
                <p className="text-sm text-muted-foreground">{ac.emptyUpcoming}</p>
              )}
            </div>
          </section>
          <section>
            <h2 className="font-serif text-xl">{ac.past}</h2>
            <div className="mt-3">
              {past.length ? (
                <AgendaList copy={copy} rows={past} />
              ) : (
                <p className="text-sm text-muted-foreground">{ac.emptyPast}</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function AgendaList({ copy, rows }: { copy: PortalCopy; rows: AppointmentRow[] }) {
  const ac = copy.appointments;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id}>
          {/* Same red panel as the suspension notice on the invoices page, so a
              visit affected by an unpaid subscription is recognisable at a
              glance in either view. */}
          <Link
            href={`/account/appointments/${row.id}`}
            className={cn(
              "block rounded-2xl border p-4 shadow-soft transition-colors",
              isBlocked(row.state)
                ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
                : "border-border bg-card hover:border-primary/40",
              row.state === "cancelled" && "opacity-70",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className={cn("font-medium", isBlocked(row.state) && "text-red-800 dark:text-red-400")}>
                {row.timing === "exact" ? `${row.dateLabel} · ${row.timeLabel}` : row.windowLabel}
              </span>
              {/* Suspension is now part of the state itself, so the badge needs
                  no special case: an unpaid subscription can never render
                  "Confirmed" beside a visit that will not happen. */}
              <StateBadge state={row.state} copy={copy} />
            </div>
            <p
              className={cn(
                "mt-1 text-sm",
                isBlocked(row.state) ? "text-red-700 dark:text-red-400" : "text-muted-foreground",
              )}
            >
              {row.propertyLabel}
            </p>
            {row.timing === "window" ? (
              <p className="mt-1 text-xs text-muted-foreground">{ac.timeToBeConfirmed}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
