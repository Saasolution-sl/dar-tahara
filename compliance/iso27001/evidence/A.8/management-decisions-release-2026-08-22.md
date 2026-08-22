# Management-decisions release evidence — 2026-08-22

Evidence classification: Internal; references and redacted results only.

## Protected release

- GitHub PR 83 passed dependency review, secret/history detection, quality and
  dependency gates, infrastructure/container scanning and both CodeQL checks.
- The initial CodeQL review identified insecure test-nonce randomness. It was
  corrected with `node:crypto` before merge and the repeated check passed.
- Post-deployment inspection found the older bundle-02 verifier used the same
  non-cryptographic nonce pattern. The follow-up evidence branch applies the
  same `node:crypto` correction; this affects test identities, not runtime code.
- GitHub merged the change as verified commit
  `d46435d8c19aec02b2231738004db7cb7f5db7e1`.
- GitHub and Forgejo `main` resolved to that same commit. The post-merge GitHub
  security workflow run `32571965424` passed.

## Production deployment

- Vercel deployment `dpl_C5S4dBFTfyG7f1eTZGvqPNjykjKy` reached `READY` and
  was aliased to `www.dartahara.com` from the exact checked-out merge.
- Public, login, MFA, account and admin responses retained report-only CSP.
- No production CSP enforcement or retention execution was enabled.

## Staging deployment and verification

- The release archive package checksum matched the checked-out merge before
  activation. The release symlink was switched to the versioned directory and
  the previous image was retained for rollback.
- Container `staging-dar-tahara-web` became healthy on image
  `dar-tahara-web:d46435d8c19aec02b2231738004db7cb7f5db7e1`.
- The external endpoint returned the expected basic-authentication challenge.
  Internal public/login/MFA/account/admin responses used enforced CSP and no
  report-only header.
- Runtime configuration was checked as booleans only. CSP enforcement was on;
  retention execution was off; the expected staging Supabase project, Stripe,
  Mautic, Resend, malware scanner and security sink were configured. Maps,
  Turnstile, WhatsApp, external support, Cubbit, analytics and assistant
  providers were not configured and are not claimed operational.
- Four Storage buckets remained private and zero tables were present in the
  `supabase_realtime` publication.
- Two transient customer-side identities passed 18 isolation tests; one
  transient staff identity passed nine least-privilege/MFA tests. Both suites
  reported cleanup `PASS` with zero matching orphans.
- Harmless content returned clean and EICAR returned
  `Eicar-Test-Signature` from the deployed application container.
- A controlled CSP event returned 204, persisted only origin/coarse-route
  metadata in staging Supabase and was found in the independent receiver.

## Remaining gate

The browser UI control runtime was unavailable because a required bundled
dependency was missing. This is recorded as not verified rather than replaced
with unsupported automation. Production CSP enforcement still requires the
seven-day enriched observation window, a completed browser UI journey, a named
Operations/CSP rollback owner and explicit management authorization.
