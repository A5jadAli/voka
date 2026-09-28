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
  await expect(page.getByText('Describe the coffee sales chart.', { exact: false })).toBeVisible();
  const draft = 'Coffee sales increased during the week and reached their highest point on Friday.';
  await page.getByLabel('Writing response').fill(draft);
  await page.reload();
  await expect(page.getByLabel('Writing response')).toHaveValue(draft);
  await page.getByRole('button', { name: 'Submit my writing' }).click();
  await expect(page.getByText('Quick checks')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Quick checks')).toBeVisible();
  await page.getByLabel('Writing response').fill(`${draft} Sales then fell sharply on Saturday.`);
  await expect(page.getByRole('button', { name: 'Submit my writing' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit my writing' }).click();
  await page.getByRole('tab', { name: 'Letter', exact: true }).click();
  await expect(page.getByText('Write a useful request')).toBeVisible();
  await page.getByRole('tab', { name: 'Chart', exact: true }).click();
  await expect(page.getByLabel('Writing response')).toHaveValue(
    `${draft} Sales then fell sharply on Saturday.`,
  );
});

test('AI writing feedback shows criteria, corrections and an improved version', async ({
  page,
}) => {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: '33333333-3333-4333-8333-333333333333',
    aud: 'authenticated',
    role: 'authenticated',
    is_anonymous: true,
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: user.id, exp: expires, aud: 'authenticated' })).toString(
      'base64url',
    ),
    'synthetic-signature',
  ].join('.');
  await page.route('**/auth/v1/signup', (route) =>
    route.fulfill({
      json: {
        access_token: token,
        refresh_token: 'synthetic-refresh',
        expires_in: 3600,
        expires_at: expires,
        token_type: 'bearer',
        user,
      },
    }),
  );
  await page.route('**/functions/v1/writing-feedback', (route) =>
    route.fulfill({
      json: {
        feedback: {
          createdAt: new Date().toISOString(),
          summary: 'A clear overview with accurate figures.',
          criteria: [
            { name: 'Task', rating: 'strong', comment: 'You gave an overview and a comparison.' },
            { name: 'Organisation', rating: 'developing', comment: 'Add a linking word.' },
            { name: 'Vocabulary', rating: 'developing', comment: 'Try peaked at.' },
            { name: 'Grammar', rating: 'needs work', comment: 'Check past tense.' },
          ],
          corrections: [
            {
              original: 'Sales rise on Friday',
              corrected: 'Sales rose on Friday',
              why: 'Past tense.',
            },
          ],
          improvedVersion: 'Coffee sales peaked at 76 cups on Friday.',
          nextStep: 'Practise past-tense trend verbs.',
        },
      },
    }),
  );
  await page.goto('/activity/write');
  await page
    .getByLabel('Writing response')
    .fill(
      'Overall sales went up in the week. Sales rise on Friday to seventy six cups and fell later.',
    );
  await page.getByRole('button', { name: 'Submit my writing' }).click();
  await page.getByRole('button', { name: 'Get AI feedback' }).click();
  await expect(page.getByText('A clear overview with accurate figures.')).toBeVisible();
  await expect(page.getByText('Sales rose on Friday')).toBeVisible();
  await page.getByRole('button', { name: 'Improved version' }).click();
  await expect(page.getByText('Coffee sales peaked at 76 cups on Friday.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the next task' })).toBeVisible();
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
  // The coloured face sits inside the tactile lip.
  await expect(wrong.locator('div').nth(1)).toHaveCSS('background-color', 'rgb(255, 233, 225)');
  await expect(page.getByText(/Not quite. Check the evidence/)).toBeVisible();
  await page
    .getByRole('radio', { name: 'To explain temporary service changes', exact: true })
    .click();
  const correct = page.getByRole('radio', {
    name: 'To explain temporary service changes',
    exact: true,
  });
  await expect(correct).toBeChecked();
  await expect(correct.locator('div').nth(1)).toHaveCSS('background-color', 'rgb(227, 242, 229)');
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
