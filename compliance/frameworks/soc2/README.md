# Dar Tahara SOC 2 first-run delta assessment

Status: **READINESS ASSESSMENT - MANAGEMENT AND AUDITOR REVIEW REQUIRED**

Assessment date: 2026-08-24

Immediate objective: SOC 2 Type I readiness, with recurring controls designed
to begin a truthful Type II observation period. This material is not a SOC 2
report and does not state or imply compliance, certification, attestation or
audit completion.

## Recommended scope

- Security: include.
- Availability: include because portal, scheduling, property access, support and
  recovery are operationally material; management must approve objectives.
- Confidentiality: include because Dar Tahara handles restricted customer,
  property-access, photograph, employee, billing and support information and
  makes confidentiality/security promises.
- Processing Integrity: defer until customer processing commitments are defined
  and a CPA confirms materiality.
- Privacy: defer from the initial SOC 2 scope while completing Law 09-08, CNDP,
  transfer, notice, RoPA, rights and retention work independently.

## Artifacts

- `../../controls/control-library.csv` - framework-independent Dar Tahara controls
  and the auditor-ready control matrix (control ID, mappings, owner, frequency,
  implementation, evidence, test, result, exceptions and status).
- `criterion-assessment.csv` - criterion-level ISO to SOC 2 delta matrix.
- `trust-services-scope.md` - category recommendation and burden analysis.
- `CUSTOMER_COMMITMENTS_REGISTER.csv` - public and contractual promises sampled.
- `subservice-organizations.csv` - proposed significant providers and open treatment.
- `system-description-draft.md` - verified draft system description.
- `SOC2_EVIDENCE_CALENDAR.csv` - recurring Type II collection schedule.
- `evidence-metadata-register.csv` - SOC 2 evidence metadata and verification state.
- `exception-register.csv` - transparent exception lifecycle.
- `remediation-backlog.csv` - proposed work, not authorization to remediate.
- `readiness-report-2026-08-24.md` - executive first-run report.

## Evidence rule

Repository files store references and sanitized metadata only. Credentials,
personal information, access lists, contracts, provider reports, logs and backup
content belong in a restricted evidence store approved by management. No
historical evidence may be created for a period before a control was effective.

## Sources

The assessment uses the AICPA 2017 Trust Services Criteria with revised points
of focus (2022) and the 2018 SOC 2 description criteria with revised
implementation guidance (2022), together with the repository state and ISO
evidence available on 2026-08-24. Criterion wording in this repository is
paraphrased; the eventual CPA remains responsible for authoritative criterion
interpretation and examination scope.
