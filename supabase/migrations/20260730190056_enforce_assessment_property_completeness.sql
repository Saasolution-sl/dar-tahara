-- A completed Home Assessment is a professional visit, not a partially
-- populated form. Counts use zero to mean "none"; null means "not assessed"
-- and is therefore not valid once the visit is completed.
update public.properties
set
  air_conditioning_units = coalesce(air_conditioning_units, 0),
  kitchen_count = coalesce(kitchen_count, 0),
  living_space_count = coalesce(living_space_count, 0)
where
  air_conditioning_units is null
  or kitchen_count is null
  or living_space_count is null;

alter table public.properties
  alter column air_conditioning_units set default 0,
  alter column air_conditioning_units set not null,
  alter column kitchen_count set default 0,
  alter column kitchen_count set not null,
  alter column living_space_count set default 0,
  alter column living_space_count set not null;

-- Every staff member needs a stable customer-facing employee number. Existing
-- legacy rows receive a deterministic number rather than remaining blank.
update public.staff_members
set employee_number = 'EMP-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where employee_number is null or btrim(employee_number) = '';

alter table public.staff_members
  alter column employee_number set not null;

alter table public.staff_members
  drop constraint if exists staff_members_employee_number_not_blank;
alter table public.staff_members
  add constraint staff_members_employee_number_not_blank
  check (btrim(employee_number) <> '');

-- Preserve truthful legacy assignments by promoting an existing inspector or
-- cleaner assignment into the newer generic assessment-employee field.
update public.home_assessments
set assigned_staff_id = coalesce(
  assigned_staff_id,
  assigned_inspector_id,
  assigned_cleaner_id
)
where assigned_staff_id is null
  and (assigned_inspector_id is not null or assigned_cleaner_id is not null);

-- Historical approval rows pre-date automatic approved_at capture. The
-- completed visit is the closest authoritative historical timestamp.
update public.home_assessments
set approved_at = assessment_completed_at
where status in ('approved', 'subscription_active', 'paused')
  and approved_at is null
  and assessment_completed_at is not null;

create or replace function private.enforce_completed_assessment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  employee_id uuid;
  employee_number_value text;
  property_row public.properties%rowtype;
  old_was_completed boolean;
  old_was_approved boolean;
  new_is_completed boolean;
begin
  if tg_op = 'UPDATE' then
    old_was_completed := old.status in (
      'assessment_completed', 'pending_review', 'approved',
      'subscription_active', 'paused'
    );
    old_was_approved := old.status in (
      'approved', 'subscription_active', 'paused'
    );
  else
    old_was_completed := false;
    old_was_approved := false;
  end if;
  new_is_completed := new.status in (
    'assessment_completed', 'pending_review', 'approved',
    'subscription_active', 'paused'
  );

  if new.status in ('approved', 'subscription_active', 'paused')
    and not old_was_approved
    and new.approved_at is null then
    new.approved_at := now();
  end if;

  -- Existing legacy rows are not rewritten with invented visit information,
  -- but every new transition into a completed state must satisfy the invariant.
  if not new_is_completed or old_was_completed then
    return new;
  end if;

  if new.scheduled_at is null then
    raise exception using
      errcode = '23514',
      message = 'assessment_schedule_required';
  end if;

  if new.assessment_completed_at is null then
    raise exception using
      errcode = '23514',
      message = 'assessment_completion_required';
  end if;

  employee_id := coalesce(
    new.assigned_staff_id,
    new.assigned_inspector_id,
    new.assigned_cleaner_id
  );
  if employee_id is null then
    raise exception using
      errcode = '23514',
      message = 'assessment_employee_required';
  end if;

  select employee_number
  into employee_number_value
  from public.staff_members
  where id = employee_id and active;

  if employee_number_value is null or btrim(employee_number_value) = '' then
    raise exception using
      errcode = '23514',
      message = 'assessment_employee_number_required';
  end if;

  select *
  into property_row
  from public.properties
  where id = new.property_id;

  if not found
    or property_row.property_type is null
    or btrim(property_row.property_type) = ''
    or property_row.access_method is null
    or btrim(property_row.access_method) = ''
    or coalesce(property_row.verified_size_m2, property_row.declared_size_m2) is null
    or coalesce(property_row.verified_bedrooms, property_row.declared_bedrooms) is null
    or property_row.air_conditioning_units is null
    or property_row.kitchen_count is null
    or property_row.living_space_count is null
    or property_row.outside_spaces is null
  then
    raise exception using
      errcode = '23514',
      message = 'assessment_property_fields_required';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_completed_assessment()
  from public, anon, authenticated;

drop trigger if exists enforce_completed_assessment
  on public.home_assessments;
create trigger enforce_completed_assessment
before insert or update of
  status,
  scheduled_at,
  assessment_completed_at,
  assigned_staff_id,
  assigned_inspector_id,
  assigned_cleaner_id,
  property_id
on public.home_assessments
for each row execute function private.enforce_completed_assessment();

-- Customers may read only employee rows linked to their own assessment. Include
-- the generic assessment employee introduced by the portal workflow.
create or replace function private.customer_can_view_staff_member(target_staff_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.home_assessments a
    join public.customers c on c.id = a.customer_id
    where c.auth_user_id = (select auth.uid())
      and (
        a.assigned_staff_id = target_staff_id
        or a.assigned_inspector_id = target_staff_id
        or a.assigned_cleaner_id = target_staff_id
      )
  );
$$;

revoke all on function private.customer_can_view_staff_member(uuid)
  from public, anon;
grant execute on function private.customer_can_view_staff_member(uuid)
  to authenticated, service_role;

notify pgrst, 'reload schema';
