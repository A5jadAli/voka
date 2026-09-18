create table if not exists public.user_learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_scenario_ids text[] not null default '{}',
  completed_unit_ids text[] not null default '{}',
  coach_tone text not null default 'supportive' check (coach_tone in ('adaptive', 'supportive', 'tough')),
  preferences jsonb not null default '{"DE":{"goal":"everyday","reference":"de-DE"},"EN":{"goal":"interviews","reference":"en-GB"}}'::jsonb,
  signals jsonb not null default '[]'::jsonb,
  speaking_practice_dates text[] not null default '{}',
  assessments jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_learning_state enable row level security;

revoke all on table public.user_learning_state from anon;
grant select, insert, update, delete on table public.user_learning_state to authenticated;

drop policy if exists "Users can read their learning state" on public.user_learning_state;
create policy "Users can read their learning state"
on public.user_learning_state for select
to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

drop policy if exists "Users can insert their learning state" on public.user_learning_state;
create policy "Users can insert their learning state"
on public.user_learning_state for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

drop policy if exists "Users can update their learning state" on public.user_learning_state;
create policy "Users can update their learning state"
on public.user_learning_state for update
to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
)
with check (
  (select auth.uid()) = user_id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

drop policy if exists "Users can delete their learning state" on public.user_learning_state;
create policy "Users can delete their learning state"
on public.user_learning_state for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);
