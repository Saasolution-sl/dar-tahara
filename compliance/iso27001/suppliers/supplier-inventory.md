# Supplier and external-dependency inventory

Status: **DRAFT — CONTRACT AND PRODUCTION USE REQUIRE VERIFICATION**

“Verified” below means code, configuration, remote metadata or deployment files establish a dependency. It does not mean a production account is enabled or contractually approved.

| Supplier/service | Verified purpose | Information exchanged | Classification | Authentication/permissions | Criticality | Security/privacy dependency | Exit/continuity | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GitHub | Public source mirror/governance | Source, commit and account metadata | Internal/Public | OAuth/PAT/SSH; one admin collaborator observed | High | Supply-chain and repository integrity | Clone/export available; settings and issues need export | Verified; controls weak |
| Forgejo (hospitalityos.es) | Git remote, likely authoritative development/release service | Source and developer metadata | Confidential | SSH; permissions unknown | Critical/TBD | Release provenance and availability | Mirror exists on GitHub; backup/recovery unknown | Verified dependency; use unverified |
| Self-hosted Supabase/PostgreSQL | Auth, database, storage and API | All principal customer/employee/operational data | Restricted | JWT, publishable/anon and service role; RLS | Critical | Central confidentiality, integrity and availability boundary | Migrations portable; restore not tested | Verified design; live state unverified |
| VPS/container hosting | Next.js, Supabase, Caddy and cron | All application and database data | Restricted | SSH/admin model unknown | Critical | Host, network, patching and backup | Image/config available; alternate host and RTO unapproved | Supplier identity unverified |
| Stripe | Payments, payment methods, invoices, subscriptions and refunds | Identity, email, amounts, billing/provider references | Restricted | Secret key and signed webhooks; dashboard roles unknown | Critical | Payment integrity, fraud and availability | Provider export/migration and customer comms required | Verified integration |
| Mautic | Marketing automation and lead scoring | Contact, consent, preferences, attribution and tags | Confidential | API username/password | Medium | Consent, campaigns and deletion | CSV/API export; campaign recreation/backup needed | Verified integration/deployment |
| Resend | Transactional and authentication email/SMTP | Recipient, name, message content, links | Confidential | API key/SMTP credential | High | Account recovery and notifications | DNS/provider change and template migration | Verified integration |
| Meta/WhatsApp | Customer messaging | Phone identifiers, message content/media and delivery metadata | Restricted | Access token, app secret and webhook verification/signature | High | Messaging privacy and service availability | Phone-number/template migration and export constraints | Verified integration |
| FreeScout / Hospitality Support | Customer support and attachment sync | Identity, ticket content, attachments and metadata | Restricted | API token or key; webhook secret | High | Support confidentiality and response | Export and mailbox transition required | Both code paths verified; production choice unknown |
| Cubbit | S3-compatible attachment storage | Customer/support/property attachments and metadata | Restricted | Access/secret key; signed URLs | High | Object confidentiality, lifecycle and durability | Bulk object export; keys and lifecycle must be documented | Verified integration |
| Cloudflare Turnstile | Bot verification | IP/device/challenge telemetry and token | Confidential | Site and secret keys | Medium | Abuse prevention and privacy notice | Disable/replace with alternate CAPTCHA | Verified code; enablement unknown |
| Google Maps Platform | Address autocomplete/map | Address queries, IP/device telemetry | Confidential | Browser API key with restrictions unknown | Medium | Address privacy and availability | Manual address entry fallback needed | Verified code |
| Google Analytics | Optional site analytics | Online identifiers and usage events | Confidential | Public measurement ID/account access unknown | Low/Medium | Consent and transfer obligations | Disable/export | Verified code; enablement unknown |
| Gemini/Grok/Groq/assistant API | Optional reasoning and embeddings | Redacted prompts, knowledge or conversation context depending provider | Restricted | API keys | High/TBD | Model data use, retention, transfer and output security | Provider abstraction exists; local/alternate model possible | Multiple verified options; active one unknown |
| Unsplash / flagcdn.com | Public image delivery | Browser IP and request metadata | Internal | Public HTTP resource | Low | Availability/privacy/cookie notice | Self-host assets | Verified code dependency |
| DNS/domain provider | Domain, TLS routing and email records | DNS/account metadata | Restricted | Unknown | Critical | Domain takeover, email authenticity and availability | Transfer codes/secondary DNS | Supplier not identified |
| Vercel | Deployment configuration file exists | Potential source/deployment metadata | Restricted | Unknown | TBD | Could be legacy or alternate hosting | Confirm and remove stale dependency if unused | Presence verified; current use not verified |

## Required due diligence

For every production supplier obtain an owner, legal entity, service region, DPA/sub-processor list, international-transfer mechanism, security assurance, breach notification terms, retention/deletion terms, availability commitment, privileged-user inventory, MFA proof, contract renewal date and exit plan. **LEGAL REVIEW REQUIRED** for processor status and transfers.
