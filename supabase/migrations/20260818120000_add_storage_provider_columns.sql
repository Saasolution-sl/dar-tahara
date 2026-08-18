-- Cubbit DS3 migration: track which object-storage backend a stored
-- attachment lives in. New uploads write to Cubbit; existing rows keep
-- pointing at Supabase Storage until the backfill script moves them, so
-- retrieval routes need to know which backend to sign a URL against.

alter table public.support_attachments
  add column if not exists storage_provider text not null default 'supabase'
    check (storage_provider in ('supabase', 'cubbit'));

alter table public.pause_request_attachments
  add column if not exists storage_provider text not null default 'supabase'
    check (storage_provider in ('supabase', 'cubbit'));

notify pgrst, 'reload schema';
