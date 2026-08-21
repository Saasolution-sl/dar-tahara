# Secure development and change management

Status: **DRAFT — MANAGEMENT APPROVAL REQUIRED**

Every normal change links a requirement or finding to a branch, reviewed pull request, tests/security checks, migration/rollback plan and deployment evidence. Secrets stay outside source. Dependencies and infrastructure are scanned; authorization, input, logging, privacy, availability and supplier impacts are considered during design. Database changes use ordered migrations and local lint/negative authorization tests.

GitHub is the review/release authority and Forgejo is the downstream mirror unless management changes that decision. Protected checks must pass before merge. The releaser verifies production health and captures the deployed commit. Emergency changes require an incident/change reference, named approver, minimum safe testing, time-limited exception, retrospective review and corrective action. Failed changes roll back using the documented release/database plan; destructive database rollback requires explicit data-owner approval.
