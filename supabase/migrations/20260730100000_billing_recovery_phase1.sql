-- Phase 1 of the invoice-status / failed-payment recovery / service-suspension
-- system: additive columns on invoices/subscriptions, plus new
-- payment_attempts, subscription_suspensions, payment_links and
-- billing_policy_settings tables.
--
-- Architecture note: this app bills via real Stripe subscriptions/invoices,
-- which already retry failed charges on Stripe's own schedule (Smart
-- Retries, configured in the Stripe Dashboard). This schema records that
-- provider-driven attempt history locally and drives OUR OWN
-- suspension/notification workflow on top of it once the configured
-- threshold is reached — it is not a second, competing retry scheduler.

alter table public.invoices
  add column if not exists failed_attempt_count integer not null default 0 check (failed_attempt_count >= 0),
  add column if not exists collection_stage text
    check (collection_stage is null or collection_stage in ('first_notice', 'second_notice', 'seriously_overdue', 'escalation_eligible')),
  add column if not exists next_retry_at timestamptz,
  add column if not exists first_notice_sent_at timestamptz,
  add column if not exists second_notice_sent_at timestamptz,
  add column if not exists seriously_overdue_at timestamptz,
  add column if not exists escalation_eligible_at timestamptz;

alter table public.subscriptions
  add column if not exists operational_status text not null default 'active'
    check (operational_status in ('active', 'suspended_for_non_payment')),
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text,
  add column if not exists suspension_invoice_id uuid references public.invoices(id) on delete set null;

-- Every payment attempt (Stripe-initiated retry, customer payment-link click,
-- or a future manual admin retry) is recorded here — never full card/bank
-- details, only provider references and sanitized failure info.
create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider_reference text not null,
  attempt_number integer not null check (attempt_number >= 1),
  attempt_type text not null check (attempt_type in ('initial', 'stripe_retry', 'manual_admin_retry', 'payment_link', 'final_settlement')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'eur' check (char_length(currency) = 3),
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  failure_code text,
  failure_message text,
  provider_response_reference text,
  initiated_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (invoice_id, provider_reference)
);

create index if not exists payment_attempts_invoice_idx on public.payment_attempts(invoice_id, initiated_at desc);
create index if not exists payment_attempts_customer_idx on public.payment_attempts(customer_id);

-- History log — a subscription can be suspended and restored more than once
-- over its life, so this is append-only, not a single mutable state.
create table if not exists public.subscription_suspensions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  triggering_invoice_id uuid references public.invoices(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  reason text not null,
  restored_by text check (restored_by is null or restored_by in ('payment', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists subscription_suspensions_subscription_idx on public.subscription_suspensions(subscription_id, started_at desc);
-- Only one open (unresolved) suspension per subscription at a time.
create unique index if not exists subscription_suspensions_one_open_idx
  on public.subscription_suspensions(subscription_id) where ended_at is null;

-- Secure, single-purpose, time-limited payment links. The token is the
-- authority for the 7-day window — the Stripe Checkout Session behind it is
-- created fresh at redemption time, not pre-created, since Stripe's own
-- session expiry is far shorter than 7 days.
create table if not exists public.payment_links (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  token text not null unique,
  link_type text not null check (link_type in ('first_notice', 'second_notice', 'final_settlement')),
  status text not null default 'active' check (status in ('active', 'used', 'expired', 'invalidated')),
  expires_at timestamptz not null,
  used_at timestamptz,
  invalidated_at timestamptz,
  created_by text not null default 'system' check (created_by in ('system', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists payment_links_invoice_idx on public.payment_links(invoice_id, created_at desc);
create index if not exists payment_links_expiring_idx on public.payment_links(status, expires_at) where status = 'active';

-- Singleton-row admin-editable billing policy, same DB-config-with-fallback
-- shape as subscription_duration_tiers / feature_flags.
create table if not exists public.billing_policy_settings (
  id boolean primary key default true check (id),
  max_automatic_attempts_before_suspension integer not null default 2 check (max_automatic_attempts_before_suspension >= 1),
  payment_link_window_days integer not null default 7 check (payment_link_window_days >= 1),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.billing_policy_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists billing_policy_settings_set_updated_at on public.billing_policy_settings;
create trigger billing_policy_settings_set_updated_at before update on public.billing_policy_settings
for each row execute function private.set_updated_at();

alter table public.payment_attempts enable row level security;
alter table public.subscription_suspensions enable row level security;
alter table public.payment_links enable row level security;
alter table public.billing_policy_settings enable row level security;

revoke all on table public.payment_attempts, public.subscription_suspensions, public.payment_links, public.billing_policy_settings from anon, authenticated;

grant select, insert, update, delete on table public.payment_attempts, public.subscription_suspensions, public.payment_links, public.billing_policy_settings to service_role;

-- Customers may read their own payment-attempt and suspension history
-- (customer-friendly wording lives in the app, not here). payment_links and
-- billing_policy_settings are deliberately service_role-only: link tokens
-- must never be enumerable by a client query, and policy values are only
-- ever read server-side.
grant select on table public.payment_attempts to authenticated;
grant select on table public.subscription_suspensions to authenticated;

create policy payment_attempts_read_own on public.payment_attempts for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

create policy subscription_suspensions_read_own on public.subscription_suspensions for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

notify pgrst, 'reload schema';
