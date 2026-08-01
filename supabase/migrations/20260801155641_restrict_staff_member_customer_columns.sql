-- Customers need a human-readable employee number for an assigned assessment,
-- but must not be able to request staff contact details or auth identifiers.
-- RLS limits rows; these column grants independently limit the fields exposed.
revoke select on table public.staff_members from authenticated;
grant select (id, employee_number) on table public.staff_members to authenticated;

-- Avoid making `auth_user_id` readable merely so the assessments RLS policy
-- can identify the current employee. The helper is deliberately boolean,
-- checks auth.uid() internally, and lives outside the exposed public schema.
create or replace function private.current_user_is_staff_member(target_staff_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.staff_members staff
      where staff.id = target_staff_id
        and staff.auth_user_id = (select auth.uid())
        and staff.active = true
    );
$$;

revoke all on function private.current_user_is_staff_member(uuid)
  from public, anon, authenticated;
grant execute on function private.current_user_is_staff_member(uuid)
  to authenticated, service_role;

drop policy if exists assessments_staff_read on public.home_assessments;
create policy assessments_staff_read
on public.home_assessments for select to authenticated
using (
  (select private.current_user_has_role(array['administrator', 'manager']))
  or (
    (select private.current_user_has_role(array['staff', 'assessment']))
    and private.current_user_is_staff_member(assigned_staff_id)
  )
);

notify pgrst, 'reload schema';
