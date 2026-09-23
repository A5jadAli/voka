// Run only after deploying voice-cleanup and applying the voice lease migration.
// Secrets are generated in memory, sent to Supabase/Vault and never logged or written to disk.
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const project = process.argv[2];
if (project !== 'feemunsltbbkkqyvorjn') throw new Error('Explicit Voka project ref required.');
const secret = randomBytes(32).toString('hex');
const run = (args) =>
  execFileSync('npx', ['--yes', 'supabase', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
let stage = 'set worker secret';
try {
  run(['secrets', 'set', `VOICE_CLEANUP_SECRET=${secret}`, '--project-ref', project]);
  stage = 'configure Vault and scheduler';
  run([
    'db',
    'query',
    '--linked',
    '--project-ref',
    project,
    `
    create extension if not exists pg_cron;
    create extension if not exists pg_net with schema extensions;
    revoke all on schema cron from public, anon, authenticated;
    revoke all on all tables in schema cron from public, anon, authenticated;
    revoke all on all functions in schema cron from public, anon, authenticated;
    do $setup$
    declare secret_id uuid;
    begin
      select id into secret_id from vault.secrets where name = 'voka_voice_cleanup';
      if secret_id is null then
        perform vault.create_secret('${secret}', 'voka_voice_cleanup', 'Private voice cleanup worker credential');
      else
        perform vault.update_secret(secret_id, '${secret}', 'voka_voice_cleanup');
      end if;
    end $setup$;
    select cron.schedule('voka-voice-cleanup', '* * * * *', $job$
      select net.http_post(
        url := 'https://${project}.supabase.co/functions/v1/voice-cleanup',
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-voka-worker', (select decrypted_secret from vault.decrypted_secrets where name = 'voka_voice_cleanup')),
        body := '{}'::jsonb,
        timeout_milliseconds := 15000
      );
    $job$);
  `,
  ]);
  stage = 'worker health check';
  const response = await fetch(`https://${project}.supabase.co/functions/v1/voice-cleanup`, {
    method: 'POST',
    headers: { 'x-voka-worker': secret },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(
      `Worker health check failed (${response.status}): ${(await response.text()).slice(0, 200)}`,
    );
  console.log('Private minute-by-minute voice cleanup configured; initial health check passed.');
} catch (error) {
  // Do not print child-process errors: their argv can contain the generated secret.
  const detail =
    error instanceof Error
      ? 'stderr' in error
        ? `${String(error.stderr)} ${'stdout' in error ? String(error.stdout) : ''}`
        : error.message
      : 'Unknown failure';
  console.error(
    `Voice cleanup setup failed during ${stage}: ${detail.replaceAll(secret, '[redacted]').slice(0, 2000)}`,
  );
  process.exitCode = 1;
}
