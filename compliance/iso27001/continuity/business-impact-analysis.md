# Business impact analysis

Status: **IMPACT-BASED TARGETS PROPOSED — MANAGEMENT APPROVAL REQUIRED**

No RTO or RPO is approved. The business owner must assess maximum tolerable disruption, impact by time band, minimum resources, manual workarounds, data-loss tolerance, peak periods and dependencies.

| Service/process | Owner | Critical data/suppliers | Criticality and proposed MTD | Proposed RTO | Proposed RPO | Workaround | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Customer portal/authentication | Operations (TBD) | Vercel, Supabase Auth/database, DNS | Critical; MTD 8 hours because customers and staff lose trusted account access | 4 hours | 1 hour | Verified support callback and controlled identity verification; never bypass authentication | MANAGEMENT APPROVAL REQUIRED |
| Scheduling/property access | Operations (TBD) | Supabase, staff communications, key/lock process | Critical; MTD 4 hours because missed/revealed access can affect safety and service | 2 hours | 15 minutes | Restricted offline schedule for current appointments; two-person access verification; no permanent code sharing | MANAGEMENT APPROVAL REQUIRED |
| Smart-lock/key authorization | Operations (TBD) | Lock provider (TBD), property records, employee identity | Critical; MTD 2 hours because customers or workers may be locked out or exposed | 1 hour | 15 minutes | Management-approved physical-key exception with custody log and expiry | MANAGEMENT APPROVAL REQUIRED |
| Billing/payments | Finance (TBD) | Stripe, Supabase, Finance | High; MTD 48 hours because service can continue briefly without new charges | 24 hours | 4 hours | Suspend new charging; use Stripe as provider evidence; reconcile before resumption | MANAGEMENT APPROVAL REQUIRED |
| Support/email | Customer Support (TBD) | Portal, Resend, Supabase, Cubbit | High; MTD 12 hours for customer incidents and service issues | 8 hours | 1 hour | Published emergency contact and restricted manual incident queue | MANAGEMENT APPROVAL REQUIRED |
| WhatsApp | Customer Support (TBD) | Meta, support integration, Supabase | Medium while inactive; reassess before activation | 24 hours after activation | 4 hours after activation | Portal/email channel; do not activate without supplier/privacy approval | MANAGEMENT APPROVAL REQUIRED |
| Security logging/alerting | Incident Manager | Supabase security log, VPS receiver, Resend | High; MTD 8 hours because detection and evidence degrade | 4 hours | 15 minutes | Preserve application logs; verify receiver chain; management escalation | MANAGEMENT APPROVAL REQUIRED |
| Source/release | Engineering | GitHub, Forgejo, Vercel, VPS | High; MTD 24 hours unless an urgent security release is needed | 8 hours | 1 hour | Forgejo/local clone; signed emergency change with retrospective review | MANAGEMENT APPROVAL REQUIRED |
| Production data recovery | Operations (TBD) | Supabase, Storage, provider backup/export | Critical; MTD 8 hours; target must be validated against provider entitlement | 4 hours | 1 hour | Controlled service suspension and customer communications; no unverified production overwrite | MANAGEMENT APPROVAL REQUIRED |

The tighter scheduling/access targets reflect physical-safety and property-entry
impact; billing and inactive WhatsApp can tolerate longer interruption. Targets
must be tested against supplier commitments and an actual isolated restore.
Review annually and after material service, supplier or threat changes.
