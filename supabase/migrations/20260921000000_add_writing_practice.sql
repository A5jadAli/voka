alter table public.user_learning_state
add column if not exists writing_practice_dates text[] not null default '{}';
