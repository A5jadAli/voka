import type { LanguageTrack } from '@/features/listening/scenarios';
import type { SpeakingGoal } from '@/features/coaching/store';

import type { RealtimeEvent } from './events';

export type RealtimeSessionStatus =
  'connecting' | 'ended' | 'error' | 'listening' | 'speaking' | 'thinking';

export type StartRealtimeSessionOptions = {
  goal: SpeakingGoal;
  onEvent: (event: RealtimeEvent) => void;
  onStatus: (status: RealtimeSessionStatus) => void;
  practice: 'conversation' | 'diagnostic';
  signal?: AbortSignal;
  starter: string;
  track: LanguageTrack;
  unitId?: string;
};

export type RealtimeSessionHandle = {
  setMuted: (muted: boolean) => void;
  stop: () => void;
};
