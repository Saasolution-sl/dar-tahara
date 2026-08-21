export type ControlSource = Record<string, string | undefined>;

export type DriftCheck = {
  id: string;
  file: string;
  required: string[];
};

export type DriftResult = {
  id: string;
  file: string;
  status: "pass" | "fail";
  missing: string[];
};

export const ISO27001_DRIFT_CHECKS: DriftCheck[] = [
  { id: "CI-SECURITY-GATES", file: ".github/workflows/security.yml", required: ["CodeQL", "gitleaks", "trivy-action", "security:drift"] },
  { id: "AUTHORIZATION-AUDIT", file: "supabase/tests/iso27001_production_authorization_audit.sql", required: ["c.relrowsecurity", "security_invoker=true", "authenticated"] },
  { id: "PRIVILEGED-MFA", file: "src/lib/mfa-policy.ts", required: ["aal2", "privilegedMfaEnforced"] },
  { id: "SHARED-RATE-LIMIT", file: "src/lib/rate-limit.ts", required: ["consume_rate_limit", "RATE_LIMIT_KEY_SECRET"] },
  { id: "OFFSITE-BACKUP", file: "deploy/vps/backup-supabase.sh", required: ["restic backup", "restic check"] },
  { id: "HOST-HARDENING", file: "deploy/vps/verify-host-hardening.sh", required: ["host_hardening_result=pass", "failures=0"] },
  { id: "CSP", file: "src/lib/content-security-policy.ts", required: ["Content-Security-Policy", "frame-ancestors", "object-src 'none'"] },
  { id: "UPLOAD-SCANNING", file: "src/lib/file-security.ts", required: ["MALWARE_SCANNER_URL", "content_type_mismatch", "result.clean !== true"] },
  { id: "ASSESSMENT-EVIDENCE-LIFECYCLE", file: "src/app/api/assessment-employee/assessments/complete/route.ts", required: ["inspectAttachmentBytes", "approvedRetentionDays", "assessment_confirmation_evidence"] },
  { id: "RETENTION-GATING", file: "src/lib/retention-control.ts", required: ["active_legal_hold", "retention_rule_unapproved", "RETENTION_EXECUTION_ENABLED"] },
  { id: "APPEND-ONLY-LOG", file: "supabase/migrations/20260821122147_iso27001_p2_p3_controls.sql", required: ["security_event_log_is_append_only", "payload_sha256"] },
  { id: "ISMS-POLICIES", file: "compliance/iso27001/policies/information-security-policy.md", required: ["Approval required", "Policy owner", "ISO/IEC 27001:2022"] },
  { id: "INTERNAL-AUDIT", file: "compliance/iso27001/audits/internal-audit-program.md", required: ["independence", "corrective action", "management review"] },
];

export function evaluateIso27001Drift(
  sources: ControlSource,
  checks: DriftCheck[] = ISO27001_DRIFT_CHECKS,
): DriftResult[] {
  return checks.map((check) => {
    const content = sources[check.file] || "";
    const missing = check.required.filter((needle) => !content.includes(needle));
    return {
      id: check.id,
      file: check.file,
      status: missing.length === 0 ? "pass" : "fail",
      missing,
    };
  });
}
