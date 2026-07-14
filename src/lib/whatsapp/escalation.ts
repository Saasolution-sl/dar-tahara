export type EscalationSeverity = "low" | "normal" | "high" | "urgent";

export type EscalationDecision = {
  required: boolean;
  category: string;
  reason: string;
  severity: EscalationSeverity;
};

const RULES: Array<{ pattern: RegExp; category: string; severity: EscalationSeverity }> = [
  { pattern: /\b(theft|stolen|robbed|vol|سرقة|مسروق)\b/i, category: "theft", severity: "urgent" },
  { pattern: /\b(?:(?:missing|lost)\s+(?:physical\s+)?keys?|keys?\s+(?:is|are|went)?\s*missing)\b|\bclé(?:s)? perdue|مفتاح مفقود/i, category: "missing_key", severity: "urgent" },
  { pattern: /\b(personal safety|unsafe|danger|threatened|harassment|خطر|تهديد)\b/i, category: "personal_safety", severity: "urgent" },
  { pattern: /\b(lawyer|legal threat|sue|court|mise en demeure|محامي|قانوني)\b/i, category: "legal_threat", severity: "high" },
  { pattern: /\b(refund|chargeback|payment dispute|remboursement|استرجاع|نزاع دفع)\b/i, category: "refund_or_payment_dispute", severity: "high" },
  { pattern: /\b(damage|liability|insurance claim|dégât|responsabilité|ضرر|مسؤولية)\b/i, category: "damage_or_liability", severity: "high" },
  { pattern: /\b(terminate|termination|formal complaint|privacy request|delete my data|résiliation|plainte|حذف بياناتي)\b/i, category: "formal_request", severity: "high" },
  { pattern: /\b(manager|human|person|agent|support team|supervisor|responsable|humain|موظف|إنسان)\b/i, category: "human_requested", severity: "normal" },
];

export function classifyEscalation(message: string, failedAttempts = 0): EscalationDecision {
  for (const rule of RULES) {
    if (rule.pattern.test(message)) {
      return { required: true, category: rule.category, reason: rule.category, severity: rule.severity };
    }
  }
  if (failedAttempts >= 2) {
    return { required: true, category: "unresolved", reason: "two_failed_resolution_attempts", severity: "normal" };
  }
  return { required: false, category: "none", reason: "none", severity: "low" };
}

export function looksLikePromptInjection(message: string): boolean {
  return /ignore (?:all |the )?(?:previous|system)|reveal (?:the )?(?:prompt|instructions)|developer message|system prompt|jailbreak/i.test(message);
}

export function looksLikeSpam(message: string): boolean {
  const urls = message.match(/https?:\/\/|www\./gi)?.length || 0;
  return urls > 5 || /(.)\1{49,}/s.test(message) || /(?:buy now|guaranteed profit|crypto giveaway)/i.test(message);
}
