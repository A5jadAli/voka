import type { LanguageTrack } from '@/features/listening/scenarios';

export type CoachingSignal = {
  count: number;
  focus: string;
  label: string;
  lastSeenAt: string;
  reason: string;
  track: LanguageTrack;
};
