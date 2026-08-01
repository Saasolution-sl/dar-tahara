-- The paid Home Assessment saves a reusable Stripe payment method. Once both
-- parties approve the assessment, the customer explicitly authorizes the
-- accepted subscription and its first automatic charge for the next Friday.
-- Service is not activated or scheduled until that first invoice is paid.

alter table public.home_assessments
  add column if not exists stripe_payment_method_id text;

alter table public.subscriptions
  add column if not exists stripe_payment_method_id text,
  add column if not exists stripe_subscription_schedule_id text,
  add column if not exists first_payment_scheduled_for timestamptz,
  add column if not exists payment_authorized_at timestamptz;

create unique index if not exists subscriptions_stripe_schedule_uidx
  on public.subscriptions(stripe_subscription_schedule_id)
  where stripe_subscription_schedule_id is not null;

create table if not exists public.subscription_payment_authorizations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.subscription_proposals(id) on delete restrict,
  subscription_id uuid not null unique references public.subscriptions(id) on delete restrict,
  assessment_id uuid not null unique references public.home_assessments(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  automatic_payments_authorized boolean not null
    check (automatic_payments_authorized),
  consent_version text not null,
  terms_version text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null check (char_length(currency) = 3),
  billing_interval text not null check (billing_interval in ('monthly', 'annual')),
  first_payment_scheduled_for timestamptz not null,
  stripe_payment_method_id text not null,
  client_ip text,
  user_agent text,
  authorized_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  assessment_id uuid not null references public.home_assessments(id) on delete restrict,
  source_invoice_id uuid not null unique references public.invoices(id) on delete restrict,
  booking_type text not null default 'subscription_service'
    check (booking_type in ('subscription_service')),
  status text not null default 'planning'
    check (status in ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  service_window_start date not null,
  service_window_end date not null,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  assigned_staff_id uuid references public.staff_members(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (service_window_end >= service_window_start),
  check (
    (scheduled_start is null and scheduled_end is null)
    or (scheduled_start is not null and scheduled_end is not null and scheduled_end > scheduled_start)
  )
);

create index if not exists payment_authorizations_customer_idx
  on public.subscription_payment_authorizations(customer_id, authorized_at desc);
create index if not exists service_bookings_customer_window_idx
  on public.service_bookings(customer_id, service_window_start);
create index if not exists service_bookings_planning_window_idx
  on public.service_bookings(status, service_window_start)
  where status in ('planning', 'confirmed');

drop trigger if exists service_bookings_set_updated_at on public.service_bookings;
create trigger service_bookings_set_updated_at
before update on public.service_bookings
for each row execute function private.set_updated_at();

alter table public.subscription_payment_authorizations enable row level security;
alter table public.service_bookings enable row level security;

revoke all on table public.subscription_payment_authorizations, public.service_bookings
  from anon, authenticated;

grant select, insert, update, delete
  on table public.subscription_payment_authorizations, public.service_bookings
  to service_role;

-- Explicit grants keep these customer-owned resources available through the
-- Data API even on projects that no longer auto-expose new public tables.
grant select on table public.subscription_payment_authorizations, public.service_bookings
  to authenticated;

create policy payment_authorizations_read_own
on public.subscription_payment_authorizations
for select to authenticated
using (
  customer_id in (
    select id from public.customers
    where auth_user_id = (select auth.uid())
  )
);

create policy service_bookings_read_own
on public.service_bookings
for select to authenticated
using (
  customer_id in (
    select id from public.customers
    where auth_user_id = (select auth.uid())
  )
);

notify pgrst, 'reload schema';
