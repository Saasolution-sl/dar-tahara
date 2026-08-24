# Trust Services Category recommendation

Status: **RECOMMENDATION - MANAGEMENT AND CPA CONFIRMATION REQUIRED**

Assessment date: 2026-08-24

The authoritative criterion source for the engagement should be the AICPA 2017
Trust Services Criteria with revised points of focus (2022). The descriptions in
the Dar Tahara matrix are intentionally paraphrased. Security is represented by
the Common Criteria; optional categories add criteria rather than replacing the
Common Criteria.

## Recommended initial Type I scope

### Security - include

Security is mandatory and is supported by reusable ISO controls for access,
change management, vulnerability management, logging, incident response,
supplier governance and risk. The largest gaps are approved ownership,
operating evidence, access reviews, supplier assurance, HR lifecycle and
independent monitoring.

### Availability - include, subject to management confirmation

Availability is materially relevant even though no explicit platform uptime SLA
was found. Customer and operational commitments depend on portal access,
scheduling, support, property access, payments and critical suppliers. Inclusion
adds work for approved service objectives, monitoring, capacity, supplier
availability, BIA, backups, restore proof and continuity exercises. It also
creates clear Type I blockers until RTO/RPO and the monitoring/recovery design
are approved and implemented.

Management may choose a Security + Confidentiality first report to reduce the
initial burden, but that is an audit-scope tradeoff rather than evidence that
Availability is immaterial. The CPA should confirm the treatment.

### Confidentiality - include

Dar Tahara handles restricted property/access information, photographs,
employee data, support conversations, billing data and credentials. Public copy
also promises concierge-level confidentiality, secure key custody and
role-restricted data access. Inclusion adds requirements to approve information
classification, validate handling and sharing, complete supplier safeguards and
operate retention/deletion across systems, backups and suppliers.

## Categories to defer

### Processing Integrity - defer

Correct transaction and scheduling behavior is operationally important, and the
codebase has substantial automated tests. However, no approved customer
commitment was found that defines processing as complete, valid, accurate,
timely and authorized in a way that justifies the additional PI1 criteria.
Before inclusion, management and Legal should define relevant processing
objectives, input/output validation, exception correction, reconciliations and
evidence populations. The CPA should confirm whether billing, scheduling or
assessment processing is material enough for the category.

### Privacy - defer from initial SOC 2 scope

Privacy remains mandatory as a legal and business program regardless of SOC 2.
The current notice, consent fields and data-flow inventory are useful, but Law
09-08/CNDP filings, cross-border transfers, RoPA, rights handling, retention,
supplier terms and breach governance remain open. Adding Privacy now would add
the full notice, choice/consent, collection, use/retention, access, disclosure,
data quality and monitoring burden while those foundational legal decisions are
unresolved. Complete the privacy program independently, then reassess business
demand for a future SOC 2 Privacy scope.

SOC 2 Security or Confidentiality must never be represented as GDPR, Law 09-08
or CNDP compliance.

## Scope decision required

Management must record one of the following before remediation is authorized:

1. Security + Availability + Confidentiality (recommended), accepting the
   additional Availability blockers and evidence burden; or
2. Security + Confidentiality for the first Type I, with a dated Availability
   reassessment and CPA concurrence.

Processing Integrity and Privacy remain outside the initial report unless the
CPA and management approve an expanded scope after the documented gaps close.
