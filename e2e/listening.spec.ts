import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('matches the two-track home and has no horizontal overflow', async ({ page }) => {
  await expect(page.getByText('Build real-world listening')).toBeVisible();
  await expect(page.getByText('Choose your next practice')).toBeVisible();
  await expect(page.getByLabel('Open live English conversation')).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole('button', { name: 'German' }).click();
  await expect(page.getByText('Everyday German').first()).toBeVisible();
  await expect(page.getByText('A1 · Erster Kontakt')).toBeVisible();
  await expect(page.getByLabel('Open German vocabulary')).toBeVisible();
});

test('connects all five primary navigation destinations', async ({ page }) => {
  await expect(page.getByLabel('Home')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Learning path', exact: true })).toBeVisible();
  await expect(page.getByLabel('Live speaking coach')).toBeVisible();
  await expect(page.getByLabel('Progress')).toBeVisible();
  await expect(page.getByLabel('Profile')).toBeVisible();

  await page.getByRole('button', { name: 'Learning path', exact: true }).click();
  await expect(page).toHaveURL(/\/sprint\?track=EN$/);
  await expect(page.getByText('From first words to real presence')).toBeVisible();
  await expect(page.getByLabel('Open B1 Interview flow')).toBeVisible();

  await page.getByLabel('Progress').last().click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByText('Your progress')).toBeVisible();

  await page.getByLabel('Profile').last().click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByLabel('Guest learner profile initials')).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Voka Plus' })).toContainText(
    'Make room for more practice',
  );
});

test('keeps primary navigation visible in the live coach and supports both back paths', async ({
  page,
}) => {
  await page.getByLabel('Live speaking coach').click();
  await expect(page).toHaveURL(/\/conversation\?track=EN$/);
  await expect(page.getByLabel('Home').last()).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Learning path', exact: true }).last(),
  ).toBeVisible();
  await expect(page.getByLabel('Progress').last()).toBeVisible();
  await expect(page.getByLabel('Profile').last()).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);

  await page.getByLabel('Live speaking coach').last().click();
  await page.getByLabel('Go back').click();
  await expect(page).toHaveURL(/\/$/);
});

test('opens the live coach and recovers safely when live audio is unavailable', async ({
  page,
}) => {
  await page.getByLabel('Open live English conversation').click();
  await expect(page).toHaveURL(/\/conversation\?track=EN$/);
  await expect(page.getByText('Modern interview English')).toBeVisible();
  await expect(page.getByText('Live captions', { exact: true })).toBeVisible();

  await page.getByLabel('Start live conversation').click();
  await expect(page.getByText('Connection needs attention')).toBeVisible();
  await expect(page.getByText('Try again', { exact: true })).toBeVisible();

  await page.getByLabel('German conversation').click();
  await expect(page.getByText('Everyday German').last()).toBeVisible();
});

test('runs the listening warm-up and continues to the detailed lesson', async ({ page }) => {
  await page.getByLabel('Open Listen').click();
  await expect(page).toHaveURL(/\/listening\?track=EN$/);
  await page.getByText('Start with a short warm-up', { exact: true }).click();
  await expect(page).toHaveURL(/\/activity\/listen$/);
  await page.getByLabel('Show transcript').click();
  await expect(page.getByText('Let’s meet outside the station at half past three.')).toBeVisible();
  await expect(page.getByLabel('Check answer')).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('radio', { name: 'Outside the station' }).click();
  await page.getByText('Check', { exact: true }).click();
  await expect(page.getByText('Correct. They will meet outside the station.')).toBeVisible();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page).toHaveURL(/\/lesson\/coffee-run$/);
  await expect(page.getByText('What natives compress')).toBeVisible();
  await page.getByRole('radio', { name: 'An extra espresso shot' }).click();
  await page.getByText('Check answer', { exact: true }).click();
  await page.getByText('More listening practice', { exact: true }).click();
  await expect(page).toHaveURL(/\/listening\?track=EN$/);
});

test('opens the spoken check, honest empty result and real account form', async ({ page }) => {
  await page.goto('/profile');
  await page.getByLabel('Open spoken level check').click();
  await expect(page.getByText('The bus to the city leaves every twenty minutes.')).toBeVisible();
  await page.getByLabel('Start spoken level check').click();
  await expect(page.getByText('Spoken level check').last()).toBeVisible();

  await page.goto('/assessment-result');
  await expect(page.getByText('No result yet')).toBeVisible();
  await expect(page.getByLabel('Start spoken level check')).toBeVisible();

  await page.goto('/profile');
  await page.getByLabel('Sign in or create account').click();
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByText('Create an account', { exact: true })).toHaveCSS(
    'text-decoration-line',
    'underline',
  );
  await page.getByText('New here? Create an account').click();
  await expect(page.getByPlaceholder('First and last name')).toBeVisible();
  await expect(page.getByText('15 or more characters')).toBeVisible();
  await expect(page.getByText('One number')).toHaveCount(0);
  await expect(page.getByText('One special character')).toHaveCount(0);
  await expect(page.getByText('One lowercase letter')).toHaveCount(0);
  await expect(page.getByText('One uppercase letter')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Terms of use' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy policy' })).toBeVisible();
  await page.getByPlaceholder('Create a strong password').fill('correct horse battery staple');
  await page.getByLabel('Show password').click();
  await expect(page.getByLabel('Hide password')).toBeVisible();
});

test('exposes profile initials, coaching settings, version and password recovery', async ({
  page,
}) => {
  await page.goto('/profile');
  await expect(page.getByLabel('Guest learner profile initials')).toBeVisible();
  await expect(page.getByText('Private by design')).toBeVisible();
  await page.getByLabel('Open settings').click();

  await expect(page.getByText('Choose how Voka pushes you')).toBeVisible();
  await page.getByRole('radio', { name: 'Tough coach coaching' }).click();
  await expect(page.getByRole('radio', { name: 'Tough coach coaching, selected' })).toBeVisible();
  await expect(page.getByText('VOKA version')).toBeVisible();
  await expect(page.getByText(/^1\.4\.0/)).toBeVisible();

  await page.goto('/auth');
  await expect(page.getByText('Forgot password?')).toHaveCSS('text-decoration-line', 'underline');
  await page.getByText('Forgot password?').click();
  await expect(page.getByText('Reset your password')).toBeVisible();
  await expect(page.getByText('Send reset link')).toBeVisible();
});

test('sets, displays and removes a test date', async ({ page }) => {
  await page.goto('/profile');
  await page.getByLabel('Set test date, currently Not set').click();
  await expect(page.getByText('When is your language test?')).toBeVisible();
  await page.getByLabel('Next day').click();
  await page.getByText('Save test date').click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByLabel(/^Set test date, currently (?!Not set)/)).toBeVisible();

  await page.goto('/sprint');
  await expect(page.getByLabel(/^Test-date practice plan for /)).toBeVisible();
  await expect(page.getByText('4 focused sessions this week')).toBeVisible();

  await page.goto('/profile');
  await page.getByLabel(/^Set test date, currently (?!Not set)/).click();
  await page.getByText('Remove test date').click();
  await expect(page.getByLabel('Set test date, currently Not set')).toBeVisible();
});

test('protects purchases behind account creation and exposes legal terms', async ({ page }) => {
  await page.goto('/plus');
  await expect(page).toHaveURL(/\/auth\?mode=sign-up$/);
  await expect(page.getByText('Start speaking')).toBeVisible();

  await page.goto('/settings');
  await page.getByText('Privacy policy').click();
  await expect(page.getByText('What Voka processes')).toBeVisible();
});

test('configures a speaking goal and opens a focused German curriculum unit', async ({ page }) => {
  await page.goto('/accent?track=DE');
  await expect(page.getByText('Standard German reference')).toBeVisible();
  await page.getByLabel('Work & study speaking goal').click();
  await expect(page.getByLabel('Work & study speaking goal')).toBeChecked();

  await page.goto('/sprint?track=DE');
  await expect(page.getByText('Your goal · Work & study')).toBeVisible();
  await page.getByLabel('Open B1 Am Telefon').click();
  await expect(page.getByText('Am Telefon').last()).toBeVisible();
  await expect(page.getByText('Kommt drauf an.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Learning path', exact: true }).last(),
  ).toBeVisible();
});

test('uses a safe fallback when a lesson id is unknown', async ({ page }) => {
  await page.goto('/lesson/not-a-real-lesson');
  await expect(page.getByText('Coffee on the go')).toBeVisible();
  await expect(page.getByText('What extra does the barista offer?')).toBeVisible();
});

test('explains the app with a skippable first-run tour', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page.getByText('Train your ear for how people really speak.')).toBeVisible();
  await page.getByText('Next', { exact: true }).click();
  await expect(page.getByText('Know exactly what to practise next.')).toBeVisible();
  await page.getByText('Skip', { exact: true }).click();
  await expect(page).toHaveURL(/\/learning-plan$/);
  await expect(page.getByText('A useful place to start')).toBeVisible();
});

test('validates writing, records completion and gives a clear next action', async ({ page }) => {
  await page.goto('/activity/write');
  await page.getByText('Start writing', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Writing response', exact: true }).fill('jkhajkhjhjhjh');
  await page.getByText('Finish writing', { exact: true }).click();
  await expect(
    page.getByText('Use at least 12 words and several different words to answer the prompt.'),
  ).toBeVisible();

  await page
    .getByRole('textbox', { name: 'Writing response', exact: true })
    .fill('Coffee sales rose during the week and Friday was the busiest day overall.');
  await page.getByText('Finish writing', { exact: true }).click();
  await expect(page.getByText(/Writing activity complete/)).toBeVisible();
  await page.getByText('View progress', { exact: true }).click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByText('Writing days')).toBeVisible();
});

test('finishes the complete vocabulary deck without looping', async ({ page }) => {
  await page.goto('/vocabulary');
  await page.getByText('Next card', { exact: true }).click();
  await page.getByText('Next card', { exact: true }).click();
  await page.getByText('Finish deck', { exact: true }).click();
  await expect(page).toHaveURL(/\/sprint\?track=DE$/);
});
