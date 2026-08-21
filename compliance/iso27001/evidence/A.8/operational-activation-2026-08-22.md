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
- One test event was labelled `receiver-live-test`; it is not an incident.
- The authoritative append-only Supabase Cloud security table remains enabled;
  the receiver provides an independent delivery copy and alert path.

## CSP

- Production returned the expected report-only policy on sampled public/login
  pages. The seven-day summary contained one labelled rollout-test report and no
  established operational violation trend.
- Production enforcement remains gated; protected staging is the canary.

Verification commands and raw outputs remain in the restricted operational
execution record. Controls: A.8.7, A.8.15, A.8.16, A.8.20, A.8.26 and A.8.28.
