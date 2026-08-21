# Content Security Policy enforcement rollout

Status: **STAGING ENFORCEMENT AUTHORIZED; PRODUCTION EVIDENCE GATE OPEN**

Owner: Engineering/Security

The protected staging environment is the enforcement canary. Production remains
report-only until all of these conditions are evidenced:

1. At least seven consecutive days of production report collection after the
   latest material frontend or third-party integration change.
2. Representative authenticated and unauthenticated journeys are exercised:
   public localized pages, login/recovery/MFA, account and staff portals,
   Turnstile, Stripe, Supabase realtime/storage, Maps and support attachments.
3. No unexplained violation remains. Any allowance must identify the required
   business feature and trusted origin; `unsafe-eval`, broad schemes and wildcard
   sources are prohibited.
4. Staging enforcement completes the same journey set without blocked features.
5. A rollback owner and command are recorded. Rollback is setting
   `CSP_ENFORCE=false` and redeploying; CSP reporting stays enabled.

Weekly evidence is produced by `scripts/collect-csp-summary.mjs` and stored as a
restricted execution record. A synthetic report is labelled and excluded from
the operational violation count. Enabling production enforcement is a normal
security release only after this gate passes; it is not inferred from a quiet
or short observation window.
