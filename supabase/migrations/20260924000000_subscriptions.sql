-- No sales or paid allowances until the owner approves and configures the plan.
create table public.voka_subscription_config (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  sales_enabled boolean not null default false,
  environment text not null default 'PRODUCTION' check (environment in ('PRODUCTION', 'SANDBOX')),
  android_product text not null default '',
  ios_product text not null default '',
  voice_daily integer not null default 0 check (voice_daily between 0 and 1000),
  assessment_daily integer not null default 0 check (assessment_daily between 0 and 1000),
  check (not enabled or ((android_product <> '' or ios_product <> '') and voice_daily > 0 and assessment_daily > 0)),
  check (not sales_enabled or enabled)
);
insert into public.voka_subscription_config (id) values (true);

create table public.voka_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default false,
  environment text not null default 'PRODUCTION',
  product_id text,
  store text,
  expires_at timestamptz,
  will_renew boolean not null default false,
  billing_issue boolean not null default false,
  provider_updated_at timestamptz,
  verified_at timestamptz,
  last_attempt_at timestamptz
);
alter table public.voka_subscription_config enable row level security;
alter table public.voka_subscriptions enable row level security;
revoke all on public.voka_subscription_config, public.voka_subscriptions from public, anon, authenticated;
grant all on public.voka_subscription_config, public.voka_subscriptions to service_role;

create function public.voka_subscription_access(p_action text, p_user_id uuid,
  p_snapshot jsonb default null, p_force boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  c public.voka_subscription_config;
  s public.voka_subscriptions;
  known_user boolean;
  fresh boolean := false;
  paid boolean := false;
  sync_allowed boolean := false;
  voice_used integer := 0;
  assessment_used integer := 0;
  today date := (now() at time zone 'UTC')::date;
begin
  select * into strict c from public.voka_subscription_config where id;
  select exists(select 1 from auth.users where id = p_user_id and not coalesce(is_anonymous, false)) into known_user;
  if known_user then
    perform pg_advisory_xact_lock(hashtextextended('voka-subscription-' || p_user_id::text, 0));
    insert into public.voka_subscriptions(user_id) values (p_user_id) on conflict do nothing;
    select * into s from public.voka_subscriptions where user_id = p_user_id;
    if p_action = 'save' then
      if (p_snapshot->>'environment') <> c.environment then raise exception 'Wrong subscription environment'; end if;
      -- Canonical provider request time, not event order, determines the latest state.
      if s.provider_updated_at is null or (p_snapshot->>'providerUpdatedAt')::timestamptz >= s.provider_updated_at then
        update public.voka_subscriptions set
          active = (p_snapshot->>'active')::boolean,
          environment = p_snapshot->>'environment', product_id = p_snapshot->>'productId',
          store = p_snapshot->>'store', expires_at = (p_snapshot->>'expiresAt')::timestamptz,
          will_renew = (p_snapshot->>'willRenew')::boolean, billing_issue = (p_snapshot->>'billingIssue')::boolean,
          provider_updated_at = (p_snapshot->>'providerUpdatedAt')::timestamptz, verified_at = now()
          where user_id = p_user_id returning * into s;
      end if;
    elsif p_action not in ('read', 'prepare') then raise exception 'Invalid subscription action';
    end if;
    fresh := coalesce(s.verified_at > now() - interval '5 minutes' and s.environment = c.environment
      and not (s.active and s.expires_at <= now()), false);
    if p_action = 'prepare' and c.enabled and (p_force or not fresh) and
      (s.last_attempt_at is null or s.last_attempt_at < now() - interval '10 seconds') then
      update public.voka_subscriptions set last_attempt_at = now() where user_id = p_user_id;
      sync_allowed := true;
    end if;
    paid := coalesce(c.enabled and fresh and s.active and s.expires_at > now()
      and ((s.store = 'play_store' and s.product_id = c.android_product)
        or (s.store = 'app_store' and s.product_id = c.ios_product)), false);
    select requests into voice_used from public.voka_ai_daily_usage where usage_day = today and kind = 'voice' and subject = p_user_id::text;
    select requests into assessment_used from public.voka_ai_daily_usage where usage_day = today and kind = 'assessment' and subject = p_user_id::text;
  end if;
  return jsonb_build_object(
    'config', jsonb_build_object('enabled', c.enabled, 'salesEnabled', c.sales_enabled
      and c.voice_daily > (select account_daily from public.voka_ai_budget_config where kind = 'voice')
      and c.assessment_daily >= (select account_daily from public.voka_ai_budget_config where kind = 'assessment')
      and c.voice_daily <= (select global_daily from public.voka_ai_budget_config where kind = 'voice')
      and c.assessment_daily <= (select global_daily from public.voka_ai_budget_config where kind = 'assessment'),
      'environment', c.environment, 'androidProduct', c.android_product, 'iosProduct', c.ios_product,
      'voiceDaily', c.voice_daily, 'assessmentDaily', c.assessment_daily),
    'knownUser', known_user, 'isPlus', paid, 'fresh', fresh, 'syncAllowed', sync_allowed,
    'expiresAt', s.expires_at, 'store', s.store, 'willRenew', coalesce(s.will_renew, false), 'billingIssue', coalesce(s.billing_issue, false),
    'voiceRemaining', greatest(0, c.voice_daily - coalesce(voice_used, 0)),
    'assessmentRemaining', greatest(0, c.assessment_daily - coalesce(assessment_used, 0)),
    'resetsAt', (today + 1)::timestamp at time zone 'UTC');
end;
$$;
revoke all on function public.voka_subscription_access(text, uuid, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.voka_subscription_access(text, uuid, jsonb, boolean) to service_role;

-- Keep the existing atomic quota transaction and global cap. Only its per-user
-- limit changes; client flags, restores and webhook retries never reset usage.
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
  subscription jsonb;
begin
  select is_anonymous into anonymous_user from auth.users where id = p_user_id;
  if not found then raise exception 'Unknown user'; end if;
  select * into config from public.voka_ai_budget_config where kind = p_kind;
  if not found then raise exception 'Unknown request kind'; end if;
  perform pg_advisory_xact_lock(hashtext('voka-ai-' || p_kind || current_day_utc::text));
  user_limit := case when coalesce(anonymous_user, false) then config.guest_daily else config.account_daily end;
  if not coalesce(anonymous_user, false) then
    subscription := public.voka_subscription_access('read', p_user_id);
    if (subscription->>'isPlus')::boolean then
      user_limit := greatest(user_limit, (subscription->'config'->>case when p_kind = 'voice' then 'voiceDaily' else 'assessmentDaily' end)::integer);
    end if;
  end if;
  select requests, last_request_at into user_count, last_request
    from public.voka_ai_daily_usage where usage_day = current_day_utc and kind = p_kind and subject = p_user_id::text;
  select requests into global_count from public.voka_ai_daily_usage
    where usage_day = current_day_utc and kind = p_kind and subject = '*';
  if coalesce(user_count, 0) >= user_limit or coalesce(global_count, 0) >= config.global_daily then
    if coalesce(global_count, 0) < config.global_daily and exists (
      select 1 from public.voka_subscriptions s cross join public.voka_subscription_config c
      where s.user_id = p_user_id and c.enabled and s.active and s.expires_at > now()
        and s.environment = c.environment and s.verified_at <= now() - interval '5 minutes'
        and ((s.store = 'play_store' and s.product_id = c.android_product)
          or (s.store = 'app_store' and s.product_id = c.ios_product))
    ) then
      return jsonb_build_object('allowed', false, 'reason', 'verification', 'retryAfter', 30);
    end if;
    retry_seconds := greatest(1, ceil(extract(epoch from (((current_day_utc + 1)::timestamp at time zone 'UTC') - current_time_utc)))::integer);
    return jsonb_build_object('allowed', false, 'reason', case when coalesce(global_count, 0) >= config.global_daily then 'capacity' else 'daily' end, 'retryAfter', retry_seconds);
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
