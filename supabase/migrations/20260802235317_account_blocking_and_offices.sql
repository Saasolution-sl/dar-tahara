-- Manager/admin account blocking (customer + subscription + personnel level)
-- and a regional-manager role that oversees one or more offices.

-- ---------------------------------------------------------------------------
-- Blocking: subscriptions gain a manual-suspension value alongside the
-- existing automated non-payment suspension. customers.status already has
-- 'suspended'; staff_members.active already exists — neither needs a schema
-- change, just enforcement in application code (see portal-auth.ts).
-- ---------------------------------------------------------------------------

alter table public.subscriptions drop constraint if exists subscriptions_operational_status_check;
alter table public.subscriptions add constraint subscriptions_operational_status_check
  check (operational_status in ('active', 'suspended_for_non_payment', 'suspended_manual', 'cancellation_pending'));

-- getAuthContext() needs to read the signed-in staff member's own `active`
-- flag to enforce deactivation at login/session time. staff_members' column
-- grant to `authenticated` was deliberately narrowed to (id, employee_number)
-- in 20260801155641; `active` is safe to add because the existing RLS policy
-- (staff_members_role_scoped_read) already limits visible rows to the
-- caller's own row, admin/manager, or a customer's assigned staff.
grant select (active) on table public.staff_members to authenticated;

-- ---------------------------------------------------------------------------
-- Offices + regional manager
-- ---------------------------------------------------------------------------

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists office_id uuid references public.offices(id) on delete set null;

alter table public.staff_members
  add column if not exists office_id uuid references public.offices(id) on delete set null;

create index if not exists customers_office_idx on public.customers(office_id);
create index if not exists staff_members_office_idx on public.staff_members(office_id);

create table if not exists public.regional_manager_offices (
  user_id uuid not null references auth.users(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, office_id)
);

create index if not exists regional_manager_offices_office_idx on public.regional_manager_offices(office_id);

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check
  check (role in (
    'applicant', 'customer', 'customer_company',
    'staff', 'assessment', 'manager', 'regional_manager', 'administrator'
  ));

alter table public.staff_members drop constraint if exists staff_members_role_check;
alter table public.staff_members add constraint staff_members_role_check
  check (role in ('cleaner', 'inspector', 'assessment', 'coordinator', 'manager', 'regional_manager', 'admin'));

alter table public.offices enable row level security;
alter table public.regional_manager_offices enable row level security;

revoke all on table public.offices, public.regional_manager_offices from anon, authenticated;

grant select, insert, update, delete on table public.offices, public.regional_manager_offices to service_role;

-- Authenticated users may read the office list (used for admin dropdowns).
grant select on table public.offices to authenticated;
create policy offices_read_authenticated on public.offices for select to authenticated
using (true);

-- A regional manager needs to read their own office assignments in
-- getAuthContext(), mirroring user_roles_read_own above.
grant select on table public.regional_manager_offices to authenticated;
create policy regional_manager_offices_read_own on public.regional_manager_offices for select to authenticated
using (user_id = (select auth.uid()));
