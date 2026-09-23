-- Hosted Supabase can enable pg-safeupdate, which rejects UPDATE without WHERE,
-- including this singleton update inside a SECURITY DEFINER function.
-- Preserve the already-deployed function and change only this known statement.
do $$
declare definition text;
begin
  select pg_get_functiondef('public.voka_voice_control(text,uuid,uuid,text)'::regprocedure) into definition;
  if position('update public.voka_voice_worker set last_success = now();' in definition) = 0 then
    raise exception 'Unexpected voice-control definition; review before replacing';
  end if;
  execute replace(definition,
    'update public.voka_voice_worker set last_success = now();',
    'update public.voka_voice_worker set last_success = now() where id = true;');
end $$;
