# Security event catalogue and response targets

Owner: Incident Manager

Technical owner: Security/Operations

Approval status: implementation baseline; named people and channels require management approval

All application events use UTC, an event ID, type, severity, source, actor and
correlation identifiers where known, plus bounded metadata. Never include
passwords, tokens, TOTP secrets, access instructions, message bodies, payment
data or full request bodies. High and critical application events route to
`SECURITY_ALERT_WEBHOOK_URL`; backup failures use the separately owned backup
alert endpoint. Container/host logs must be shipped to an access-controlled,
off-host log destination before production evidence is complete.

| Event | Minimum severity | Detection source | Required response | Target |
|---|---|---|---|---|
| `rate_limit_control_unavailable` | High | Application | Page Operations; restore shared counter before relaxing control | Acknowledge 15 min, mitigate 60 min |
| Sustained `rate_limit_blocked` | Medium; High when distributed or sustained | Application/WAF | Identify endpoint and source pattern; block/adjust only with evidence | Review 4 h; High acknowledge 15 min |
| `authorization_denied` anomaly | Medium | Application/audit logs | Check actor, route class and role changes | Review next business day; High 15 min |
| `privileged_mfa_required` anomaly | Medium | Application/Auth | Check factors, login source and account status | Review next business day; High 15 min |
| Database backup or restore failure | Critical | Host job | Open incident; protect last known good snapshot; repair and retest | Acknowledge 15 min, restore job 4 h |
| Secret/push-protection detection | High | GitHub | Stop release, revoke exposed credential, investigate history | Acknowledge 15 min |
| Critical dependency/image/host vulnerability | High/Critical by exploitability | GitHub/Trivy/host scan | Triage exposure and remediate or approve time-boxed exception | Critical 24 h; High 7 days |
| Repository protection/settings disabled | High | GitHub audit/settings review | Re-enable, inspect merges during gap | Acknowledge 15 min |
| Privileged role/factor changed | High | Supabase audit/review | Validate approved request and remove unauthorized access | Acknowledge 15 min |
| Repeated payment/webhook signature failure | Medium/High by volume | Application/provider | Confirm provider status and source; block abuse | Review 4 h; High 15 min |
| Suspected personal-data disclosure | Critical | Any | Preserve evidence; invoke breach assessment and legal notification clock | Immediate |

At least weekly, Security/Operations reviews delivery failures, high/critical
events, rate-limit trends, authentication anomalies, GitHub alerts, backup jobs
and open incident actions. Record the reviewer, period, findings and tickets.
