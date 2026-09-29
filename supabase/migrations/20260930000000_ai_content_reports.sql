-- In-app reports about AI-generated content (Google Play AI-Generated Content policy).
-- Learners can file reports without leaving the app; only the service role can read them.
create table if not exists public.ai_content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  surface text not null check (surface in ('conversation', 'writing-feedback', 'assessment')),
  reason text not null check (reason in ('offensive', 'harmful', 'incorrect', 'other')),
  details text check (char_length(details) <= 500),
  content_excerpt text check (char_length(content_excerpt) <= 2000),
  track text check (track in ('EN', 'DE')),
  created_at timestamptz not null default now()
);

alter table public.ai_content_reports enable row level security;

create policy "Users can file their own AI content reports"
  on public.ai_content_reports
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Supabase grants table privileges to API roles by default; allow only column inserts.
revoke all on public.ai_content_reports from anon, authenticated;
grant insert (surface, reason, details, content_excerpt, track) on public.ai_content_reports
  to authenticated;

create index if not exists ai_content_reports_created_at_idx
  on public.ai_content_reports (created_at desc);

-- A light abuse limit: at most 20 reports per user per day.
create or replace function public.limit_ai_content_reports()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.ai_content_reports
    where user_id = new.user_id and created_at > now() - interval '1 day'
  ) >= 20 then
    raise exception 'Report limit reached. Please try again tomorrow.';
  end if;
  return new;
end;
$$;

create trigger ai_content_reports_limit
  before insert on public.ai_content_reports
  for each row execute function public.limit_ai_content_reports();
