-- Run in a disposable database with all learning-state migrations and Supabase auth helpers.
begin;
insert into auth.users (id, is_anonymous) values
  ('00000000-0000-4000-8000-000000000071', false),
  ('00000000-0000-4000-8000-000000000072', false);
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000071","is_anonymous":false}';
insert into public.user_learning_state (user_id, foundations) values
  ('00000000-0000-4000-8000-000000000071', '{"greetings":{"draft":"Danke"}}');
do $$ begin
  assert (select count(*) = 1 from public.user_learning_state), 'Owner must read their draft';
end; $$;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000072","is_anonymous":false}';
do $$ begin
  assert (select count(*) = 0 from public.user_learning_state), 'Another account must not read this draft';
end; $$;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000071","is_anonymous":true}';
do $$ begin
  assert (select count(*) = 0 from public.user_learning_state), 'Anonymous sessions must not read account drafts';
end; $$;
reset role;
do $$ begin
  begin
    update public.user_learning_state set foundations = '[]';
    raise exception 'Expected an object constraint violation';
  exception when check_violation then null;
  end;
  begin
    update public.user_learning_state set foundations = jsonb_build_object('draft', repeat('a', 65536));
    raise exception 'Expected a size constraint violation';
  exception when check_violation then null;
  end;
end; $$;
rollback;
