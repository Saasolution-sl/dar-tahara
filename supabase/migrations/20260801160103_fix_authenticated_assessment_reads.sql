-- `assessments_staff_read` previously queried `staff_members` directly from
-- its RLS expression. Authenticated customers do not have SELECT permission on
-- that table, so PostgreSQL could reject an otherwise valid own-assessment read
-- while evaluating all permissive policies.
--
-- Keep staff data private and move only the membership check into a narrowly
-- scoped SECURITY DEFINER helper in the unexposed private schema.
create or replace function private.current_user_is_active_staff_member(
  target_staff_id uuid
)
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

revoke all on function private.current_user_is_active_staff_member(uuid)
  from public, anon, authenticated;
grant execute on function private.current_user_is_active_staff_member(uuid)
  to authenticated, service_role;

drop policy if exists assessments_staff_read on public.home_assessments;
create policy assessments_staff_read
on public.home_assessments for select to authenticated
using (
  (select private.current_user_has_role(array['administrator', 'manager']))
  or (
    (select private.current_user_has_role(array['staff', 'assessment']))
    and private.current_user_is_active_staff_member(assigned_staff_id)
  )
);

notify pgrst, 'reload schema';
