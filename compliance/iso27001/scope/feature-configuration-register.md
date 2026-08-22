# Feature configuration and operating-state register

Status: **VERIFIED CONFIGURATION SNAPSHOT — 2026-08-22**

The state terms are deliberately distinct from code presence. No secret values
or customer records are included.

| Feature | Production state | Staging state | Evidence | Security/privacy action |
| --- | --- | --- | --- | --- |
| Stripe payments | Production active | Configured; transaction not exercised | Production and staging secret/webhook variables; checkout, billing and webhook routes | Finance owner, dashboard roles, DPA/transfer, tax and retention review |
| Google Maps | Production active | Inactive/not configured | Production API key/map ID variables; absent from deployed staging environment | Restrict browser key; minimize address queries; supplier/transfer review |
| Cloudflare Turnstile | Production active | Inactive/not configured | Production site/secret variables; absent from deployed staging environment | Verify production challenge journeys and privacy notice before relying on the control |
| File uploads | Production active | Staging active | Four private Storage buckets in each project; upload routes; malware scanner evidence | Complete lifecycle by purpose; retain scan and access evidence |
| Supabase Realtime | Implemented but inactive | Implemented but inactive | No application subscriptions and no tables in `supabase_realtime` publication | Remove unused CSP WebSocket allowance if inactivity is confirmed as intentional |
| Supabase Storage | Production active | Staging active | Private buckets: assessment attachments/confirmations, pause-request and support attachments | Approve purpose-specific retention; test object deletion and backup expiry |
| WhatsApp | Implemented but inactive | Inactive/not configured; health returns 503 | Production and staging variables absent; code and migrations exist | Do not list as operational; complete Meta/CNDP/supplier review before activation |
| Support attachments | Production active (Dar Tahara portal) | Storage/scanner layer active; external support inactive | Private support bucket and passing clean/EICAR scanner checks; external support variables absent | Complete signed-download/upload journey; keep external integration inactive until reviewed |
| Mautic marketing | Production active/configured | Configured; journey not exercised | Production and staging server/API variables and integration | Consent, CNDP, transfer, DPA and deletion propagation review |
| Google Analytics | Production active/configured behind consent | Inactive/not configured | Production measurement ID; deployed staging value empty | Confirm Morocco notice/CNDP position and disable if not approved |
| Groq assistant | Production active/configured | Inactive/not configured | Production provider key/model; no supported assistant-provider key in staging | Verify prompt minimization, region, DPA, retention and transfer authorization |
| Resend email | Production active | Configured; prior alert path verified | Production/staging provider variables; prior labelled security alert delivery | Verify DPA, recipients, templates, retention and account MFA |
| Malware scanning | Production active | Operational | Deployed app container returned clean for harmless text and `Eicar-Test-Signature` denial for EICAR | Maintain signature freshness, monthly image review and fail-closed monitoring |
| Security-event sink | Production active | Operational | Sanitized staging CSP event persisted in Supabase and the independent receiver | Approve retention/review cadence and include receiver volume in off-site backup scope |

`Production active/configured` proves deployed configuration and reachable code,
not contract approval or control audit. The staging snapshot was verified from
the deployed runtime on 2026-08-22 without recording any value. A browser UI
journey remains open because the available browser-control runtime was missing
a bundled dependency; HTTP, database and synthetic authorization checks passed.
