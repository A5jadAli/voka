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

async function waitForIceGathering(peer: RTCPeerConnection) {
  if (peer.iceGatheringState === 'complete') return;

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      peer.onicegatheringstatechange = null;
      reject(new Error('The voice connection timed out. Please check your internet connection.'));
    }, ICE_TIMEOUT_MS);

    peer.onicegatheringstatechange = () => {
      if (peer.iceGatheringState !== 'complete') return;
      clearTimeout(timeout);
      peer.onicegatheringstatechange = null;
      resolve();
    };
  });
}

export async function startRealtimeSession({
  onEvent,
  onStatus,
  starter,
  track,
}: StartRealtimeSessionOptions): Promise<RealtimeSessionHandle> {
  onStatus('connecting');
  const peer = new RTCPeerConnection({});
  let microphone: MediaStream | undefined;
  let microphoneTrack: MediaStreamTrack | undefined;
  let stopped = false;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    microphone?.getTracks().forEach((trackItem) => trackItem.stop());
    peer.close();
    onStatus('ended');
  };

  try {
    microphone = await mediaDevices.getUserMedia({ audio: true, video: false });
    microphoneTrack = microphone.getAudioTracks()[0];
    if (!microphoneTrack) throw new Error('No microphone is available on this device.');
    peer.addTrack(microphoneTrack, microphone);

    const channel = peer.createDataChannel('oai-events');
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
      channel.send(
        JSON.stringify({
          response: {
            instructions: starter,
            output_modalities: ['audio'],
          },
          type: 'response.create',
        }),
      );
    };
    channel.onerror = () => onStatus('error');
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        onStatus('error');
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForIceGathering(peer);
    const sdp = peer.localDescription?.sdp;
    if (!sdp) throw new Error('Could not prepare the microphone connection.');

    const { answerSdp } = await createConversationRequest(sdp, track);
    await peer.setRemoteDescription(new RTCSessionDescription({ sdp: answerSdp, type: 'answer' }));
    onStatus('listening');

    return {
      setMuted: (muted) => {
        if (microphoneTrack) microphoneTrack.enabled = !muted;
      },
      stop: () => {
        if (channel.readyState === 'open') channel.send(JSON.stringify({ type: 'session.close' }));
        channel.close();
        cleanup();
      },
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}
