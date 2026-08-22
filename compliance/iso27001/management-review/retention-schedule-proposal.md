# Morocco-focused retention schedule proposal

Status: **PROPOSED — LEGAL/PRIVACY/OWNER APPROVAL REQUIRED**

No value in this proposal authorizes deletion of real production records.
`RETENTION_EXECUTION_ENABLED=false` remains mandatory. The database rules remain
disabled and unapproved.

## Basis used

- [Morocco Law 09-08](https://www.cndp.ma/images/lois/Loi-09-08-Fr.pdf)
  requires personal data not to identify people longer than necessary for the
  declared purpose. CNDP filings may themselves state enforceable periods.
- [CNDP procedures](https://www.cndp.ma/procedures-de-notification-process/)
  require declaration or, for specified categories, prior authorization.
- [CNDP foreign-transfer guidance](https://www.cndp.ma/transfert-de-donnees-a-letranger/)
  requires an approved underlying processing and a permitted transfer route.
- Moroccan General Tax Code 2026 Article 211 provides a ten-year statutory
  candidate for specified accounting documents. Finance and counsel must
  confirm which Dar Tahara records qualify and the correct trigger.
- GDPR is conditional on Article 3 territorial scope or contractual duties; if
  applicable, Articles 5 and 17 add storage-limitation and erasure requirements.

## Additional purpose-specific proposals

| Record | Trigger | Proposed maximum | Basis type | Required decision |
| --- | --- | --- | --- | --- |
| Appointment smart-lock code | Appointment end | Automatic expiry immediately; no reusable plaintext copy after 24 hours | Security/operational | Operations design and Legal review |
| Smart-lock/property access history | Access event | 365 days | Security/accountability proposal | Legal/Privacy and Operations approval |
| Physical-key custody record | Verified key return | 365 days | Security/accountability proposal | Legal/Privacy and Operations approval |
| Routine before/after service photographs | Customer acceptance or service closure | 90 days | Data-minimization/business proposal | Legal/Privacy and Operations approval |
| Damage/insurance evidence | Claim closure | 1095 days | Claims/business proposal | Counsel/insurer confirmation |
| Authentication session/recovery telemetry | Event occurrence | 90 days | Security proposal | Security and Legal/Privacy approval |
| Security/access audit record | Event occurrence | 365 days | Security/accountability proposal | Legal/Privacy approval; extend only under hold/incident |
| Rolling operational backups | Backup creation | 35 days | Recovery proposal | Operations and management approval |
| Qualifying accounting backup/archive | Fiscal-period close | 3650 days | Statutory candidate | Legal/Finance classification and approval |

Consent withdrawal, a valid data-subject request, security revocation, legal
hold and statutory obligations can override ordinary periods. Overrides must be
case-specific, authorized and evidenced; they are not implemented by silently
changing the global schedule.
