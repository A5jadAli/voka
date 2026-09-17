import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LanguageTrack } from '@/features/listening/scenarios';

import { mergeCoachingSignal } from './signals';
import type { CoachingSignal } from './store-types';

export type { CoachingSignal } from './store-types';

export type SpeakingGoal = 'everyday' | 'interviews' | 'work-study';
export type CoachTone = 'adaptive' | 'supportive' | 'tough';

export type SpeakingPreferences = {
  DE: { goal: SpeakingGoal; reference: 'de-DE' };
  EN: { goal: SpeakingGoal; reference: 'en-GB' };
};

const defaultPreferences: SpeakingPreferences = {
  DE: { goal: 'everyday', reference: 'de-DE' },
  EN: { goal: 'interviews', reference: 'en-GB' },
};

type CoachingState = {
  avatarUri: string | null;
  coachTone: CoachTone;
  completedUnitIds: string[];
  hasHydrated: boolean;
  preferences: SpeakingPreferences;
  signals: CoachingSignal[];
  speakingPracticeDates: string[];
  completeUnit: (unitId: string) => void;
  recordSpeakingPractice: () => void;
  recordSignal: (signal: Omit<CoachingSignal, 'count' | 'lastSeenAt'>) => void;
  setAvatarUri: (uri: string | null) => void;
  setCoachTone: (tone: CoachTone) => void;
  setGoal: (track: LanguageTrack, goal: SpeakingGoal) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useCoachingStore = create<CoachingState>()(
  persist(
    (set) => ({
      avatarUri: null,
      coachTone: 'supportive',
      completedUnitIds: [],
      hasHydrated: false,
      preferences: defaultPreferences,
      signals: [],
      speakingPracticeDates: [],
      completeUnit: (unitId) =>
        set((state) =>
          state.completedUnitIds.includes(unitId)
            ? state
            : { completedUnitIds: [...state.completedUnitIds, unitId] },
        ),
      recordSignal: (signal) =>
        set((state) => ({ signals: mergeCoachingSignal(state.signals, signal) })),
      recordSpeakingPractice: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          return state.speakingPracticeDates.includes(today)
            ? state
            : { speakingPracticeDates: [...state.speakingPracticeDates, today].slice(-30) };
        }),
      setAvatarUri: (avatarUri) => set({ avatarUri }),
      setCoachTone: (coachTone) => set({ coachTone }),
      setGoal: (track, goal) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [track]: { ...state.preferences[track], goal },
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'voka-coaching',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const speakingGoalCopy: Record<SpeakingGoal, { description: string; label: string }> = {
  everyday: {
    description: 'Fast, practical exchanges with less translation in your head.',
    label: 'Everyday life',
  },
  interviews: {
    description: 'Natural answers, modern phrasing and confident follow-up questions.',
    label: 'Interviews',
  },
  'work-study': {
    description: 'Clear explanations, discussion and professional register.',
    label: 'Work & study',
  },
};
