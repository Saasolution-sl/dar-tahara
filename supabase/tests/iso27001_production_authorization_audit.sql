\set ON_ERROR_STOP on
\pset pager off

begin transaction read only;

do $$
declare
  finding text;
begin
  select string_agg(format('%I.%I', n.nspname, c.relname), ', ' order by n.nspname, c.relname)
    into finding
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'storage')
    and c.relkind in ('r', 'p')
    and not c.relrowsecurity;

  if finding is not null then
    raise exception 'Tables without RLS in exposed/data schemas: %', finding;
  end if;
end
$$;

do $$
declare
  finding text;
begin
  select string_agg(format('%I.%I', n.nspname, c.relname), ', ' order by n.nspname, c.relname)
    into finding
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('v', 'm')
    and (
      has_table_privilege('anon', c.oid, 'SELECT')
      or has_table_privilege('authenticated', c.oid, 'SELECT')
    )
    and not coalesce(c.reloptions, '{}'::text[]) @> array['security_invoker=true'];

  if finding is not null then
    raise exception 'API-readable views without security_invoker=true: %', finding;
  end if;
end
$$;

do $$
declare
  finding text;
begin
  select string_agg(p.oid::regprocedure::text, ', ' order by p.oid::regprocedure::text)
    into finding
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where p.prosecdef
    and n.nspname in ('public', 'storage')
    and not exists (
      select 1
      from unnest(coalesce(p.proconfig, '{}'::text[])) setting
      where setting like 'search_path=%'
    );

  if finding is not null then
    raise exception 'SECURITY DEFINER functions without fixed search_path: %', finding;
  end if;
end
$$;

do $$
declare
  finding text;
begin
  select string_agg(p.oid::regprocedure::text, ', ' order by p.oid::regprocedure::text)
    into finding
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where p.prosecdef
    and n.nspname = 'public'
    and (
      has_function_privilege('anon', p.oid, 'EXECUTE')
      or has_function_privilege('authenticated', p.oid, 'EXECUTE')
    );

  if finding is not null then
    raise exception 'Public SECURITY DEFINER functions executable by Data API roles require explicit review/revocation: %', finding;
  end if;
end
$$;

do $$
declare
  finding text;
begin
  select string_agg(format('%I.%I:%I', schemaname, tablename, policyname), ', ' order by schemaname, tablename, policyname)
    into finding
  from pg_policies
  where schemaname in ('public', 'storage')
    and concat_ws(' ', qual, with_check) ~* 'auth\.role\s*\(';

  if finding is not null then
    raise exception 'Policies use deprecated auth.role(): %', finding;
  end if;
end
$$;

do $$
declare
  finding text;
begin
  if to_regclass('storage.buckets') is null then
    return;
  end if;

  select string_agg(id, ', ' order by id)
    into finding
  from storage.buckets
  where public;

  if finding is not null then
    raise exception 'Public storage buckets require explicit approval: %', finding;
  end if;
end
$$;

select
  current_database() as database_name,
  current_setting('server_version') as server_version,
  count(*) filter (where n.nspname = 'public' and c.relkind in ('r', 'p')) as public_tables,
  count(*) filter (where n.nspname = 'public' and c.relkind in ('r', 'p') and c.relrowsecurity) as public_tables_with_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace;

select
  n.nspname as schema_name,
  p.proname as function_name,
  p.prosecdef as security_definer,
  p.proconfig as function_settings
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'storage')
order by n.nspname, p.proname;

rollback;
