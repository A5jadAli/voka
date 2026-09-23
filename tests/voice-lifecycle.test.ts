import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createConversationRequest } from '@/features/conversation/backend';
import { startRealtimeSession } from '@/features/conversation/realtime-session.web';

jest.mock('@/features/conversation/backend', () => ({ createConversationRequest: jest.fn() }));

class FakePeer {
  static latest: FakePeer;
  iceGatheringState = 'complete';
  connectionState = 'connected';
  localDescription = { sdp: 'fake-offer' };
  onconnectionstatechange?: () => void;
  channel = { close: jest.fn(), onerror: undefined as undefined | (() => void) };
  close = jest.fn();
  constructor() {
    FakePeer.latest = this;
  }
  addTrack() {}
  createDataChannel() {
    return this.channel;
  }
  async createOffer() {
    return this.localDescription;
  }
  async setLocalDescription() {}
  async setRemoteDescription() {}
}
const microphoneStop = jest.fn();
const audioPause = jest.fn();
const closeRemote = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
const media = {
  getAudioTracks: () => [{ enabled: true, stop: microphoneStop }],
  getTracks: () => [{ stop: microphoneStop }],
};
const getUserMedia = jest.fn<() => Promise<typeof media>>();
const savedNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const savedPeer = globalThis.RTCPeerConnection;
const savedAudio = globalThis.Audio;

beforeEach(() => {
  jest.clearAllMocks();
  getUserMedia.mockResolvedValue(media);
  jest.mocked(createConversationRequest).mockResolvedValue({
    answerSdp: 'fake-answer',
    sessionId: 'fake-session',
    expiresAt: undefined,
    close: closeRemote,
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { mediaDevices: { getUserMedia } },
  });
  Object.assign(globalThis, {
    RTCPeerConnection: FakePeer,
    Audio: class {
      pause = audioPause;
    },
  });
});
afterEach(() => {
  if (savedNavigator) Object.defineProperty(globalThis, 'navigator', savedNavigator);
  Object.assign(globalThis, { RTCPeerConnection: savedPeer, Audio: savedAudio });
});
const options = () => ({
  coachTone: 'supportive' as const,
  goal: 'everyday' as const,
  onEvent: jest.fn(),
  onStatus: jest.fn(),
  practice: 'conversation' as const,
  starter: 'Hello',
  track: 'DE' as const,
});

describe('voice transport cleanup', () => {
  it('stops locally and hangs up when the five-minute limit expires', async () => {
    jest.useFakeTimers();
    try {
      const input = options();
      await startRealtimeSession(input);
      jest.advanceTimersByTime(300_000);
      expect(microphoneStop).toHaveBeenCalledTimes(1);
      expect(closeRemote).toHaveBeenCalledTimes(1);
      expect(input.onStatus).toHaveBeenLastCalledWith('ended');
    } finally {
      jest.useRealTimers();
    }
  });
  it('stops microphone, playback, channel and peer exactly once', async () => {
    const session = await startRealtimeSession(options());
    session.stop();
    session.stop();
    expect(microphoneStop).toHaveBeenCalledTimes(1);
    expect(audioPause).toHaveBeenCalledTimes(1);
    expect(FakePeer.latest.close).toHaveBeenCalledTimes(1);
    expect(FakePeer.latest.channel.close).toHaveBeenCalledTimes(1);
    expect(closeRemote).toHaveBeenCalledTimes(1);
  });
  it('releases audio on a data-channel failure', async () => {
    const input = options();
    await startRealtimeSession(input);
    FakePeer.latest.channel.onerror?.();
    expect(microphoneStop).toHaveBeenCalledTimes(1);
    expect(input.onStatus).toHaveBeenLastCalledWith('error');
  });
  it('stops a microphone that arrives after permission/start was cancelled', async () => {
    let grant!: (value: typeof media) => void;
    getUserMedia.mockReturnValue(
      new Promise((resolve) => {
        grant = resolve;
      }),
    );
    const controller = new AbortController();
    const starting = startRealtimeSession({ ...options(), signal: controller.signal });
    controller.abort();
    grant(media);
    await expect(starting).rejects.toThrow('cancelled');
    expect(microphoneStop).toHaveBeenCalledTimes(1);
    expect(createConversationRequest).not.toHaveBeenCalled();
  });
  it('does not request microphone permission for a cancelled start', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(startRealtimeSession({ ...options(), signal: controller.signal })).rejects.toThrow(
      'cancelled',
    );
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});
