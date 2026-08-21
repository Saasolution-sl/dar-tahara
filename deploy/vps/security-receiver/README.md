# Security event receiver

This service provides authenticated, centralized delivery for application
security events. It writes a tamper-evident SHA-256 hash chain to a dedicated
Docker volume and sends high/critical alert deliveries through the existing
Resend operational-email account.

The application must set `SECURITY_EVENT_DELIVERY_TOKEN` and the two HTTPS URLs
to the Caddy routes. The receiver token and email-provider credential remain in
a root-owned mode-0600 VPS environment file. The receiver does not expose a log
read API; access is through audited VPS administration only.

The Supabase Cloud append-only table remains the authoritative application log.
This receiver is an independent delivery copy and alert path. Include its volume
in encrypted off-host backup scope and verify the hash chain during weekly log
review.

Run `verify-runtime.mjs` inside the receiver container after deployment. It
submits one clearly labelled test event to the log and alert routes, verifies
successful HTTP delivery, and sends one test alert to the configured security
owner without printing credentials. Set `SECURITY_RECEIVER_BASE_URL` to the
public Caddy base URL to verify the complete TLS route.
