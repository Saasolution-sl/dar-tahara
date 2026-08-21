# Security logging and review procedure

Status: **DRAFT — PRIVACY/OPERATIONS APPROVAL REQUIRED**

The application emits structured, UTC security events with event ID, severity, source, correlation and bounded metadata. Passwords, secrets, tokens, authorization/cookie values, message bodies/content and direct identity/contact fields are excluded. Events are appended to a restricted database log with a payload hash and may be forwarded to a protected off-host sink; high/critical events also use the alert channel.

Operations must approve retention, sink access, alert routing, time synchronization and review cadence. Update/delete is blocked except under an explicitly enabled, approved maintenance context. Review records show alert disposition and link incidents/corrective actions without copying sensitive payloads. Quarterly integrity sampling is proposed but not operational until approved.
