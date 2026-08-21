-- Air-conditioning maintenance benefit: physical AC unit registry, a
-- maintenance-entitlement ledger (two service windows per rolling 12-month
-- benefit period, per unit), and AC-specific service appointments.
--
-- Deliberately NOT reusing public.service_bookings: that table requires
-- assessment_id and source_invoice_id NOT NULL, both meaningless for a
-- usually-free AC visit. Same shape/status vocabulary/RLS/trigger
-- conventions as service_bookings, just its own table.

create sequence if not exists public.ac_unit_code_seq;

create table if not exists public.ac_units (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  unit_code text not null unique default (
    'AC-' || lpad(nextval('public.ac_unit_code_seq')::text, 6, '0')
  ),
  room_type text not null check (room_type in (
    'living_room', 'master_bedroom', 'bedroom_2', 'bedroom_3', 'guest_room',
    'kitchen', 'office', 'hallway', 'dining_room', 'other'
  )),
  -- Required display text when room_type = 'other'; optional free-text label
  -- for every other room_type too (customers may want to distinguish
  -- "Bedroom 2" from "Kids' room").
  room_label text,
  floor text,
  brand text,
  model text,
  serial_number text,
  location_notes text,
  photo_path text,
  coverage_type text not null default 'paid_addon'
    check (coverage_type in ('included', 'paid_addon')),
  status text not null default 'active'
    check (status in (
      'active', 'pending_activation', 'pending_cancellation',
      'inactive', 'retired', 'replaced'
    )),
  -- Null for the included unit: it is never billed, so it never has a
  -- Stripe subscription item.
  stripe_subscription_item_id text,
  coverage_started_at timestamptz,
  coverage_ended_at timestamptz,
  retired_at timestamptz,
  replaced_by_ac_id uuid references public.ac_units(id) on delete set null,
  replacement_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (room_type <> 'other' or room_label is not null)
);

-- At most one currently-active included unit per subscription: the DB, not
-- just application code, refuses a second "included" designation.
create unique index if not exists ac_units_one_included_per_subscription
  on public.ac_units(subscription_id)
  where coverage_type = 'included' and status in ('active', 'pending_activation');

create index if not exists ac_units_customer_idx on public.ac_units(customer_id);
create index if not exists ac_units_property_idx on public.ac_units(property_id);
create index if not exists ac_units_subscription_idx on public.ac_units(subscription_id);

create table if not exists public.ac_maintenance_entitlements (
  id uuid primary key default gen_random_uuid(),
  ac_unit_id uuid not null references public.ac_units(id) on delete restrict,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  benefit_period_start date not null,
  benefit_period_end date not null,
  service_window_number smallint not null check (service_window_number in (1, 2)),
  service_window_start date not null,
  service_window_end date not null,
  status text not null default 'available'
    check (status in ('available', 'booked', 'completed', 'expired', 'cancelled')),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (benefit_period_end > benefit_period_start),
  check (service_window_end > service_window_start),
  -- One row per unit per window per benefit period: regenerating windows for
  -- an existing period is a database error, not just an application bug.
  unique (ac_unit_id, benefit_period_start, service_window_number)
);

create index if not exists ac_entitlements_unit_idx
  on public.ac_maintenance_entitlements(ac_unit_id, benefit_period_start);
create index if not exists ac_entitlements_available_idx
  on public.ac_maintenance_entitlements(ac_unit_id, service_window_start)
  where status = 'available';

-- Created after ac_maintenance_entitlements so its FK to that table can be
-- NOT NULL UNIQUE (one appointment fulfils exactly one entitlement) without
-- a circular dependency between the two tables.
create table if not exists public.ac_maintenance_appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  ac_unit_id uuid not null references public.ac_units(id) on delete restrict,
  entitlement_id uuid not null unique
    references public.ac_maintenance_entitlements(id) on delete restrict,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  assigned_staff_id uuid references public.staff_members(id) on delete set null,
  filter_condition text,
  filter_cleaned boolean not null default false,
  exterior_cleaned boolean not null default false,
  drainage_inspected boolean not null default false,
  issue_detected boolean not null default false,
  issue_notes text,
  employee_notes text,
  customer_notes text,
  before_photo_path text,
  after_photo_path text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scheduled_start is null and scheduled_end is null)
    or (scheduled_start is not null and scheduled_end is not null and scheduled_end > scheduled_start)
  )
);

create index if not exists ac_appointments_customer_window_idx
  on public.ac_maintenance_appointments(customer_id, scheduled_start);
create index if not exists ac_appointments_planning_idx
  on public.ac_maintenance_appointments(status, scheduled_start)
  where status in ('scheduled', 'confirmed');

drop trigger if exists ac_units_set_updated_at on public.ac_units;
create trigger ac_units_set_updated_at
before update on public.ac_units
for each row execute function private.set_updated_at();

drop trigger if exists ac_entitlements_set_updated_at on public.ac_maintenance_entitlements;
create trigger ac_entitlements_set_updated_at
before update on public.ac_maintenance_entitlements
for each row execute function private.set_updated_at();

drop trigger if exists ac_appointments_set_updated_at on public.ac_maintenance_appointments;
create trigger ac_appointments_set_updated_at
before update on public.ac_maintenance_appointments
for each row execute function private.set_updated_at();

alter table public.ac_units enable row level security;
alter table public.ac_maintenance_entitlements enable row level security;
alter table public.ac_maintenance_appointments enable row level security;

revoke all on table public.ac_units, public.ac_maintenance_entitlements, public.ac_maintenance_appointments
  from anon, authenticated;

grant select, insert, update, delete
  on table public.ac_units, public.ac_maintenance_entitlements, public.ac_maintenance_appointments
  to service_role;

-- Explicit grants keep these customer-owned resources available through the
-- Data API even on projects that no longer auto-expose new public tables.
grant select on table public.ac_units, public.ac_maintenance_entitlements, public.ac_maintenance_appointments
  to authenticated;

create policy ac_units_read_own
on public.ac_units
for select to authenticated
using (
  customer_id in (
    select id from public.customers
    where auth_user_id = (select auth.uid())
  )
);

create policy ac_entitlements_read_own
on public.ac_maintenance_entitlements
for select to authenticated
using (
  ac_unit_id in (
    select id from public.ac_units
    where customer_id in (
      select id from public.customers
      where auth_user_id = (select auth.uid())
    )
  )
);

create policy ac_appointments_read_own
on public.ac_maintenance_appointments
for select to authenticated
using (
  customer_id in (
    select id from public.customers
    where auth_user_id = (select auth.uid())
  )
);
