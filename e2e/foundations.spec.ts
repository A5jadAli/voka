import { expect, test } from '@playwright/test';
import { foundationLessons } from '../src/features/foundations/catalog';

test.beforeEach(async ({ page }) => {
  // These lessons must not require an account, provider calls or a microphone.
  await page.route('**/*', (route) =>
    ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
});

test('a complete beginner gets correction, a persistent draft, evidence and a next lesson', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'German', exact: true }).click();
  await page.getByRole('button', { name: 'Start: Hello, please and thank you' }).click();
  await expect(page.getByText('Hello! / Good day!', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Practise these phrases' }).click();
  await page.getByRole('button', { name: 'Auf Wiedersehen!', exact: true }).click();
  await expect(page.getByText(/^Not quite\. Try another answer\./)).toBeVisible();
  await page.getByRole('button', { name: 'Guten Tag!', exact: true }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'Bitte.', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to writing' }).click();
  await page.getByLabel('Your German answer').fill('wrong words');
  await page.reload();
  await expect(page.getByLabel('Your German answer')).toHaveValue('wrong words');
  await page.getByRole('button', { name: 'Check my phrase' }).click();
  await expect(page.getByText(/^This does not match this exercise yet\./)).toBeVisible();
  await page.getByLabel('Your German answer').fill('Danke!');
  await page.getByRole('button', { name: 'Check my phrase' }).click();
  await page.getByRole('button', { name: 'Continue to speaking practice' }).click();
  await page.getByRole('button', { name: 'Save without speaking' }).click();
  await expect(page.getByText('1/3 checks right first time')).toBeVisible();
  await page.reload();
  await expect(page.getByText('1/3 checks right first time')).toBeVisible();
  await page.getByRole('button', { name: 'Next lesson: Say your name' }).click();
  await expect(page).toHaveURL(/\/foundation\/introductions$/);
  await expect(page.getByText('My name is Sara.', { exact: true })).toBeVisible();
});

test('all lessons can be completed without audio and without false speaking credit', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const lessons = foundationLessons.map((lesson) => ({
    id: lesson.id,
    choices: lesson.checks.map((check) => check.options[check.answer]),
    answer: lesson.writing.accepted[0],
  }));
  for (const lesson of lessons) {
    await page.goto(`/foundation/${lesson.id}`);
    await page.getByRole('button', { name: 'Practise these phrases' }).click();
    await page.getByRole('button', { name: lesson.choices[0], exact: true }).click();
    await page.getByRole('button', { name: 'Next question' }).click();
    await page.getByRole('button', { name: lesson.choices[1], exact: true }).click();
    await page.getByRole('button', { name: 'Continue to writing' }).click();
    await page.getByLabel('Your German answer').fill(lesson.answer);
    await page.getByRole('button', { name: 'Check my phrase' }).click();
    await page.getByRole('button', { name: 'Continue to speaking practice' }).click();
    await page.getByRole('button', { name: 'Save without speaking' }).click();
    await expect(page.getByText('3/3 checks right first time')).toBeVisible();
    await expect(page.getByText(/You skipped the speaking practice/)).toBeVisible();
  }
  await page.getByRole('button', { name: 'Try German listening' }).click();
  await expect(page).toHaveURL(/\/listening\?track=DE$/);
});

test('unavailable German audio explains the fallback and does not block learning', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.speechSynthesis, 'getVoices', {
      value: () => [
        { voiceURI: 'test-en', lang: 'en-GB', name: 'English', localService: true, default: true },
      ],
    });
  });
  await page.goto('/foundation/greetings');
  await page.getByRole('button', { name: 'Hear: Hallo!', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('continue with the text');
  await page.getByRole('button', { name: 'Practise these phrases' }).click();
  await expect(page.getByText('Question 1 of 2.', { exact: false })).toBeVisible();
});
