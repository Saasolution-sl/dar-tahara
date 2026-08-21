# Technical security assessment

Status: **DRAFT — SOURCE-LEVEL ASSESSMENT, NOT A PENETRATION TEST**
Observed: 2026-08-21

## Critical security findings

No confirmed P0 compromise, active exploitation, plaintext private key, or current tracked-tree credential was found. The following require urgent P1 remediation:

1. **Known vulnerable production dependencies.** `npm audit --omit=dev` reported three high and one moderate finding. Installed Next.js 15.5.20 is below the fixed 15.5.21 threshold for several advisories, including SSRF/DoS classes. Upgrade and regression testing are immediately actionable.
2. **Source/release governance is not adequate for production.** GitHub `main` is unprotected. The only active ruleset covers `production` but requires zero approvals. No GitHub Actions workflows/environments were found. Secret scanning, push protection and Dependabot security updates are disabled.
3. **Production authorization state is unverified.** Migration code shows strong RLS intent, but the connected Supabase project was inactive and a table query timed out. The self-hosted production schema, grants, policies and storage configuration were not inspected.
4. **Recovery can fail catastrophically.** Backups are coded as daily same-host dumps retained for 14 days. There is no off-site/encrypted-copy evidence, alerting, object-store backup evidence or actual restore test.
5. **Privileged authentication is insufficiently evidenced.** The observed configuration permits six-character passwords with no complexity; MFA enrollment is available but AAL2 enforcement and privileged-user coverage were not found.
6. **Host/container security is unknown.** No live OS, patch, firewall, exposed-port, SSH, container-privilege, registry or runtime-log inspection was possible.

## Identity and access management

Strengths:

- Supabase `getUser()` is used for server authorization rather than trusting client metadata.
- Roles are database-backed; customer/staff suspension is checked before role authorization.
- Ownership-aware RLS policies and column grants are extensively represented in migrations.
- Service-role clients are marked server-only and credentials are obtained from environment variables.
- Auth tests cover blocked accounts, role routing and ownership boundaries.

Gaps:

- Live user/admin/service-account inventory, MFA coverage, password settings and dormant-account review are unavailable.
- No approved joiner/mover/leaver process, periodic access review, access request/approval record or break-glass process exists in evidence.
- Local password minimum is 6, complexity is empty, secure password change is disabled, and session timebox/inactivity settings are commented out.
- MFA TOTP is enabled as a capability but there is no application-level AAL2 gate or enforcement evidence.
- GitHub has one observed admin collaborator, creating key-person/concentration risk; Forgejo access is unknown.

Assessment: **Partially Implemented; high-priority verification and hardening required.**

## Application security

Strengths:

- Next.js/React encoding defaults; structured-data serialization tests; input normalization and server-side business-rule validation.
- Same-origin checks on 38 route files, authentication/authorization patterns on 69, and webhook/secret guards on 14 (static pattern counts; not proof of complete coverage).
- Stripe, Meta/WhatsApp and support webhook signature logic with tests; payload-size controls on support webhook.
- File upload size/type allowlists, safe filenames, private buckets and short-lived signed URLs.
- SSRF restrictions are tested for FreeScout base URLs; open redirects are tested.
- 661 tests, typecheck and lint passed on the reviewed worktree.

Gaps:

- No CSP is configured. HSTS exists in Caddy files but not in application headers and was not verified live.
- Rate limiting is an in-memory map per process and trusts proxy IP headers without an evidenced trusted-proxy boundary; it is not a durable distributed control.
- No comprehensive authenticated DAST, IDOR/BOLA suite, CSRF matrix, CORS review, fuzzing or file-content/malware scan was performed.
- Static routing heuristics found apparently unguarded state-changing routes; manual sampling showed legitimate public/legacy/delegating endpoints, demonstrating that complete route-by-route threat review remains required.
- Error/console logging can include provider IDs and error messages; production redaction and aggregation were not verified.

Assessment: **Partially Implemented.**

## Secrets and cryptography

Strengths:

- `.env` files, backup variants, PEMs and local runtime artifacts are ignored.
- The current tracked-tree location-only scan found no common live key/JWT/private-key patterns.
- WhatsApp identifiers/content have HMAC/AES-GCM protections and tests.
- Stripe and support signatures use signed webhook patterns; TLS proxy configuration exists.

Gaps:

- No full-history Gitleaks/TruffleHog evidence, push protection, central secrets vault, rotation schedule, key-custody record or emergency rotation exercise.
- Environment files on the VPS appear to be the runtime secret store; access, encryption at rest and backup behavior are unverified.
- Encryption key versions, rotation, separation and recovery are not documented.

Assessment: **Partially Implemented. Never treat the no-match current-tree scan as proof that history is clean.**

## Database and storage

Strengths:

- 59 migrations define approximately 97 application tables. Extensive `ENABLE ROW LEVEL SECURITY`, grants/revocations, ownership policies and private-schema helper functions are present.
- Private storage buckets use ownership paths and size/MIME constraints.
- Security-definer functions are often placed in `private` or explicitly revoked/granted; tests assert selected RLS expectations.
- Database pooler override binds host ports to loopback.

Gaps:

- Literal parsing found 12 tables without a directly matched literal RLS statement; some are secured by dynamic loops or later migrations, so this is a verification queue—not a confirmed exposure.
- 21 `SECURITY DEFINER` mentions require live owner/search-path/EXECUTE review.
- Live exposed schemas, grants, policies, views, functions, buckets, extensions and advisor results are unavailable.
- Object-store encryption, versioning, lifecycle, access logs, malware scanning and recovery are unverified.
- Service-role REST helpers create a broad privileged path whose runtime use must be audited and minimized.

Assessment: **Partially Implemented in code; Requires Verification in production.**

## Infrastructure and network

Strengths:

- Caddy configuration specifies HSTS and defensive headers.
- Supabase database pooler binds loopback; only Kong is joined to the public network in the override.
- Application and database services have named networks and health checks; containers restart unless stopped.

Gaps:

- No live TLS scan, port scan, firewall, SSH, OS version, patch status, container image digest, rootless/privilege configuration, read-only filesystem, capability drop, resource limit, WAF/CDN or management-interface review.
- Application health check is WhatsApp-specific and may not prove database/business-path health.
- Compose image defaults to mutable `latest`; provenance/signing and registry controls are absent from evidence.
- Supabase local config shows network restrictions disabled and SSL enforcement commented; deployment-specific exposure must be verified rather than inferred.

Assessment: **Requires Verification; high inherent risk.**

## CI/CD and repository governance

Observed GitHub state:

- Public repository; `main` unprotected.
- Active `production` ruleset prevents deletion/non-fast-forward and requires PR use, but requires zero approvals and no code-owner review/thread resolution.
- No `.github` workflows, CODEOWNERS, SECURITY.md or environments found.
- Actions enabled for all actions; secret scanning, push protection and Dependabot security updates disabled.
- Forgejo governance and authoritative deployment path unknown.

Assessment: **Not Implemented to a certification-ready level.**

## Logging and monitoring

Code includes `audit_logs`, assistant/WhatsApp/support audit/event tables, webhook idempotency records and selected correlation IDs. No approved event catalogue, central protected log destination, alert rules, review schedule, access list, integrity protection, retention proof, clock synchronization proof or incident linkage is evidenced.

Assessment: **Partially Implemented; operational detection unverified.**

## Backup and recovery

| Store | Observed backup | Frequency/retention | Verification | Gap |
| --- | --- | --- | --- | --- |
| PostgreSQL | Custom `pg_dump` to `/srv/dartahara/backups` | Daily 02:15 UTC; 14 days | `pg_restore --list` only | Same host, encryption/off-site/alerts/full restore absent |
| Supabase object storage | None evidenced | Unknown | None | Define backup/versioning/restore |
| Cubbit objects | Provider durability only, unverified | Unknown | None | Obtain configuration and test restore |
| Mautic/support/Forgejo | Scripts/configs exist for some services | Unknown | None | Identify data stores and backup owners |
| Git repositories | GitHub/Forgejo copies | Event-driven | Clone possible | Settings/issues/release metadata need backup/export |

Assessment: **Not operationally verified.**

## GDPR/privacy and physical operations

Consent fields, privacy pages, limited redaction, private storage and selected retention jobs are positive. No approved RoPA, lawful-basis map, DSR process, processor register/DPA set, transfer assessment, cookie/analytics verification, breach decision workflow or end-to-end deletion proof exists. **LEGAL REVIEW REQUIRED.**

No evidence proves screening, property-entry authorization, unique/time-limited access, key/code issuance, staff device controls, lost-device response, printed-record handling, termination revocation or equipment disposal. Smart-lock product logic is not proof of operational access controls.

Assessment: **Requires Verification.**

## Security automation recommendation

First batch after approval:

1. Upgrade the vulnerable dependency set and make `npm audit --omit=dev` a blocking check.
2. Add GitHub/authoritative-repository gates: tests, typecheck, lint, CodeQL, dependency review and Gitleaks; pin third-party actions by commit SHA.
3. Add migration-based RLS/grant/function tests and a read-only production drift report.
4. Add container scanning with Trivy only if the production image/build path is confirmed.
5. Add CSP report-only tests and a shared rate-limit design.

Do not add tools that have no owner, alert path or remediation SLA.
