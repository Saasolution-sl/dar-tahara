# Initial information asset register

Status: **POPULATED — OWNERS/CLASSIFICATIONS REQUIRE MANAGEMENT APPROVAL**

Scope and personnel assumptions follow `scope/organization-profile.md`; role
assignments follow `scope/role-register.csv`.

| Asset | Type | Proposed owner | Location | Classification | C | I | A | Criticality | Backup | Dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dar Tahara source code | Software | Engineering lead | GitHub authoritative review/release; Forgejo synchronized mirror | Internal (public portions) | M | H | M | High | Distributed Git copies | Git hosts, developer accounts, protected CI |
| Next.js production application | Software/service | Engineering/Operations | Vercel production | Confidential | H | H | H | Critical | Rebuild from verified source/deployment | Vercel, GitHub, managed Supabase, suppliers |
| Next.js staging application | Software/service | Engineering/Operations | Protected VPS container | Confidential | H | H | M | High | Rebuild from verified image/source | VPS, Caddy, managed staging Supabase |
| Supabase PostgreSQL database | Information/system | Data owner/Operations | Managed Supabase `eu-west-1` | Restricted | H | H | H | Critical | Provider backup state/restore evidence requires verification | Supabase, application, export/backup controls |
| Supabase Auth identities/sessions | Information/service | Security/Engineering | Managed Supabase production/staging | Restricted | H | H | H | Critical | Provider recovery and identity lifecycle require verification | SMTP, signing keys, database, MFA |
| Supabase/Cubbit object storage | Information/service | Operations/Privacy | Managed private Supabase buckets and Cubbit | Restricted | H | H | M | High | Object backup/lifecycle/restore unverified | Storage keys, database metadata, malware scanner |
| Customer master and contact data | Information | Customer operations/Privacy | PostgreSQL and processors | Confidential | H | H | M | High | Database dump | Supabase, support, email, Mautic |
| Property and access information | Information | Operations/Security | PostgreSQL, support and staff access | Restricted | H | H | H | Critical | Database dump | Staff devices, scheduling, lock/key process |
| Employee/staff and HR-related data | Information | HR | PostgreSQL and HR source unknown | Restricted | H | H | M | High | Database dump/HR backup unknown | HR, managers, identity lifecycle |
| Service visits/quality/complaints | Information | Operations | PostgreSQL/support | Confidential | H | H | H | High | Database dump | Staff, customer portal, support |
| Billing, invoice and refund records | Information | Finance | PostgreSQL and Stripe | Restricted | H | H | H | Critical | Database dump and Stripe | Stripe, email, finance access |
| Marketing leads and consent | Information | Marketing/Privacy | PostgreSQL and Mautic | Confidential | H | H | M | High | Database dump/Mautic unknown | Mautic, email, analytics |
| Support and WhatsApp conversations | Information | Customer support | PostgreSQL, Meta, support system, storage | Restricted | H | H | H | High | Database/object backups unverified | Meta, FreeScout/support, AI, Cubbit |
| Photographs and attachments | Information | Operations/Privacy | Private Supabase buckets/Cubbit | Restricted | H | H | M | High | Unverified | Object storage, signed URL logic |
| Audit and security event records | Information | Security/Operations | Managed Supabase append-only table and hash-chained VPS receiver | Confidential | H | H | H | Critical | Receiver-volume backup and approved retention remain open | Application, clocks, alert provider, receiver token |
| Secrets/signing/encryption keys | Information | Security/Operations | VPS env files and supplier vaults unknown | Restricted | H | H | H | Critical | Secure recovery unverified | Every integrated service |
| VPS host and Docker runtime | Infrastructure | Operations | External hosting provider | Restricted | H | H | H | Critical | Rebuild docs; system backup unknown | Protected staging, Caddy, scanner, receiver, SSH/Tailscale |
| Caddy/DNS/TLS configuration | Infrastructure | Operations | VPS and DNS provider | Restricted | H | H | H | Critical | Repository for proxy config; DNS backup unknown | DNS registrar/provider, CA |
| GitHub/Forgejo accounts and rules | Service/identity | Engineering manager | External GitHub and Forgejo service | Restricted | H | H | H | Critical | Repositories synchronized; settings/issues backup open | MFA, admin identities, email, ruleset |
| Stripe account/configuration | Service | Finance | Stripe | Restricted | H | H | H | Critical | Provider records/export | Finance/admin identities, webhooks |
| Mautic/support/email accounts | Services | Marketing/Support | Supplier/self-hosted | Restricted | H | H | M/H | High | Unverified | DNS, supplier accounts, APIs |
| Staff endpoints and mobile devices | Equipment | Operations/HR | Remote/offices/customer sites | Restricted | H | H | H | Critical | Device backup/MDM unknown | Endpoint controls, network, identity |
| Physical keys/temporary access credentials | Information/physical | Operations | Staff/customer property process | Restricted | H | H | H | Critical | Not applicable; issuance logs required | Staff, customers, lock/key provider |
| Malware-scanning service | Security service | Engineering/Operations | VPS internal clamd plus authenticated bridge | Confidential | H | H | H | High | Rebuild from repository; signatures update in service | ClamAV image/signatures, Caddy, scanner token |
| Independent security-event receiver | Security service | Security/Operations | VPS restricted persistent volume | Confidential | H | H | H | High | Hash chain active; volume backup/restore pending | Caddy, Resend, delivery token, system clock |

Legend: C/I/A impact is Low, Medium or High. Management approved the Morocco
boundary and temporary leadership assignments, but classifications and
unassigned functional owners still require formal approval.
