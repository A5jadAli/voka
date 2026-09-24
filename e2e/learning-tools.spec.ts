import { expect, test } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) =>
    ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
});
test('Home actions are distinct and icon navigation keeps accessible names', async ({ page }) => {
  await page.goto('/');
  const home = page.getByRole('button', { name: 'Home', exact: true });
  await expect(home).toBeVisible();
  await expect(home.getByText('Home', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Open practice:/ })).toBeVisible();
  await page
    .getByRole('button', { name: 'Change my starting point and goal', exact: true })
    .click();
  await expect(page).toHaveURL(/\/learning-plan$/);
});
test('writing draft survives reload and submitted text can be revised', async ({ page }) => {
  await page.goto('/activity/write');
  await expect(page.getByText('Describe the coffee sales chart.', { exact: false })).toHaveCSS(
    'color',
    'rgb(95, 91, 88)',
  );
  await page.getByRole('button', { name: 'Start writing', exact: true }).click();
  const draft = 'Coffee sales increased during the week and reached their highest point on Friday.';
  await page.getByLabel('Writing response').fill(draft);
  await page.reload();
  await expect(page.getByLabel('Writing response')).toHaveValue(draft);
  await page.getByRole('button', { name: 'Finish writing activity' }).click();
  await expect(page.getByText('Review and revise')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Review and revise')).toBeVisible();
  await page.getByLabel('Writing response').fill(`${draft} Sales then fell sharply on Saturday.`);
  await expect(page.getByRole('button', { name: 'Finish writing activity' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish writing activity' }).click();
  await page.getByRole('button', { name: 'Letter', exact: true }).click();
  await expect(page.getByText('Write a useful request')).toBeVisible();
  await page.getByRole('button', { name: 'Chart', exact: true }).click();
  await expect(page.getByLabel('Writing response')).toHaveValue(
    `${draft} Sales then fell sharply on Saturday.`,
  );
});
test('starting ability and exam goal change the recommended practice', async ({ page }) => {
  await page.goto('/learning-plan');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'I know some words and short phrases' }).click();
  await page.getByRole('button', { name: 'IELTS General Training', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'IELTS General Training', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Start recommended practice' }).click();
  await expect(page).toHaveURL(/\/activity\/write\?task=letter$/);
});
test('reading gives correction, records completion and offers the next text', async ({ page }) => {
  await page.goto('/reading');
  const wrong = page.getByRole('radio', { name: 'To announce a permanent closure', exact: true });
  await wrong.click();
  await expect(wrong).toBeChecked();
  await expect(wrong).toHaveCSS('background-color', 'rgb(255, 240, 234)');
  await expect(page.getByText(/Not quite. Check the evidence/)).toBeVisible();
  await page
    .getByRole('radio', { name: 'To explain temporary service changes', exact: true })
    .click();
  const correct = page.getByRole('radio', {
    name: 'To explain temporary service changes',
    exact: true,
  });
  await expect(correct).toBeChecked();
  await expect(correct).toHaveCSS('background-color', 'rgb(232, 243, 233)');
  await expect(correct).toBeDisabled();
  await expect(wrong).not.toBeChecked();
  await page.getByRole('button', { name: 'Read a practical notice', exact: true }).click();
  await expect(correct).toBeChecked();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  await page.getByRole('radio', { name: 'No', exact: true }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('radio', { name: 'The location only', exact: true }).click();
  await page.getByRole('button', { name: 'Save reading practice' }).click();
  await expect(page.getByText('Practice saved', { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Read a practical notice · Practised' }),
  ).toBeVisible();
});
