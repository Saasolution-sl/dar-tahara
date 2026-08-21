# Privileged access, MFA and break glass

Owner: Security/Operations

Approval status: implementation baseline; management approval and named custodians required

## Normal control

The `staff`, `assessment`, `manager`, `regional_manager`, and `administrator`
roles require a Supabase Auth session at AAL2. Production enables this by
default. Users enroll a TOTP authenticator at `/security/mfa`; privileged
pages redirect AAL1 sessions there and privileged APIs return `mfa_required`.
Passwords are at least 12 characters with upper/lowercase letters, digits and
symbols; password changes require recent authentication. Sessions have a
12-hour maximum and a 30-minute inactivity timeout.

Operations must review the privileged-user and verified-factor inventory every
quarter and after every personnel change. Remove obsolete roles and factors
immediately. Keep at least two named administrators so recovery does not depend
on one person.

## Break glass

Use only when all enrolled privileged users cannot complete AAL2 and service
recovery cannot wait for normal factor recovery.

1. The incident commander opens an incident record, records the reason, scope,
   approver and planned expiry, and confirms the request through a second
   communication channel.
2. An operations custodian sets `REQUIRE_PRIVILEGED_AAL2=false`, deploys the
   configuration-only change, and records the deployment identifier. The
   maximum initial exception is 60 minutes.
3. The named administrator performs only the recovery action, from a managed
   device and trusted network. All actions remain in `audit_logs` and host logs.
4. Restore `REQUIRE_PRIVILEGED_AAL2=true`, deploy, and verify that an AAL1
   privileged API request is rejected and an AAL2 request succeeds.
5. Rotate or remove affected factors/credentials, review activity during the
   exception, attach evidence to the incident, and complete a post-incident
   review within two business days.

The flag is not a convenience bypass. An exception without an incident record,
second-person approval and expiry is a control failure.
