-- Provision every verified Supabase identity as a Dar Tahara applicant.
-- Existing assessment customers are linked by normalized email; otherwise a
-- minimal profile is created and completed later in the customer portal.

create or replace function private.provision_portal_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
  customer_id uuid;
  display_name text;
  preferred_language text;
begin
  normalized_email := lower(trim(new.email));
  -- Do not link customer data or assign a role until Supabase has verified the
  -- address. Google/Apple identities arrive confirmed; password users reach
  -- this branch only after opening their confirmation email.
  if normalized_email is null or normalized_email = '' or new.email_confirmed_at is null then
    return new;
  end if;

  display_name := left(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(normalized_email, '@', 1)
  ), 200);
  preferred_language := case
    when new.raw_user_meta_data ->> 'preferred_language' in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')
      then new.raw_user_meta_data ->> 'preferred_language'
    else 'en'
  end;

  select c.id
  into customer_id
  from public.customers c
  where lower(c.email) = normalized_email
  order by c.created_at asc
  limit 1
  for update;

  if customer_id is not null then
    update public.customers
    set auth_user_id = coalesce(auth_user_id, new.id),
        email_verified_at = coalesce(new.email_confirmed_at, email_verified_at),
        last_login_at = coalesce(new.last_sign_in_at, last_login_at),
        updated_at = now()
    where id = customer_id
      and (auth_user_id is null or auth_user_id = new.id);
  else
    insert into public.customers (
      auth_user_id,
      email,
      full_name,
      phone,
      preferred_language,
      status,
      email_verified_at,
      last_login_at
    ) values (
      new.id,
      normalized_email,
      display_name,
      '',
      preferred_language,
      'applicant',
      new.email_confirmed_at,
      new.last_sign_in_at
    )
    on conflict (email) do update
    set auth_user_id = coalesce(public.customers.auth_user_id, excluded.auth_user_id),
        email_verified_at = coalesce(excluded.email_verified_at, public.customers.email_verified_at),
        last_login_at = coalesce(excluded.last_login_at, public.customers.last_login_at),
        updated_at = now()
    where public.customers.auth_user_id is null
       or public.customers.auth_user_id = excluded.auth_user_id;
  end if;

  return new;
end;
$$;

revoke all on function private.provision_portal_user() from public, anon, authenticated;
grant execute on function private.provision_portal_user() to service_role;

drop trigger if exists provision_portal_user_on_auth_change on auth.users;
create trigger provision_portal_user_on_auth_change
after insert or update of email_confirmed_at, last_sign_in_at on auth.users
for each row execute function private.provision_portal_user();
