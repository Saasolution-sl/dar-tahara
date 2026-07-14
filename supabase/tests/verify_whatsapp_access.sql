-- Verify the production WhatsApp backend remains service-role only.
-- Run with: supabase db query --local --file supabase/tests/verify_whatsapp_access.sql

do $$
declare
  table_name text;
  role_name text;
  privilege_name text;
  function_signature text;
begin
  foreach table_name in array array[
    'whatsapp_contacts',
    'whatsapp_conversations',
    'whatsapp_messages',
    'support_escalations',
    'knowledge_entries',
    'bot_audit_logs',
    'webhook_events',
    'whatsapp_contacts_legacy',
    'whatsapp_events'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is null then
      raise exception 'Expected table public.% is missing', table_name;
    end if;

    if not (
      select c.relrowsecurity
      from pg_class c
      where c.oid = format('public.%I', table_name)::regclass
    ) then
      raise exception 'RLS is disabled on public.%', table_name;
    end if;

    if exists (
      select 1
      from pg_policies p
      where p.schemaname = 'public'
        and p.tablename = table_name
        and (p.roles && array['anon', 'authenticated', 'public']::name[])
    ) then
      raise exception 'A public-role RLS policy exists on public.%', table_name;
    end if;

    foreach role_name in array array['anon', 'authenticated']
    loop
      foreach privilege_name in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE']
      loop
        if has_table_privilege(
          role_name,
          format('public.%I', table_name),
          privilege_name
        ) then
          raise exception '% unexpectedly has % on public.%',
            role_name, privilege_name, table_name;
        end if;
      end loop;
    end loop;

    foreach privilege_name in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE']
    loop
      if not has_table_privilege(
        'service_role',
        format('public.%I', table_name),
        privilege_name
      ) then
        raise exception 'service_role is missing % on public.%',
          privilege_name, table_name;
      end if;
    end loop;
  end loop;

  foreach function_signature in array array[
    'public.claim_next_whatsapp_webhook_event()',
    'public.cleanup_whatsapp_retention(integer,integer)'
  ]
  loop
    foreach role_name in array array['anon', 'authenticated']
    loop
      if has_function_privilege(role_name, function_signature, 'EXECUTE') then
        raise exception '% unexpectedly has EXECUTE on %',
          role_name, function_signature;
      end if;
    end loop;

    if not has_function_privilege('service_role', function_signature, 'EXECUTE') then
      raise exception 'service_role is missing EXECUTE on %', function_signature;
    end if;
  end loop;

  -- Exercise representative table and RPC calls under both public roles.
  -- Each nested block rolls back its SET ROLE when the expected permission
  -- error is raised, leaving the outer verification transaction privileged.
  foreach role_name in array array['anon', 'authenticated']
  loop
    begin
      perform set_config('role', role_name, true);
      perform 1 from public.whatsapp_contacts limit 1;
      raise exception '% unexpectedly read public.whatsapp_contacts', role_name;
    exception
      when insufficient_privilege then
        null;
    end;

    begin
      perform set_config('role', role_name, true);
      perform * from public.claim_next_whatsapp_webhook_event();
      raise exception '% unexpectedly executed claim_next_whatsapp_webhook_event()', role_name;
    exception
      when insufficient_privilege then
        null;
    end;
  end loop;
end
$$;
