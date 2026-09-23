import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    vokaVoiceTest: {
      starts: number;
      stops: number;
      closes: number;
      delayPermission: boolean;
      grant?: () => void;
      fail?: () => void;
    };
  }
}

async function installFakeVoice(page: Page) {
  let requests = 0;
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    aud: 'authenticated',
    role: 'authenticated',
    is_anonymous: true,
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(
      JSON.stringify({ sub: user.id, exp: expires, aud: 'authenticated', is_anonymous: true }),
    ).toString('base64url'),
    'synthetic-signature',
  ].join('.');
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return route.continue();
    if (url.pathname === '/auth/v1/signup')
      return route.fulfill({
        json: {
          access_token: token,
          refresh_token: 'synthetic-refresh',
          expires_in: 3600,
          expires_at: expires,
          token_type: 'bearer',
          user,
        },
      });
    if (url.pathname.endsWith('/functions/v1/realtime-session')) {
      requests += 1;
      return route.fulfill({ json: { transport: { sdp: 'synthetic-answer' } } });
    }
    return route.abort();
  });
  await page.addInitScript(() => {
    const counters = (window.vokaVoiceTest = {
      starts: 0,
      stops: 0,
      closes: 0,
      delayPermission: false,
    } as Window['vokaVoiceTest']);
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async () => {
        counters.starts += 1;
        if (counters.delayPermission)
          await new Promise<void>((resolve) => {
            counters.grant = resolve;
          });
        const track = {
          enabled: true,
          stop: () => {
            counters.stops += 1;
          },
        };
        return { getAudioTracks: () => [track], getTracks: () => [track] };
      },
    });
    Object.defineProperty(window, 'RTCPeerConnection', {
      value: class {
        iceGatheringState = 'complete';
        localDescription = { sdp: 'synthetic-offer' };
        addTrack() {}
        createDataChannel() {
          const channel = {
            readyState: 'open',
            onerror: undefined as undefined | (() => void),
            send() {},
            close() {
              this.readyState = 'closed';
            },
          };
          counters.fail = () => channel.onerror?.();
          return channel;
        }
        async createOffer() {
          return this.localDescription;
        }
        async setLocalDescription() {}
        async setRemoteDescription() {}
        close() {
          counters.closes += 1;
        }
      },
    });
  });
  return () => requests;
}

test('voice failure releases the microphone, retry reconnects, navigation stops the new session', async ({
  page,
}) => {
  const requests = await installFakeVoice(page);
  await page.goto('/conversation?track=DE');
  await page.getByLabel('Start live conversation', { exact: true }).click();
  await expect(page.getByText('Listening. Jump in anytime', { exact: true })).toBeVisible();
  await page.evaluate(() => window.vokaVoiceTest.fail?.());
  await expect(page.getByText('Connection needs attention', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.vokaVoiceTest.stops)).toBe(1);
  await page.getByLabel('Start live conversation', { exact: true }).click();
  await expect(page.getByText('Listening. Jump in anytime', { exact: true })).toBeVisible();
  expect(requests()).toBe(2);
  await page.getByLabel('Progress', { exact: true }).last().click();
  await expect(page.getByText('Your progress', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.vokaVoiceTest.stops)).toBe(2);
  expect(await page.evaluate(() => window.vokaVoiceTest.closes)).toBe(2);
});

test('leaving during microphone permission closes the late microphone without starting paid voice', async ({
  page,
}) => {
  const requests = await installFakeVoice(page);
  await page.goto('/conversation?track=DE');
  await page.evaluate(() => {
    window.vokaVoiceTest.delayPermission = true;
  });
  await page.getByLabel('Start live conversation', { exact: true }).click();
  await expect(page.getByText('Connecting securely…', { exact: true })).toBeVisible();
  await page.getByLabel('Progress', { exact: true }).last().click();
  await expect(page.getByText('Your progress', { exact: true })).toBeVisible();
  await page.evaluate(() => window.vokaVoiceTest.grant?.());
  await expect.poll(() => page.evaluate(() => window.vokaVoiceTest.stops)).toBe(1);
  expect(requests()).toBe(0);
});
