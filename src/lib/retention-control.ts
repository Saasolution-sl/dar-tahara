import "server-only";

import { randomUUID } from "node:crypto";
import { emitSecurityEvent } from "@/lib/security-events";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";

export type RetentionRule = {
  category: string;
  retention_days: number | null;
  legal_basis: string | null;
  enabled: boolean;
  approved_by: string | null;
  approved_at: string | null;
  next_review_at: string | null;
};

export type LegalHold = {
  subject_type: string;
  subject_reference: string;
  expires_at: string | null;
};

export type RetentionDecision =
  | { allowed: true; daysByCategory: Record<string, number> }
  | { allowed: false; code: string; categories: string[] };

function isNonEmpty(value: string | null): value is string {
  return Boolean(value?.trim());
}

export function evaluateRetentionRules(
  categories: string[],
  rules: RetentionRule[],
  holds: LegalHold[],
  now = new Date(),
): RetentionDecision {
  const activeHolds = holds.filter((hold) => {
    if (hold.subject_type !== "retention_category" && hold.subject_type !== "all_records") return false;
    if (hold.expires_at && new Date(hold.expires_at) <= now) return false;
    return hold.subject_type === "all_records" || categories.includes(hold.subject_reference);
  });
  if (activeHolds.length > 0) {
    return {
      allowed: false,
      code: "active_legal_hold",
      categories: [...new Set(activeHolds.map((hold) => hold.subject_reference))],
    };
  }

  const byCategory = new Map(rules.map((rule) => [rule.category, rule]));
  const missing = categories.filter((category) => !byCategory.has(category));
  if (missing.length > 0) return { allowed: false, code: "retention_rule_missing", categories: missing };

  const invalid = categories.filter((category) => {
    const rule = byCategory.get(category)!;
    const days = rule.retention_days;
    return !rule.enabled
      || !Number.isInteger(days)
      || Number(days) < 1
      || !isNonEmpty(rule.legal_basis)
      || !isNonEmpty(rule.approved_by)
      || !rule.approved_at
      || Number.isNaN(new Date(rule.approved_at).valueOf())
      || new Date(rule.approved_at) > now;
  });
  if (invalid.length > 0) return { allowed: false, code: "retention_rule_unapproved", categories: invalid };

  const overdue = categories.filter((category) => {
    const review = byCategory.get(category)!.next_review_at;
    return Boolean(review && new Date(review) <= now);
  });
  if (overdue.length > 0) return { allowed: false, code: "retention_review_overdue", categories: overdue };

  return {
    allowed: true,
    daysByCategory: Object.fromEntries(categories.map((category) => [category, byCategory.get(category)!.retention_days!])),
  };
}

export async function approvedRetentionDays(category: string): Promise<number | null> {
  const rules = await serviceSelect<RetentionRule[]>(
    `retention_policy_rules?category=eq.${encodeURIComponent(category)}&select=category,retention_days,legal_basis,enabled,approved_by,approved_at,next_review_at&limit=1`,
  );
  const decision = evaluateRetentionRules([category], rules, []);
  return decision.allowed ? decision.daysByCategory[category] : null;
}

async function recordDecision(
  runId: string,
  categories: string[],
  mode: "dry_run" | "execute",
  status: "started" | "succeeded" | "failed" | "blocked",
  details: Record<string, unknown>,
  errorCode?: string,
) {
  await serviceInsert("retention_execution_log", categories.map((category) => ({
    run_id: runId,
    category,
    mode,
    status,
    error_code: errorCode ?? null,
    evidence: details,
  })));
}

export async function runApprovedRetention<T extends Record<string, number>>(input: {
  categories: string[];
  execute: (daysByCategory: Record<string, number>) => Promise<T>;
}): Promise<T | { executed: 0; blocked: number }> {
  const categories = [...new Set(input.categories)].sort();
  const runId = randomUUID();
  const filter = encodeURIComponent(`(${categories.join(",")})`);
  const [rules, holds] = await Promise.all([
    serviceSelect<RetentionRule[]>(`retention_policy_rules?category=in.${filter}&select=category,retention_days,legal_basis,enabled,approved_by,approved_at,next_review_at`),
    serviceSelect<LegalHold[]>("legal_holds?active=eq.true&select=subject_type,subject_reference,expires_at"),
  ]);
  const decision = evaluateRetentionRules(categories, rules, holds);
  const executionEnabled = process.env.RETENTION_EXECUTION_ENABLED === "true";

  if (!decision.allowed || !executionEnabled) {
    const code = decision.allowed ? "retention_execution_disabled" : decision.code;
    const blockedCategories = decision.allowed ? categories : decision.categories;
    await recordDecision(runId, categories, "dry_run", "blocked", { blocked_categories: blockedCategories }, code);
    await emitSecurityEvent({
      type: "retention_control_blocked",
      severity: "medium",
      correlationId: runId,
      metadata: { code, categories: blockedCategories },
    });
    return { executed: 0, blocked: categories.length };
  }

  await recordDecision(runId, categories, "execute", "started", { approved_categories: categories });
  try {
    const result = await input.execute(decision.daysByCategory);
    await recordDecision(runId, categories, "execute", "succeeded", { result });
    return result;
  } catch (error) {
    await recordDecision(runId, categories, "execute", "failed", {
      error: error instanceof Error ? error.name : "unknown_error",
    }, "retention_execution_failed");
    throw error;
  }
}
