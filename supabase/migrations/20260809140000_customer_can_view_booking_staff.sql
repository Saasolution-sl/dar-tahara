-- `customer_can_view_staff_member` only ever considered `home_assessments`.
-- `service_bookings.assigned_staff_id` points at the same table, so on the
-- customer Appointments view the employee join silently returned null for any
-- employee the customer had not also met during an assessment - RLS filtering a
-- row out looks identical to "not assigned yet". Widen the helper to the
-- bookings the customer already owns; the exposed columns are still limited to
-- (id, employee_number, active) by the column grants, so this reveals nothing
-- beyond the employee number the customer is meant to see.

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
  )
  or exists (
    select 1
    from public.service_bookings b
    join public.customers c on c.id = b.customer_id
    where c.auth_user_id = (select auth.uid())
      and b.assigned_staff_id = target_staff_id
  );
$$;

revoke all on function private.customer_can_view_staff_member(uuid)
  from public, anon;
grant execute on function private.customer_can_view_staff_member(uuid)
  to authenticated, service_role;

notify pgrst, 'reload schema';
