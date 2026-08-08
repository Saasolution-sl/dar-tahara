# Stripe setup for Dar Tahara

Merchant of record: **Paradox FZCO (Dubai, UAE)**, the entity that collects online
customer payments, manages subscriptions and support. Dar Tahara (Morocco) performs
the cleaning and invoices Paradox FZCO separately. Every customer-facing artefact
(checkout, receipts, invoices, statement descriptor) must show **Paradox FZCO** as the
legal merchant, configured in the Stripe account below.

The integration is code-complete and uses Stripe's REST API directly (no SDK, matching
the repo's fetch-based convention). The steps below are the **account-owner Dashboard
actions** that cannot be done from code.

---

## 1. Create / select the Stripe account
Use the Stripe account owned by **Paradox FZCO**. Set the business/legal name, country
(**United Arab Emirates**), support email and business address in *Settings → Business*.

## 2. Get test API keys
*Developers → API keys* (toggle **Test mode** on): copy `sk_test_…` and `pk_test_…`.

## 3. Configure environment variables
Copy `.env.example` → `.env.local` and set:
```
STRIPE_SECRET_KEY=sk_test_…
STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…              # from step 6
STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID=bpc_…   # from step 7 (optional)
STRIPE_DEFAULT_CURRENCY=eur
STRIPE_ACCOUNT_COUNTRY=AE
STRIPE_STATEMENT_DESCRIPTOR=DAR TAHARA
STRIPE_TAX_ENABLED=false
NEXT_PUBLIC_SITE_URL=https://www.dartahara.com
```
Never commit real keys. Use test keys in dev/staging, live keys only in production.

## 4. Create the webhook endpoint
*Developers → Webhooks → Add endpoint*.
URL: `https://<your-domain>/api/stripe/webhook` (this repo's route).

## 5. Subscribe to these events
```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
payment_intent.succeeded
payment_intent.payment_failed
invoice.paid
invoice.payment_failed
invoice.payment_action_required
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
charge.refunded
charge.dispute.created
```

## 6. Webhook signing secret
After creating the endpoint, reveal the **Signing secret** (`whsec_…`) and set
`STRIPE_WEBHOOK_SECRET`. Signature + timestamp are verified in `src/lib/stripe.ts`.

## 7. Customer Portal
*Billing → Customer portal*. Enable: update payment method, view invoices, cancel
subscription (per business rules). Save, then copy the configuration id (`bpc_…`) into
`STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID`. Portal sessions are created server-side in
`createBillingPortalSession`; access must be granted only after an authenticated
ownership check. Subscription proposal acceptance uses Stripe-hosted Checkout.

## 8. Enable payment methods
*Settings → Payment methods*: turn on **automatic payment methods** so cards, Apple Pay,
Google Pay, Link and eligible local methods (e.g. SEPA) appear dynamically by currency,
country and device. The code does **not** hardcode methods.

## 9. Apple Pay domain verification
*Settings → Payment methods → Apple Pay → Add a new domain*. Add your production domain.
Stripe hosts the verification automatically for Checkout, with no file upload needed for
Stripe-hosted Checkout. Required before the Apple Pay button appears.

## 10. Google Pay
Enabled automatically via automatic payment methods on eligible devices/browsers once
your account is activated. No extra config for Stripe-hosted Checkout.

## 11. Invoice branding
*Settings → Branding*: logo, icon, brand colour. *Settings → Invoicing* / *Customer
emails*: set the business name **Paradox FZCO**, footer and support address.

## 12. Statement descriptor
*Settings → Business → Public details*: set the descriptor (≤22 chars). We also send
`STRIPE_STATEMENT_DESCRIPTOR` is retained for eligible one-time payment intents.

## 13. Customer emails & receipts
*Settings → Customer emails*: enable **successful payments** (receipts) and refunds.
Operational emails (booking/inspection/subscription) are sent by the app via Resend.

## 14. Retry & dunning rules
*Billing → Automatic collection / Revenue recovery*: configure smart retries and dunning
emails for failed recurring invoices. The app marks subscriptions `past_due` on
`invoice.payment_failed` / `invoice.payment_action_required`.

## 15. Tax (if legally applicable)
*Tax → Settings*: register origin/collection as advised by your tax adviser, then set
`STRIPE_TAX_ENABLED=true`. Checkout then enables `automatic_tax`. Leave `false` until
confirmed with a professional. See the open questions in the final report.

## 16. Test cards
`4242 4242 4242 4242` (success), `4000 0000 0000 9995` (declined),
`4000 0025 0000 3155` (3DS required). Any future expiry, any CVC/postal.

## 17. Stripe CLI (local webhooks)
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the printed whsec_… into STRIPE_WEBHOOK_SECRET, then:
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger charge.refunded
```

## 18. Staging → live switch
In staging use **test** keys. In production set **live** keys (`sk_live_…`, `pk_live_…`),
create a **separate live webhook endpoint** and use its live `whsec_…`. Keys are
environment-specific and must never be mixed.

## 19. Verify the production webhook
Send a test event from the Dashboard endpoint and confirm a `200` and a row in
`stripe_webhook_events`. Check *Webhooks → your endpoint → events* for delivery success.

## 20. Safe low-value live test
With live keys and management approval, use a controlled low-value subscription
proposal. Confirm that approving the assessment creates no Stripe charge, customer
acceptance opens hosted Checkout, and only the signed webhook activates service.
Then refund the test payment and confirm `charge.refunded` is recorded.

## 21. Confirm with management / advisers
- Legal merchant entity wording on receipts/invoices/terms (**Paradox FZCO**).
- Whether Stripe Tax must be enabled and in which jurisdictions.
- Settlement currency (default EUR) and any MAD handling.
- Refund policy for rejected customers (see `Refunds` in the report).
- Business verification / KYC completed for Paradox FZCO.

---

### Database migration
Apply the billing schema to the Supabase project before going live:
```
supabase/migrations/20260713123305_premium_home_assessment_workflow.sql
supabase/migrations/20260714090000_stripe_refunds_and_dispute_status.sql
supabase/migrations/20260715225139_secure_customer_onboarding_portal.sql
```
(`supabase db push`, or paste into the SQL editor of the project behind
`NEXT_PUBLIC_SUPABASE_URL`.) The service-role/secret key must be set server-side only.
