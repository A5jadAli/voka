import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('switches between English and German without horizontal overflow', async ({ page }) => {
  await expect(page.getByText('Understand real English')).toBeVisible();
  await expect(page.getByLabel('Open Coffee on the go')).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole('button', { name: 'German' }).click();
  await expect(page.getByText('Understand real German')).toBeVisible();
  await expect(page.getByLabel('Open At the bakery')).toBeVisible();
});

test('completes a listening lesson and saves the result', async ({ page }) => {
  await page.getByLabel('Open Coffee on the go').click();
  await expect(page).toHaveURL(/\/lesson\/coffee-run$/);
  await expect(page.getByText('What natives compress')).toBeVisible();

  await page.getByText('English', { exact: true }).click();
  await expect(page.getByText('Meaning', { exact: true })).toBeVisible();
  await page.getByText('Meaning', { exact: true }).click();
  await expect(page.getByText('Subtitles are off — listen for the situation.')).toBeVisible();

  await page.getByRole('radio', { name: 'A larger cup' }).click();
  await page.getByText('Check answer', { exact: true }).click();
  await expect(page.getByText('Not quite. Replay it slowly, then try once more.')).toBeVisible();

  await page.getByRole('radio', { name: 'An extra espresso shot' }).click();
  await page.getByText('Check answer', { exact: true }).click();
  await expect(page.getByText('Exactly — you caught the key instruction.')).toBeVisible();
  await expect(page.getByText('Lesson complete')).toBeVisible();

  await page.getByLabel('Go back').click();
  await expect(page.getByText('DONE')).toBeVisible();
});

test('uses a safe fallback when a lesson id is unknown', async ({ page }) => {
  await page.goto('/lesson/not-a-real-lesson');
  await expect(page.getByText('Coffee on the go')).toBeVisible();
  await expect(page.getByText('What extra does the barista offer?')).toBeVisible();
});
