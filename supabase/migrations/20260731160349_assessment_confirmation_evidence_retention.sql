-- Keep the signed confirmation audit record while deleting only the sensitive
-- identity image after the configured retention window.
alter table public.assessment_confirmations
  add column if not exists evidence_deleted_at timestamptz;

create index if not exists assessment_confirmations_pending_retention_idx
  on public.assessment_confirmations(retention_delete_after)
  where evidence_deleted_at is null;

notify pgrst, 'reload schema';
