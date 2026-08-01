create or replace function private.protect_confirmed_assessment_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  employee_id uuid;
  employee_number_value text;
  property_row public.properties%rowtype;
begin
  if old.status not in (
    'assessment_completed', 'pending_review', 'approved',
    'subscription_active', 'paused'
  ) or new.status not in (
    'assessment_completed', 'pending_review', 'approved',
    'subscription_active', 'paused'
  ) then
    return new;
  end if;

  if new.scheduled_at is not distinct from old.scheduled_at
    and new.assessment_completed_at is not distinct from old.assessment_completed_at
    and new.assigned_staff_id is not distinct from old.assigned_staff_id
    and new.assigned_inspector_id is not distinct from old.assigned_inspector_id
    and new.assigned_cleaner_id is not distinct from old.assigned_cleaner_id
    and new.property_id is not distinct from old.property_id
  then
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

revoke all on function private.protect_confirmed_assessment_identity()
  from public, anon, authenticated;

drop trigger if exists protect_confirmed_assessment_identity
  on public.home_assessments;
create trigger protect_confirmed_assessment_identity
before update of
  scheduled_at,
  assessment_completed_at,
  assigned_staff_id,
  assigned_inspector_id,
  assigned_cleaner_id,
  property_id
on public.home_assessments
for each row execute function private.protect_confirmed_assessment_identity();

create or replace function private.protect_completed_property_findings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.home_assessments
    where property_id = new.id
      and status in (
        'assessment_completed', 'pending_review', 'approved',
        'subscription_active', 'paused'
      )
  ) then
    return new;
  end if;

  if new.property_type is null
    or btrim(new.property_type) = ''
    or new.access_method is null
    or btrim(new.access_method) = ''
    or coalesce(new.verified_size_m2, new.declared_size_m2) is null
    or coalesce(new.verified_bedrooms, new.declared_bedrooms) is null
    or new.air_conditioning_units is null
    or new.kitchen_count is null
    or new.living_space_count is null
    or new.outside_spaces is null
  then
    raise exception using
      errcode = '23514',
      message = 'assessment_property_fields_required';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_completed_property_findings()
  from public, anon, authenticated;

drop trigger if exists protect_completed_property_findings
  on public.properties;
create trigger protect_completed_property_findings
before update of
  property_type,
  access_method,
  verified_size_m2,
  declared_size_m2,
  verified_bedrooms,
  declared_bedrooms,
  air_conditioning_units,
  kitchen_count,
  living_space_count,
  outside_spaces
on public.properties
for each row execute function private.protect_completed_property_findings();

notify pgrst, 'reload schema';
