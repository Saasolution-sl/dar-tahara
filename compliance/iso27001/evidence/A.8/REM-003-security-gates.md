# REM-003 security-gate evidence

Date: 2026-08-21

Status: **Active on GitHub; continuing operational review required**

Controls: A.5.17, A.5.21, A.8.8, A.8.12, A.8.25, A.8.29, A.8.32

Risks: R-001, R-002, R-013

## Implemented definitions

- `.github/workflows/security.yml` runs production and full dependency audits, type-checking, linting, tests, a production build, current-tree secret detection, full-history Gitleaks, pull-request dependency review, and CodeQL.
- Third-party and GitHub-maintained actions are pinned to immutable commit SHAs.
- `.github/dependabot.yml` schedules weekly npm and GitHub Actions updates and groups compatible minor/patch changes.
- `scripts/scan-secrets.ts` scans tracked and non-ignored untracked files up to 2 MiB. It reports only file, line and detector name; suspected values are suppressed.
- `src/lib/security/secret-scan.test.ts` verifies representative detection, line reporting, placeholder handling and value suppression.

## Local verification

| Check | Result |
| --- | --- |
| `actionlint` 1.7.12 | Workflow passed |
| YAML parse | Workflow and Dependabot definitions passed |
| `npm run security:secrets` | Passed for 814 repository files |
| `npm run security:audit:production` | Passed: 0 vulnerabilities |
| `npm run security:audit` | Passed: 0 vulnerabilities |
| `npm test` | Passed: 664/664 tests, including 3 secret-detector tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; existing ESLintRC deprecation warning only |
| Clean CI-style `npm ci` and `npm run build` | Passed without ignored `.env.local` files; 163 static pages generated |

## Residual work and boundary

GitHub is the authoritative review/release repository and Forgejo is its
downstream mirror. The hosted workflow and native repository controls are
operational. Alert-routing exercises, independent review, and sustained
operating evidence remain outstanding; source and CI evidence alone do not
establish certification readiness.

## Hosted verification update

GitHub pull request 65 executed the workflow on 2026-08-21. After the documented
Gitleaks false-positive correction, the pull request merged and post-merge run
`32466510778` completed successfully at commit
`5927201863e03c128f921656efd0fa7b0b161728`. GitHub dependency graph/security
updates, secret scanning, push protection and private vulnerability reporting
are active. Ruleset `21137818` makes the named security jobs strict required
checks for `main`, requires pull requests and signed commits, blocks force-push
and deletion, and has no bypass actors.

The repository has one collaborator, so a one-review requirement would make
every change unmergeable. Independent approval remains a governance residual
until a second qualified reviewer is appointed. GitHub did not enable
non-provider secret patterns or validity checks, so Gitleaks/full-history and
push protection remain the compensating controls.

Pull request 76 delivered the signed Critical/P1 source remediation at commit
`d61d83ad2e89eb42f4fcfd7b70c14d77d11a8717`. PR run `32473518119` and
post-merge run `32473769988` passed all applicable gates, including the new
source/IaC/secret and production-container Trivy job. Forgejo `main` was then
fast-forwarded to the same commit without a force-push.
