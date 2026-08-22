# Operational activation evidence — 2026-08-22

Evidence classification: Internal; references only. Credentials, raw logs and
email contents are excluded from the repository.

## Upload malware protection

- Deployment: VPS containers `dar-tahara-clamav` and
  `dar-tahara-malware-bridge`; clamd TCP is isolated on an internal Docker
  network and the HTTPS bridge requires a bearer token.
- Engine observed: ClamAV 1.4 LTS patch stream with current signatures.
- Results: clean text returned `clean=true`; the standard harmless EICAR test
  returned `clean=false` and `Eicar-Test-Signature`.
- The staging web container repeated both results using its actual deployment
  environment. Vercel production was rebuilt and aliased to `www.dartahara.com`
  with the scanner variables present.

## Security event delivery

- Deployment: `dar-tahara-security-receiver`, authenticated HTTPS routes and a
  restricted persistent volume with a SHA-256 previous-record hash chain.
- Results: unauthorized requests were rejected; log delivery returned 202 and
  alert delivery returned 202 with `alertSent=true`.
- Labelled verification events (`receiver-live-test` and
  `staging-runtime-verification`) are test records, not incidents. The staging
  application runtime delivered the non-alert verification event successfully
  (`202`, `accepted=true`).
- The authoritative append-only Supabase Cloud security table remains enabled;
  the receiver provides an independent delivery copy and alert path.

## CSP

- Production returned the expected report-only policy on sampled public/login
  pages. The seven-day summary contained one event generated during the known
  controlled rollout test and no established operational violation trend. The
  stored event itself did not retain a test label or enough origin detail to
  independently attribute it; E-033 addresses that evidence-quality gap.
- Protected staging returned an enforced CSP header and no report-only header
  from the deployed application runtime. Production enforcement remains gated
  until the representative-traffic observation period is complete.

## Release verification

- GitHub PR 81 was merged as signed/verified commit
  `4bcb41718ba837905c15b04a21ca97a14a3ff5d4`; GitHub and Forgejo `main`
  references were synchronized to that commit.
- Vercel production deployment `dpl_HJv75foRSGPZFUK4o5nAsipkmU5V` reached
  `Ready` and was aliased to `www.dartahara.com`; the public response retained
  the intended CSP report-only policy.
- Staging ran healthy from image
  `dar-tahara-web:4bcb41718ba837905c15b04a21ca97a14a3ff5d4`.
- From that staging runtime, clean and EICAR malware checks passed, the security
  log receiver accepted a labelled non-alert event, and CSP enforcement was
  confirmed (`enforced=true`, `reportOnly=false`).

Verification commands and raw outputs remain in the restricted operational
execution record. Controls: A.8.7, A.8.15, A.8.16, A.8.20, A.8.26 and A.8.28.
