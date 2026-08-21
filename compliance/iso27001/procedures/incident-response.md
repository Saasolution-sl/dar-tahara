# Information security incident response procedure

Owner: Incident Manager

Approval status: implementation baseline; management must name primary/backup responders and external contacts

## Report and triage

Personnel report suspected events immediately through the owned security/on-call
channel. If that channel may be compromised, call the incident manager using the
verified offline contact list. Do not investigate through a suspected account.

The incident manager opens the register, assigns a unique ID, preserves the
original report, and classifies severity:

- Critical: active compromise, material service/data loss, suspected disclosure
  of personal/property-access data, destructive malware, or recovery failure.
- High: credible attempted compromise, privileged-control failure, exposed
  secret, or exploitable critical vulnerability without confirmed impact.
- Medium: contained event requiring investigation; no evidence of compromise.
- Low: informational or false-positive candidate retained for trend review.

Critical and High events require a named incident commander and scribe. Start a
timeline in UTC and record every decision, command, evidence item and custodian.

## Contain, investigate and recover

1. Protect people and property first. Revoke sessions/keys, isolate affected
   workloads, block malicious traffic, or pause risky processing as justified.
2. Preserve volatile logs and snapshots before destructive cleanup when safe.
   Hash exported evidence and record source, collector, time and every transfer.
3. Determine entry point, identities, data/actions affected, persistence,
   supplier involvement and earliest/latest known activity. Keep facts,
   hypotheses and unknowns separate.
4. Remove persistence and root cause, rotate affected credentials, patch or
   rebuild from trusted artifacts, and validate authorization boundaries.
5. Restore service progressively. Verify security gates, monitoring, backups,
   business transactions and customer-facing behavior. The incident commander
   authorizes full recovery and enhanced monitoring.

## Communications and legal assessment

Only the incident commander or delegated communications/legal owner contacts
customers, authorities, insurers, press or suppliers. For any possible personal
data breach, immediately record categories, subjects, likely consequences and
protective measures; involve privacy/legal counsel to determine applicable
notification duties and deadlines. Do not delay escalation while impact is
uncertain.

## Closure and learning

Within two business days of recovery for Critical/High events (five for Medium),
hold a blameless review covering root cause, detection/response times, control
performance, decisions, communications and recurrence risks. Assign corrective
actions with owner/due date, link them to risk/control records, test completion,
and update procedures, catalogue and training. The incident manager closes only
when evidence and actions are accepted or formally tracked.
