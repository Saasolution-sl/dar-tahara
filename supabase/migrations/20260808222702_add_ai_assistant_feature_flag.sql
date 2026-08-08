-- Preserve the current production behaviour during rollout: the assistant is
-- enabled until an administrator explicitly disables it.
insert into public.feature_flags (
  key,
  name,
  description,
  enabled,
  public_disabled_message,
  fallback_cta_label,
  fallback_cta_url
)
values (
  'ai_assistant_enabled',
  'AI Assistant',
  'Controls whether the Dar Tahara AI Assistant is available to customers and website visitors.',
  true,
  'Our automated assistant is temporarily unavailable. Please contact Dar Tahara Support.',
  'Contact Support',
  '/#contact'
)
on conflict (key) do nothing;

notify pgrst, 'reload schema';
