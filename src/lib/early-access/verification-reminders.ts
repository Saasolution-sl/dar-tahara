import "server-only";
import { serviceSelect, serviceInsert, isServiceRoleConfigured } from "@/lib/supabase-rpc";
import { generateVerificationToken, hashToken, tokenExpiry } from "./token";
import { totalTokenCount } from "./persistence";
import { sendVerificationEmail } from "./email";
import { site } from "@/lib/site";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * "Don't forget to verify" reminders for people who completed the early-access
 * form but never confirmed their email address.
 *
 * This has to be sent by the app rather than by a Mautic campaign. Verification
 * tokens are single-use and expire after 48 hours (token.ts), so a link baked in
 * at signup is long dead by the time a 7-day reminder fires, and Mautic cannot
 * mint a fresh one. The Mautic email "DT · Verification reminder" links to the
 * "check your inbox" page instead, which confirms nothing — this job exists
 * because that approach cannot be made to work.
 *
 * Distinct from the abandonment job, which chases people who never FINISHED the
 * form. These people finished it and never clicked the link.
 */

/** Wait this long after signup before nudging. */
export const REMINDER_AFTER_DAYS = 7;
/**
 * Never nudge a signup older than this. Someone who ignored the original mail
 * for a month is not a warm lead, and an unexpected mail about a form they have
 * forgotten reads as spam and invites a complaint.
 */
export const MAX_AGE_DAYS = 30;

const DAY_MS = 86_400_000;

export type ReminderCandidate = {
  id: string;
  email: string;
  status: string;
  preferred_language: string | null;
  created_at: string;
};

export type EligibilityResult = { eligible: boolean; reason?: string };

/**
 * Whether a lead should get a reminder. Pure so every boundary is unit-tested.
 *
 * `tokenCount` is the total number of verification tokens ever issued: signup
 * issues exactly one, so anything above one means this lead has already been
 * given a fresh link and must not be mailed again. That single rule is what
 * makes the job safe to run repeatedly — nobody can be nudged twice.
 */
export function isReminderEligible(args: {
  status: string;
  createdAt: string;
  tokenCount: number;
  now?: number;
}): EligibilityResult {
  const now = args.now ?? Date.now();
  if (args.status !== "pending") return { eligible: false, reason: "not_pending" };

  const created = Date.parse(args.createdAt);
  if (!Number.isFinite(created)) return { eligible: false, reason: "bad_created_at" };

  const ageMs = now - created;
  if (ageMs < REMINDER_AFTER_DAYS * DAY_MS) return { eligible: false, reason: "too_recent" };
  if (ageMs > MAX_AGE_DAYS * DAY_MS) return { eligible: false, reason: "too_old" };
  if (args.tokenCount > 1) return { eligible: false, reason: "already_reminded" };

  return { eligible: true };
}

export type ReminderRunResult = {
  scanned: number;
  sent: number;
  skipped: number;
  failures: number;
};

/**
 * Send one reminder per eligible lead. Best-effort per lead: one failure is
 * counted and the run continues, because a single bad address must not stop
 * everyone else's reminder.
 */
export async function sendPendingVerificationReminders(opts?: {
  limit?: number;
  now?: number;
  dryRun?: boolean;
}): Promise<ReminderRunResult> {
  const empty: ReminderRunResult = { scanned: 0, sent: 0, skipped: 0, failures: 0 };
  if (!isServiceRoleConfigured()) return empty;

  const now = opts?.now ?? Date.now();
  const limit = Math.max(1, Math.min(500, opts?.limit ?? 200));

  // Bound the query by both ends of the window so the scan stays small as the
  // lead table grows, rather than pulling every pending lead ever created.
  const notAfter = new Date(now - REMINDER_AFTER_DAYS * DAY_MS).toISOString();
  const notBefore = new Date(now - MAX_AGE_DAYS * DAY_MS).toISOString();

  const candidates = await serviceSelect<ReminderCandidate[]>(
    `marketing_leads?status=eq.pending` +
      `&created_at=lte.${encodeURIComponent(notAfter)}` +
      `&created_at=gte.${encodeURIComponent(notBefore)}` +
      `&select=id,email,status,preferred_language,created_at&order=created_at.asc&limit=${limit}`,
  ).catch((e) => {
    // Never silently return "nothing to do" on a query failure: an empty result
    // and a broken query look identical from the outside.
    console.error("[verification-reminders] candidate query failed", e);
    return null;
  });
  if (!candidates) return { ...empty, failures: 1 };

  const result: ReminderRunResult = { scanned: candidates.length, sent: 0, skipped: 0, failures: 0 };

  for (const lead of candidates) {
    try {
      const tokenCount = await totalTokenCount(lead.id);
      const check = isReminderEligible({
        status: lead.status,
        createdAt: lead.created_at,
        tokenCount,
        now,
      });
      if (!check.eligible) {
        result.skipped += 1;
        continue;
      }
      if (opts?.dryRun) {
        result.sent += 1;
        continue;
      }

      // Mint a genuinely fresh 48h token, exactly as /api/early-access/resend
      // does, so the link in the reminder actually verifies the address.
      const token = generateVerificationToken();
      await serviceInsert("email_verification_tokens", {
        lead_id: lead.id,
        token_hash: await hashToken(token),
        expires_at: tokenExpiry(),
      });

      const locale: Locale =
        lead.preferred_language && isLocale(lead.preferred_language)
          ? lead.preferred_language
          : defaultLocale;

      await sendVerificationEmail({
        email: lead.email,
        token,
        locale,
        baseUrl: site.url,
      });
      result.sent += 1;
    } catch (e) {
      console.error("[verification-reminders] lead failed", { leadId: lead.id, error: String(e) });
      result.failures += 1;
    }
  }

  return result;
}
