# Remediation implementation status

Last updated: 2026-08-21

This is the living execution record for the approved remediation sequence. The original first-run assessment remains an immutable baseline; completion here means the stated acceptance evidence exists, not that management has accepted residual risk.

| ID | Status | Current result / next gate |
| --- | --- | --- |
| REM-001 | Implemented and merged | GitHub `main` contains the patched dependency set. Production/full audits and the post-merge security workflow passed. See E-016/E-017. |
| REM-002 | Operational with one residual | GitHub is the authoritative review/release repository; active ruleset `21137818` requires PRs, signed commits, resolved threads, strict green security checks, and blocks deletion/force-push with no bypass. Forgejo is synchronized as a downstream mirror at signed commit `d61d83a`. Only one repository collaborator exists, so independent approval cannot yet be required. |
| REM-003 | Operational | Secret scanning, push protection, Dependabot security updates, private vulnerability reporting, Gitleaks, dependency review and CodeQL are active. PR run `32473518119` and post-merge run `32473769988` passed for the signed P1 remediation. Non-provider secret patterns/validity checks remain unavailable in repository settings. See E-017/E-018. |
| REM-004 | Implemented; live proof pending | Read-only authorization audit fails on missing RLS, unsafe views/definers/grants, deprecated policy helpers or public buckets. Local migrated schema passed with 98/98 public tables under RLS. Run against production under authorized read-only access. See E-019. |
| REM-005 | Implemented; deployment/restore proof pending | Backup streams directly to an encrypted off-site Restic repository, alerts failures, applies daily/weekly/monthly retention, and has a disposable network-isolated restore test/evidence record. Approve region/cost/custodians, deploy, then complete the first restore. See E-020. |
| REM-006 | Implemented; rollout proof pending | Password/session configuration hardened; privileged roles require AAL2 in production; TOTP enrollment/step-up and a logged, time-boxed break-glass procedure exist. Deploy and verify privileged-user/factor coverage plus recovery. See E-021. |
| REM-007 | Implemented; deployment/load proof pending | Trusted proxy parsing selects the verified right-hand hop. All sensitive endpoints use a service-role-only atomic PostgreSQL limiter with HMAC keys and fail-closed production behavior. Local concurrency boundary and negative grant checks passed; deploy migration and perform multi-instance abuse test. See E-021. |
| REM-008 | CI operational; live-host proof pending | Pinned Trivy source/IaC/secret/image gate and read-only host hardening verifier added. The blocking PR scan and post-merge scan passed, including the production image. Run the verifier against the live host and remediate any result before closure. See E-022. |
| REM-009 | Implemented baseline; operational exercise pending | Structured security events, high/critical webhook delivery, catalogue, response procedure, register and tabletop template added. Name responders, configure protected off-host logging/alert endpoint, test alert-to-incident and run tabletop. See E-023. |
| REM-010–REM-020 | Planned | Execute in backlog order subject to recorded legal, production and management gates. |
