# Internal readiness assessment — 2026-08-22

Status: **IMPLEMENTER READINESS REVIEW — NOT THE INDEPENDENT INTERNAL AUDIT**

Scope reviewed: Dar Tahara web application, GitHub/Forgejo delivery controls,
managed Supabase projects, Vercel production, VPS staging and the newly activated
malware-scanning/security-event services. The reviewer implemented parts of the
control set and therefore cannot satisfy the independence requirement.

## Objective evidence sampled

- GitHub protected merge and post-merge checks for the P1/P2/P3 remediation.
- Production and staging migration status and database lint results.
- Live production/staging headers and health responses.
- ClamAV 1.4 LTS daemon health plus clean and EICAR verdicts from the staging app
  runtime.
- Authenticated security-log and security-alert delivery, hash-chained receiver
  persistence, and a clearly labelled alert email test.
- Seven-day CSP event summary and current production report-only header.
- Retention rules remaining disabled without approvals.

## Findings

1. **Conformity candidate:** uploads now fail closed through an authenticated,
   private-clamd architecture and were verified with harmless test data.
2. **Conformity candidate:** security events have two restricted stores
   (Supabase Cloud and the VPS receiver); alert delivery was exercised.
3. **Open nonconformity/readiness blocker:** production CSP has not completed the
   minimum observation and journey gate; staging is the enforcement canary.
4. **Open nonconformity/readiness blocker:** no retention schedule is approved
   and no production deletion is authorized.
5. **Open nonconformity/readiness blocker:** management has not approved scope,
   risk treatment, BIA objectives, policy owners or resources.
6. **Open nonconformity/readiness blocker:** no competent independent auditor has
   been appointed and no independent internal-audit report exists.
7. **Open nonconformity/readiness blocker:** no completed incident tabletop,
   continuity exercise, employee training cycle, property-access drill or
   supplier contract/DPA review was evidenced.

## Subsequent management-direction implementation

Later on 2026-08-22, management fixed the initial geography/boundary as Morocco,
assigned the executive approver plus temporary ISMS/incident escalation roles,
confirmed cleaners as employees and directed attributable time-limited property
access. Organization, role, location, asset, supplier, feature, data-flow, risk,
legal and SoA registers were populated. Morocco-focused retention and
impact-based RTO/RPO proposals, a restore plan, tabletop and training material
were prepared. Transient staging customer/staff isolation tests passed with zero
leftovers, and CSP evidence was enhanced to retain only sanitized origin/route
information.

These are design/implementation improvements, not closure of the findings:
Legal/Privacy, Finance, HR, Operations and the independent auditor remain
unassigned; the legal entity/sites are incomplete; exercises, approvals, audit
and management review have not occurred.

Conclusion: technical readiness improved materially, but certification readiness
is blocked by operating evidence and organizational decisions. Management should
complete the retention/scope/risk/BIA decisions, appoint an independent auditor,
run the exercises, then conduct management review on the resulting findings.
