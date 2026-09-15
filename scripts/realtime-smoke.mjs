import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!url || !publishableKey) {
  throw new Error('Supabase public configuration is required.');
}

const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false },
});
const { data, error } = await supabase.auth.signInAnonymously();
if (error || !data.session) {
  throw new Error(error?.message ?? 'Anonymous authentication did not return a session.');
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto('about:blank');
  const offerSdp = await page.evaluate(async () => {
    const peer = new RTCPeerConnection();
    globalThis.__vokaSmokePeer = peer;
    peer.addTransceiver('audio', { direction: 'sendrecv' });
    peer.createDataChannel('oai-events');
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    if (peer.iceGatheringState !== 'complete') {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('ICE gathering timed out.')), 10_000);
        peer.addEventListener('icegatheringstatechange', () => {
          if (peer.iceGatheringState !== 'complete') return;
          clearTimeout(timeout);
          resolve();
        });
      });
    }
    return peer.localDescription?.sdp;
  });

  if (!offerSdp) throw new Error('WebRTC did not create an SDP offer.');
  const response = await fetch(`${url}/functions/v1/realtime-session`, {
    body: JSON.stringify({
      goal: 'interviews',
      practice: 'conversation',
      sdp: offerSdp,
      track: 'EN',
      unitId: 'en-b1-interview-flow',
    }),
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const body = await response.json();
  if (!response.ok || typeof body.transport?.sdp !== 'string') {
    throw new Error(body.error ?? `Voice service returned ${response.status}.`);
  }

  await page.evaluate(async (answerSdp) => {
    const peer = globalThis.__vokaSmokePeer;
    await peer.setRemoteDescription({ sdp: answerSdp, type: 'answer' });
    if (peer.connectionState === 'connected') return;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WebRTC connection timed out.')), 15_000);
      peer.addEventListener('connectionstatechange', () => {
        if (peer.connectionState === 'connected') {
          clearTimeout(timeout);
          resolve();
        } else if (peer.connectionState === 'failed') {
          clearTimeout(timeout);
          reject(new Error('WebRTC connection failed.'));
        }
      });
    });
    peer.close();
  }, body.transport.sdp);

  console.log('Realtime smoke test passed: authenticated WebRTC connection established.');
} finally {
  await browser.close();
  await supabase.auth.signOut();
}
