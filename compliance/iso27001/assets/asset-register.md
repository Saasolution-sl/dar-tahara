# Initial information asset register

Status: **DRAFT — OWNERS AND CLASSIFICATIONS REQUIRE APPROVAL**

| Asset | Type | Proposed owner | Location | Classification | C | I | A | Criticality | Backup | Dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dar Tahara source code | Software | Engineering lead | Forgejo and public GitHub mirror | Internal (public portions) | M | H | M | High | Distributed Git copies | Git hosts, developer accounts |
| Next.js production application | Software/service | Engineering/Operations | VPS container | Confidential | H | H | H | Critical | Rebuild from source/image | VPS, Caddy, registries, suppliers |
| Supabase PostgreSQL database | Information/system | Data owner/Operations | Self-hosted VPS | Restricted | H | H | H | Critical | Daily local dump; restore unverified | Host, Supabase stack, backup storage |
| Supabase Auth identities/sessions | Information/service | Security/Engineering | Self-hosted Supabase | Restricted | H | H | H | Critical | Database/Auth backup unverified | SMTP, signing keys, database |
| Supabase/Cubbit object storage | Information/service | Operations/Privacy | Supabase storage and Cubbit | Restricted | H | H | M | High | Unverified | Storage keys, database metadata |
| Customer master and contact data | Information | Customer operations/Privacy | PostgreSQL and processors | Confidential | H | H | M | High | Database dump | Supabase, support, email, Mautic |
| Property and access information | Information | Operations/Security | PostgreSQL, support and staff access | Restricted | H | H | H | Critical | Database dump | Staff devices, scheduling, lock/key process |
| Employee/staff and HR-related data | Information | HR | PostgreSQL and HR source unknown | Restricted | H | H | M | High | Database dump/HR backup unknown | HR, managers, identity lifecycle |
| Service visits/quality/complaints | Information | Operations | PostgreSQL/support | Confidential | H | H | H | High | Database dump | Staff, customer portal, support |
| Billing, invoice and refund records | Information | Finance | PostgreSQL and Stripe | Restricted | H | H | H | Critical | Database dump and Stripe | Stripe, email, finance access |
| Marketing leads and consent | Information | Marketing/Privacy | PostgreSQL and Mautic | Confidential | H | H | M | High | Database dump/Mautic unknown | Mautic, email, analytics |
| Support and WhatsApp conversations | Information | Customer support | PostgreSQL, Meta, support system, storage | Restricted | H | H | H | High | Database/object backups unverified | Meta, FreeScout/support, AI, Cubbit |
| Photographs and attachments | Information | Operations/Privacy | Private Supabase buckets/Cubbit | Restricted | H | H | M | High | Unverified | Object storage, signed URL logic |
| Audit and security event records | Information | Security/Operations | PostgreSQL/container logs | Confidential | H | H | H | Critical | Database dump; log backup unknown | Application, clocks, monitoring |
| Secrets/signing/encryption keys | Information | Security/Operations | VPS env files and supplier vaults unknown | Restricted | H | H | H | Critical | Secure recovery unverified | Every integrated service |
| VPS host and Docker runtime | Infrastructure | Operations | Hosting provider | Restricted | H | H | H | Critical | Rebuild docs; system backup unknown | Hosting, DNS, SSH, registry |
| Caddy/DNS/TLS configuration | Infrastructure | Operations | VPS and DNS provider | Restricted | H | H | H | Critical | Repository for proxy config; DNS backup unknown | DNS registrar/provider, CA |
| GitHub/Forgejo accounts and rules | Service/identity | Engineering manager | External/self-hosted Git services | Restricted | H | H | H | Critical | Repository mirror; settings backup unknown | MFA, admin identities, email |
| Stripe account/configuration | Service | Finance | Stripe | Restricted | H | H | H | Critical | Provider records/export | Finance/admin identities, webhooks |
| Mautic/support/email accounts | Services | Marketing/Support | Supplier/self-hosted | Restricted | H | H | M/H | High | Unverified | DNS, supplier accounts, APIs |
| Staff endpoints and mobile devices | Equipment | Operations/HR | Remote/offices/customer sites | Restricted | H | H | H | Critical | Device backup/MDM unknown | Endpoint controls, network, identity |
| Physical keys/temporary access credentials | Information/physical | Operations | Staff/customer property process | Restricted | H | H | H | Critical | Not applicable; issuance logs required | Staff, customers, lock/key provider |

Legend: C/I/A impact is Low, Medium or High. Classification and ownership are proposed, not management-approved.
