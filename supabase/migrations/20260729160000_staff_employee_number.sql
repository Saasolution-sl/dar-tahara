-- Human-readable employee identifier, shown to customers in the portal so
-- they can see which employee performed their home assessment.
alter table public.staff_members
  add column if not exists employee_number text unique;

-- Narrow read: a customer may see a staff member's row ONLY if that staff
-- member is assigned (as cleaner or inspector) to one of the customer's own
-- assessments. The application only ever selects `employee_number` through
-- this path (never email/phone), but the RLS policy itself is the real
-- boundary, keep it scoped to exactly this relationship, nothing broader.
create policy staff_members_read_via_own_assessment on public.staff_members for select to authenticated
using (
  id in (
    select assigned_inspector_id from public.home_assessments
    where assigned_inspector_id is not null
      and customer_id in (select id from public.customers where auth_user_id = (select auth.uid()))
    union
    select assigned_cleaner_id from public.home_assessments
    where assigned_cleaner_id is not null
      and customer_id in (select id from public.customers where auth_user_id = (select auth.uid()))
  )
);

notify pgrst, 'reload schema';
