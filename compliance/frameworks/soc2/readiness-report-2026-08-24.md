# Dar Tahara ISO 27001 to SOC 2 delta readiness report

Status: **FIRST-RUN READINESS ASSESSMENT - NOT AN AUDIT OR ATTESTATION**

Assessment date: 2026-08-24

Repository baseline: commit `7ba9db21231042cd6556e803ee1d3f0c1aa7e3a8`
on branch `codex/soc2-readiness-first-run`, plus the assessment artifacts created
on that branch.

Target: SOC 2 Type I readiness first, with Type II evidence collection designed
to start control by control after truthful effective dates.

## Executive conclusion

Dar Tahara should not rebuild its compliance environment. The ISO work provides
a credible reusable technical baseline: protected signed changes, required
security gates, RLS/RBAC, privileged MFA design, private storage, webhook
verification, malware scanning, dual security-event storage, incident/recovery
procedures, risk/supplier/data-flow registers and 36 evidence references.

The environment is not yet ready for a SOC 2 Type I examination. Only 2 of 38
criteria in the recommended Security + Availability + Confidentiality scope are
currently assessed as satisfied by existing controls. The main blockers are
management approvals, unassigned functional owners, workforce lifecycle,
customer-commitment validation, production access/configuration proof,
availability/capacity design, recovery exercises, supplier assurance,
retention/legal work, independent monitoring and a complete system description.

This assessment created mappings and evidence architecture only. It made no
broad production remediation, enabled no deletion, enforced no production CSP
and fabricated no historical evidence.

## Readiness dashboard

```text
SOC 2 READINESS - 2026-08-24

Scope:
Security:                  Recommended include
Availability:              Recommended include; management/CPA confirmation
Confidentiality:           Recommended include
Processing Integrity:      Recommended defer
Privacy:                   Recommended defer from SOC 2; legal program continues

Criteria assessed:                         38
Satisfied by existing control:              2
Partially satisfied:                       18
New controls required:                      3
Evidence insufficient:                     11
Management decisions:                       4

Type I blocking criteria:                  35
  unconditional:                           30
  Availability/Confidentiality dependent:   5
Type II controls without effective date:   29
Open residual High ISO risks:               2
Confirmed P0 compromise:                    0
Formal SOC 2 exceptions recorded:           0
Unassigned-owner exceptions in controls:   12
Customer commitments sampled:              18
Remediation candidates:                    20
```

These are counts, not a compliance score. Zero formal exceptions means the new
exception register is empty; it does not prove that controls operated without
exceptions.

## Assessment basis and limitations

The criterion baseline is the AICPA's *2017 Trust Services Criteria (with
revised points of focus - 2022)* and the *2018 SOC 2 Description Criteria (with
revised implementation guidance - 2022)*. Official references:

- https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022
- https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2/

Criterion descriptions in the local matrix are paraphrased. The assessment is
based on repository/configuration records, prior connected-service/deployment
evidence and the ISO evidence register. It is not an examination by a CPA and
does not independently verify every live provider account, contract, employee,
device, customer property, backup or operational event.

The repository currently contains 61 Supabase migrations, 105 application route
files, 102 automated test files, protected GitHub security workflows, 22 ISO
risks and 36 registered ISO evidence references. Existing ISO documents remain
the underlying procedures and evidence; framework mappings live separately.

## A. Existing ISO controls reusable for SOC 2

| Reusable area | Dar Tahara controls | SOC 2 use | Evidence boundary |
| --- | --- | --- | --- |
| Protected software change and testing | DT-SDLC-001, DT-SDLC-002 | CC5.2, CC7.1, CC8.1 | Protected signed PRs, required audits/tests, CodeQL, Gitleaks, dependency review and Trivy have prior passing evidence |
| Authorization and data isolation | DT-IAM-001 | CC6.1-CC6.3, CC6.5 | RLS/RBAC and negative tests are strong; production export and recurring reviews remain open |
| Privileged authentication | DT-IAM-002 | CC6.1-CC6.3 | AAL2/TOTP and break-glass design exist; production factor/recovery evidence is missing |
| Secure external boundaries | DT-DATA-002, DT-DATA-004 | CC6.6-CC6.8, C1.1 | TLS/headers, signed webhooks, private storage and authenticated fail-closed malware scanning are implemented |
| Security logging and alerting | DT-OPS-002 | CC4.1, CC7.2, CC7.3 | Append-only Supabase plus hash-chained receiver and alert delivery work technically; review/retention/backup operation is open |
| Incident response | DT-OPS-003 | CC7.3-CC7.5 | Procedure, severity model, evidence preservation, register and tabletop are reusable; no completed exercise exists |
| Risk and corrective action | DT-GOV-003, DT-GOV-004 | CC3, CC4, CC9.1 | Risk and corrective-action registers are reusable; approvals, fraud assessment, monitoring and management review are incomplete |
| Supplier management | DT-SUP-001, DT-SUP-002 | CC9.2, A1.2, C1.1 | Supplier/data/criticality inventory is detailed; contracts, assurance, reviews and exit evidence are largely absent |
| Availability and recovery design | DT-BCM-001-003 | CC7.5, CC9.1, A1.1-A1.3 | BIA, restore and exercise plans are reusable; objectives and actual exercises are unapproved/unperformed |
| Classification and lifecycle | DT-DATA-001, DT-DATA-003 | CC6.5, CC6.7, C1.1, C1.2 | Asset/data-flow inventories and fail-closed retention design are reusable; handling approval and end-to-end deletion evidence are missing |

The control library assigns 35 Dar Tahara identifiers and stores ISO, SOC 2 and
GDPR mappings independently from the control implementation.

## B. Partial mappings

The following ISO areas need stronger or differently structured SOC 2 evidence:

1. **Policies and roles:** ISO drafts demonstrate design intent, but SOC 2 Type I
   needs approved, implemented controls with responsible persons at the point in
   time. Functional owners and deputies are still missing.
2. **Risk:** the ISO register is substantive, but objectives, fraud risk,
   customer commitments, treatments and residual-risk decisions require formal
   approval and recurring review.
3. **Access:** RLS, RBAC and MFA code do not prove the production user/factor
   population, approved provisioning, timely revocation or quarterly reviews.
4. **Change:** the normal GitHub path is strong, but emergency, live-host,
   dashboard/provider and organizational changes require the same traceability.
5. **Logging:** event generation/delivery exists, but Type II needs daily alert
   dispositions, weekly reviews, quarterly chain sampling and retained failures.
6. **Incident response:** a complete procedure is not evidence of responder
   competence or operation. Named participants and a labelled tabletop are
   required.
7. **Supplier controls:** an inventory is not contract, assurance, access,
   availability, deletion or exit evidence.
8. **Recovery:** a plan and provider feature are not restoration evidence.
   Approved objectives and a witnessed isolated database/object restore are open.
9. **Confidentiality:** classification inventories are strong, but owners,
   handling, exports, endpoints, transfers, suppliers and disposal require
   approved operation.
10. **Evidence:** ISO references need control ID, framework, period, source,
    owner, collection date and verification metadata for SOC 2 testing.

The criterion-by-criterion details are in `criterion-assessment.csv`.

## C. SOC 2-specific gaps

Genuinely new or materially expanded requirements are:

- a customer-commitments register with publication/contract change governance;
- an explicit fraud-risk assessment proportionate to the service;
- a formal exception register and monthly exception-aging review;
- a SOC 2 system description based on AICPA description criteria;
- significant subservice-organization analysis and CPA-approved treatment;
- complementary user entity controls, without transferring Dar Tahara duties;
- Availability monitoring, service indicators and capacity management if that
  category is selected;
- control-effective dates and complete evidence populations for Type II;
- CPA scoping decisions for optional categories, boundaries and evidence; and
- management's point-in-time assertion and the eventual independent examination,
  neither of which Codex can provide.

## D. Recommended Trust Services Categories

### Include Security

Security is required and has the strongest existing technical baseline.

### Include Availability, subject to management and CPA confirmation

No explicit platform uptime SLA was found, but portal, scheduling, support,
property access and supplier availability are operationally material. Inclusion
adds approved objectives, monitoring, capacity, supplier dependency, backup,
restore and continuity testing. Management may choose Security + Confidentiality
for a faster first Type I, but should document the rationale and a dated
Availability reassessment with CPA concurrence.

### Include Confidentiality

Restricted property/access, photographs, HR, billing and support information,
together with public confidentiality/key-security promises, make the category
material. The extra burden is approved classification/handling, supplier
safeguards, sharing/export controls and lifecycle/disposal proof.

### Defer Processing Integrity

Automated tests exist, but approved customer processing objectives for complete,
valid, accurate, timely and authorized processing have not been defined.
Management and the CPA should decide whether billing, scheduling or assessments
justify the added PI criteria.

### Defer Privacy from the initial SOC 2

Law 09-08/CNDP, transfers, RoPA, rights, retention, suppliers and breach
governance remain foundational gaps. Complete them regardless of SOC 2, then
reassess market demand. Security/Confidentiality do not establish GDPR, Law
09-08 or CNDP compliance.

## E. Type I blockers

The 20-item remediation backlog consolidates 35 blocking criteria. The material
gates are:

1. approve entity, locations, system boundary, categories, policies, objectives,
   risk and resources;
2. appoint Legal/Privacy, Finance, HR, Operations, responders, control owners,
   deputies and oversight;
3. validate all 18 sampled customer commitments and law/privacy statements;
4. approve and operate HR screening, terms, training and JML controls;
5. verify production RLS/RBAC, privileged MFA/factors and first access review;
6. rotate the duplicated ignored Stripe test credential and complete the
   value-free production credential inventory;
7. verify key/smart-lock claims or amend them through authorized legal/content
   change before offering them;
8. approve vulnerability SLAs and begin live-host/configuration evidence;
9. begin owned log/alert review and complete an incident tabletop;
10. approve Availability objectives and implement monitoring/capacity if scoped;
11. confirm recovery entitlement and complete restore/continuity exercises;
12. approve classification, transfers, retention and synthetic lifecycle proof;
13. complete critical supplier assurance and exit/continuity review;
14. approve restricted evidence custody and metadata; and
15. complete the system description with CPA boundary/subservice/CUEC feedback.

No Type I point-in-time date should be selected until the selected criteria are
designed and implemented and the evidence exists.

## F. Type II preparation

Five controls have a dated technical effective state from 2026-08-21/22, while
29 controls lack an effective date for their full operation. Type II preparation
must begin control by control:

- per change: protected PR/release/deployment and emergency changes;
- continuous/daily: security events, alert triage, uptime/jobs and scanner health;
- weekly: security-log review, vulnerability triage and CI scheduled runs;
- monthly: live-host/configuration review, exception aging, incident/privacy
  zero-state review and retention execution only after approval;
- quarterly: risk, privileged/supplier/service access, credentials, critical
  suppliers, capacity, evidence integrity and log-chain samples;
- annual/per event: policy/BIA, training, continuity/restore/tabletop, independent
  audit, management review and all joiner/mover/leaver or incident events.

The evidence calendar records next steps and emphasizes that a zero-event period
requires a dated population/zero-state review, not an invented transaction.

## G. Technical work Codex can perform after approval

Proposed implementation batch, deliberately not executed in this first run:

1. extend the existing drift tool to validate SOC 2 control IDs, owners,
   frequencies, effective dates and evidence-calendar consistency;
2. add sanitized CI evidence manifests for protected checks, deployments,
   dependency/security scans and failures/exceptions;
3. add read-only evidence collectors for GitHub rules/access, Vercel deployments,
   Supabase authorization/MFA configuration and approved supplier metadata;
4. add owned monitoring configuration for public health, critical scheduled jobs,
   latency/error rate and scanner/security receiver health after objectives are
   approved;
5. add evidence-safe log-review and exception workflows without storing payloads;
6. build a reproducible control/evidence dashboard from CSV source files;
7. add customer-commitment drift checks for authoritative terms/privacy/marketing
   sources without automatically modifying legal copy;
8. add backup/restore evidence manifests around the approved isolated exercise;
9. add access-review population generation that excludes secrets and unnecessary
   personal data; and
10. add tests ensuring production retention deletion and CSP enforcement remain
    blocked until their existing management gates close.

These changes require management approval and the relevant access/owners. They
must not modify production broadly or activate legal/operational decisions.

## H. Human actions

The unified `HUMAN_ACTIONS.md` now includes SOC 2 actions HA-023 through HA-034.
Immediate human priorities are:

- management: scope/categories, oversight, policies, risk, resources and CPA;
- Legal/Privacy: commitments, entity/controller identity, Law 09-08/CNDP,
  transfers, retention, supplier terms and privacy workflows;
- HR: screening, terms, training, JML and sensitive-record handling;
- Finance: fraud risk, Stripe access and payment/retention decisions;
- Operations: availability objectives, monitoring, access/keys, recovery and
  exercises;
- Security/Engineering: production authorization/MFA, access review, credentials,
  vulnerabilities, live configuration and evidence automation; and
- independent assurance: internal auditor first, management review second, CPA
  scoping and examination only when the point-in-time design is ready.

Generated documents and prepared exercises must never be marked completed until
the people actually approve or perform them.

## I. Auditor questions

1. Is Security + Availability + Confidentiality appropriate for the initial
   report, or should Availability follow a Security + Confidentiality Type I?
2. What exact system boundary and service commitments should enter the report
   given property operations and physical/customer-home access?
3. Which providers are significant subservice organizations, and should each be
   treated using the carve-out or inclusive method?
4. Which shared services or privileged roles from Paradox, SaaSolution or other
   group entities enter the boundary?
5. Which complementary user entity controls are necessary and sufficiently
   communicated without shifting Dar Tahara responsibilities?
6. Can the point-in-time Type I design rely on recently approved policies where
   technical controls pre-existed, and what implementation evidence is expected?
7. Is the current one-collaborator protected merge model acceptable for Type I
   with compensating controls, and when is a second independent reviewer required?
8. What population and evidence are expected for no hires, no terminations, no
   incidents, no emergency changes or no exceptions during a period?
9. What provider assurance and bridge-letter evidence is sufficient for Supabase,
   Vercel, GitHub, Stripe, Cubbit, Resend and the VPS host?
10. For Availability, are proposed RTO/RPO, monitoring and one combined isolated
    restore/continuity exercise adequate for initial design assessment?
11. For Confidentiality C1.2, can Type I precede real-record deletion if legal
    rules, fail-closed design, synthetic lifecycle and supplier/backup handling
    are fully implemented?
12. Do billing, scheduling or assessment commitments make Processing Integrity
    materially relevant despite the proposed deferral?
13. What restricted evidence-store, retention and export format should be used
    for the CPA's tooling and sampling?
14. How should customer-property access and smart-lock/key processes be described
    and sampled within a technology-plus-operations system?

## Stop gate

The authorized first execution is complete at the assessment/documentation
stage. Broad remediation, new production monitoring, supplier/legal changes,
policy approval, control activation, retention deletion and CSP enforcement are
not authorized by this report. Proceed only after management approves the Trust
Services scope and the proposed remediation batch and assigns the required
owners.
