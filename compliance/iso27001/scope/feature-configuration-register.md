# Feature configuration and operating-state register

Status: **VERIFIED CONFIGURATION SNAPSHOT — 2026-08-22**

The state terms are deliberately distinct from code presence. No secret values
or customer records are included.

| Feature | Production state | Staging state | Evidence | Security/privacy action |
| --- | --- | --- | --- | --- |
| Stripe payments | Production active | Configuration present locally; live runtime recheck pending | Production secret/webhook variables; checkout, billing and webhook routes | Finance owner, dashboard roles, DPA/transfer, tax and retention review |
| Google Maps | Production active | Configuration present locally; live runtime recheck pending | Production API key/map ID variables and application components | Restrict browser key; minimize address queries; supplier/transfer review |
| Cloudflare Turnstile | Production active | Unknown | Production site/secret variables and verification code | Verify challenge journeys and privacy notice; staging needs explicit configuration check |
| File uploads | Production active | Staging active | Four private Storage buckets in each project; upload routes; malware scanner evidence | Complete lifecycle by purpose; retain scan and access evidence |
| Supabase Realtime | Implemented but inactive | Implemented but inactive | No application subscriptions and no tables in `supabase_realtime` publication | Remove unused CSP WebSocket allowance if inactivity is confirmed as intentional |
| Supabase Storage | Production active | Staging active | Private buckets: assessment attachments/confirmations, pause-request and support attachments | Approve purpose-specific retention; test object deletion and backup expiry |
| WhatsApp | Implemented but inactive | Unknown | Production health returned 503; production variables absent; code and migrations exist | Do not list as operational; complete Meta/CNDP/supplier review before activation |
| Support attachments | Production active (Dar Tahara portal) | Staging active at Storage layer | Private support bucket, signed downloads, malware/type/size controls; Cubbit production configuration | External FreeScout/Hospitality Support integration is implemented but inactive in production |
| Mautic marketing | Production active/configured | Unknown | Production server/tracking variables and integration | Consent, CNDP, transfer, DPA and deletion propagation review |
| Google Analytics | Production active/configured behind consent | Configuration present locally | Production measurement ID and consent-gated loader | Confirm Morocco notice/CNDP position and disable if not approved |
| Groq assistant | Production active/configured | Unknown | Production provider key/model and application provider abstraction | Verify prompt minimization, region, DPA, retention and transfer authorization |
| Resend email | Production active | Staging alert path active | Production provider variable; live labelled security alert delivery | Verify DPA, recipients, templates, retention and account MFA |

`Production active/configured` proves deployed configuration and reachable code,
not contract approval or control audit. Staging runtime checks that require VPS
access remain open until Tailscale device reauthentication is completed.
