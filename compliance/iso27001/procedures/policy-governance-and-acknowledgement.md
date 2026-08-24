# Policy governance and acknowledgement procedure

Status: **DESIGN IMPLEMENTED - MANAGEMENT, HR AND LEGAL APPROVAL REQUIRED**

Control: `DT-GOV-001`

Framework mappings: ISO/IEC 27001 clauses 5 and 7.5, Annex A 5.1 and 6.3;
SOC 2 CC1.1, CC2.2 and CC5.3.

## Controlled policy lifecycle

1. The policy owner reconciles the draft with the actual organization, systems,
   customer commitments, legal advice and dependent procedures.
2. Required reviewers record their decision, conditions and version. Legal/HR
   review employment, monitoring, reporting, non-retaliation and disciplinary
   language before personnel issuance.
3. The authorized approver assigns the version, effective date, owner and next
   review date. A draft or unsigned record is not effective.
4. The controlled version is published through an approved channel. Superseded
   versions remain retained with their approval/effective period.
5. The owner maps the policy to in-scope roles and issues it before independent
   privileged, restricted-data or customer-property access where applicable.
6. Personnel acknowledge receipt and understanding. Role-specific training is
   tracked separately; acknowledgement alone is not competence evidence.
7. The owner reviews overdue acknowledgements monthly until complete and
   escalates them to the relevant manager and HR. Access must not be granted or
   retained contrary to an approved prerequisite.
8. The owner reviews the policy annually and after a material legal,
   organizational, supplier, system, incident, risk or customer-commitment
   change. Changes follow the protected repository workflow.

## Ethical reporting and deviations

Personnel report suspected misconduct, conflicts, inaccurate evidence,
unsupported compliance claims, security events or control bypasses through the
owned security/management channel. If that channel or manager is implicated,
the reporter uses the approved alternate escalation route. Good-faith reporting
must not result in retaliation.

The receiving owner preserves the report, limits access, assesses incident/legal
implications and records either:

- an incident;
- a control exception;
- an HR/disciplinary matter in the restricted HR system;
- a corrective action; or
- a documented no-issue disposition with rationale.

The compliance repository stores only sanitized references, never sensitive HR
allegations, screening details or unnecessary personal information.

## Evidence

For Type I, retain the approved policy, owner, effective/review dates,
communication method, role mapping and evidence that the acknowledgement
process is implemented.

For Type II, retain the complete in-scope population, issue/acknowledgement dates,
overdue reviews, access decisions, material-change reissues and deviations for
the observation period. Do not create acknowledgements for dates before the
policy was issued.

Use `policy-acknowledgement-register-template.csv` as a schema only. Actual
personnel records belong in the restricted evidence store.
