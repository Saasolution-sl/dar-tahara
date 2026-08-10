import { STEPS, type StepId } from "./schema";
import { likelyAbandonmentCategory } from "./funnel";

export type ReportingSession = {
  id: string;
  status: string;
  email_present: boolean;
  current_step: StepId;
  current_step_index: number;
  source_code: string | null;
  utm_source: string | null;
  referrer_host: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system?: string | null;
  locale?: string | null;
  started_at: string;
  completed_at: string | null;
  early_access_registered_at?: string | null;
  onboarding_started_at?: string | null;
  onboarding_completed_at?: string | null;
  city?: string | null;
  abandoned_at: string | null;
  resumed_at: string | null;
  reminder_count: number;
  completed_after_reminder: boolean;
};

export type ReportingEvent = {
  signup_session_id: string;
  event_name: string;
  step_id: StepId | null;
  step_index: number | null;
  field_name: string | null;
  error_type: string | null;
  error_code?: string | null;
  duration_ms: number | null;
};

export type ReportingFeedback = { reason: string };
export type ReportingLead = {
  id: string;
  residence_city: string | null;
  mautic_sync_status: string;
  submitted_at: string | null;
};

type CountRow = { label: string; count: number };

function countBy<T>(rows: T[], label: (row: T) => string): CountRow[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = label(row) || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts].map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function uniqueSessions(events: ReportingEvent[], eventName: string): number {
  return new Set(events.filter((event) => event.event_name === eventName).map((event) => event.signup_session_id)).size;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function buildEarlyAccessReport(
  sessions: ReportingSession[],
  events: ReportingEvent[],
  feedback: ReportingFeedback[],
  leads: ReportingLead[] = [],
) {
  const viewed = uniqueSessions(events, "early_access_viewed") || sessions.length;
  const started = uniqueSessions(events, "early_access_started");
  const registered = sessions.filter((session) => Boolean(session.early_access_registered_at)
    || ["early_access_registered", "onboarding_started", "onboarding_completed", "completed"].includes(session.status)).length;
  const onboardingStarted = sessions.filter((session) => Boolean(session.onboarding_started_at)
    || ["onboarding_started", "onboarding_completed", "completed"].includes(session.status)).length;
  const onboardingCompleted = sessions.filter((session) => Boolean(session.onboarding_completed_at)
    || ["onboarding_completed", "completed"].includes(session.status)).length;
  const completed = onboardingCompleted;
  const abandoned = sessions.filter((session) => ["abandoned_eligible", "reminder_sent"].includes(session.status)).length;
  const resumed = sessions.filter((session) => Boolean(session.resumed_at)).length;
  const identified = sessions.filter((session) => session.email_present).length;
  const optedOut = sessions.filter((session) => session.status === "opted_out").length;
  const reminder1 = sessions.filter((session) => session.reminder_count >= 1).length;
  const reminder2 = sessions.filter((session) => session.reminder_count >= 2).length;
  const completedAfterReminder = sessions.filter((session) => session.completed_after_reminder).length;
  const completionMinutes = sessions.flatMap((session) => {
    if (!session.completed_at) return [];
    const duration = Date.parse(session.completed_at) - Date.parse(session.started_at);
    return Number.isFinite(duration) && duration >= 0 ? [duration / 60_000] : [];
  });

  const steps = STEPS.map((stepId, stepIndex) => {
    const enteredIds = new Set(events.filter((event) => ["onboarding_step_viewed", "early_access_step_viewed"].includes(event.event_name) && event.step_id === stepId).map((event) => event.signup_session_id));
    const completedIds = new Set(events.filter((event) => ["onboarding_step_completed", "early_access_step_completed"].includes(event.event_name) && event.step_id === stepId).map((event) => event.signup_session_id));
    const durations = events.filter((event) => ["onboarding_step_completed", "early_access_step_completed"].includes(event.event_name) && event.step_id === stepId && event.duration_ms !== null).map((event) => event.duration_ms as number);
    const errors = events.filter((event) => event.event_name === "early_access_validation_error" && event.step_id === stepId).length;
    const medianDuration = median(durations);
    return {
      stepId, stepIndex, entered: enteredIds.size, completed: completedIds.size, errors,
      completionRate: enteredIds.size ? completedIds.size / enteredIds.size : 0,
      medianSeconds: medianDuration === null ? null : Math.round(medianDuration / 1000),
    };
  });

  const eventsBySession = new Map<string, ReportingEvent[]>();
  for (const event of events) {
    eventsBySession.set(event.signup_session_id, [...(eventsBySession.get(event.signup_session_id) || []), event]);
  }
  const abandonmentCategories = countBy(
    sessions.filter((session) => Boolean(session.abandoned_at)),
    (session) => likelyAbandonmentCategory(eventsBySession.get(session.id) || []),
  );

  return {
    summary: {
      viewed, started, registered, onboardingStarted, onboardingCompleted, completed, abandoned, resumed,
      identified, anonymous: Math.max(0, viewed - identified),
      optedOut, reminder1, reminder2, completedAfterReminder,
      startRate: viewed ? started / viewed : 0,
      registrationRate: viewed ? registered / viewed : 0,
      onboardingStartRate: registered ? onboardingStarted / registered : 0,
      onboardingCompletionRate: onboardingStarted ? onboardingCompleted / onboardingStarted : 0,
      completionRate: viewed ? completed / viewed : 0,
      averageCompletionMinutes: completionMinutes.length
        ? completionMinutes.reduce((sum, value) => sum + value, 0) / completionMinutes.length : null,
      medianCompletionMinutes: median(completionMinutes),
    },
    steps,
    sources: countBy(sessions, (session) => session.utm_source || session.source_code || session.referrer_host || "direct / unknown"),
    devices: countBy(sessions, (session) => session.device_type || "unknown"),
    browsers: countBy(sessions, (session) => session.browser || "unknown"),
    operatingSystems: countBy(sessions, (session) => session.operating_system || "unknown"),
    locales: countBy(sessions, (session) => session.locale || "unknown"),
    cities: countBy(
      sessions.filter((session) => Boolean(session.early_access_registered_at || session.city)),
      (session) => session.city || "unknown",
    ),
    mauticSyncStatuses: countBy(leads, (lead) => lead.mautic_sync_status || "unknown"),
    errorFields: countBy(
      events.filter((event) => event.event_name === "early_access_validation_error"),
      (event) => event.field_name || event.error_type || "unknown",
    ),
    apiErrors: countBy(
      events.filter((event) => event.event_name === "early_access_api_error"),
      (event) => event.error_code || event.error_type || "unknown",
    ),
    abandonmentCategories,
    feedbackReasons: countBy(feedback, (row) => row.reason),
  };
}
