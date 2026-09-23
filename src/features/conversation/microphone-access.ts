export type MicrophoneAccess = 'ready' | 'enabled' | 'denied' | 'blocked';

// Web and iOS request access through their media transport. Android has an
// explicit setup step because its permission activity can background Voka.
export async function prepareMicrophoneAccess(): Promise<MicrophoneAccess> {
  return 'ready';
}
