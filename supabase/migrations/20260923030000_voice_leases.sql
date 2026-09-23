-- Trusted worker heartbeat + durable leases. No client may read call identifiers.
create table public.voka_voice_worker (id boolean primary key default true check(id), last_success timestamptz);
insert into public.voka_voice_worker (id) values (true);
create table public.voka_voice_leases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  call_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 minute')
);
alter table public.voka_voice_worker enable row level security;
alter table public.voka_voice_leases enable row level security;
revoke all on public.voka_voice_worker, public.voka_voice_leases from public, anon, authenticated;

create function public.voka_voice_control(p_action text, p_user_id uuid default null, p_lease_id uuid default null, p_call_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_lease public.voka_voice_leases; v_result jsonb;
begin
  if p_action = 'reserve' then
    perform pg_advisory_xact_lock(620240923);
    if not exists (select 1 from public.voka_voice_worker where last_success > now() - interval '3 minutes') then
      return jsonb_build_object('error', 'Voice safety checks are temporarily unavailable. Please try again shortly.');
    end if;
    if not exists (select 1 from auth.users where id = p_user_id) then raise exception 'Unknown user'; end if;
    -- A pending SDP request is bounded to 30s. Provider calls expire within 60 minutes.
    delete from public.voka_voice_leases where (call_id is null and expires_at < now()) or created_at < now() - interval '65 minutes';
    if exists (select 1 from public.voka_voice_leases where user_id = p_user_id) then
      return jsonb_build_object('error', 'Your previous voice session is still closing. Please try again in a minute.');
    end if;
    if (select count(*) from public.voka_voice_leases) >= 4 then
      return jsonb_build_object('error', 'The live coach is busy. Please try again shortly.');
    end if;
    insert into public.voka_voice_leases(user_id) values(p_user_id) returning * into v_lease;
    return jsonb_build_object('id', v_lease.id);
  elsif p_action = 'bind' then
    if p_call_id is null or p_call_id !~ '^rtc_[A-Za-z0-9_-]{1,200}$' then raise exception 'Invalid call'; end if;
    update public.voka_voice_leases set call_id = p_call_id, expires_at = now() + interval '5 minutes'
      where id = p_lease_id and user_id = p_user_id and call_id is null and expires_at > now() returning * into v_lease;
    if not found then raise exception 'Expired reservation'; end if;
    return jsonb_build_object('id', v_lease.id, 'expiresAt', v_lease.expires_at);
  elsif p_action = 'lookup' then
    select * into v_lease from public.voka_voice_leases where id = p_lease_id and user_id = p_user_id;
    return case when found then jsonb_build_object('id', v_lease.id, 'callId', v_lease.call_id) else '{}'::jsonb end;
  elsif p_action = 'finish' then
    delete from public.voka_voice_leases where id = p_lease_id and (p_user_id is null or user_id = p_user_id);
    return '{}'::jsonb;
  elsif p_action = 'expired' then
    select coalesce(jsonb_agg(jsonb_build_object('id', id, 'callId', call_id)), '[]'::jsonb) into v_result
      from public.voka_voice_leases where expires_at < now();
    return v_result;
  elsif p_action = 'heartbeat' then
    update public.voka_voice_worker set last_success = now();
    return '{}'::jsonb;
  end if;
  raise exception 'Invalid voice control action';
end;
$$;
revoke all on function public.voka_voice_control(text, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.voka_voice_control(text, uuid, uuid, text) to service_role;
