-- Synthetic local database only. Invoked by scripts/test-subscriptions-db.sh.
insert into auth.users(id, is_anonymous) values
  ('00000000-0000-4000-8000-000000000001', false),
  ('00000000-0000-4000-8000-000000000002', false),
  ('00000000-0000-4000-8000-000000000003', true);

do $$
declare
  u uuid := '00000000-0000-4000-8000-000000000001';
  result jsonb;
  snapshot jsonb := jsonb_build_object('active', true, 'environment', 'PRODUCTION',
    'productId', 'voka_plus:monthly', 'store', 'play_store', 'expiresAt', now() + interval '30 days',
    'willRenew', true, 'billingIssue', false, 'providerUpdatedAt', now());
begin
  if has_function_privilege('authenticated', 'public.voka_subscription_access(text,uuid,jsonb,boolean)', 'EXECUTE')
    or has_table_privilege('authenticated', 'public.voka_subscriptions', 'UPDATE')
    or has_function_privilege('anon', 'public.claim_voka_ai_request(uuid,text)', 'EXECUTE') then
    raise exception 'Client can modify paid access';
  end if;
  result := public.voka_subscription_access('read', u);
  if (result->'config'->>'enabled')::boolean or (result->>'isPlus')::boolean then raise exception 'Billing enabled by default'; end if;
  update public.voka_ai_budget_config set account_daily = 1, global_daily = 20, cooldown_seconds = 0;
  update public.voka_subscription_config set enabled = true, android_product = 'voka_plus:monthly', voice_daily = 3, assessment_daily = 4;
  result := public.voka_subscription_access('prepare', u);
  if not (result->>'syncAllowed')::boolean then raise exception 'First sync not allowed'; end if;
  result := public.voka_subscription_access('prepare', u, null, true);
  if (result->>'syncAllowed')::boolean then raise exception 'Sync throttle bypassed'; end if;
  result := public.voka_subscription_access('save', u, snapshot);
  if not (result->>'isPlus')::boolean then raise exception 'Verified paid access missing'; end if;
  for i in 1..3 loop
    result := public.claim_voka_ai_request(u, 'voice');
    if not (result->>'allowed')::boolean then raise exception 'Paid allowance not applied'; end if;
  end loop;
  result := public.claim_voka_ai_request(u, 'voice');
  if (result->>'allowed')::boolean then raise exception 'Paid daily cap exceeded'; end if;
  perform public.voka_subscription_access('save', u, snapshot);
  result := public.voka_subscription_access('read', u);
  if (result->>'voiceRemaining')::integer <> 0 then raise exception 'Replay refilled credits'; end if;
  result := public.voka_subscription_access('save', u,
    snapshot || jsonb_build_object('active', false, 'providerUpdatedAt', now() - interval '1 minute'));
  if not (result->>'isPlus')::boolean then raise exception 'Old snapshot overwrote newer state'; end if;
  update public.voka_subscriptions set verified_at = now() - interval '6 minutes' where user_id = u;
  result := public.voka_subscription_access('read', u);
  if (result->>'isPlus')::boolean then raise exception 'Stale verification granted paid access'; end if;
  result := public.claim_voka_ai_request(u, 'voice');
  if result->>'reason' <> 'verification' then raise exception 'Stale subscription needs actionable recovery'; end if;
  update public.voka_subscriptions set verified_at = now(), expires_at = now() - interval '1 second' where user_id = u;
  result := public.voka_subscription_access('read', u);
  if (result->>'isPlus')::boolean then raise exception 'Expired subscription granted access'; end if;
  update public.voka_subscriptions set expires_at = now() + interval '1 day', environment = 'SANDBOX' where user_id = u;
  result := public.voka_subscription_access('read', u);
  if (result->>'isPlus')::boolean then raise exception 'Sandbox state granted production access'; end if;
  result := public.voka_subscription_access('save', '00000000-0000-4000-8000-000000000003', snapshot);
  if (result->>'isPlus')::boolean or (result->>'knownUser')::boolean then raise exception 'Guest got paid access'; end if;
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'voice');
  if not (result->>'allowed')::boolean then raise exception 'Free practice broken'; end if;
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'voice');
  if (result->>'allowed')::boolean then raise exception 'Non-subscriber got paid quota'; end if;
  update public.voka_ai_budget_config set global_daily = 0 where kind = 'assessment';
  perform public.voka_subscription_access('save', u, snapshot);
  result := public.claim_voka_ai_request(u, 'assessment');
  if (result->>'allowed')::boolean or result->>'reason' <> 'capacity' then raise exception 'Paid user bypassed global cap'; end if;
  result := public.voka_subscription_access('save', u, snapshot || jsonb_build_object('active', false, 'providerUpdatedAt', now() + interval '1 second'));
  if (result->>'isPlus')::boolean then raise exception 'Revoked subscription retained access'; end if;
  delete from auth.users where id = u;
  if exists (select 1 from public.voka_subscriptions where user_id = u) then raise exception 'Deleted account retained entitlement'; end if;
end;
$$;
