alter table public.user_learning_state
  add column if not exists writing jsonb not null default '{}'::jsonb;
alter table public.user_learning_state
  add constraint writing_object_size check (
    jsonb_typeof(writing) = 'object' and octet_length(writing::text) <= 200000
  );
