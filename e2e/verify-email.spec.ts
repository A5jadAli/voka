import { expect, test } from '@playwright/test';

test('sign-up leads to a clear check-your-email step with a rate-limited resend', async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (['localhost', '127.0.0.1'].includes(url.hostname)) return route.continue();
    requests.push(url.pathname);
    // Supabase returns the new user without a session until the email is confirmed.
    if (url.pathname === '/auth/v1/signup')
      return route.fulfill({
        json: {
          id: '44444444-4444-4444-8444-444444444444',
          email: 'new.learner@gmail.com',
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: { display_name: 'New Learner' },
          identities: [{ id: 'identity' }],
        },
      });
    return route.abort();
  });

  await page.goto('/auth?mode=sign-up');
  await page.getByPlaceholder('First and last name').fill('New Learner');
  await page.getByPlaceholder('you@example.com').fill('new.learner@gmail.com');
  await page.getByPlaceholder('Create a strong password').fill('Voka2026!');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/verify-email\?/);
  expect(requests).toContain('/auth/v1/signup');
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await expect(page.getByText('new.learner@gmail.com', { exact: true })).toBeVisible();
  await expect(page.getByText('Vokeno opens and signs you in.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Gmail' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Resend email in 0:\d\d/ })).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);

  await page.getByRole('button', { name: 'Use a different email' }).click();
  await expect(page).toHaveURL(/\/auth\?mode=sign-up/);
  await expect(page.getByPlaceholder('First and last name')).toBeVisible();
});
