# First-run certification-readiness findings

Status: **DRAFT — MANAGEMENT APPROVAL REQUIRED**
Date: 2026-08-21

## Critical security findings

No confirmed P0 compromise was found. Immediate P1 findings are:

- Known high-severity production dependency advisories with fixes available; Next.js 15.5.20 is below the relevant 15.5.21 fixed threshold.
- GitHub `main` is unprotected; security scanning and Dependabot updates are disabled; no CI or protected deployment environment is present.
- Live production RLS, grants, privileged functions and object policies are not verified.
- Database backups appear same-host only and no successful restoration test exists.
- Privileged MFA, strong password/session settings and periodic access reviews are not evidenced.
- Live VPS/container/network/patch posture and security monitoring are unknown.
- No approved incident process or exercise exists.
- Physical/property access, staff endpoint security and termination revocation are unverified.

## Technical actions Codex can implement after approval

1. Upgrade Next.js and transitive dependencies; run audit, test, typecheck, lint and build gates.
2. Add security CI: CodeQL, dependency review, Gitleaks, npm audit and existing test/type/lint checks, with pinned actions.
3. Add migration/static checks for RLS, grants, public functions/views and service-role usage; prepare a read-only live drift collector.
4. Implement a CSP report-only baseline and automated header tests.
5. Replace process-local rate limiting with an approved shared control and trusted-proxy rules.
6. Add file magic-byte/content scanning and quarantine flow.
7. Add machine-readable compliance/drift outputs for branches, dependencies, RLS, backups and logging.

Repository settings, production reads, supplier provisioning, paid services, credential rotation and deployment require separate approval or access.

## Human actions

See [HUMAN_ACTIONS.md](../../../HUMAN_ACTIONS.md). Highest priority: approve scope/owners/risk criteria, validate employee and property-access controls, complete supplier/privacy/legal review, approve BIA/RTO/RPO, and authorize live read-only verification.

## Questions and blockers

- Which legal entity and locations are to be certified?
- Which repository and branch deploy to production, and who can approve/deploy?
- What host/provider, DNS, firewall and monitoring operate production?
- How can read-only production database/config evidence be collected without exposing customer data?
- Which external integrations are enabled, in which regions, under which contracts?
- Who are the employees/contractors, and what screening, devices, training and JML processes apply?
- How are physical keys, smart-lock credentials and customer-property access issued, limited, logged and revoked?
- What RTO/RPO and data-retention periods does management approve?
- Where will restricted compliance evidence be stored?

## Recommended tooling

Pilot self-hosted CISO Assistant Community with synthetic data as the human-governed ISMS system of record. Keep CI/infrastructure checks as evidence producers and consider OSCAL as an interchange format. Do not adopt a community ISO27001 MCP as the authoritative record before security, multi-user, backup, audit and export review. Do not install any tooling until the architecture is approved.

## Proposed next phase

Approve a controlled Phase 0/1 batch covering REM-001 through REM-004:

1. Patch dependency vulnerabilities.
2. Confirm the authoritative repository and protect release paths.
3. Add mandatory security CI and secret prevention.
4. Perform read-only production database authorization/RLS drift verification.

Start backup redesign (REM-005) once management approves storage location, encryption/key ownership and RTO/RPO assumptions. Stop after this batch for evidence review before identity, monitoring, recovery and policy phases continue.
