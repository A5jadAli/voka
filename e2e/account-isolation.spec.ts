import { expect, test } from '@playwright/test';

test('sign-in clears private form state in navigation history without breaking auth routing', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'learner@example.test',
    aud: 'authenticated',
    role: 'authenticated',
    is_anonymous: false,
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { display_name: 'Test Learner' },
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: user.id, exp: expires, aud: 'authenticated' })).toString(
      'base64url',
    ),
    'synthetic-signature',
  ].join('.');
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (['127.0.0.1', 'localhost'].includes(url.hostname)) return route.continue();
    if (url.pathname === '/auth/v1/token')
      return route.fulfill({
        json: {
          access_token: token,
          refresh_token: 'synthetic-refresh',
          expires_at: expires,
          expires_in: 3600,
          token_type: 'bearer',
          user,
        },
      });
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
    if (url.pathname === '/rest/v1/user_learning_state')
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    return route.abort();
  });
  await page.goto('/activity/write');
  await page.getByLabel('Start writing', { exact: true }).click();
  await page
    .getByLabel('Writing response')
    .fill('A private guest draft that must not appear in the signed-in account.');
  await page.getByLabel('Answer by speaking instead').click();
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Sign in or create account' }).click();
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder('Your password').fill('synthetic test password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('img', { name: 'Test Learner profile initials' })).toBeVisible();
  // Sign-in replaces Auth with Profile; the earlier Profile entry is also in history.
  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/conversation\?track=EN$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/activity\/write$/);
  await expect(page.getByLabel('Writing response')).toHaveCount(0);
  await page.getByLabel('Start writing', { exact: true }).click();
  await expect(page.getByLabel('Writing response')).toHaveValue('');
  expect(errors).toEqual([]);
});
