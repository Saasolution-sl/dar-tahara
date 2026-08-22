# Data-flow inventory

Status: **POPULATED CONFIGURATION BASELINE — LEGAL/OWNER REVIEW REQUIRED**

Operating-state classifications are maintained in
`scope/feature-configuration-register.md`. The initial business geography is
Morocco; supplier processing outside Morocco is a transfer-review dependency.

## End-to-end view

```mermaid
flowchart TD
  U[Customer / prospect / employee in Morocco] -->|HTTPS forms, portal, API| W[Vercel Next.js production]
  W -->|Auth requests and cookies| A[Managed Supabase Auth]
  W -->|PII, operations, audit events| P[(Managed Supabase PostgreSQL)]
  W -->|Private uploads| S[Private Supabase Storage / Cubbit]
  W -->|Checkout and billing references| T[Stripe]
  W -->|Transactional/auth email| R[Resend]
  W -->|Lead and consent fields| M[Mautic]
  W -->|Messages and metadata| Q[Meta WhatsApp / support platform]
  W -->|Address query| G[Google Maps]
  W -->|Optional redacted prompts| L[Configured AI provider]
  W -->|Minimized security events| V[VPS hash-chained receiver]
  W -->|Upload bytes over authenticated TLS| C[VPS malware scanner]
  P -->|Provider backup / approved export| B[Recovery boundary - proof pending]
  P -->|Exports from admin endpoints| X[Authorized administrator]
```

## Inventory

| Category | Classification | Collected | Transmitted/processed | Stored | Backed up | Logged/exported | Deletion/retention | Evidence and gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Customer identity/contact | Confidential | Signup, assessment, profile, support, early-access forms | App, Supabase, Resend; Mautic/WhatsApp/support where used | `customers`, leads, auth identity and related tables | Included in PostgreSQL dump if deployed as coded | Admin/customer views; selected audit events; subscriber CSV export | Partial retention jobs; complete schedule not defined | Migrations/routes; processor purposes and deletion propagation require verification |
| Addresses/property information | Restricted | Assessment/property forms and Google autocomplete | App, Supabase, Google Maps queries | `properties`, `cleaning_properties`, assessments, access preferences | PostgreSQL dump | Portal/admin views and operational records | No complete property/access retention rule found | Access notes may create physical-security risk; minimize and segregate |
| Appointments and service operations | Confidential | Assessment and maintenance booking flows; staff updates | App, database, email/WhatsApp notifications | assessments, service bookings/visits, AC appointments | PostgreSQL dump | Audit/activity events and operational dashboards | No approved retention schedule found | Time/location data may reveal customer presence and staff movements |
| Employee information | Restricted | Staff administration and operational use | App and database; possibly support/email | `staff_members`, attendance, sick leave, live status, KPI records | PostgreSQL dump | Manager/admin views; audit coverage varies | HR retention and post-employment deletion unverified | Screening, HR source, lawful basis and access review not visible |
| Authentication data | Restricted | Supabase Auth login/reset/OAuth flows | Browser to managed Supabase Auth through application boundary | Supabase Auth; session cookies in browser; app does not intentionally store plaintext passwords | Managed recovery status requires verification | Auth/security events and provider logs | Token/session and identity deletion process unverified | Staging synthetic customer/staff lifecycle and isolation checks passed; production factor inventory/recovery proof pending |
| Authorization/access control | Restricted | Role, staff status, office assignment and customer ownership | App and PostgREST/RLS | `user_roles`, `staff_members`, `regional_manager_offices`, ownership columns | PostgreSQL dump | Selected audit events | Joiner/mover/leaver and periodic review not evidenced | Database-backed RBAC and RLS code exist; deployed state unverified |
| Support conversations | Restricted | Portal, WhatsApp, assistant and support integrations | Meta, support platform, AI provider when enabled, Resend fallback | Support, WhatsApp and assistant tables; attachments in private storage/Cubbit | Database dump; object backup unverified | Support sync/audit/provider-event tables; content logging minimized in places | WhatsApp/assistant retention settings exist; end-to-end deletion unverified | Cross-system deletion, international transfers and attachment lifecycle need review |
| Marketing information/consent | Confidential | Subscribe and early-access forms with explicit consent | App, Supabase, Mautic, optional analytics | leads, consents, sources, referral/funnel tables, Mautic | Database and Mautic backup unknown | Campaign/subscriber exports and analytics | Partial/abandoned-lead jobs exist; Mautic propagation unverified | **LEGAL REVIEW REQUIRED** for purposes, cookies, transfers and retention |
| Payment references | Restricted | Stripe-hosted Checkout/Setup flows and webhooks | Stripe and app | Customer/payment/invoice/subscription tables store provider IDs, status and masked summaries | PostgreSQL dump | Webhook event IDs, audit events, finance/admin exports | Financial/legal retention and Stripe deletion unverified | No evidence that PAN/CVC is stored; verify logs and Stripe account settings |
| Invoices/refunds | Restricted | Generated from billing records and Stripe events | App, Stripe, email to customer | Invoice/payment/refund tables; generated PDFs/links | PostgreSQL dump; external Stripe retention | Customer/admin PDF/CSV-style access and audit events | Statutory retention requires legal/finance approval | **LEGAL REVIEW REQUIRED** for Morocco/EU record obligations |
| Cleaning/quality records | Confidential | Staff operational workflows | App and database | service visits, inspections, complaints, AI insights, AC records | PostgreSQL dump | Operations dashboards; selected audits | Retention not defined | May contain sensitive property observations and staff performance data |
| Before/after and damage photographs | Restricted | Assessment/support/pause uploads; AC completion copy promises before/after photos | Browser/app to private managed Storage or Cubbit; scanner service before accepted server-side uploads | Four verified private Supabase buckets and Cubbit paths; exact AC photo model not verified | Object-store backup/versioning unverified | Metadata in database; signed-download flows; minimized rejection events | One identity-image retention path exists; comprehensive photo deletion absent | Require purpose tags, short retention, access logs, malware controls and customer-home privacy training |
| Smart-lock/physical-access data | Restricted | Property/access preference and smart-lock interest flows | App/database; no lock provider verified | Property access preferences and product/interest records | Managed recovery status unverified | Operational/audit coverage unverified | Proposed short-lived credential and access-log periods require Legal/Operations approval | Management prefers individually attributable, appointment-limited credentials, but production implementation remains unverified |
| Operational records | Confidential | Staff/admin/customer actions and scheduled jobs | App/database and suppliers | Bookings, subscriptions, inventory, offices, dashboards, notifications | PostgreSQL dump | Admin/manager views and audit tables | Schedule incomplete | Availability, ownership and change-history controls require operational evidence |
| Audit/security events | Confidential | Application events, webhooks, assistant/support activities | App to managed Supabase and authenticated VPS receiver; high/critical events to Resend alert path | Append-only Supabase table plus SHA-256 previous-hash receiver records | Receiver-volume backup pending | Live log/alert tests passed; weekly owner review pending | Proposed one-year security-log period awaits approval | Independent delivery and alerting are operational; named responders/tabletop remain open |

## Lifecycle gaps

- A proposed retention schedule, fail-closed deletion runbook and legal-hold
  schema now exist, but none is legally approved for real-record deletion.
- Managed database backups may contain data due for deletion; backup expiry and
  restoration-suppression rules are not approved.
- Object storage backup, versioning, encryption-key custody, lifecycle rules and restore tests were not verified.
- Administrative exports are present but export approval, logging, secure delivery and expiry are not consistently evidenced.
- Before/after, identity, damage and access-related images need distinct purposes and retention periods rather than one generic attachment rule.
- Morocco Law 09-08/CNDP notification and foreign-transfer requirements require
  Legal/Privacy review for every managed cloud and external processor.
