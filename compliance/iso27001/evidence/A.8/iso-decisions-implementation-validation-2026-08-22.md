# ISO implementation decisions: technical validation record

Date: 2026-08-22

State: **IMPLEMENTED IN PROTECTED WORKING BRANCH — RELEASE AND OPERATING EVIDENCE PENDING**

This record covers the repository implementation of management's Morocco scope,
temporary leadership, synthetic-staging-test, retention-safety and exercise-
preparation decisions. It contains no credentials, personal data or production
record exports.

## Validation completed

- Application tests: 659/659 passed, including CSP report minimization tests.
- Type checking: passed.
- Lint: passed with the existing Next.js legacy ESLint configuration warning.
- Production build: passed; 164 static pages generated.
- Machine-readable ISO/security drift checks: 13/13 passed.
- Production dependency audit: zero known vulnerabilities reported by
  `npm audit --omit=dev`.
- Repository secret scan: passed; no secret value is retained in this evidence.
- ISO CSV registers parsed successfully. The retention register contains 13
  proposed rows, no invalid periods, no approval/review/activation values and no
  status outside `PROPOSED`.

## Staging identity evidence

Two transient synthetic customer-side identities completed the existing
18-check isolation/RLS cycle. A separate transient synthetic staff identity
proved authentication, its least-privilege role, access to approved own fields,
denial of private staff fields, denial of administrator escalation, separation
from customer provisioning and required MFA step-up at AAL1. Both runs removed
their identities and reported zero matching orphans.

## Safety gates retained

- No production account or real-customer deletion test was created.
- `RETENTION_EXECUTION_ENABLED=false` remains mandatory and no retention row is
  activated.
- Production CSP remains report-only. The enriched CSP report collector is not
  evidence of production operation until the protected release is deployed.
- Restore, incident tabletop and training artifacts are prepared plans only;
  none is represented as a completed exercise.

## Open verification

Complete the protected merge, deploy the exact merged revision, reauthenticate
to the staging host, confirm its boolean feature-state snapshot, complete
representative browser journeys, and collect seven consecutive production days
of sanitized CSP evidence. Production enforcement still requires a named
Operations/CSP rollback owner and explicit management authorization.
