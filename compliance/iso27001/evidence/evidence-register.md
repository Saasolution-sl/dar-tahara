# Evidence register

The register contains references only. Sensitive evidence must be stored in an approved restricted repository.

| ID | Description | Owner | Storage/reference | Collected | Controls | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| E-001 | Repository source baseline and working-tree status | Engineering | Git commit `7fd50e9`; local review record | 2026-08-21 | A.5.8, A.8.4, A.8.25, A.8.32 | Verified locally; uncommitted state noted |
| E-002 | Dependency inventory and lockfile | Engineering | `package.json`, `package-lock.json` | 2026-08-21 | A.5.9, A.5.21, A.8.8 | Verified locally |
| E-003 | Production dependency audit | Engineering | `npm audit --omit=dev --json` execution record | 2026-08-21 | A.8.8, A.8.29 | Failed security gate: 3 high, 1 moderate |
| E-004 | Test execution | Engineering | `npm test` execution record | 2026-08-21 | A.8.25, A.8.28, A.8.29 | 661/661 passed |
| E-005 | Type and lint validation | Engineering | `npm run typecheck`; `npm run lint` | 2026-08-21 | A.8.25, A.8.28, A.8.29 | Passed; ESLint legacy-config warning |
| E-006 | Database schema/RLS migration set | Engineering/Database | `supabase/migrations/` (59 files observed) | 2026-08-21 | A.5.15-A.5.18, A.8.2, A.8.3, A.8.24 | Code evidence only; deployment unverified |
| E-007 | Authentication and authorization implementation | Engineering | `src/lib/portal-auth.ts`, Supabase clients, auth routes/tests | 2026-08-21 | A.5.15-A.5.18, A.8.5 | Partial; MFA and live settings unverified |
| E-008 | Webhook security implementation | Engineering | Stripe, WhatsApp and support webhook code/tests | 2026-08-21 | A.8.20, A.8.24, A.8.26, A.8.29 | Verified in code/tests |
| E-009 | VPS/container/reverse-proxy configuration | Operations | `deploy/vps/` | 2026-08-21 | A.8.9, A.8.20-A.8.24 | Code evidence only; live state unverified |
| E-010 | Backup job configuration | Operations | `deploy/vps/backup-supabase.sh` and cron | 2026-08-21 | A.5.30, A.8.13 | Partial; no restore or off-site evidence |
| E-011 | GitHub repository governance snapshot | Engineering manager | GitHub API/CLI assessment record | 2026-08-21 | A.5.18, A.8.4, A.8.25, A.8.32 | Verified metadata; security gap present |
| E-012 | Current-tree secret-pattern scan | Engineering | Local detector record; locations only | 2026-08-21 | A.5.17, A.8.12, A.8.24 | No matches; history not comprehensively scanned |
| E-013 | Data-flow and supplier code inventory | Security/Privacy | This assessment's inventories | 2026-08-21 | A.5.9, A.5.19-A.5.23, A.5.34 | Initial, requires operational confirmation |
| E-014 | Supabase connector observation | Database owner | Connected-service assessment record | 2026-08-21 | A.8.3, A.8.8, A.8.13 | Project inactive/table query timeout; not production proof |
| E-015 | Security headers | Engineering/Operations | `next.config.mjs`, Caddy files | 2026-08-21 | A.8.20, A.8.24, A.8.26 | Partial; live headers and CSP unverified/missing |
| E-016 | REM-001 dependency remediation | Engineering | `evidence/A.8/REM-001-dependency-remediation.md`, `package.json`, `package-lock.json` | 2026-08-21 | A.5.21, A.8.8, A.8.29 | Worktree verified: both audits clean; 661 tests, typecheck, lint and build passed; release pending |
| E-017 | REM-003 security-gate implementation | Engineering/Security | `evidence/A.8/REM-003-security-gates.md`, `.github/`, GitHub runs `32473518119` and `32473769988` | 2026-08-21 | A.5.17, A.5.21, A.8.8, A.8.12, A.8.25, A.8.29, A.8.32 | Signed remediation PR and post-merge runs passed; native scanning/security updates active |
| E-018 | GitHub repository protection export | Engineering owner | Repository ruleset `21137818`; GitHub security settings API record | 2026-08-21 | A.5.15, A.5.18, A.8.4, A.8.32 | PR/signed/strict green gates active; no bypass; independent reviewer unavailable |
| E-019 | Authorization drift audit | Database owner | `supabase/tests/iso27001_production_authorization_audit.sql`; local PostgreSQL execution record | 2026-08-21 | A.5.15-A.5.18, A.8.2, A.8.3 | Local migrated schema passed; 98/98 public tables RLS; production run pending |
| E-020 | Encrypted backup and isolated restore controls | Operations | `deploy/vps/backup-supabase.sh`, `test-supabase-restore.sh`, `backup.env.example` | 2026-08-21 | A.5.30, A.8.13, A.8.14 | Shell syntax verified; off-site deployment and completed restore evidence pending |
| E-021 | Privileged AAL2 and shared abuse control | Security/Engineering | `src/lib/mfa-policy.ts`, `/security/mfa`, shared limiter migration/code/tests, Supabase config | 2026-08-21 | A.5.16-A.5.18, A.8.5, A.8.6, A.8.20, A.8.26 | Unit/build passed; atomic allow/block and browser-role denial verified locally; production rollout pending |
| E-022 | Infrastructure scanning/hardening controls | Security/Operations | Trivy workflow job; GitHub runs `32473518119` and `32473769988`; `deploy/vps/verify-host-hardening.sh` | 2026-08-21 | A.8.7-A.8.9, A.8.20-A.8.22 | Clean tracked-tree and production-image scans passed locally and on GitHub; live-host output pending |
| E-023 | Incident detection/response baseline | Incident Manager | Structured event implementation, event catalogue, procedure, register and tabletop template | 2026-08-21 | A.5.24-A.5.28, A.6.8, A.8.15-A.8.17 | Code/tests passed; named responders, alert exercise, protected retention and tabletop pending |
| E-024 | Local ignored-secret observation | Engineering owner | Restricted local scan record; HA-015 (no secret value stored here) | 2026-08-21 | A.5.17, A.8.2, A.8.12 | Same Stripe test secret present in three Git-ignored local files; full-history/current repository gates clean; rotation and backup deletion pending |
| E-025 | Approval-gated retention foundation | Legal/Privacy/Engineering | `retention_policy_rules`, `legal_holds`, execution log, retention controller/tests and procedure | 2026-08-21 | A.5.33, A.5.34, A.8.10 | Fail-closed source/tests prepared; periods, approvals and synthetic production lifecycle pending |
| E-026 | CSP and upload protection | Engineering/Operations | CSP middleware/report endpoint; file-signature/scanner code/tests; attachment migration/routes | 2026-08-21 | A.8.7, A.8.12, A.8.20, A.8.26, A.8.28 | Source/unit evidence prepared; live report review, enforcement and scanner detection test pending |
| E-027 | Protected security-event log | Security/Privacy | Event schema/redaction tests; append-only hashed table; off-host sink support; logging procedure | 2026-08-21 | A.5.33, A.5.34, A.8.15-A.8.17 | Source/unit evidence prepared; sink/access/retention and review evidence pending |
| E-028 | P2/P3 governance package | ISMS manager | Policy, supplier, SDLC, property drill, training, BIA/recovery, audit/review and corrective-action templates | 2026-08-21 | Clauses 7-10; A.5.19-A.5.23, A.5.29-A.5.37, A.6, A.7.2, A.7.9, A.8.25-A.8.33 | Draft artifacts only; named approvals and completed records explicitly pending |
| E-029 | Machine-readable control drift gate | Security/Engineering | `security:drift`, controlled negative unit test and GitHub quality gate | 2026-08-21 | A.5.36, A.8.9, A.8.16 | Local/PR verification pending at time of entry; merge/run IDs to be added after green checks |

## Evidence gaps

All controls still require sustained operating evidence before certification.
Highest-priority remaining evidence: live RLS/privilege export, independent
repository reviewer, privileged-user/factor inventory and MFA recovery proof,
host/container scan, off-site backup restoration record, protected log retention,
alert-to-incident test, incident exercise, supplier contracts/DPA records,
employee lifecycle evidence, physical/property-access drill, approved policies,
internal audit and management review minutes.
