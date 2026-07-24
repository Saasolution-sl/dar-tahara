-- Website-backed retrieval, review-only knowledge suggestions, and channel-neutral handover.
-- All objects remain private to the server-side service role. Customer-facing routes
-- authenticate against the opaque website session before invoking these objects.

create extension if not exists vector with schema extensions;

alter table public.knowledge_articles
  add column if not exists source_review_required boolean not null default false,
  add column if not exists source_changed_at timestamptz,
  add column if not exists quality_score numeric(4,3) not null default 0.900
    check (quality_score between 0 and 1);

alter table public.knowledge_entries
  add column if not exists knowledge_article_id uuid
    references public.knowledge_articles(id) on delete set null;

update public.knowledge_entries e
set knowledge_article_id = a.id
from public.knowledge_articles a
where e.knowledge_article_id is null
  and e.slug = a.slug;

alter table public.assistant_feedback
  add column if not exists knowledge_article_ids uuid[] not null default '{}'::uuid[],
  add column if not exists website_source_ids uuid[] not null default '{}'::uuid[],
  add column if not exists answer_confidence numeric(4,3)
    check (answer_confidence is null or answer_confidence between 0 and 1),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.website_sources (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null unique,
  title text not null default '',
  page_type text not null default 'other',
  language text not null default 'en'
    check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  status text not null default 'active'
    check (status in ('active', 'blocked', 'removed', 'error')),
  is_indexable boolean not null default true,
  latest_content_hash text,
  current_version_id uuid,
  sitemap_last_modified timestamptz,
  last_crawled_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (canonical_url ~ '^https://(www\.)?dartahara\.com(/|$)')
);

create table if not exists public.website_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.website_sources(id) on delete cascade,
  content_hash text not null,
  title text not null default '',
  extracted_text text not null,
  sitemap_last_modified timestamptz,
  security_flags jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source_id, content_hash)
);

alter table public.website_sources
  drop constraint if exists website_sources_current_version_id_fkey;
alter table public.website_sources
  add constraint website_sources_current_version_id_fkey
  foreign key (current_version_id) references public.website_versions(id) on delete set null;

create table if not exists public.website_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.website_sources(id) on delete cascade,
  version_id uuid not null references public.website_versions(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  content_hash text not null,
  embedding extensions.vector(512),
  embedding_model text,
  search_document tsvector,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (version_id, chunk_index)
);

create table if not exists public.knowledge_suggestions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  source_id uuid not null references public.website_sources(id) on delete cascade,
  source_version_id uuid not null references public.website_versions(id) on delete cascade,
  source_url text not null,
  source_page text not null,
  language text not null
    check (language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  extracted_text text not null,
  confidence_score numeric(4,3) not null check (confidence_score between 0 and 1),
  content_hash text not null,
  question_fingerprint text not null,
  suggestion_embedding extensions.vector(512),
  embedding_model text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected')),
  occurrence_count integer not null default 1 check (occurrence_count > 0),
  first_found_at timestamptz not null default now(),
  last_found_at timestamptz not null default now(),
  reviewer uuid references auth.users(id) on delete set null,
  review_date timestamptz,
  admin_notes text,
  approved_article_id uuid references public.knowledge_articles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.handover_reference_seq start with 1;

create table if not exists public.handover_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'DT-' || lpad(nextval('public.handover_reference_seq')::text, 6, '0')
  ),
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  channel text not null default 'whatsapp'
    check (channel in ('whatsapp', 'phone', 'freescout', 'crm', 'ticket')),
  status text not null default 'created'
    check (status in ('created', 'opened', 'accepted', 'closed', 'failed')),
  customer_language text not null
    check (customer_language in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt')),
  detected_intent text,
  service text,
  location text,
  conversation_summary text not null,
  conversation_transcript text not null,
  destination text not null,
  provider_payload jsonb not null default '{}'::jsonb,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_sources_status_crawled_idx
  on public.website_sources (status, last_crawled_at, language);
create index if not exists website_versions_source_created_idx
  on public.website_versions (source_id, created_at desc);
create index if not exists website_embeddings_search_idx
  on public.website_embeddings using gin (search_document);
create index if not exists website_embeddings_vector_idx
  on public.website_embeddings using hnsw (embedding vector_cosine_ops)
  where embedding is not null;
create index if not exists knowledge_suggestions_review_idx
  on public.knowledge_suggestions (status, confidence_score desc, last_found_at desc);
create index if not exists knowledge_suggestions_hash_idx
  on public.knowledge_suggestions (content_hash, question_fingerprint);
create index if not exists knowledge_suggestions_vector_idx
  on public.knowledge_suggestions using hnsw (suggestion_embedding vector_cosine_ops)
  where suggestion_embedding is not null;
create index if not exists handover_requests_conversation_idx
  on public.handover_requests (conversation_id, created_at desc);
create index if not exists knowledge_entries_article_idx
  on public.knowledge_entries (knowledge_article_id)
  where knowledge_article_id is not null;

create or replace function private.link_knowledge_entry_article()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.knowledge_article_id is null then
    select id into new.knowledge_article_id
    from public.knowledge_articles
    where slug = new.slug
    order by updated_at desc
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists knowledge_entries_link_article on public.knowledge_entries;
create trigger knowledge_entries_link_article
before insert or update of slug, knowledge_article_id on public.knowledge_entries
for each row execute function private.link_knowledge_entry_article();

create or replace function private.set_website_embedding_search_document()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.search_document := to_tsvector('simple', coalesce(new.content, ''));
  return new;
end;
$$;

drop trigger if exists website_embeddings_search_document_update on public.website_embeddings;
create trigger website_embeddings_search_document_update
before insert or update of content on public.website_embeddings
for each row execute function private.set_website_embedding_search_document();

drop trigger if exists website_sources_set_updated_at on public.website_sources;
create trigger website_sources_set_updated_at before update on public.website_sources
for each row execute function private.set_updated_at();
drop trigger if exists knowledge_suggestions_set_updated_at on public.knowledge_suggestions;
create trigger knowledge_suggestions_set_updated_at before update on public.knowledge_suggestions
for each row execute function private.set_updated_at();
drop trigger if exists handover_requests_set_updated_at on public.handover_requests;
create trigger handover_requests_set_updated_at before update on public.handover_requests
for each row execute function private.set_updated_at();

alter table public.website_sources enable row level security;
alter table public.website_versions enable row level security;
alter table public.website_embeddings enable row level security;
alter table public.knowledge_suggestions enable row level security;
alter table public.handover_requests enable row level security;

revoke all on table public.website_sources, public.website_versions,
  public.website_embeddings, public.knowledge_suggestions, public.handover_requests
  from public, anon, authenticated;
grant select, insert, update, delete on table public.website_sources, public.website_versions,
  public.website_embeddings, public.knowledge_suggestions, public.handover_requests
  to service_role;
revoke all on sequence public.handover_reference_seq from public, anon, authenticated;
grant usage, select on sequence public.handover_reference_seq to service_role;

create or replace function public.record_website_page_version(
  p_canonical_url text,
  p_title text,
  p_page_type text,
  p_language text,
  p_content_hash text,
  p_extracted_text text,
  p_sitemap_last_modified timestamptz default null,
  p_security_flags jsonb default '[]'::jsonb,
  p_metadata jsonb default '{}'::jsonb
)
returns table(source_id uuid, version_id uuid, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.website_sources%rowtype;
  v_version_id uuid;
begin
  if p_canonical_url !~ '^https://(www\.)?dartahara\.com(/|$)' then
    raise exception 'website_source_not_allowed';
  end if;
  if p_language not in ('en', 'nl', 'fr', 'ar', 'es', 'de', 'pt') then
    raise exception 'unsupported_website_language';
  end if;

  insert into public.website_sources (
    canonical_url, title, page_type, language, status, is_indexable,
    sitemap_last_modified, last_crawled_at, last_error, metadata
  ) values (
    p_canonical_url, left(p_title, 500), left(p_page_type, 100), p_language,
    'active', true, p_sitemap_last_modified, now(), null, p_metadata
  )
  on conflict (canonical_url) do update set
    title = excluded.title,
    page_type = excluded.page_type,
    language = excluded.language,
    status = 'active',
    is_indexable = true,
    sitemap_last_modified = excluded.sitemap_last_modified,
    last_crawled_at = now(),
    last_error = null,
    metadata = public.website_sources.metadata || excluded.metadata,
    updated_at = now()
  returning * into v_source;

  if v_source.latest_content_hash = p_content_hash and v_source.current_version_id is not null then
    return query select v_source.id, v_source.current_version_id, false;
    return;
  end if;

  insert into public.website_versions (
    source_id, content_hash, title, extracted_text, sitemap_last_modified, security_flags
  ) values (
    v_source.id, p_content_hash, left(p_title, 500), p_extracted_text,
    p_sitemap_last_modified, coalesce(p_security_flags, '[]'::jsonb)
  )
  on conflict on constraint website_versions_source_id_content_hash_key do update set
    title = excluded.title,
    sitemap_last_modified = excluded.sitemap_last_modified
  returning id into v_version_id;

  update public.website_sources
  set latest_content_hash = p_content_hash,
      current_version_id = v_version_id,
      updated_at = now()
  where id = v_source.id;

  if v_source.latest_content_hash is not null then
    update public.knowledge_articles a
    set source_review_required = true,
        source_changed_at = now(),
        updated_at = now()
    from public.knowledge_sources s
    where a.source_id = s.id
      and s.source_url = p_canonical_url
      and a.status = 'approved';
  end if;

  return query select v_source.id, v_version_id, true;
end;
$$;

revoke all on function public.record_website_page_version(
  text, text, text, text, text, text, timestamptz, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.record_website_page_version(
  text, text, text, text, text, text, timestamptz, jsonb, jsonb
) to service_role;

create or replace function public.search_website_content(
  p_query_text text,
  p_query_embedding extensions.vector(512) default null,
  p_language text default 'en',
  p_match_count integer default 5
)
returns table(
  embedding_id uuid,
  source_id uuid,
  version_id uuid,
  canonical_url text,
  title text,
  page_type text,
  language text,
  content text,
  content_hash text,
  similarity double precision
)
language sql
security invoker
set search_path = ''
as $$
  with ranked as (
    select
      e.id as embedding_id,
      e.source_id,
      e.version_id,
      s.canonical_url,
      s.title,
      s.page_type,
      s.language,
      e.content,
      e.content_hash,
      ts_rank_cd(e.search_document, websearch_to_tsquery('simple', left(p_query_text, 500)))::double precision as keyword_score,
      case
        when p_query_embedding is not null and e.embedding is not null
          then (1 - (e.embedding OPERATOR(extensions.<=>) p_query_embedding))::double precision
        else 0::double precision
      end as semantic_score
    from public.website_embeddings e
    join public.website_sources s
      on s.id = e.source_id and s.current_version_id = e.version_id
    where s.status = 'active'
      and s.is_indexable
      and s.language in (p_language, 'en')
      and (
        e.search_document @@ websearch_to_tsquery('simple', left(p_query_text, 500))
        or (p_query_embedding is not null and e.embedding is not null
          and 1 - (e.embedding OPERATOR(extensions.<=>) p_query_embedding) >= 0.55)
      )
  )
  select
    embedding_id, source_id, version_id, canonical_url, title, page_type,
    language, content, content_hash,
    least(1, greatest(0, least(1, keyword_score * 5) * 0.45 + semantic_score * 0.55)) as similarity
  from ranked
  order by (least(1, keyword_score * 5) * 0.45 + semantic_score * 0.55) desc
  limit least(greatest(p_match_count, 1), 20);
$$;

revoke all on function public.search_website_content(text, extensions.vector, text, integer)
  from public, anon, authenticated;
grant execute on function public.search_website_content(text, extensions.vector, text, integer)
  to service_role;

create or replace function public.upsert_knowledge_suggestion(
  p_question text,
  p_answer text,
  p_source_id uuid,
  p_source_version_id uuid,
  p_source_url text,
  p_source_page text,
  p_language text,
  p_extracted_text text,
  p_confidence_score numeric,
  p_content_hash text,
  p_question_fingerprint text,
  p_suggestion_embedding extensions.vector(512) default null,
  p_embedding_model text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.knowledge_suggestions
  where status = 'pending_review'
    and (
      (content_hash = p_content_hash and question_fingerprint = p_question_fingerprint)
      or (
        p_suggestion_embedding is not null
        and suggestion_embedding is not null
        and suggestion_embedding OPERATOR(extensions.<=>) p_suggestion_embedding <= 0.08
      )
    )
  order by last_found_at desc
  limit 1
  for update;

  if v_id is not null then
    update public.knowledge_suggestions
    set answer = p_answer,
        source_id = p_source_id,
        source_version_id = p_source_version_id,
        source_url = p_source_url,
        source_page = p_source_page,
        extracted_text = p_extracted_text,
        confidence_score = greatest(confidence_score, p_confidence_score),
        occurrence_count = occurrence_count + 1,
        last_found_at = now(),
        metadata = metadata || p_metadata,
        updated_at = now()
    where id = v_id;
    return v_id;
  end if;

  insert into public.knowledge_suggestions (
    question, answer, source_id, source_version_id, source_url, source_page,
    language, extracted_text, confidence_score, content_hash, question_fingerprint,
    suggestion_embedding, embedding_model, metadata
  ) values (
    left(p_question, 2000), left(p_answer, 5000), p_source_id, p_source_version_id,
    p_source_url, left(p_source_page, 500), p_language, left(p_extracted_text, 12000),
    p_confidence_score, p_content_hash, p_question_fingerprint,
    p_suggestion_embedding, p_embedding_model, p_metadata
  ) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.upsert_knowledge_suggestion(
  text, text, uuid, uuid, text, text, text, text, numeric, text, text,
  extensions.vector, text, jsonb
) from public, anon, authenticated;
grant execute on function public.upsert_knowledge_suggestion(
  text, text, uuid, uuid, text, text, text, text, numeric, text, text,
  extensions.vector, text, jsonb
) to service_role;

create or replace function public.approve_knowledge_suggestion(
  p_suggestion_id uuid,
  p_reviewer_id uuid,
  p_admin_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.knowledge_suggestions%rowtype;
  v_source_id uuid;
  v_article_id uuid;
  v_slug text;
begin
  select * into s
  from public.knowledge_suggestions
  where id = p_suggestion_id
  for update;

  if not found then raise exception 'knowledge_suggestion_not_found'; end if;
  if s.status <> 'pending_review' then raise exception 'knowledge_suggestion_not_pending'; end if;

  select id into v_source_id
  from public.knowledge_sources
  where source_url = s.source_url and source_type = 'website'
  order by created_at
  limit 1;

  if v_source_id is null then
    insert into public.knowledge_sources (title, source_type, source_url, metadata)
    values (s.source_page, 'website', s.source_url, jsonb_build_object('website_source_id', s.source_id))
    returning id into v_source_id;
  end if;

  v_slug := 'website-suggestion-' || replace(s.id::text, '-', '');
  insert into public.knowledge_articles (
    slug, category, status, visibility, source_id, canonical_language,
    applicable_languages, approval_date, last_reviewed_date, metadata
  ) values (
    v_slug, coalesce(nullif(s.metadata->>'category', ''), 'support'),
    'approved', 'public', v_source_id, s.language, array[s.language],
    now(), current_date, jsonb_build_object('knowledge_suggestion_id', s.id)
  )
  returning id into v_article_id;

  insert into public.knowledge_article_versions (
    article_id, version, title, summary, body, short_answer,
    detailed_answer, source_answer, change_note, approved_at
  ) values (
    v_article_id, 1, s.question, left(s.answer, 500), s.answer,
    left(s.answer, 500), s.answer, s.extracted_text,
    'Approved from website knowledge suggestion ' || s.id::text, now()
  );

  insert into public.knowledge_entries (
    slug, category, title, language, content, status, version,
    effective_from, keywords, source, reviewed_at, knowledge_article_id
  ) values (
    v_slug, coalesce(nullif(s.metadata->>'category', ''), 'support'),
    s.question, s.language, s.answer, 'published', 1, now(),
    array_remove(array[lower(coalesce(s.metadata->>'category', 'support'))], ''),
    'website_suggestion:' || s.id::text, now(), v_article_id
  );

  update public.knowledge_suggestions
  set status = 'approved',
      reviewer = p_reviewer_id,
      review_date = now(),
      admin_notes = p_admin_notes,
      approved_article_id = v_article_id,
      updated_at = now()
  where id = s.id;

  insert into public.assistant_audit_logs (
    actor_type, actor_reference, action, subject_table, subject_id, metadata
  ) values (
    'administrator', coalesce(p_reviewer_id::text, 'system'),
    'website_knowledge_suggestion_approved', 'knowledge_suggestions', s.id,
    jsonb_build_object('article_id', v_article_id, 'source_url', s.source_url)
  );

  return v_article_id;
end;
$$;

revoke all on function public.approve_knowledge_suggestion(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.approve_knowledge_suggestion(uuid, uuid, text)
  to service_role;
