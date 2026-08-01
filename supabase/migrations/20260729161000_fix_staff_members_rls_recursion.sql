-- Fix: staff_members_read_via_own_assessment (previous migration) subqueries
-- home_assessments directly in its USING clause. home_assessments has its own
-- RLS policy (assessments_staff_read) that subqueries staff_members — the two
-- policies trigger each other's RLS evaluation and Postgres reports
-- "infinite recursion detected in policy for relation staff_members".
--
-- Fixed the same way current_user_has_role() already avoids this class of
-- bug elsewhere in this schema: a SECURITY DEFINER helper function owned by
-- the migration role bypasses RLS for its own internal query, so evaluating
-- it from within another table's policy never re-triggers RLS recursion.
drop policy if exists staff_members_read_via_own_assessment on public.staff_members;

create or replace function private.customer_can_view_staff_member(target_staff_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.home_assessments a
    join public.customers c on c.id = a.customer_id
    where c.auth_user_id = (select auth.uid())
      and (a.assigned_inspector_id = target_staff_id or a.assigned_cleaner_id = target_staff_id)
  );
$$;

revoke all on function private.customer_can_view_staff_member(uuid) from public, anon;
grant execute on function private.customer_can_view_staff_member(uuid) to authenticated, service_role;

create policy staff_members_read_via_own_assessment on public.staff_members for select to authenticated
using (private.customer_can_view_staff_member(id));

notify pgrst, 'reload schema';
