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
| E-017 | REM-003 security-gate implementation | Engineering/Security | `evidence/A.8/REM-003-security-gates.md`, `.github/`, `scripts/scan-secrets.ts` | 2026-08-21 | A.5.17, A.5.21, A.8.8, A.8.12, A.8.25, A.8.29, A.8.32 | Definitions and local checks verified; hosted execution/enforcement pending |

## Evidence gaps

All 93 controls require additional operating evidence before certification. Highest-priority evidence: live RLS/privilege export, repository/release settings, privileged-user inventory and MFA proof, host/container scan, backup restoration record, monitoring alerts, incident exercise, supplier contracts/DPA records, employee lifecycle evidence, physical/property-access procedure, approved policies, internal audit and management review minutes.
