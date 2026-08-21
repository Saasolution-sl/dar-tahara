# Service credential management

Owner: Security/Operations

Approval status: implementation baseline; named custodians and vault require management approval

- Keep publishable/anonymous keys separate from secret/service-role, provider,
  webhook, encryption and backup credentials. A server secret must never use a
  `NEXT_PUBLIC_` name, enter source control, browser output, tickets or chat.
- Store production secrets only in the approved access-controlled deployment
  secret store. Limit each credential to one service/environment and the least
  permissions supported. Use a dedicated identity for off-site backup.
- Maintain an inventory with system, purpose, owner, custodian, environment,
  privilege, storage location, creation/last-rotation date and dependencies—no
  secret values. Review privileged credentials quarterly.
- Two authorized people approve service-role, production deployment, DNS,
  repository-admin and backup-recovery access. Remove access on role change or
  termination immediately and verify downstream sessions/tokens are revoked.
- Rotate on the provider-supported schedule and immediately after suspected
  disclosure, custodian departure, unapproved access or control failure. Test
  replacement in staging, deploy the new value, verify service/alerts, revoke
  the old value, and record evidence. Never leave overlapping credentials
  indefinitely.
- Emergency retrieval follows the incident and break-glass procedure. Every
  use records requester, approver, reason, start/end time and affected action.
- GitHub push protection, repository/history scanning and deployment validation
  are preventive/detective controls; a detected real secret is revoked first,
  then removed from current/history where justified and investigated.

Quarterly evidence: credential inventory export, access review decisions,
rotation records, secret-scan results and resolved exceptions.
