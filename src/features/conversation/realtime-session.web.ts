import { createConversationRequest } from './backend';
import type { RealtimeSessionHandle, StartRealtimeSessionOptions } from './realtime-types';

const ICE_TIMEOUT_MS = 10_000;

async function waitForIceGathering(peer: RTCPeerConnection) {
  if (peer.iceGatheringState === 'complete') return;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      peer.onicegatheringstatechange = null;
      reject(new Error('The voice connection timed out. Please check your internet connection.'));
    }, ICE_TIMEOUT_MS);
    peer.onicegatheringstatechange = () => {
      if (peer.iceGatheringState !== 'complete') return;
      window.clearTimeout(timeout);
      peer.onicegatheringstatechange = null;
      resolve();
    };
  });
}

export async function startRealtimeSession({
  onEvent,
  onStatus,
  goal,
  practice,
  starter,
  track,
  unitId,
}: StartRealtimeSessionOptions): Promise<RealtimeSessionHandle> {
  onStatus('connecting');
  const peer = new RTCPeerConnection();
  const audio = new Audio();
  audio.autoplay = true;
  let microphone: MediaStream | undefined;
  let stopped = false;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    microphone?.getTracks().forEach((trackItem) => trackItem.stop());
    audio.pause();
    audio.srcObject = null;
    peer.close();
    onStatus('ended');
  };

  try {
    microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
    const microphoneTrack = microphone.getAudioTracks()[0];
    if (!microphoneTrack) throw new Error('No microphone is available on this device.');
    peer.addTrack(microphoneTrack, microphone);
    peer.ontrack = (event) => {
      audio.srcObject = event.streams[0] ?? new MediaStream([event.track]);
      void audio.play().catch(() => onStatus('error'));
    };

    const channel = peer.createDataChannel('oai-events');
    channel.onmessage = (message) => {
      if (typeof message.data !== 'string') return;
      try {
        onEvent(JSON.parse(message.data) as Parameters<typeof onEvent>[0]);
      } catch {
        // Ignore non-JSON WebRTC diagnostics.
      }
    };
    channel.onopen = () => {
      channel.send(
        JSON.stringify({
          response: { instructions: starter, output_modalities: ['audio'] },
          type: 'response.create',
        }),
      );
    };
    channel.onerror = () => onStatus('error');

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForIceGathering(peer);
    const sdp = peer.localDescription?.sdp;
    if (!sdp) throw new Error('Could not prepare the microphone connection.');

    const { answerSdp } = await createConversationRequest(sdp, track, {
      goal,
      practice,
      unitId,
    });
    await peer.setRemoteDescription({ sdp: answerSdp, type: 'answer' });
    onStatus('listening');

    return {
      setMuted: (muted) => {
        microphoneTrack.enabled = !muted;
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
