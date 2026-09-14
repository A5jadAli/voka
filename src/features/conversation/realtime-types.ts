import type { LanguageTrack } from '@/features/listening/scenarios';

import type { RealtimeEvent } from './events';

export type RealtimeSessionStatus =
  'connecting' | 'ended' | 'error' | 'listening' | 'speaking' | 'thinking';

export type StartRealtimeSessionOptions = {
  onEvent: (event: RealtimeEvent) => void;
  onStatus: (status: RealtimeSessionStatus) => void;
  starter: string;
  track: LanguageTrack;
};

export type RealtimeSessionHandle = {
  setMuted: (muted: boolean) => void;
  stop: () => void;
};
