-- Supabase may install this event-trigger helper when automatic RLS enablement
-- is selected during project creation. It must not be exposed as a Data API RPC.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable()
      from public, anon, authenticated;
  end if;
end
$$;
