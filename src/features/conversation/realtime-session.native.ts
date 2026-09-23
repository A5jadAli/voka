import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  type MediaStream,
  type MediaStreamTrack,
} from 'react-native-webrtc';

import { createConversationRequest } from './backend';
import type { RealtimeSessionHandle, StartRealtimeSessionOptions } from './realtime-types';

const ICE_TIMEOUT_MS = 10_000;

async function waitForIceGathering(peer: RTCPeerConnection, signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('Conversation start cancelled.');
  if (peer.iceGatheringState === 'complete') return;

  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', cancel);
      peer.onicegatheringstatechange = null;
      if (error) reject(error);
      else resolve();
    };
    const cancel = () => finish(new Error('Conversation start cancelled.'));
    const timeout = setTimeout(() => {
      finish(new Error('The voice connection timed out. Please check your internet connection.'));
    }, ICE_TIMEOUT_MS);
    signal?.addEventListener('abort', cancel, { once: true });

    peer.onicegatheringstatechange = () => {
      if (peer.iceGatheringState !== 'complete') return;
      finish();
    };
  });
}

export async function startRealtimeSession({
  coachTone,
  onEvent,
  onStatus,
  goal,
  practice,
  signal,
  starter,
  track,
  unitId,
}: StartRealtimeSessionOptions): Promise<RealtimeSessionHandle> {
  onStatus('connecting');
  const peer = new RTCPeerConnection({});
  let microphone: MediaStream | undefined;
  let microphoneTrack: MediaStreamTrack | undefined;
  let remoteMedia: MediaStream | undefined;
  let stopped = false;
  let closeRemote: (() => Promise<void>) | undefined;
  let durationTimer: ReturnType<typeof setTimeout> | undefined;
  let channel: ReturnType<RTCPeerConnection['createDataChannel']> | undefined;

  const cleanup = (failed = false) => {
    if (stopped) return;
    stopped = true;
    clearTimeout(durationTimer);
    void closeRemote?.().catch(() => undefined); // Durable worker retries when offline.
    signal?.removeEventListener('abort', abort);
    microphone?.getTracks().forEach((trackItem) => trackItem.stop());
    remoteMedia?.getTracks().forEach((trackItem) => trackItem.stop());
    channel?.close();
    peer.close();
    onStatus(failed ? 'error' : 'ended');
  };

  const abort = () => cleanup();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    if (signal?.aborted) throw new Error('Conversation start cancelled.');
    microphone = await mediaDevices.getUserMedia({ audio: true, video: false });
    if (stopped || signal?.aborted) {
      microphone.getTracks().forEach((trackItem) => trackItem.stop());
      throw new Error('Conversation start cancelled.');
    }
    microphoneTrack = microphone.getAudioTracks()[0];
    if (!microphoneTrack) throw new Error('No microphone is available on this device.');
    peer.addTrack(microphoneTrack, microphone);
    peer.ontrack = (event: { streams: MediaStream[]; track: MediaStreamTrack | null }) => {
      if (stopped) {
        event.track?.stop();
        return;
      }
      remoteMedia = event.streams[0] ?? remoteMedia;
      const audioTrack =
        event.track?.kind === 'audio' ? event.track : remoteMedia?.getAudioTracks()[0];
      if (!audioTrack) return;
      audioTrack.enabled = true;
      audioTrack._setVolume(1);
    };

    channel = peer.createDataChannel('oai-events');
    channel.onmessage = (message: unknown) => {
      const data = (message as { data?: unknown }).data;
      if (typeof data !== 'string') return;
      try {
        onEvent(JSON.parse(data) as Parameters<typeof onEvent>[0]);
      } catch {
        // Ignore non-JSON WebRTC diagnostics.
      }
    };
    channel.onopen = () => {
      if (stopped) return;
      channel?.send(
        JSON.stringify({
          response: {
            instructions: starter,
            output_modalities: ['audio'],
          },
          type: 'response.create',
        }),
      );
    };
    channel.onerror = () => cleanup(true);
    channel.onclose = () => cleanup(true);
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        cleanup(true);
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForIceGathering(peer, signal);
    const sdp = peer.localDescription?.sdp;
    if (!sdp) throw new Error('Could not prepare the microphone connection.');

    const { answerSdp, close, expiresAt } = await createConversationRequest(
      sdp,
      track,
      {
        coachTone,
        goal,
        practice,
        unitId,
      },
      signal,
    );
    closeRemote = close;
    if (stopped || signal?.aborted) {
      void closeRemote?.().catch(() => undefined);
      throw new Error('Conversation start cancelled.');
    }
    const expires = expiresAt ? Date.parse(expiresAt) : NaN;
    durationTimer = setTimeout(
      () => cleanup(),
      Number.isFinite(expires) ? Math.max(0, Math.min(300_000, expires - Date.now())) : 300_000,
    );
    await peer.setRemoteDescription(new RTCSessionDescription({ sdp: answerSdp, type: 'answer' }));
    onStatus('listening');

    return {
      setMuted: (muted) => {
        if (microphoneTrack) microphoneTrack.enabled = !muted;
      },
      stop: () => cleanup(),
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}
