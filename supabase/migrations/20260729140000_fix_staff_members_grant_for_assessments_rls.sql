-- Bug fix: `assessments_staff_read`'s USING clause subqueries `staff_members`
-- (`assigned_staff_id in (select id from staff_members where auth_user_id = ...)`),
-- but `staff_members` was revoked from `authenticated` and never granted back.
-- Postgres must evaluate every permissive RLS policy on a SELECT; evaluating
-- this one throws a hard "permission denied for table staff_members" instead
-- of just not matching, which kills the entire query for EVERY authenticated
-- role, including a customer reading their own home_assessments via
-- `assessments_read_own`. This has been silently breaking
-- `/account/assessments` for every real customer since the policy was added.
--
-- `staff_members` still has RLS enabled with zero SELECT policies, so this
-- grant alone continues to return zero rows to any non-service-role caller,
-- it only stops the query from erroring outright.
grant select on table public.staff_members to authenticated;

notify pgrst, 'reload schema';
