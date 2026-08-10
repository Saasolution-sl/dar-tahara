-- Make early-access lead capture atomic.
--
-- persistEarlyAccessLead did three writes over PostgREST: upsert
-- marketing_leads, insert lead_consents, insert email_verification_tokens.
-- Separate requests mean separate transactions, so a failure after the first
-- one leaves a lead stored with no record of the consent it was collected
-- under and no way for the visitor to verify. That is exactly what happened on
-- 2026-08-10: the consent insert failed a CHECK for eight hours while leads
-- kept being written. It only escaped without orphans because every attempt in
-- that window reused an existing email and took the update path.
--
-- One function, one transaction: either the lead and its consents and its token
-- all exist, or none of them do.
--
-- The lead columns arrive as jsonb rather than as a fixed parameter list
-- because buildLeadRow() spreads a variable set of attribution columns. Dynamic
-- SQL over the supplied keys means columns the caller did not mention keep
-- their database defaults, which `jsonb_populate_record` alone would overwrite
-- with NULL.

create or replace function public.persist_early_access_lead(
  p_lead jsonb,
  p_consent jsonb,
  p_consent_types text[],
  p_token_hash text default null,
  p_token_expires_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := p_lead->>'normalized_email';
  v_prior_id uuid;
  v_prior_status text;
  v_lead_id uuid;
  v_status text;
  v_patch jsonb;
  v_cols text;
  v_assignments text;
begin
  if v_email is null or btrim(v_email) = '' then
    raise exception 'persist_early_access_lead requires normalized_email';
  end if;
  if p_consent_types is null or array_length(p_consent_types, 1) is null then
    raise exception 'persist_early_access_lead requires at least one consent type';
  end if;

  select id, status into v_prior_id, v_prior_status
  from public.marketing_leads
  where normalized_email = v_email
  limit 1;

  if v_prior_id is null then
    select string_agg(quote_ident(key), ', ') into v_cols
    from jsonb_object_keys(p_lead) as k(key);

    execute format(
      'insert into public.marketing_leads (%s) '
      'select %s from jsonb_populate_record(null::public.marketing_leads, $1) '
      'returning id, status',
      v_cols, v_cols
    ) using p_lead into v_lead_id, v_status;
  else
    -- Mirrors the behaviour this replaces: first-touch attribution is never
    -- overwritten on a returning lead, and an already-verified lead keeps its
    -- status rather than being knocked back to pending.
    --
    -- Note `first_name` is caught by the same `first_%` prefix and so is also
    -- left untouched on update. That is preserved here deliberately - this
    -- migration is about atomicity, not about changing which columns a repeat
    -- submission may rewrite.
    select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_patch
    from jsonb_each(p_lead) as e(key, value)
    where key not like 'first\_%'
      and not (key = 'status' and v_prior_status is distinct from 'pending');

    if v_patch = '{}'::jsonb then
      v_lead_id := v_prior_id;
      v_status := v_prior_status;
    else
      select string_agg(format('%I = src.%I', key, key), ', ') into v_assignments
      from jsonb_object_keys(v_patch) as k(key);

      execute format(
        'update public.marketing_leads as target set %s '
        'from jsonb_populate_record(null::public.marketing_leads, $1) as src '
        'where target.id = $2 returning target.id, target.status',
        v_assignments
      ) using v_patch, v_prior_id into v_lead_id, v_status;
    end if;
  end if;

  insert into public.lead_consents (
    lead_id, consent_type, granted, policy_version, locale, source, request_metadata
  )
  select
    v_lead_id,
    consent_type,
    coalesce((p_consent->>'granted')::boolean, true),
    p_consent->>'policy_version',
    p_consent->>'locale',
    p_consent->>'source',
    case when p_consent->'request_metadata' = 'null'::jsonb then null
         else p_consent->'request_metadata' end
  from unnest(p_consent_types) as t(consent_type);

  -- Only an unverified lead needs a fresh verification token; an already
  -- verified one must not be handed a new way to re-verify.
  if v_status is distinct from 'pending' then
    return jsonb_build_object('lead_id', v_lead_id, 'already_verified', true);
  end if;

  if p_token_hash is not null then
    insert into public.email_verification_tokens (lead_id, token_hash, expires_at)
    values (v_lead_id, p_token_hash, p_token_expires_at);
  end if;

  return jsonb_build_object('lead_id', v_lead_id, 'already_verified', false);
end;
$$;

comment on function public.persist_early_access_lead(jsonb, jsonb, text[], text, timestamptz) is
  'Atomically upserts an early-access lead with its consent rows and verification token. Called server-side with the service role only.';

-- Server-side only: the early-access route holds the secret key. Nothing
-- reachable with the publishable key should be able to write leads directly.
revoke all on function public.persist_early_access_lead(jsonb, jsonb, text[], text, timestamptz) from public, anon, authenticated;
grant execute on function public.persist_early_access_lead(jsonb, jsonb, text[], text, timestamptz) to service_role;
