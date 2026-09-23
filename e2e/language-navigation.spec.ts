import { expect, test } from '@playwright/test';
import { listeningScenarios } from '../src/features/listening/scenarios';

test('German remains selected across navigation and a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'German', exact: true }).click();
  await page.getByLabel('Live speaking coach', { exact: true }).click();
  await expect(page).toHaveURL(/\/conversation\?track=DE$/);
  await expect(page.getByText('Everyday German', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Learning path', exact: true }).last().click();
  await expect(page).toHaveURL(/\/sprint\?track=DE$/);
  await expect(page.getByLabel('Open A1 Erster Kontakt')).toBeVisible();
  await page.getByRole('button', { name: 'Home', exact: true }).last().click();
  await page.reload();
  await expect(page.getByText('Everyday German', { exact: true })).toBeVisible();
  await page.getByLabel('Progress', { exact: true }).last().click();
  await page.getByLabel('Start live conversation from progress').click();
  await expect(page).toHaveURL(/\/conversation\?track=DE$/);
});

test('all authored listening lessons are discoverable and open in the correct language', async ({
  page,
}) => {
  for (const track of ['EN', 'DE'] as const) {
    await page.goto('/');
    if (track === 'DE') await page.getByRole('button', { name: 'German', exact: true }).click();
    else await page.getByRole('button', { name: 'English', exact: true }).click();
    await page
      .getByLabel(`Open ${track === 'DE' ? 'German' : 'English'} listening lessons`)
      .click();
    await expect(page).toHaveURL(new RegExp(`/listening\\?track=${track}$`));
    for (const scenario of listeningScenarios.filter((entry) => entry.track === track)) {
      await page
        .getByRole('button', { name: `Open listening lesson ${scenario.title}`, exact: true })
        .click();
      await expect(page.getByText(scenario.question.prompt, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Go back', exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/listening\\?track=${track}$`));
    }
  }
});
