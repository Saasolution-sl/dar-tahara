-- Bundle 2 introduces public signup and external identity-provider UI. Keep
-- registration fail-closed until email delivery and each OAuth provider have
-- been verified in the target environment. Existing signed-in customers keep
-- access through the separate customer_portal_enabled flag.
update public.feature_flags
set
  enabled = false,
  updated_at = now()
where key = 'customer_registration_enabled';
