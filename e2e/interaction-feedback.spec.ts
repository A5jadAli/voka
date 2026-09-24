import { expect, test, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) =>
    ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
  // Controlled speech events exercise a slow device without sending or playing audio.
  await page.addInitScript(() => {
    const utterances: SpeechSynthesisUtterance[] = [];
    // Native browser setters only accept real SpeechSynthesisVoice objects.
    // Allow our synthetic voices while keeping real start/end event dispatch.
    Object.defineProperty(SpeechSynthesisUtterance.prototype, 'voice', {
      get: () => null,
      set: () => undefined,
    });
    Object.defineProperties(window.speechSynthesis, {
      getVoices: {
        value: () => [
          {
            voiceURI: 'test-de',
            lang: 'de-DE',
            name: 'German',
            localService: true,
            default: false,
          },
          {
            voiceURI: 'test-en',
            lang: 'en-GB',
            name: 'English',
            localService: true,
            default: true,
          },
        ],
      },
      speak: {
        value: (utterance: SpeechSynthesisUtterance) => {
          utterances.push(utterance);
        },
      },
      cancel: { value: () => undefined },
    });
    Object.assign(window, {
      testSpeechEvent: (event: string, index = utterances.length - 1) =>
        utterances[index]?.dispatchEvent(new Event(event)),
      testSpeechCalls: () => utterances.map((item) => ({ text: item.text, rate: item.rate })),
    });
  });
});

declare global {
  interface Window {
    testSpeechEvent: (event: string, index?: number) => void;
    testSpeechCalls: () => { text: string; rate: number }[];
  }
}

async function expectSameBounds(
  target: Locator,
  before: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>,
) {
  const after = await target.boundingBox();
  expect(after).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const)
    expect(Math.abs(after![key] - before[key])).toBeLessThan(1);
}

test('German phrase controls stay still during preparation, playback, cancellation and replay', async ({
  page,
}) => {
  await page.goto('/foundation/greetings');
  const audio = page.getByRole('button', { name: 'Hear: Hallo!', exact: true });
  await audio.scrollIntoViewIfNeeded();
  const before = (await audio.boundingBox())!;
  await audio.click();
  await expect(audio).toHaveAttribute('aria-busy', 'true');
  await expect(audio).toContainText('Preparing audio...');
  await expectSameBounds(audio, before);
  await expect.poll(() => page.evaluate(() => window.testSpeechCalls().length)).toBe(1);
  await page.evaluate(() => window.testSpeechEvent('start'));
  await expect(audio).toContainText('Playing audio');
  await expectSameBounds(audio, before);
  await audio.click();
  await expect(audio).toContainText('Tap to listen');
  await expectSameBounds(audio, before);
  await audio.click();
  await expect(audio).toContainText('Preparing audio...');
  await expect.poll(() => page.evaluate(() => window.testSpeechCalls().length)).toBe(2);
  await audio.click();
  await page.evaluate(() => window.testSpeechEvent('start'));
  await expect(audio).toContainText('Tap to listen');
  await expect(audio).toHaveAttribute('aria-pressed', 'false');
  await expectSameBounds(audio, before);
});

test('German meaning checks mark the chosen answer and preserve correct feedback', async ({
  page,
}) => {
  await page.goto('/foundation/greetings');
  await page.getByRole('button', { name: 'Practise these phrases' }).click();
  const wrong = page.getByRole('radio', { name: 'Auf Wiedersehen!', exact: true });
  await wrong.click();
  await expect(wrong).toBeChecked();
  await expect(wrong).toHaveCSS('background-color', 'rgb(255, 240, 234)');
  const right = page.getByRole('radio', { name: 'Guten Tag!', exact: true });
  await right.click();
  await expect(right).toBeChecked();
  await expect(right).toHaveCSS('background-color', 'rgb(232, 243, 233)');
  await expect(right).toBeDisabled();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
});

test('dialogue replay restarts, speed takes effect and listening does not erase a checked answer', async ({
  page,
}) => {
  await page.goto('/lesson/coffee-run');
  await page.getByRole('button', { name: 'Play audio', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel audio', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.testSpeechCalls().length)).toBeGreaterThan(0);
  const firstCount = await page.evaluate(() => window.testSpeechCalls().length);
  await page.evaluate(() => window.testSpeechEvent('start', 0));
  await expect(page.getByRole('button', { name: 'Stop audio', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replay audio', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.testSpeechCalls().length))
    .toBe(firstCount * 2);
  await expect(page.getByRole('button', { name: 'Cancel audio', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Slow audio' }).click();
  await expect
    .poll(() => page.evaluate(() => window.testSpeechCalls().at(-1)?.rate))
    .toBeCloseTo(0.68, 4);
  await page.getByRole('radio', { name: 'An extra espresso shot' }).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  const correct = page.getByRole('radio', { name: 'An extra espresso shot' });
  await expect(correct).toHaveCSS('background-color', 'rgb(232, 243, 233)');
  await page.getByRole('button', { name: 'Replay audio', exact: true }).click();
  await expect(page.getByText('More listening practice', { exact: true })).toBeVisible();
  await expect(correct).toBeChecked();
});

test('vocabulary audio does not flip the card and stops from the same control', async ({
  page,
}) => {
  await page.goto('/vocabulary');
  const card = page.getByRole('button', { name: 'Flip vocabulary card' });
  const audio = page.getByRole('button', { name: 'Hear Rechnung' });
  await audio.click();
  await expect(audio).toContainText('Preparing audio...');
  await expect(card.getByText('Rechnung', { exact: true })).toBeVisible();
  await audio.click();
  await expect(audio).toContainText('Tap to listen');
});
