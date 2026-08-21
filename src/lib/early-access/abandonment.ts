import "server-only";

import { mauticFromEnv } from "@/lib/mautic/env";
import type { MauticClient } from "@/lib/mautic/client";
import { runApprovedRetention } from "@/lib/retention-control";
import { serviceRpc, serviceSelect, serviceUpdate, serviceUpdateMinimal } from "@/lib/supabase-rpc";
import {
  abandonmentConfig,
  dueReminderNumber,
  shouldMarkAbandoned,
  type AbandonmentConfig,
} from "./funnel";
import {
  generateSessionToken,
  hashSessionToken,
  recordFunnelEvent,
  type SignupSessionRow,
} from "./funnel-server";

type AbandonmentRow = SignupSessionRow & {
  source_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
};

export type AbandonmentRunResult = {
  inspected: number;
  markedAbandoned: number;
  remindersQueued: number;
  skipped: number;
  failures: number;
};

export type AbandonmentDependencies = {
  now: () => number;
  config: AbandonmentConfig;
  loadCandidates: () => Promise<AbandonmentRow[]>;
  markAbandoned: (row: AbandonmentRow, at: string) => Promise<void>;
  queueReminder: (row: AbandonmentRow, reminder: 1 | 2, at: string) => Promise<boolean | void>;
};

/** Purely orchestrates candidates so timing, suppression and failures are testable. */
export async function processAbandonmentCandidates(
  deps: AbandonmentDependencies,
): Promise<AbandonmentRunResult> {
  const result: AbandonmentRunResult = {
    inspected: 0, markedAbandoned: 0, remindersQueued: 0, skipped: 0, failures: 0,
  };
  let rows: AbandonmentRow[];
  try {
    rows = await deps.loadCandidates();
  } catch {
    result.failures += 1;
    return result;
  }

  const now = deps.now();
  const at = new Date(now).toISOString();
  for (const original of rows) {
    result.inspected += 1;
    const row = { ...original };
    try {
      if (shouldMarkAbandoned(row, now, deps.config)) {
        await deps.markAbandoned(row, at);
        row.status = "abandoned_eligible";
        row.abandoned_at = at;
        result.markedAbandoned += 1;
      }
      const reminder = dueReminderNumber(row, now, deps.config);
      if (!reminder) {
        result.skipped += 1;
        continue;
      }
      const queued = await deps.queueReminder(row, reminder, at);
      if (queued === false) result.skipped += 1;
      else result.remindersQueued += 1;
    } catch {
      result.failures += 1;
    }
  }
  return result;
}

function siteRoot(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com").replace(/\/$/, "");
}

function sessionName(row: AbandonmentRow, key: "firstName" | "lastName"): string | undefined {
  const value = row.partial_payload?.[key];
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 100) : undefined;
}

async function syncReminderToMautic(
  client: MauticClient,
  row: AbandonmentRow,
  reminder: 1 | 2,
  resumeToken: string,
  feedbackToken: string,
): Promise<number> {
  if (!row.email) throw new Error("abandonment_email_missing");
  const locale = /^[a-z]{2}(?:-[A-Z]{2})?$/.test(row.locale || "") ? row.locale! : "en";
  const root = siteRoot();
  const fields: Record<string, string | number | boolean> = {
    email: row.email,
    early_access_status: "abandoned",
    ea_step: row.current_step,
    ea_started_at: row.started_at,
    ea_last_activity: row.last_activity_at,
    ea_abandoned_at: row.abandoned_at || new Date().toISOString(),
    ea_reminder_count: reminder,
    // Capability tokens live in the URL fragment: fragments are not sent in
    // HTTP requests, access logs or Referer headers. The client exchanges the
    // token once and removes it from browser history.
    ea_resume_url: `${root}/${locale}/early-access#resume=${encodeURIComponent(resumeToken)}`,
    ea_feedback_url: `${root}/${locale}/early-access/feedback#token=${encodeURIComponent(feedbackToken)}`,
    preferred_language: locale,
  };
  const firstName = sessionName(row, "firstName");
  const lastName = sessionName(row, "lastName");
  if (firstName) fields.firstname = firstName;
  if (lastName) fields.lastname = lastName;
  if (row.source_code) fields.first_source_code = row.source_code;
  if (row.utm_source) fields.first_utm_source = row.utm_source;
  if (row.utm_medium) fields.first_utm_medium = row.utm_medium;
  if (row.utm_campaign) fields.first_utm_campaign = row.utm_campaign;

  const upsert = await client.upsertContactByEmail(row.email, fields);
  await client.addTags(upsert.contact.id, [
    "early-access",
    "early-access-abandoned",
    `early-access-reminder-${reminder}-due`,
  ]);
  return upsert.contact.id;
}

const CANDIDATE_SELECT = [
  "id", "client_token_hash", "lead_id", "mautic_contact_id", "email",
  "normalized_email", "email_present", "reminder_consent", "status", "current_step",
  "current_step_index", "highest_completed_step", "client_revision", "partial_payload", "locale", "started_at",
  "last_activity_at", "completed_at", "abandoned_at", "resumed_at", "opted_out_at",
  "reminder_count", "reminder_1_queued_at", "reminder_2_queued_at", "reminder_claimed_at",
  "reminder_claimed_number", "resume_token_hash",
  "resume_token_expires_at", "feedback_token_hash", "feedback_token_expires_at",
  "source_code", "utm_source", "utm_medium", "utm_campaign", "device_type",
].join(",");

export async function runEarlyAccessAbandonmentJob(): Promise<AbandonmentRunResult> {
  const config = abandonmentConfig();
  const staleClaimCutoff = new Date(Date.now() - 15 * 60_000).toISOString();
  await serviceUpdateMinimal(
    "early_access_signup_sessions",
    `reminder_claimed_at=lt.${staleClaimCutoff}`,
    {
      reminder_claimed_at: null,
      reminder_claimed_number: null,
      resume_token_hash: null,
      resume_token_expires_at: null,
      feedback_token_hash: null,
      feedback_token_expires_at: null,
    },
  ).catch(() => {});
  return processAbandonmentCandidates({
    now: () => Date.now(),
    config,
    loadCandidates: () => serviceSelect<AbandonmentRow[]>(
      `early_access_signup_sessions?status=in.(onboarding_started,resumed,abandoned_eligible,reminder_sent)&select=${CANDIDATE_SELECT}&order=last_activity_at.asc&limit=250`,
    ),
    markAbandoned: async (row, at) => {
      await serviceUpdate(
        "early_access_signup_sessions",
        `id=eq.${row.id}&status=in.(onboarding_started,resumed)&completed_at=is.null&opted_out_at=is.null`,
        { status: "abandoned_eligible", abandoned_at: at },
      );
      await recordFunnelEvent(row.id, {
        eventName: "onboarding_abandoned",
        idempotencyKey: "session:abandoned",
        stepId: row.current_step,
        stepIndex: row.current_step_index,
        totalDurationMs: Date.parse(at) - Date.parse(row.started_at),
      });
    },
    queueReminder: async (row, reminder, at) => {
      const client = mauticFromEnv();
      if (!client) throw new Error("mautic_not_configured");
      const resumeToken = generateSessionToken();
      const feedbackToken = generateSessionToken();
      const expiresAt = new Date(Date.parse(at) + config.resumeTokenHours * 3_600_000).toISOString();

      // Persist hashes before exposing the raw token to Mautic. Raw tokens are
      // never stored; a retry simply rotates them before any campaign is queued.
      const resumeHash = hashSessionToken(resumeToken);
      const tokenRows = await serviceUpdate<Array<{ id: string }>>(
        "early_access_signup_sessions",
        `id=eq.${row.id}&status=in.(abandoned_eligible,reminder_sent)&reminder_consent=eq.true&email_present=eq.true&reminder_count=eq.${reminder - 1}&reminder_claimed_at=is.null&completed_at=is.null&opted_out_at=is.null`,
        {
          reminder_claimed_at: at,
          reminder_claimed_number: reminder,
          resume_token_hash: resumeHash,
          resume_token_expires_at: expiresAt,
          feedback_token_hash: hashSessionToken(feedbackToken),
          feedback_token_expires_at: expiresAt,
        },
      );
      if (!tokenRows.length) return false;
      let contactId: number;
      try {
        contactId = await syncReminderToMautic(
          client, { ...row, abandoned_at: row.abandoned_at || at }, reminder, resumeToken, feedbackToken,
        );
      } catch (error) {
        await serviceUpdateMinimal(
          "early_access_signup_sessions",
          `id=eq.${row.id}&resume_token_hash=eq.${resumeHash}&reminder_count=eq.${reminder - 1}`,
          {
            reminder_claimed_at: null,
            reminder_claimed_number: null,
            resume_token_hash: null,
            resume_token_expires_at: null,
            feedback_token_hash: null,
            feedback_token_expires_at: null,
          },
        ).catch(() => {});
        throw error;
      }
      const timestampKey = reminder === 1 ? "reminder_1_queued_at" : "reminder_2_queued_at";
      const updated = await serviceUpdate<Array<{ id: string }>>(
        "early_access_signup_sessions",
        `id=eq.${row.id}&reminder_count=eq.${reminder - 1}&resume_token_hash=eq.${resumeHash}&completed_at=is.null&opted_out_at=is.null`,
        {
          status: "reminder_sent",
          reminder_count: reminder,
          [timestampKey]: at,
          mautic_contact_id: contactId,
          reminder_claimed_at: null,
          reminder_claimed_number: null,
        },
      );
      if (!updated.length) {
        // The visitor completed or opted out during the external call. Move the
        // Mautic contact out of the dynamic abandoned segment before campaign
        // membership is recalculated.
        const current = await serviceSelect<Array<{ status: string }>>(
          `early_access_signup_sessions?id=eq.${row.id}&select=status&limit=1`,
        ).catch(() => [] as Array<{ status: string }>);
        const status = current[0]?.status;
        if (status === "completed" || status === "onboarding_completed" || status === "opted_out") {
          await client.editContact(contactId, {
            early_access_status: status === "completed" || status === "onboarding_completed" ? "pending" : "opted_out",
          }).catch(() => null);
        }
        return false;
      }
      return true;
    },
  });
}

/** Remove recoverable form PII only under the approved central schedule. */
export async function purgeStaleSignupSessionPii() {
  return runApprovedRetention({
    categories: ["early_access_partial_pii"],
    execute: async (days) => ({
      purged: await serviceRpc<number>("cleanup_early_access_partial_pii", {
        retention_days: days.early_access_partial_pii,
      }),
    }),
  });
}

export async function updateAbandonedMauticStatus(
  row: Pick<AbandonmentRow, "email" | "mautic_contact_id">,
  status: "resumed" | "opted_out",
): Promise<void> {
  const client = mauticFromEnv();
  if (!client || !row.email) return;
  const result = await client.upsertContactByEmail(row.email, {
    email: row.email,
    early_access_status: status,
  });
  await client.addTags(result.contact.id, [`early-access-${status.replaceAll("_", "-")}`]);
}
