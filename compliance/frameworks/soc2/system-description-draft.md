# Draft SOC 2 system description

Status: **DRAFT - ENTITY, SCOPE, COMMITMENTS AND CPA REVIEW REQUIRED**

Prepared: 2026-08-24

Point-in-time target: to be set only after management closes the Type I design
and implementation blockers. This is a readiness artifact, not management's
final assertion or an auditor-approved description.

## 1. Organization and service

Dar Tahara is the trading name for a Moroccan property-services business whose
registered legal entity remains `DAR_TAHARA_LEGAL_ENTITY_TBD`. The service uses
a customer-facing web application and operational processes to support initial
home assessments, customer accounts, property information, scheduling,
subscriptions, billing references, support, service delivery and administration.

The description must be updated after incorporation with the registered name,
registered office, operating locations and management-approved reporting period.

## 2. Proposed system boundary

The proposed SOC 2 system includes the people, procedures, information,
software and infrastructure used to develop, operate and support the Dar Tahara
customer/property-services platform in Morocco:

- the public website and customer, staff, manager and administrator experiences;
- application APIs, webhooks and scheduled jobs;
- Vercel production hosting;
- managed Supabase production and staging PostgreSQL, Auth and private Storage;
- protected VPS staging, reverse proxy, malware scanner and independent
  security-event receiver;
- GitHub as authoritative review/release repository and Forgejo as downstream
  source mirror;
- deployment, change, access, monitoring, incident and recovery processes;
- customer, employee, property, support, billing-reference, marketing,
  attachment and security-event information;
- property-access and key/smart-lock processes where Dar Tahara personnel handle
  customer access; and
- significant suppliers whose services support the selected criteria.

Other group entities, SaaSolution, Paradox, unrelated Hospitality products and
non-Dar-Tahara countries are outside the proposed boundary except where they
provide a documented shared service, supplier, processor or privileged role.
Customer-owned home networks/devices and supplier internal control environments
are not operated by Dar Tahara, but their interfaces and Dar Tahara's supplier
governance remain in scope.

The final boundary and any inclusive/carve-out treatment require management and
CPA confirmation.

## 3. Trust Services Categories and objectives

The readiness recommendation is Security, Availability and Confidentiality.
Security is required. Availability is proposed because customer portals,
scheduling, support, property access and critical suppliers are operationally
material; management has not approved availability objectives or an uptime SLA.
Confidentiality is proposed because the system handles restricted property,
access, photograph, employee, billing and support information and publishes
confidentiality/security commitments.

Processing Integrity and Privacy are deferred from the initial report. Privacy
controls and Moroccan Law 09-08/CNDP work remain independently required.

## 4. Infrastructure

- Vercel hosts the production Next.js application.
- Managed Supabase in `eu-west-1` provides PostgreSQL, Auth, PostgREST/Data API
  and private Storage for production and staging. Realtime is implemented but
  inactive according to the 2026-08-22 feature snapshot.
- A protected VPS hosts staging application services, Caddy/TLS, an internal
  ClamAV service and an authenticated hash-chained security-event receiver.
- DNS/domain provider identity and some provider regions and assurance remain
  open and must be added before the final description.

Production is not described as self-hosted Supabase. Managed provider recovery
entitlement and independent export/restore evidence remain unverified.

## 5. Software

The application is a Next.js 15/React 19 system with server routes, background
jobs and integrations. Repository review on 2026-08-24 observed 61 ordered
Supabase migrations, 105 route files and 102 automated test files. Authorization
uses application roles, ownership checks and PostgreSQL row-level security.
Privileged application roles are designed to require Supabase AAL2/TOTP.

The application integrates, depending on production configuration, with Stripe,
Resend, Mautic, Cubbit, Cloudflare Turnstile, Google Maps/Analytics and Groq.
WhatsApp and external FreeScout/Hospitality Support integrations are implemented
but recorded as inactive in production. They must not be described as operating
services unless activation evidence supersedes that register.

## 6. People

Othman Deraz is the executive approver and temporary ISMS manager/incident
escalation owner. Legal/Privacy, Finance, HR, Operations/CSP rollback,
operational incident responders and independent internal auditor are unassigned.
Cleaners are treated as Dar Tahara employees for the current control design.

The final description must identify actual personnel populations, contractors,
system administrators, support staff and outsourced/shared-service roles without
including unnecessary personal information.

## 7. Procedures

The system uses or has drafted procedures for:

- secure development, protected pull requests, security testing, deployment,
  rollback and emergency change;
- identity, privileged MFA, break glass, access review and service credentials;
- structured logging, alerting, incident response and evidence preservation;
- supplier review, information classification, retention, legal holds and
  deletion;
- backup/restoration, business continuity and exercises;
- employee awareness and property-access handling; and
- audit, corrective action and management review.

Many procedures are implemented technically but have not been approved or
operated by named owners. Draft procedure existence must not be represented as
Type II operating effectiveness.

## 8. Information

In-scope information includes customer identity/contact data, addresses and
property/access information, appointments, employee and authorization data,
support conversations, marketing/consent data, payment references, invoices,
cleaning/quality records, photographs/attachments, audit/security events and
secrets. The asset and data-flow registers classify much of this information as
Confidential or Restricted, but owners/classifications require approval.

Primary account numbers and card verification codes are intended to remain with
Stripe. Dar Tahara stores provider references, statuses and masked summaries.
This boundary must be verified against production logs and account settings.

## 9. Data flow and trust boundaries

Customers and personnel use HTTPS to access the Vercel application. The
application communicates with Supabase Auth/database/Storage and approved
suppliers through server-side credentials and signed/verified webhook
interfaces. Restricted uploads use private storage and authenticated fail-closed
ClamAV scanning. Minimized security events are stored in restricted Supabase and
sent to an authenticated off-host hash-chained receiver; higher-severity events
can use Resend alerts.

Material trust boundaries are internet-to-application, browser-to-auth/data API,
application-to-privileged provider APIs, public-webhook-to-event processor,
development-to-production release, Dar Tahara-to-subservice organization and
personnel-to-customer property/access information.

## 10. Control environment

Reusable controls include protected signed pull requests, required security and
quality checks, dependency/SAST/secret/container scanning, RLS/RBAC, privileged
AAL2 design, signed webhooks, private object storage, security headers, malware
scanning, structured security events, incident/continuity procedures and a
detailed ISO risk/supplier/evidence baseline.

Material open elements include approved policies and roles, workforce
lifecycle, production access/configuration evidence, supplier assurance,
availability monitoring/capacity, restore/continuity exercises, retention and
deletion approval, customer-commitment validation, independent monitoring and
management review.

## 11. Significant subservice organizations

Supabase, Vercel, the VPS hosting provider, GitHub, Stripe, Cubbit and Resend are
initial candidates because Dar Tahara relies on their services for one or more
proposed criteria. Other configured providers may be relevant depending on
actual use and materiality. The `subservice-organizations.csv` register records
the rationale and open evidence. The CPA must confirm significant-provider and
inclusive/carve-out treatment.

## 12. Complementary user entity controls

The following customer responsibilities may be necessary for secure use and
should be reviewed by Legal and the CPA before inclusion in customer terms or
the final description:

- provide accurate authorized contact, property, access and safety information;
- protect account credentials, devices and authentication factors and report
  suspected compromise promptly;
- use MFA where offered or required;
- provide lawful, safe access only for scheduled/approved services and avoid
  sending full access codes, passwords or payment details through unsupported
  channels;
- review account, booking and access information and report anomalies or damage
  within the contractual period; and
- manage customer-owned networks, smart-lock compatibility and devices that Dar
  Tahara does not administer.

These responsibilities do not transfer Dar Tahara's access, confidentiality,
monitoring, incident, supplier or legal obligations to customers.

## 13. Significant changes

The ISO remediation work completed before this assessment added protected
GitHub release controls, security scanning, managed-production/staging evidence,
privileged AAL2 design, fail-closed retention gates, malware scanning, a second
security-event store and enhanced CSP evidence. Production CSP remains
report-only and real-record retention execution remains disabled. These states
must remain synchronized with the final system description.

Future significant changes include incorporation/entity finalization, supplier
activation/deactivation, production CSP enforcement, retention activation,
smart-lock rollout, new locations, ownership changes and material architecture
or customer-commitment changes.

## 14. Description completion gate

Before management uses this as a Type I system description:

1. replace the entity token and approve locations and boundaries;
2. approve selected Trust Services Categories and service commitments;
3. assign owners and confirm personnel/shared-service populations;
4. reconcile every active supplier and integration to production evidence;
5. obtain CPA feedback on subservice organizations and CUECs;
6. set the point-in-time date only after controls are designed and implemented;
7. validate the description against the deployed environment and contracts; and
8. obtain management approval without claiming audit completion.
