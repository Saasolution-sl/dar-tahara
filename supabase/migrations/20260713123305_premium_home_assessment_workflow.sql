create extension if not exists pgcrypto;

create sequence if not exists public.home_assessment_reference_seq start 10001;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  stripe_customer_id text unique,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postal_code text,
  country_code text not null default 'MA' check (char_length(country_code) = 2),
  declared_size_m2 numeric(7,2) not null check (declared_size_m2 >= 20),
  declared_bedrooms smallint not null check (declared_bedrooms between 0 and 50),
  declared_bathrooms numeric(4,1) not null check (declared_bathrooms between 0 and 50),
  pets boolean not null default false,
  pet_details text,
  smoking boolean not null default false,
  declared_condition text not null default 'standard'
    check (declared_condition in ('excellent', 'standard', 'needs_attention', 'heavy')),
  access_notes text,
  verified_size_m2 numeric(7,2),
  verified_bedrooms smallint,
  verified_bathrooms numeric(4,1),
  cleaning_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  phone text,
  role text not null check (role in ('cleaner', 'inspector', 'coordinator', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_assessments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'DTH-' || to_char(current_date, 'YYMM') || '-' ||
    lpad(nextval('public.home_assessment_reference_seq')::text, 5, '0')
  ),
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  status text not null default 'awaiting_payment'
    check (status in (
      'awaiting_payment', 'assessment', 'pending_review', 'approved',
      'needs_revised_quote', 'rejected', 'subscription_active', 'paused', 'cancelled'
    )),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'processing', 'paid', 'failed', 'refunded', 'expired')),
  requested_frequency text not null
    check (requested_frequency in ('monthly', 'biweekly', 'weekly', 'irregular')),
  requested_billing_interval text not null default 'monthly'
    check (requested_billing_interval in ('monthly', 'annual')),
  estimated_monthly_cents integer check (estimated_monthly_cents is null or estimated_monthly_cents >= 0),
  estimated_annual_cents integer check (estimated_annual_cents is null or estimated_annual_cents >= 0),
  assessment_price_cents integer not null check (assessment_price_cents > 0),
  currency text not null default 'eur' check (char_length(currency) = 3),
  preferred_date date not null,
  alternate_date date,
  preferred_time_slot text not null
    check (preferred_time_slot in ('morning', 'afternoon', 'flexible')),
  assigned_cleaner_id uuid references public.staff_members(id) on delete set null,
  assigned_inspector_id uuid references public.staff_members(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  paid_at timestamptz,
  confirmed_at timestamptz,
  assessment_started_at timestamptz,
  assessment_completed_at timestamptz,
  initial_deep_clean_required boolean,
  additional_deep_clean_fee_cents integer check (
    additional_deep_clean_fee_cents is null or additional_deep_clean_fee_cents >= 0
  ),
  difficult_areas text,
  interior_quality text,
  property_condition_notes text,
  future_cleaning_duration_minutes integer check (
    future_cleaning_duration_minutes is null or future_cleaning_duration_minutes > 0
  ),
  assessment_notes text,
  revised_monthly_cents integer check (revised_monthly_cents is null or revised_monthly_cents >= 0),
  revised_annual_cents integer check (revised_annual_cents is null or revised_annual_cents >= 0),
  revised_quote_reason text,
  revised_quote_status text check (
    revised_quote_status is null or revised_quote_status in ('pending', 'accepted', 'declined', 'expired')
  ),
  revised_quote_token uuid unique default gen_random_uuid(),
  revised_quote_expires_at timestamptz,
  decline_reason text,
  legal_acceptance jsonb not null,
  terms_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  assessment_id uuid not null unique references public.home_assessments(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'past_due', 'paused', 'cancelled', 'declined')),
  frequency text not null check (frequency in ('monthly', 'biweekly', 'weekly', 'irregular')),
  billing_interval text not null check (billing_interval in ('monthly', 'annual')),
  monthly_price_cents integer not null check (monthly_price_cents >= 0),
  billed_price_cents integer not null check (billed_price_cents >= 0),
  annual_discount_basis_points integer not null default 0
    check (annual_discount_basis_points between 0 and 10000),
  currency text not null default 'eur' check (char_length(currency) = 3),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  activated_at timestamptz,
  paused_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  assessment_id uuid references public.home_assessments(id) on delete set null,
  stripe_invoice_id text unique,
  amount_due_cents integer not null default 0,
  amount_paid_cents integer not null default 0,
  currency text not null default 'eur',
  status text not null default 'draft'
    check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  hosted_invoice_url text,
  invoice_pdf_url text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_events (
  id bigint generated always as identity primary key,
  assessment_id uuid not null references public.home_assessments(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  actor_type text not null default 'system' check (actor_type in ('system', 'customer', 'admin', 'stripe')),
  actor_reference text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_messages (
  id bigint generated always as identity primary key,
  customer_id uuid references public.customers(id) on delete set null,
  assessment_id uuid references public.home_assessments(id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp')),
  direction text not null check (direction in ('inbound', 'outbound')),
  template_key text,
  recipient text,
  body text,
  provider_message_id text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'failed', 'received')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists customers_auth_user_id_idx on public.customers(auth_user_id);
create index if not exists customers_phone_idx on public.customers(phone);
create index if not exists properties_customer_id_idx on public.properties(customer_id);
create index if not exists assessments_status_date_idx on public.home_assessments(status, preferred_date);
create index if not exists assessments_customer_id_idx on public.home_assessments(customer_id);
create index if not exists subscriptions_customer_status_idx on public.subscriptions(customer_id, status);
create index if not exists invoices_customer_created_idx on public.invoices(customer_id, created_at desc);
create index if not exists assessment_events_assessment_created_idx on public.assessment_events(assessment_id, created_at desc);
create index if not exists customer_messages_assessment_created_idx on public.customer_messages(assessment_id, created_at desc);

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.validate_assessment_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status = new.status then
    return new;
  end if;

  if not (
    (old.status = 'awaiting_payment' and new.status in ('assessment', 'cancelled')) or
    (old.status = 'assessment' and new.status in ('pending_review', 'cancelled')) or
    (old.status = 'pending_review' and new.status in ('approved', 'needs_revised_quote', 'rejected', 'cancelled')) or
    (old.status = 'needs_revised_quote' and new.status in ('approved', 'rejected', 'cancelled')) or
    (old.status = 'approved' and new.status in ('subscription_active', 'cancelled')) or
    (old.status = 'subscription_active' and new.status in ('paused', 'cancelled')) or
    (old.status = 'paused' and new.status in ('subscription_active', 'cancelled'))
  ) then
    raise exception 'invalid_assessment_transition:%->%', old.status, new.status;
  end if;
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function private.set_updated_at();
drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties
for each row execute function private.set_updated_at();
drop trigger if exists staff_set_updated_at on public.staff_members;
create trigger staff_set_updated_at before update on public.staff_members
for each row execute function private.set_updated_at();
drop trigger if exists assessments_set_updated_at on public.home_assessments;
create trigger assessments_set_updated_at before update on public.home_assessments
for each row execute function private.set_updated_at();
drop trigger if exists assessments_validate_transition on public.home_assessments;
create trigger assessments_validate_transition before update of status on public.home_assessments
for each row execute function private.validate_assessment_transition();
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function private.set_updated_at();
drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function private.set_updated_at();

alter table public.customers enable row level security;
alter table public.properties enable row level security;
alter table public.staff_members enable row level security;
alter table public.home_assessments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.assessment_events enable row level security;
alter table public.customer_messages enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on table public.customers, public.properties, public.staff_members,
  public.home_assessments, public.subscriptions, public.invoices,
  public.assessment_events, public.customer_messages, public.stripe_webhook_events
from anon, authenticated;

grant select, insert, update, delete on table public.customers, public.properties,
  public.staff_members, public.home_assessments, public.subscriptions, public.invoices,
  public.assessment_events, public.customer_messages, public.stripe_webhook_events
to service_role;
grant usage, select on sequence public.home_assessment_reference_seq,
  public.assessment_events_id_seq, public.customer_messages_id_seq to service_role;

grant select, update on table public.customers to authenticated;
grant select, insert, update, delete on table public.properties to authenticated;
grant select on table public.home_assessments, public.subscriptions, public.invoices,
  public.assessment_events to authenticated;

create policy customers_read_own on public.customers for select to authenticated
using ((select auth.uid()) = auth_user_id);
create policy customers_update_own on public.customers for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

create policy properties_read_own on public.properties for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy properties_insert_own on public.properties for insert to authenticated
with check (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy properties_update_own on public.properties for update to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())))
with check (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy properties_delete_own on public.properties for delete to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));

create policy assessments_read_own on public.home_assessments for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy subscriptions_read_own on public.subscriptions for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy invoices_read_own on public.invoices for select to authenticated
using (customer_id in (select id from public.customers where auth_user_id = (select auth.uid())));
create policy assessment_events_read_own on public.assessment_events for select to authenticated
using (assessment_id in (
  select a.id from public.home_assessments a
  join public.customers c on c.id = a.customer_id
  where c.auth_user_id = (select auth.uid())
));

notify pgrst, 'reload schema';
