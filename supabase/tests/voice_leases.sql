-- Disposable database only. Every mutation rolls back.
begin;
insert into auth.users(id, is_anonymous) select ('00000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid, false from generate_series(1,5) n;
do $$
declare result jsonb; lease_id uuid; other_id uuid := '00000000-0000-4000-8000-000000000002';
begin
  result := public.voka_voice_control('reserve', '00000000-0000-4000-8000-000000000001');
  assert result ? 'error', 'Missing worker health must fail closed';
  perform public.voka_voice_control('heartbeat');
  result := public.voka_voice_control('reserve', '00000000-0000-4000-8000-000000000001');
  lease_id := (result->>'id')::uuid;
  assert lease_id is not null, 'Healthy worker permits a reservation';
  result := public.voka_voice_control('reserve', '00000000-0000-4000-8000-000000000001');
  assert result ? 'error', 'One active reservation per account';
  result := public.voka_voice_control('bind', '00000000-0000-4000-8000-000000000001', lease_id, 'rtc_test');
  assert (result->>'expiresAt')::timestamptz <= now() + interval '5 minutes', 'Bound call lifetime';
  result := public.voka_voice_control('lookup', other_id, lease_id);
  assert result = '{}'::jsonb, 'Other account cannot look up a call';
  perform public.voka_voice_control('finish', other_id, lease_id);
  assert exists(select 1 from public.voka_voice_leases where id = lease_id), 'Other account cannot release a lease';
  perform public.voka_voice_control('reserve', other_id);
  perform public.voka_voice_control('reserve', '00000000-0000-4000-8000-000000000003');
  perform public.voka_voice_control('reserve', '00000000-0000-4000-8000-000000000004');
  result := public.voka_voice_control('reserve', '00000000-0000-4000-8000-000000000005');
  assert result ? 'error', 'Global active-call cap';
  update public.voka_voice_leases set expires_at = now() - interval '1 second' where id = lease_id;
  result := public.voka_voice_control('expired');
  assert jsonb_array_length(result) = 1, 'Expired calls are retained for worker hangup';
  perform public.voka_voice_control('finish', null, lease_id);
  assert not exists(select 1 from public.voka_voice_leases where id = lease_id), 'Worker can release after hangup';
  assert not has_function_privilege('authenticated', 'public.voka_voice_control(text,uuid,uuid,text)', 'execute');
  assert not has_table_privilege('anon', 'public.voka_voice_leases', 'select');
  assert has_function_privilege('service_role', 'public.voka_voice_control(text,uuid,uuid,text)', 'execute');
end $$;
rollback;
