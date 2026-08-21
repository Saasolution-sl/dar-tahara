create table if not exists private.rate_limit_counters (
  key_hash text primary key,
  window_started_at timestamptz not null,
  expires_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table private.rate_limit_counters enable row level security;
revoke all on table private.rate_limit_counters from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_window_seconds integer,
  p_max_requests integer
)
returns table(allowed boolean, retry_after_ms bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
begin
  if p_key_hash !~ '^[0-9a-f]{64}$'
     or p_window_seconds < 1 or p_window_seconds > 86400
     or p_max_requests < 1 or p_max_requests > 10000 then
    raise exception 'invalid_rate_limit_parameters' using errcode = '22023';
  end if;

  return query
  insert into private.rate_limit_counters as counters (
    key_hash,
    window_started_at,
    expires_at,
    request_count
  ) values (
    p_key_hash,
    v_now,
    v_now + make_interval(secs => p_window_seconds),
    1
  )
  on conflict (key_hash) do update set
    window_started_at = case when counters.expires_at <= v_now then v_now else counters.window_started_at end,
    expires_at = case when counters.expires_at <= v_now then v_now + make_interval(secs => p_window_seconds) else counters.expires_at end,
    request_count = case when counters.expires_at <= v_now then 1 else counters.request_count + 1 end
  returning
    counters.request_count <= p_max_requests,
    case
      when counters.request_count <= p_max_requests then 0::bigint
      else greatest(1::bigint, ceil(extract(epoch from (counters.expires_at - v_now)) * 1000)::bigint)
    end;
end;
$$;

comment on function public.consume_rate_limit(text, integer, integer) is
  'Atomic application-wide rate limit. Accepts an HMAC digest only; server-side service role only.';

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
