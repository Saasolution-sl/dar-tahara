-- Track *when* the free 12-month deep clean was used, so the portal can show
-- the customer a date rather than just a boolean. Once used, the customer
-- can still request further deep cleans, they just pay for them (same
-- pricing formula as every other paid deep clean).
alter table public.subscriptions
  add column if not exists deep_clean_free_used_at timestamptz;

notify pgrst, 'reload schema';
