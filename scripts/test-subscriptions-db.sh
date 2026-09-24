#!/usr/bin/env bash
set -euo pipefail
# Isolated synthetic PostgreSQL cluster. No production connection or credentials.
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
pg_bin="${VOKA_TEST_PG_BIN:-/usr/lib/postgresql/16/bin}"
test_dir="$(mktemp -d /tmp/voka-subscriptions-db.XXXXXX)"
trap '"$pg_bin/pg_ctl" -D "$test_dir/data" -m immediate stop >/dev/null 2>&1 || true' EXIT
"$pg_bin/initdb" -D "$test_dir/data" -A trust --no-locale >/dev/null
"$pg_bin/pg_ctl" -D "$test_dir/data" -l "$test_dir/postgres.log" -o "-k $test_dir -h '' -p 55439" -w start >/dev/null
psql_test=("$pg_bin/psql" -X -v ON_ERROR_STOP=1 -h "$test_dir" -p 55439 -d postgres)
"${psql_test[@]}" -c 'create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key, is_anonymous boolean);' >/dev/null
"${psql_test[@]}" -f "$project_dir/supabase/migrations/20260923000000_ai_usage_limits.sql" >/dev/null
"${psql_test[@]}" -f "$project_dir/supabase/migrations/20260924000000_subscriptions.sql" >/dev/null
"${psql_test[@]}" -f "$project_dir/tests/subscriptions.sql"
"${psql_test[@]}" -c "insert into auth.users values ('00000000-0000-4000-8000-000000000004', false); insert into public.voka_subscriptions(user_id, active, environment, product_id, store, expires_at, verified_at) values ('00000000-0000-4000-8000-000000000004', true, 'PRODUCTION', 'voka_plus:monthly', 'play_store', now() + interval '1 day', now());" >/dev/null
request_pids=()
for attempt in {1..12}; do
  "${psql_test[@]}" -c "select public.claim_voka_ai_request('00000000-0000-4000-8000-000000000004', 'voice');" >/dev/null &
  request_pids+=("$!")
done
for request_pid in "${request_pids[@]}"; do wait "$request_pid"; done
"${psql_test[@]}" -c "do \$\$ begin if (select requests from public.voka_ai_daily_usage where subject = '00000000-0000-4000-8000-000000000004' and kind = 'voice') <> 3 then raise exception 'Concurrent requests bypassed quota'; end if; end; \$\$;"
printf 'Subscription database checks passed. Synthetic test files: %s\n' "$test_dir"
