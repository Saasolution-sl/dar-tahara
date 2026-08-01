-- Dedicated account profiles and separation of duties:
-- customer/company, manager oversight, and assigned assessment employees.

-- ---------------------------------------------------------------------------
-- Roles and staff profile types
-- ---------------------------------------------------------------------------

alter table public.user_roles
  drop constraint if exists user_roles_role_check;
alter table public.user_roles
  add constraint user_roles_role_check check (role in (
    'applicant', 'customer', 'customer_company',
    'staff', 'assessment', 'manager', 'administrator'
  ));

alter table public.staff_members
  drop constraint if exists staff_members_role_check;
alter table public.staff_members
  add constraint staff_members_role_check check (role in (
    'cleaner', 'inspector', 'assessment', 'coordinator', 'manager', 'admin'
  ));

-- Invited internal profiles are not customer accounts. This trigger condition
-- only suppresses customer-profile provisioning; actual access is still
-- determined exclusively by the protected `user_roles` table.
drop trigger if exists provision_portal_user_on_auth_change on auth.users;
create trigger provision_portal_user_on_auth_change
after insert or update of email_confirmed_at, last_sign_in_at on auth.users
for each row
when (coalesce(new.raw_user_meta_data ->> 'invited_profile', '') not in ('assessment', 'manager'))
execute function private.provision_portal_user();

-- Existing inspectors are the legacy equivalent of the new Assessment
-- profile. Keep the historic value valid while assigning new accounts the
-- explicit `assessment` profile.

-- Paid assessment records use the legacy `assessment` state. Allow the
-- manager to assign and schedule that record before the employee completes it.
create or replace function private.validate_assessment_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status = new.status then return new; end if;
  if not (
    (old.status = 'draft' and new.status in ('submitted', 'cancelled')) or
    (old.status = 'submitted' and new.status in ('under_review', 'contacted', 'cancelled', 'expired')) or
    (old.status = 'under_review' and new.status in ('contacted', 'assessment_scheduled', 'additional_information_required', 'approved', 'rejected', 'cancelled')) or
    (old.status = 'contacted' and new.status in ('assessment_scheduled', 'additional_information_required', 'rejected', 'cancelled')) or
    (old.status = 'awaiting_payment' and new.status in ('assessment', 'cancelled')) or
    (old.status = 'assessment' and new.status in ('assessment_scheduled', 'pending_review', 'cancelled')) or
    (old.status = 'assessment_scheduled' and new.status in ('assessment_completed', 'cancelled')) or
    (old.status = 'assessment_completed' and new.status in ('under_review', 'approved', 'rejected')) or
    (old.status = 'additional_information_required' and new.status in ('under_review', 'contacted', 'cancelled', 'expired')) or
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

-- ---------------------------------------------------------------------------
-- Company customers
-- ---------------------------------------------------------------------------

create table if not exists public.company_profiles (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  legal_name text not null check (btrim(legal_name) <> ''),
  trade_name text,
  chamber_of_commerce_number text not null check (btrim(chamber_of_commerce_number) <> ''),
  tax_identification_number text not null check (btrim(tax_identification_number) <> ''),
  registration_country text not null check (registration_country ~ '^[A-Z]{2}$'),
  registered_address jsonb not null,
  billing_email text not null check (billing_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  billing_phone text not null check (btrim(billing_phone) <> ''),
  authorized_representative_name text not null check (btrim(authorized_representative_name) <> ''),
  authorized_representative_title text not null check (btrim(authorized_representative_title) <> ''),
  website text,
  employee_count integer check (employee_count is null or employee_count >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_country, chamber_of_commerce_number)
);

drop trigger if exists company_profiles_set_updated_at on public.company_profiles;
create trigger company_profiles_set_updated_at
before update on public.company_profiles
for each row execute function private.set_updated_at();

alter table public.company_profiles enable row level security;
revoke all on table public.company_profiles from anon, authenticated;
grant select, insert, update, delete on table public.company_profiles to service_role;
grant select on table public.company_profiles to authenticated;

drop policy if exists company_profiles_read_own on public.company_profiles;
create policy company_profiles_read_own
on public.company_profiles for select to authenticated
using (
  customer_id in (
    select id from public.customers
    where auth_user_id = (select auth.uid())
  )
);

-- ---------------------------------------------------------------------------
-- Customer identity confirmation evidence for completed assessments
-- ---------------------------------------------------------------------------

create table if not exists public.assessment_confirmations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.home_assessments(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  staff_member_id uuid not null references public.staff_members(id) on delete restrict,
  customer_confirmation_name text not null check (btrim(customer_confirmation_name) <> ''),
  id_document_type text not null check (id_document_type in (
    'national_id', 'passport', 'residence_permit', 'company_representative_id'
  )),
  evidence_storage_path text not null unique,
  confirmed_services jsonb not null check (jsonb_typeof(confirmed_services) = 'array'),
  customer_confirmed_at timestamptz not null,
  retention_delete_after timestamptz not null,
  created_at timestamptz not null default now(),
  constraint assessment_confirmation_retention_check
    check (retention_delete_after > customer_confirmed_at)
);

alter table public.home_assessments
  add column if not exists customer_identity_confirmed_at timestamptz,
  add column if not exists customer_confirmation_reference uuid
    references public.assessment_confirmations(id) on delete set null;

create index if not exists assessment_confirmations_staff_idx
  on public.assessment_confirmations(staff_member_id, customer_confirmed_at desc);
create index if not exists assessment_confirmations_retention_idx
  on public.assessment_confirmations(retention_delete_after);

alter table public.assessment_confirmations enable row level security;
revoke all on table public.assessment_confirmations from anon, authenticated;
grant select, insert, update, delete on table public.assessment_confirmations to service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'assessment-confirmations',
  'assessment-confirmations',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Identity evidence is uploaded and downloaded only by server routes after
-- an assignment/manager authorization check. No browser role receives direct
-- object access, which also prevents bucket listing.

create or replace function private.require_assessment_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in (
      'assessment_completed', 'pending_review', 'approved',
      'subscription_active', 'paused'
    )
    and old.status not in (
      'assessment_completed', 'pending_review', 'approved',
      'subscription_active', 'paused'
    )
    and not exists (
      select 1 from public.assessment_confirmations confirmation
      where confirmation.assessment_id = new.id
        and confirmation.customer_id = new.customer_id
        and confirmation.staff_member_id = coalesce(
          new.assigned_staff_id,
          new.assigned_inspector_id,
          new.assigned_cleaner_id
        )
    )
  then
    raise exception using
      errcode = '23514',
      message = 'assessment_customer_confirmation_required';
  end if;
  return new;
end;
$$;

revoke all on function private.require_assessment_confirmation()
  from public, anon, authenticated;

drop trigger if exists require_assessment_confirmation
  on public.home_assessments;
create trigger require_assessment_confirmation
before update of status on public.home_assessments
for each row execute function private.require_assessment_confirmation();

-- ---------------------------------------------------------------------------
-- Manager oversight and refund confirmation
-- ---------------------------------------------------------------------------

alter table public.refunds
  add column if not exists approved_by_manager_user_id uuid
    references auth.users(id) on delete set null,
  add column if not exists approved_at timestamptz;

alter table public.refunds
  drop constraint if exists refunds_source_check;
alter table public.refunds
  add constraint refunds_source_check
  check (source in ('admin', 'manager', 'stripe_webhook'));

alter table public.assessment_events
  drop constraint if exists assessment_events_actor_type_check;
alter table public.assessment_events
  add constraint assessment_events_actor_type_check
  check (actor_type in (
    'system', 'customer', 'assessment_employee', 'manager', 'admin', 'stripe'
  ));

-- Replace the legacy broad staff policy with explicit least-privilege roles.
drop policy if exists assessments_staff_read on public.home_assessments;
create policy assessments_staff_read
on public.home_assessments for select to authenticated
using (
  (select private.current_user_has_role(array['administrator', 'manager']))
  or (
    (select private.current_user_has_role(array['staff', 'assessment']))
    and assigned_staff_id in (
      select id from public.staff_members
      where auth_user_id = (select auth.uid())
    )
  )
);

drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_management_read
on public.audit_logs for select to authenticated
using ((select private.current_user_has_role(array['administrator', 'manager'])));

drop policy if exists staff_members_read_via_own_assessment
  on public.staff_members;
create policy staff_members_role_scoped_read
on public.staff_members for select to authenticated
using (
  auth_user_id = (select auth.uid())
  or (select private.current_user_has_role(array['administrator', 'manager']))
  or private.customer_can_view_staff_member(id)
);

notify pgrst, 'reload schema';
