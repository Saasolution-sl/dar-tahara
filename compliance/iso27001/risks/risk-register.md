# Risk methodology and initial register

Status: **DRAFT — MANAGEMENT APPROVAL REQUIRED**

## Method

- Likelihood: 1 rare, 2 unlikely, 3 possible, 4 likely, 5 almost certain.
- Impact: 1 negligible, 2 minor, 3 moderate, 4 major, 5 severe.
- Score = Likelihood × Impact.
- Low 1–4; Medium 5–9; High 10–16; Critical 17–25.
- Residual scores are preliminary estimates after observed controls, not accepted risks.
- Acceptance of High or Critical residual risk is always **MANAGEMENT DECISION REQUIRED**.

## Register

| ID | Asset/process | Threat and vulnerability | Existing controls | L | I | Inherent | Proposed treatment / ISO controls | Proposed owner | Residual | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Source/release | Unauthorized or unreviewed change reaches production because GitHub `main` is unprotected, security features/CI are off and authoritative release path is unclear | Production-only ruleset; Git history; tests | 4 | 5 | 20 Critical | Protect authoritative branches, require reviews/checks, enable scanning and environments; A.5.15, A.5.18, A.8.4, A.8.25, A.8.32 | Engineering manager | 8 Medium | E-001, E-011 | Open P1 |
| R-002 | Web application | Known dependency vulnerabilities enable SSRF/DoS or related compromise | Patched lockfile, clean production/full audits, tests, reverse proxy | 4 | 4 | 16 High | Deploy the reviewed patch and automate scanning; A.8.8, A.8.29 | Engineering lead | 6 Medium | E-002, E-003, E-016 | Treatment implemented in worktree; release/monitoring pending |
| R-003 | Production database | Deployed RLS/grants differ from migrations, exposing customer/employee records | Extensive RLS/revoke migration code | 3 | 5 | 15 High | Read-only live schema/grant/RLS export; automated negative authorization tests; A.8.2, A.8.3 | Database owner | 5 Medium | E-006, E-014 | Open P1 |
| R-004 | Service credentials | Broad service-role or supplier key is stolen or misused | Server-only modules, env indirection, no current-tree secret match | 3 | 5 | 15 High | Inventory/rotate, vault, restrict runtime and audit service actions; A.5.17, A.8.2, A.8.24 | Security/Operations | 8 Medium | E-007, E-012 | Open P1 |
| R-005 | Database backup/recovery | Host loss/ransomware destroys both production and same-host backups; restore fails | Daily custom-format dump, 14-day retention, archive-list check | 4 | 5 | 20 Critical | Encrypted off-site copies, alerts, documented and witnessed restore tests; A.5.30, A.8.13, A.8.14 | Operations | 6 Medium | E-010 | Open P1 |
| R-006 | Privileged identity | Password-only or weak-password privileged compromise; MFA not enforced | Supabase Auth, one-hour JWT, refresh rotation, rate limits | 4 | 4 | 16 High | Enforce admin/staff MFA/AAL2, >=12-character policy, session controls and quarterly review; A.5.16-A.5.18, A.8.5 | Security/HR | 6 Medium | E-007 | Open P1 |
| R-007 | Public APIs | Distributed abuse bypasses per-process rate limiting and spoofable proxy IP headers | Input checks, Turnstile on selected forms, local limits | 4 | 3 | 12 High | Trusted-proxy policy and shared rate-limit store/WAF; A.8.6, A.8.20, A.8.26 | Engineering/Operations | 6 Medium | E-004 | Open P1 |
| R-008 | Detection/response | Security events are missed because logs are fragmented and no alerting/SIEM operation is evidenced | Multiple audit tables and correlation IDs in selected flows | 4 | 4 | 16 High | Event catalogue, central protected logs, alert rules, on-call ownership; A.5.24-A.5.28, A.8.15-A.8.17 | Security/Operations | 8 Medium | E-006 | Open P1 |
| R-009 | Incident response | Breach handling is delayed or evidence is lost because no approved plan/exercise exists | Application event records | 3 | 5 | 15 High | Approve plan, contacts, GDPR assessment, evidence procedure and tabletop; A.5.24-A.5.28 | Incident manager | 8 Medium | Gap | Open P1 |
| R-010 | Suppliers/privacy | Processor breach, unlawful transfer or lock-in because supplier contracts and sub-processors are unverified | Provider abstractions and inventory | 4 | 4 | 16 High | Due diligence, DPAs, transfer review, assurance and exit plans; A.5.19-A.5.23, A.5.31, A.5.34 | Procurement/Privacy | 8 Medium | E-013 | Open P2; LEGAL REVIEW REQUIRED |
| R-011 | Data lifecycle | Excess customer/employee/photo/support data persists across DB, backup and suppliers | Selected retention jobs and private buckets | 4 | 4 | 16 High | Approved retention schedule and tested deletion propagation; A.5.33, A.5.34, A.8.10 | Privacy/Data owners | 8 Medium | E-013 | Open P2; LEGAL REVIEW REQUIRED |
| R-012 | Property access | Lost, shared or stale keys/codes allow unauthorized property entry | Access-preference model and staff attribution fields | 3 | 5 | 15 High | Unique/time-limited/revocable credentials, issuance logs and JML process; A.5.15, A.6.5, A.7.2, A.7.9 | Operations/Physical security | 6 Medium | Gap | Open P1 |
| R-013 | SDLC | Vulnerability or secret enters production because automated security gates are not yet hosted or enforced | Local tests, clean lockfile/audits, pinned workflow and scanner definitions | 4 | 4 | 16 High | Activate and require CodeQL/SAST, secret scan, dependency review and test/build gates; A.8.8, A.8.25, A.8.29, A.8.32 | Engineering lead | 6 Medium | E-004, E-011, E-016, E-017 | Treatment implemented in worktree; activation pending |
| R-014 | Change management | Emergency/dashboard/VPS change is not traceable or approved | Git migrations and some audit events | 4 | 4 | 16 High | Authoritative release flow, environment approvals and emergency-change record; A.5.37, A.8.9, A.8.32 | Engineering/Operations | 8 Medium | E-001, E-011 | Open P2 |
| R-015 | Browser security | XSS or content injection has greater impact because CSP is absent | Encoding framework, restrictive headers, webhook/input tests | 3 | 3 | 9 Medium | Deploy tested CSP report-only then enforce; A.8.20, A.8.26, A.8.28 | Engineering | 4 Low | E-015 | Open P2 |
| R-016 | File uploads | Malware, active content or sensitive image is distributed through attachment flows | MIME/size allowlists, private buckets, signed URLs, safe names | 3 | 4 | 12 High | Content scanning, magic-byte validation, quarantine, lifecycle and download controls; A.8.7, A.8.12, A.8.26 | Engineering/Support | 6 Medium | E-006 | Open P2 |
| R-017 | Logs | Logs disclose PII/secrets or can be altered/deleted without detection | Selected redaction/encryption and audit tables | 3 | 4 | 12 High | Log schema, minimization, access, integrity, retention and review; A.5.33, A.5.34, A.8.15 | Security/Privacy | 6 Medium | E-006 | Open P2 |
| R-018 | Third-party availability | Outage of hosting, Supabase, Stripe, email, support or Meta disrupts service | Some provider abstraction, source/config backups | 3 | 4 | 12 High | BIA, RTO/RPO, supplier SLAs, failover/manual workarounds; A.5.22, A.5.29, A.5.30 | Operations/Business owner | 8 Medium | E-009, E-013 | Open P2 |
| R-019 | VPS/infrastructure | Unpatched or misconfigured host/container is compromised | Docker separation, Caddy TLS, loopback DB pooler | 4 | 5 | 20 Critical | Live hardening/port/patch/privilege scan, image scanning, monitoring; A.8.7-A.8.9, A.8.20-A.8.22 | Operations | 8 Medium | E-009 | Open P1 |
| R-020 | Privacy/legal | Processing lacks valid notices, bases, records, transfer controls or breach workflow | Consent fields and privacy page exist | 4 | 5 | 20 Critical | Counsel-led GDPR/privacy mapping, RoPA, DSR/breach/transfer procedures; A.5.31, A.5.33, A.5.34 | Privacy/Legal | 10 High | E-013 | Open P2; LEGAL REVIEW REQUIRED; MANAGEMENT DECISION REQUIRED |

No risk has been accepted. Residual High/Critical items require explicit management authorization after treatment evidence and review.
