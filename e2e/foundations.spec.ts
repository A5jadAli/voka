import { expect, test } from '@playwright/test';
import { foundationLessons } from '../src/features/foundations/catalog';
import { placementStages } from '../src/features/placement/items';

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
  await page
    .getByRole('button', { name: 'Open practice: Start with your first German words' })
    .click();
  await expect(page.getByText('Hello! / Good day!', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Practise these phrases' }).click();
  await page.getByRole('radio', { name: 'Auf Wiedersehen!', exact: true }).click();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText('Not quite', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('radio', { name: 'Guten Tag!', exact: true }).click();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText('Correct', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('radio', { name: 'Bitte.', exact: true }).click();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(
    page.getByRole('button', { name: 'Play the listening question', exact: true }),
  ).toBeVisible();
  await page.getByRole('radio', { name: 'Saying goodbye until tomorrow', exact: true }).click();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText(/You heard “Tschüss, bis morgen!”/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue to writing' }).click();
  await page.getByLabel('Your German answer').fill('wrong words');
  await page.reload();
  await expect(page.getByLabel('Your German answer')).toHaveValue('wrong words');
  await page.getByRole('button', { name: 'Check my phrase' }).click();
  await expect(page.getByText('Not yet', { exact: true })).toBeVisible();
  await page.getByLabel('Your German answer').fill('Danke!');
  await page.getByRole('button', { name: 'Check my phrase' }).click();
  await page.getByRole('button', { name: 'Continue to speaking practice' }).click();
  await page.getByRole('button', { name: 'Skip speaking for now' }).click();
  await expect(page.getByText('2/4 checks right first time')).toBeVisible();
  await page.reload();
  await expect(page.getByText('2/4 checks right first time')).toBeVisible();
  await page.getByRole('button', { name: 'Next lesson: Say your name' }).click();
  await expect(page).toHaveURL(/\/foundation\/introductions$/);
  await expect(page.getByText('My name is Sara.', { exact: true })).toBeVisible();
  // Home now points at the next lesson in the path instead of the onboarding suggestion.
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Open practice: Next: Say your name' }),
  ).toBeVisible();
  await expect(page.getByText('7 phrases · next review tomorrow')).toBeVisible();
});

test('all lessons can be completed without audio and without false speaking credit', async ({
  page,
}) => {
  test.setTimeout(600_000);
  const lessons = foundationLessons.map((lesson) => ({
    id: lesson.id,
    language: lesson.track === 'EN' ? 'English' : 'German',
    choices: lesson.checks.map((check) => check.options[check.answer]),
    answer: lesson.writing.accepted[0],
  }));
  for (const lesson of lessons) {
    await page.goto(`/foundation/${lesson.id}`);
    await page.getByRole('button', { name: 'Practise these phrases' }).click();
    for (const [index, choice] of lesson.choices.entries()) {
      await page.getByRole('radio', { name: choice, exact: true }).click();
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page
        .getByRole('button', {
          name: index === lesson.choices.length - 1 ? 'Continue to writing' : 'Next question',
        })
        .click();
    }
    await page.getByLabel(`Your ${lesson.language} answer`).fill(lesson.answer);
    await page.getByRole('button', { name: 'Check my phrase' }).click();
    await page.getByRole('button', { name: 'Continue to speaking practice' }).click();
    await page.getByRole('button', { name: 'Skip speaking for now' }).click();
    const total = lesson.choices.length + 1;
    await expect(page.getByText(`${total}/${total} checks right first time`)).toBeVisible();
    await expect(page.getByText(/You skipped the speaking practice/)).toBeVisible();
  }
  await page.getByRole('button', { name: 'Try English listening' }).click();
  await expect(page).toHaveURL(/\/listening\?track=EN$/);
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
  await expect(page.getByText('Question 1 of 3', { exact: true })).toBeVisible();
});

test('placement advances only on secure stages and recommends a real starting lesson', async ({
  page,
}) => {
  const [a1, a2] = placementStages('DE');
  await page.goto('/placement?track=DE');
  await page.getByRole('button', { name: 'Start the check' }).click();
  for (const item of a1) {
    await page.getByRole('radio', { name: item.options[item.answer], exact: true }).click();
    await page.getByRole('button', { name: /Next question|Finish this stage/ }).click();
  }
  await expect(page.getByText(/Stage 2 of 4 · A2/)).toBeVisible();
  for (const item of a2) {
    const wrong = item.options[(item.answer + 1) % item.options.length];
    await page.getByRole('radio', { name: wrong, exact: true }).click();
    await page.getByRole('button', { name: /Next question|Finish this stage/ }).click();
  }
  await expect(page.getByText('Secure up to A1 tasks')).toBeVisible();
  await expect(page.getByText(/not a certified CEFR level/)).toBeVisible();
  await expect(page.getByText('Review what you missed')).toBeVisible();
  await page.getByRole('button', { name: 'Start recommended practice' }).click();
  await expect(page).toHaveURL(/\/foundation\/weekend-smalltalk$/);
});

test('finished lesson phrases come back for spaced review the next day', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-28T09:00:00Z') });
  const lesson = foundationLessons.find((item) => item.id === 'greetings')!;
  await page.goto('/foundation/greetings');
  await page.getByRole('button', { name: 'Practise these phrases' }).click();
  for (const [index, check] of lesson.checks.entries()) {
    await page.getByRole('radio', { name: check.options[check.answer], exact: true }).click();
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page
      .getByRole('button', {
        name: index === lesson.checks.length - 1 ? 'Continue to writing' : 'Next question',
      })
      .click();
  }
  await page.getByLabel('Your German answer').fill('Danke');
  await page.getByRole('button', { name: 'Check my phrase' }).click();
  await page.getByRole('button', { name: 'Continue to speaking practice' }).click();
  await page.getByRole('button', { name: 'I practised aloud' }).click();
  await expect(page.getByText('Lesson complete')).toBeVisible();

  await page.goto('/review?track=DE');
  await expect(page.getByText('Nothing to review yet')).toHaveCount(0);
  await expect(page.getByText('You are up to date', { exact: false })).toBeVisible();

  await page.clock.setFixedTime(new Date('2026-09-29T10:00:00Z'));
  await page.goto('/review?track=DE');
  await expect(page.getByText('Which phrase means:')).toBeVisible();
  for (let step = 0; step < 30; step++) {
    if (await page.getByText('Review complete').isVisible()) break;
    if (await page.getByRole('button', { name: 'Check', exact: true }).isVisible()) {
      await page.getByRole('radio').first().click();
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Show answer' }).click();
      await page.getByRole('button', { name: 'I knew it' }).click();
    }
  }
  await expect(page.getByText('Review complete')).toBeVisible();
  await expect(page.getByText(/You remembered \d+ of 7 phrases/)).toBeVisible();
});
