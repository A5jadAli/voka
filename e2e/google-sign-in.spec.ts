import { expect, test, type Page } from '@playwright/test';

const user = {
  id: '55555555-5555-4555-8555-555555555555',
  email: 'google.learner@gmail.com',
  aud: 'authenticated',
  role: 'authenticated',
  is_anonymous: false,
  created_at: new Date().toISOString(),
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { full_name: 'Google Learner' },
  identities: [{ provider: 'google', identity_data: { full_name: 'Google Learner' } }],
};

function accessToken() {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  return [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: user.id, exp: expires, aud: 'authenticated' })).toString(
      'base64url',
    ),
    'synthetic-signature',
  ].join('.');
}

async function mockBackend(page: Page, redirectFragment: () => string, googleEnabled = true) {
  const authorizeRequests: URL[] = [];
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (['localhost', '127.0.0.1'].includes(url.hostname)) return route.continue();
    if (url.pathname === '/auth/v1/settings')
      return route.fulfill({ json: { external: { google: googleEnabled, email: true } } });
    if (url.pathname === '/auth/v1/authorize') {
      authorizeRequests.push(url);
      // Stand in for Google and Supabase: send the browser back to the app's callback.
      const back = url.searchParams.get('redirect_to') ?? '';
      return route.fulfill({
        status: 302,
        headers: { location: `${back}${redirectFragment()}` },
      });
    }
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
    if (url.pathname === '/rest/v1/user_learning_state') return route.fulfill({ json: null });
    return route.abort();
  });
  return authorizeRequests;
}

test('Continue with Google signs the learner in and lands on their profile', async ({ page }) => {
  const authorizeRequests = await mockBackend(
    page,
    () =>
      `#access_token=${accessToken()}&refresh_token=synthetic-refresh&expires_in=3600&token_type=bearer`,
  );
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Continue with Google' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Google Learner', { exact: true })).toBeVisible();
  expect(authorizeRequests).toHaveLength(1);
  expect(authorizeRequests[0].searchParams.get('provider')).toBe('google');
  expect(authorizeRequests[0].searchParams.get('redirect_to')).toMatch(/\/oauth-callback$/);
  // Tokens must not linger in the address bar after sign-in.
  expect(page.url()).not.toContain('access_token');
});

test('a failed Google sign-in explains itself and offers a way back', async ({ page }) => {
  await mockBackend(page, () => '?error=server_error&error_description=Provider+is+down');
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Continue with Google' }).click();

  await expect(page.getByRole('heading', { name: 'Google sign-in didn’t finish' })).toBeVisible();
  await expect(page.getByText('Provider is down')).toBeVisible();
  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
});

test('the Google button stays hidden until the provider is enabled', async ({ page }) => {
  await mockBackend(page, () => '', false);
  await page.goto('/auth');
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0);
});
