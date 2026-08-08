-- Cookieless, server-side page-view counter for /[locale]/early-access.
--
-- Why this exists: the tracked links produced by the campaign-sources admin
-- utility tell us what we SENT, but nothing about what arrived. Counting views
-- closes that loop (views → submissions per source) without a single analytics
-- cookie, so the counter runs before, and independently of, any cookie
-- consent decision.
--
-- Privacy posture. A row records only:
--   • when the view happened (timestamp),
--   • which locale was rendered,
--   • the campaign params that were already in the URL (src + utm_*),
--   • a SALTED SHA-256 hash of the client IP, truncated to 128 bits.
-- No raw IP, no user agent, no referrer, no cookie, no identifier that could be
-- joined back to a person. The IP hash exists purely so "views" can be reported
-- alongside "unique-ish visitors", coarse dedupe, not identity. It is salted
-- with RATE_LIMIT_SECRET (see src/lib/early-access/request-meta.ts), so the
-- stored value is not reversible with a rainbow table of the IPv4 space.
--
-- Security model matches the other early-access tables: RLS on, forced, and NO
-- anon/authenticated policies. Writes happen exclusively from the Next.js server
-- with the service role (which bypasses RLS); the browser never touches this
-- table through the Data API.

create table if not exists public.early_access_page_views (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),

  -- Which localized page was served.
  locale text not null default 'en'
    check (locale in ('en','nl','fr','ar','es','de','pt')),

  -- Campaign attribution as it appeared in the URL. source_code is intentionally
  -- NOT a foreign key to campaign_sources: a mistyped or retired code in a
  -- shared link must still be counted (and be visible as an orphan), never
  -- rejected at insert time.
  source_code text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  -- Salted, truncated IP hash. Nullable, when the IP is unavailable the view is
  -- still counted, it just cannot contribute to the unique-visitor estimate.
  ip_hash text
);

-- Per-source reporting is the primary read pattern; the plain occurred_at index
-- supports retention pruning and "views in the last N days".
create index if not exists early_access_page_views_source_idx
  on public.early_access_page_views (source_code, occurred_at desc);
create index if not exists early_access_page_views_occurred_idx
  on public.early_access_page_views (occurred_at desc);

-- ── Aggregate view ─────────────────────────────────────────────────────────────
-- Pre-aggregated per source_code so the admin utility never has to pull raw view
-- rows. `unique_visitors` is the coarse dedupe: distinct IP hashes, which
-- collapses one person refreshing the page but deliberately also collapses
-- several people behind one NAT. It is an estimate and is labelled as such in
-- the UI. security_invoker keeps the view bound by the caller's own privileges
-- rather than the owner's, so it cannot become a back door around the RLS below.
create or replace view public.early_access_page_view_stats
with (security_invoker = true) as
  select
    source_code,
    count(*)::bigint                                     as views,
    count(distinct ip_hash)::bigint                      as unique_visitors,
    min(occurred_at)                                     as first_view_at,
    max(occurred_at)                                     as last_view_at
  from public.early_access_page_views
  group by source_code;

-- ── Row-level security: deny-by-default ────────────────────────────────────────
alter table public.early_access_page_views enable row level security;
alter table public.early_access_page_views force row level security;

do $$
begin
  -- The Data API roles only exist on a Supabase database; guard the revokes so
  -- this migration also applies cleanly on a plain Postgres (CI, local test).
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.early_access_page_views from anon;
    revoke all on table public.early_access_page_view_stats from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table public.early_access_page_views from authenticated;
    revoke all on table public.early_access_page_view_stats from authenticated;
  end if;
end
$$;
