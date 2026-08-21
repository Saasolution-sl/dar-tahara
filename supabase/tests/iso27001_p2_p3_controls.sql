\set ON_ERROR_STOP on
\pset pager off

begin;

do $$
begin
  if exists (select 1 from public.retention_policy_rules where enabled) then
    raise exception 'retention rules must be disabled until human approval';
  end if;
  if has_table_privilege('authenticated', 'public.retention_policy_rules', 'SELECT')
    or has_table_privilege('authenticated', 'public.security_event_log', 'INSERT')
    or has_table_privilege('authenticated', 'public.pause_request_attachments', 'INSERT') then
    raise exception 'browser roles have unsafe P2/P3 table privileges';
  end if;
  if not has_table_privilege('service_role', 'public.security_event_log', 'INSERT') then
    raise exception 'service_role cannot append security events';
  end if;
end
$$;

do $$
begin
  begin
    update public.retention_policy_rules
      set enabled = true
      where category = 'whatsapp_messages';
    raise exception 'unapproved retention rule was enabled';
  exception
    when check_violation then null;
  end;
end
$$;

insert into public.security_event_log(
  event_id, occurred_at, event_type, severity, source, payload_sha256
) values (
  '00000000-0000-0000-0000-000000000001', now(), 'controlled_test',
  'low', 'database-test', repeat('0', 64)
);

do $$
begin
  begin
    update public.security_event_log
      set severity = 'medium'
      where event_id = '00000000-0000-0000-0000-000000000001';
    raise exception 'append-only security event was mutable';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

select category, enabled
from public.retention_policy_rules
order by category;

rollback;
