-- Atomic, server-only request budgets. Counts are not currency/spend guarantees.
create table if not exists public.voka_ai_budget_config (
  kind text primary key check (kind in ('voice', 'assessment')),
  guest_daily integer not null check (guest_daily >= 0),
  account_daily integer not null check (account_daily >= 0),
  global_daily integer not null check (global_daily >= 0),
  cooldown_seconds integer not null check (cooldown_seconds >= 0)
);

insert into public.voka_ai_budget_config values
  ('voice', 2, 10, 50, 10),
  ('assessment', 2, 20, 200, 5)
on conflict (kind) do nothing;

create table if not exists public.voka_ai_daily_usage (
  usage_day date not null,
  kind text not null check (kind in ('voice', 'assessment')),
  subject text not null,
  requests integer not null default 0 check (requests >= 0),
  last_request_at timestamptz not null default now(),
  primary key (usage_day, kind, subject)
);

alter table public.voka_ai_budget_config enable row level security;
alter table public.voka_ai_daily_usage enable row level security;
revoke all on public.voka_ai_budget_config, public.voka_ai_daily_usage from anon, authenticated;
grant all on public.voka_ai_budget_config, public.voka_ai_daily_usage to service_role;

create or replace function public.claim_voka_ai_request(p_user_id uuid, p_kind text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  config public.voka_ai_budget_config%rowtype;
  current_time_utc timestamptz := clock_timestamp();
  current_day_utc date := (current_time_utc at time zone 'UTC')::date;
  anonymous_user boolean;
  user_limit integer;
  user_count integer;
  global_count integer;
  last_request timestamptz;
  retry_seconds integer;
begin
  select is_anonymous into anonymous_user from auth.users where id = p_user_id;
  if not found then raise exception 'Unknown user'; end if;
  select * into config from public.voka_ai_budget_config where kind = p_kind;
  if not found then raise exception 'Unknown request kind'; end if;

  -- One short transaction per kind/day protects both per-user and global caps.
  perform pg_advisory_xact_lock(hashtext('voka-ai-' || p_kind || current_day_utc::text));
  user_limit := case when coalesce(anonymous_user, false) then config.guest_daily else config.account_daily end;
  select requests, last_request_at into user_count, last_request
    from public.voka_ai_daily_usage where usage_day = current_day_utc and kind = p_kind and subject = p_user_id::text;
  select requests into global_count from public.voka_ai_daily_usage
    where usage_day = current_day_utc and kind = p_kind and subject = '*';
  if coalesce(user_count, 0) >= user_limit or coalesce(global_count, 0) >= config.global_daily then
    retry_seconds := greatest(1, ceil(extract(epoch from (((current_day_utc + 1)::timestamp at time zone 'UTC') - current_time_utc)))::integer);
    return jsonb_build_object('allowed', false, 'reason', 'daily', 'retryAfter', retry_seconds);
  end if;
  if last_request is not null and last_request + make_interval(secs => config.cooldown_seconds) > current_time_utc then
    retry_seconds := greatest(1, ceil(extract(epoch from (last_request + make_interval(secs => config.cooldown_seconds) - current_time_utc)))::integer);
    return jsonb_build_object('allowed', false, 'reason', 'cooldown', 'retryAfter', retry_seconds);
  end if;

  insert into public.voka_ai_daily_usage (usage_day, kind, subject, requests, last_request_at)
    values (current_day_utc, p_kind, p_user_id::text, 1, current_time_utc), (current_day_utc, p_kind, '*', 1, current_time_utc)
    on conflict (usage_day, kind, subject) do update
    set requests = public.voka_ai_daily_usage.requests + 1, last_request_at = excluded.last_request_at;
  delete from public.voka_ai_daily_usage where kind = p_kind and usage_day < current_day_utc - 2;
  return jsonb_build_object('allowed', true);
end;
$$;

revoke all on function public.claim_voka_ai_request(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_voka_ai_request(uuid, text) to service_role;
