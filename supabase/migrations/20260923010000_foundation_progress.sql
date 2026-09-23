-- Uses the existing per-user RLS policies on user_learning_state.
alter table public.user_learning_state
  add column if not exists foundations jsonb not null default '{}'::jsonb;
alter table public.user_learning_state
  add constraint foundations_bounded_object check (
    jsonb_typeof(foundations) = 'object' and octet_length(foundations::text) <= 65536
  );
