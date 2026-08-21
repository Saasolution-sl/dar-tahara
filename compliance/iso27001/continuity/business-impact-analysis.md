# Business impact analysis

Status: **DRAFT WORKSHEET — MANAGEMENT APPROVAL REQUIRED**

No RTO or RPO is approved. The business owner must assess maximum tolerable disruption, impact by time band, minimum resources, manual workarounds, data-loss tolerance, peak periods and dependencies.

| Service/process | Owner | Critical data/suppliers | Impact and MTD | Proposed RTO | Proposed RPO | Workaround | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Customer portal/authentication | TBD | Supabase, app host, DNS | TBD | TBD | TBD | TBD | Pending |
| Scheduling/property access | TBD | Database, staff communications, access provider/manual keys | TBD | TBD | TBD | TBD | Pending |
| Billing/payments | TBD | Stripe, database, Finance | TBD | TBD | TBD | TBD | Pending |
| Support/WhatsApp | TBD | Support, Meta, email, database | TBD | TBD | TBD | TBD | Pending |
| Source/release/backup | TBD | GitHub, Forgejo, VPS, off-site backup | TBD | TBD | TBD | TBD | Pending |

Assumptions must be tested against supplier commitments and approved risk criteria. Review annually and after material service, supplier or threat changes.
