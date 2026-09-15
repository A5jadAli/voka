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
  await expect(page.getByText('Food & cafés')).toBeVisible();
  await expect(page.getByLabel('Open German vocabulary')).toBeVisible();
});

test('connects all five primary navigation destinations', async ({ page }) => {
  await expect(page.getByLabel('Home')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Learning path', exact: true })).toBeVisible();
  await expect(page.getByLabel('Live speaking coach')).toBeVisible();
  await expect(page.getByLabel('Progress')).toBeVisible();
  await expect(page.getByLabel('Profile')).toBeVisible();

  await page.getByRole('button', { name: 'Learning path', exact: true }).click();
  await expect(page).toHaveURL(/\/sprint$/);
  await expect(page.getByText('From first words to real presence')).toBeVisible();
  await expect(page.getByLabel('Open B1 Interview flow')).toBeVisible();

  await page.getByLabel('Progress').last().click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByText('Your progress')).toBeVisible();

  await page.getByLabel('Profile').last().click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Unlimited practice after the pilot')).toBeVisible();
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
  await expect(page.getByText('Everyday German')).toBeVisible();
});

test('runs the listening warm-up and continues to the detailed lesson', async ({ page }) => {
  await page.getByLabel('Open Listen').click();
  await expect(page).toHaveURL(/\/activity\/listen$/);
  await page.getByLabel('Show transcript').click();
  await expect(page.getByText('Let’s meet outside the station at half past three.')).toBeVisible();
  await page.getByText('Check', { exact: true }).click();
  await expect(page.getByText('Correct — they will meet outside the station.')).toBeVisible();
  await page.getByText('Continue', { exact: true }).click();

  await expect(page).toHaveURL(/\/lesson\/coffee-run$/);
  await expect(page.getByText('What natives compress')).toBeVisible();
  await page.getByRole('radio', { name: 'An extra espresso shot' }).click();
  await page.getByText('Check answer', { exact: true }).click();
  await expect(page.getByText('Lesson complete', { exact: true })).toBeVisible();
});

test('opens the spoken check, honest empty result and real account form', async ({ page }) => {
  await page.goto('/profile');
  await page.getByLabel('Open spoken level check').click();
  await expect(page.getByText('The bus to the city leaves every twenty minutes.')).toBeVisible();
  await page.getByLabel('Start spoken level check').click();
  await expect(page.getByText('Spoken level check').last()).toBeVisible();

  await page.goto('/mock-result');
  await expect(page.getByText('No result yet')).toBeVisible();
  await expect(page.getByLabel('Start spoken level check from results')).toBeVisible();

  await page.goto('/profile');
  await page.getByLabel('Sign in or create account').click();
  await expect(page.getByText('Welcome back')).toBeVisible();
  await page.getByText('New here? Create an account').click();
  await expect(page.getByPlaceholder('Your name')).toBeVisible();
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
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Build real-world listening')).toBeVisible();
});

test('gives feedback when a writing response is too short', async ({ page }) => {
  await page.goto('/activity/write');
  await page.getByText('Start writing', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Writing response', exact: true }).fill('Too short');
  await page.getByText('Save response', { exact: true }).click();
  await expect(page.getByText('Add a little more detail — at least 20 characters.')).toBeVisible();
});
