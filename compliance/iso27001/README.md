# Dar Tahara ISO/IEC 27001:2022 first-run assessment

Status: **DRAFT — MANAGEMENT APPROVAL REQUIRED**

Assessment date: 2026-08-21

Source baseline: commit `7fd50e932ba1955040c5ce2b7123457984d68f76` plus the then-current, pre-existing working-tree changes
Assessment type: repository, connected-service metadata, and configuration review; not a certification audit

## Executive outcome

The application contains meaningful technical security controls: database RLS migrations, role-based authorization, private object buckets, webhook signature checks, input validation, audit-event tables, encrypted WhatsApp content, scheduled backups, and 661 passing tests. Those controls are not yet an operational, evidence-backed ISMS. Management approvals, live-environment verification, control ownership, supplier assurance, incident/continuity exercises, access reviews, and independent audit evidence are missing or unavailable.

No confirmed P0 compromise or exposed current-tree secret was found. Two P1 issues need urgent approval for remediation: vulnerable production dependencies and weak GitHub governance. Production database, host, backup restoration, employee/physical controls, and supplier contracts could not be operationally verified.

## Readiness dashboard

```text
ISO/IEC 27001:2022

Controls assessed:       93
Implemented:              0
Partially implemented:   36
Not implemented:         17
Not applicable:           0
Unknown/unverified:      40

P0 findings:              0
P1 findings:              9
P2 findings:              8
P3 findings:              3

Open risks:              20
Critical/high risks:     19
Management actions:      13
Legal review items:       4
Evidence gaps:           93
```

The figures are counts, not a readiness percentage. A control is not marked fully implemented because repository evidence alone does not prove sustained operation.

## Material blockers

- The connected Supabase project was inactive and timed out; it is not proven to be the deployed self-hosted production database.
- No production host, Caddy runtime, container, firewall, TLS, database, backup archive, monitoring system, HR system, endpoint-management system, or physical-access system was inspected live.
- GitHub `main` is unprotected; no CI workflows or environments were found; GitHub secret scanning, push protection, and Dependabot security updates are disabled.
- `npm audit --omit=dev` reported four production dependency findings: three high and one moderate, with fixes available. The installed Next.js version is 15.5.20.
- Backup code creates a daily, same-host, 14-day PostgreSQL dump and validates only its archive listing; encryption, off-site copies, alerting, and a tested restore are not evidenced.
- MFA is available in configuration but enforcement is not evidenced. The observed local Supabase configuration permits six-character passwords without complexity requirements.
- Organizational and physical controls have no approved policies, assigned owners, training evidence, access reviews, incident exercise, continuity exercise, or management review record.
- Data retention and deletion are implemented for selected records only; the complete schedule for customer, employee, marketing, support, photo, audit, and supplier-held data is not established.

## Repository map

- [Proposed scope](scope/proposed-scope.md)
- [Architecture inventory](scope/architecture-inventory.md)
- [Data-flow inventory](data-flows/data-flow-inventory.md)
- [Supplier inventory](suppliers/supplier-inventory.md)
- [Asset register](assets/asset-register.md)
- [Risk methodology and register](risks/risk-register.md)
- [93-control gap assessment](soa/control-matrix.csv)
- [Draft Statement of Applicability](soa/statement-of-applicability.csv)
- [Technical security assessment](audits/technical-security-assessment.md)
- [Evidence register](evidence/evidence-register.md)
- [Remediation backlog](roadmap/remediation-backlog.md)
- [Remediation implementation status](roadmap/remediation-status.md)
- [Tooling recommendation](tooling/grc-tooling-recommendation.md)
- [Human actions](../../HUMAN_ACTIONS.md)

## Evidence handling

This repository stores evidence references, not credentials, customer/employee data, database exports, production logs, access lists, contracts, or backup files. Sensitive evidence must remain in a management-approved restricted evidence store.

## Decision gate

The first-run findings remain the dated baseline. Remediation is now proceeding through the prioritized backlog; the living status record separates verified implementation from human approval, deployment, legal review, production access and residual-risk decisions.
