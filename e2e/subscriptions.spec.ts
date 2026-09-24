import { expect, test, type Page } from '@playwright/test';

const disabled = {
  config: {
    enabled: false,
    salesEnabled: false,
    environment: 'PRODUCTION',
    androidProduct: '',
    iosProduct: '',
    voiceDaily: 0,
    assessmentDaily: 0,
  },
  isPlus: false,
  fresh: true,
  expiresAt: null,
  store: null,
  willRenew: false,
  billingIssue: false,
  voiceRemaining: 0,
  assessmentRemaining: 0,
  resetsAt: '2026-09-25T00:00:00Z',
};
async function signedIn(page: Page, status: () => unknown) {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'subscriber@example.test',
    aud: 'authenticated',
    role: 'authenticated',
    is_anonymous: false,
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { display_name: 'Test Subscriber' },
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
    if (['localhost', '127.0.0.1'].includes(url.hostname)) return route.continue();
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
    if (url.pathname === '/rest/v1/user_learning_state') return route.fulfill({ json: null });
    if (url.pathname.endsWith('/subscription-status')) {
      const body = status();
      return route.fulfill({
        status: body ? 200 : 503,
        json: body ?? { error: 'Could not confirm subscription. Try again.' },
      });
    }
    return route.abort();
  });
  await page.goto('/auth');
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder('Your password').fill('synthetic test password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('button', { name: 'View Voka Plus' }).click();
  await expect(page).toHaveURL(/\/plus$/);
}

test('Plus is discoverable but does not offer an unconfigured payment', async ({ page }) => {
  await signedIn(page, () => disabled);
  await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Not available yet' })).toBeDisabled();
  await expect(page.getByText(/Unlimited|Rs 200/)).toHaveCount(0);
  await page.getByRole('link', { name: 'Terms', exact: true }).click();
  await expect(page.getByText('Practice allowances', { exact: true })).toBeVisible();
});

test('verified subscribers see their remaining allowance and can manage cancellation', async ({
  page,
}, testInfo) => {
  await signedIn(page, () => ({
    ...disabled,
    config: { ...disabled.config, enabled: true, voiceDaily: 15, assessmentDaily: 25 },
    isPlus: true,
    store: 'play_store',
    expiresAt: '2027-09-24T12:00:00Z',
    voiceRemaining: 7,
    assessmentRemaining: 9,
  }));
  await expect(page.getByText('You’re on Plus.', { exact: true })).toBeVisible();
  await expect(page.getByText(/Today: 7 session starts and 9 assessment/)).toBeVisible();
  await expect(page.getByText(/Access until/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Manage subscription', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Subscribe/ })).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('subscription-screen.png'), fullPage: true });
});

test('failed status lookup has an actionable retry', async ({ page }) => {
  let healthy = false;
  await signedIn(page, () => (healthy ? disabled : null));
  await expect(page.getByText('Could not confirm subscription. Try again.')).toBeVisible();
  healthy = true;
  await page.getByRole('button', { name: 'Refresh status' }).click();
  await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
  await expect(page.getByText('Could not confirm subscription. Try again.')).toHaveCount(0);
});

test('guest Plus entry opens account creation rather than checkout', async ({ page }) => {
  await page.route('**/*', (route) =>
    ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
  await page.goto('/profile');
  await page.getByRole('button', { name: 'View Voka Plus' }).click();
  await expect(page).toHaveURL(/\/auth\?mode=sign-up$/);
  await expect(page.getByRole('button', { name: /Subscribe/ })).toHaveCount(0);
});
