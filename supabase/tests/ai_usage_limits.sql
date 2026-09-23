-- Run only in a disposable database with auth.users and the budget migration.
begin;
insert into auth.users (id, is_anonymous) values
  ('00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000002', false),
  ('00000000-0000-4000-8000-000000000003', false);
update public.voka_ai_budget_config set guest_daily = 1, account_daily = 2, global_daily = 4, cooldown_seconds = 0;

do $$
declare result jsonb;
begin
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000001', 'voice');
  assert (result->>'allowed')::boolean, 'Guest first request must pass';
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000001', 'voice');
  assert not (result->>'allowed')::boolean, 'Guest daily cap must apply';
  perform public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'voice');
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'voice');
  assert (result->>'allowed')::boolean, 'Account has a separate allowance';
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'voice');
  assert not (result->>'allowed')::boolean, 'Account cap must apply';
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000003', 'voice');
  assert (result->>'allowed')::boolean, 'Last global slot must pass';
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000003', 'voice');
  assert not (result->>'allowed')::boolean, 'Global cap must apply across users';
  assert (select requests = 4 from public.voka_ai_daily_usage where kind = 'voice' and subject = '*'), 'Rejected requests must not consume slots';
  update public.voka_ai_budget_config set cooldown_seconds = 10 where kind = 'assessment';
  perform public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'assessment');
  result := public.claim_voka_ai_request('00000000-0000-4000-8000-000000000002', 'assessment');
  assert result->>'reason' = 'cooldown', 'Rapid retries must be limited';
  assert not has_function_privilege('authenticated', 'public.claim_voka_ai_request(uuid,text)', 'execute'), 'Clients must not allocate requests';
  assert not has_table_privilege('anon', 'public.voka_ai_daily_usage', 'select'), 'Anonymous clients must not inspect usage';
  assert not has_table_privilege('authenticated', 'public.voka_ai_budget_config', 'update'), 'Clients must not change limits';
  assert has_function_privilege('service_role', 'public.claim_voka_ai_request(uuid,text)', 'execute'), 'The backend must be able to claim requests';
end;
$$;
rollback;
