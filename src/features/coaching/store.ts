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
  coachTone: CoachTone;
  completedUnitIds: string[];
  hasHydrated: boolean;
  preferences: SpeakingPreferences;
  signals: CoachingSignal[];
  speakingPracticeDates: string[];
  testDate: string | null;
  writingPracticeDates: string[];
  completeUnit: (unitId: string) => void;
  mergeCloudState: (state: Partial<PersistedCoachingState>) => void;
  recordSpeakingPractice: () => void;
  recordWritingPractice: () => void;
  recordSignal: (signal: Omit<CoachingSignal, 'count' | 'lastSeenAt'>) => void;
  resetCoaching: () => void;
  setCoachTone: (tone: CoachTone) => void;
  setGoal: (track: LanguageTrack, goal: SpeakingGoal) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setTestDate: (date: string | null) => void;
};

export type PersistedCoachingState = Pick<
  CoachingState,
  | 'coachTone'
  | 'completedUnitIds'
  | 'preferences'
  | 'signals'
  | 'speakingPracticeDates'
  | 'testDate'
  | 'writingPracticeDates'
>;

function mergePersistedSignals(local: CoachingSignal[], remote: CoachingSignal[]) {
  const merged = new Map<string, CoachingSignal>();
  for (const signal of [...local, ...remote]) {
    const key = `${signal.track}:${signal.label}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, signal);
      continue;
    }
    const incomingIsNewer = Date.parse(signal.lastSeenAt) > Date.parse(current.lastSeenAt);
    merged.set(key, {
      ...(incomingIsNewer ? signal : current),
      count: Math.max(current.count, signal.count),
      lastSeenAt: incomingIsNewer ? signal.lastSeenAt : current.lastSeenAt,
    });
  }
  return [...merged.values()]
    .sort((a, b) => Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt))
    .slice(0, 12);
}

export const useCoachingStore = create<CoachingState>()(
  persist<CoachingState, [], [], PersistedCoachingState>(
    (set) => ({
      coachTone: 'supportive',
      completedUnitIds: [],
      hasHydrated: false,
      preferences: defaultPreferences,
      signals: [],
      speakingPracticeDates: [],
      testDate: null,
      writingPracticeDates: [],
      completeUnit: (unitId) =>
        set((state) =>
          state.completedUnitIds.includes(unitId)
            ? state
            : { completedUnitIds: [...state.completedUnitIds, unitId] },
        ),
      mergeCloudState: (cloud) =>
        set((state) => ({
          coachTone: cloud.coachTone ?? state.coachTone,
          completedUnitIds: [
            ...new Set([...state.completedUnitIds, ...(cloud.completedUnitIds ?? [])]),
          ],
          preferences: cloud.preferences ?? state.preferences,
          signals: mergePersistedSignals(state.signals, cloud.signals ?? []),
          speakingPracticeDates: [
            ...new Set([...state.speakingPracticeDates, ...(cloud.speakingPracticeDates ?? [])]),
          ]
            .sort()
            .slice(-30),
          testDate: cloud.testDate === undefined ? state.testDate : cloud.testDate,
          writingPracticeDates: [
            ...new Set([...state.writingPracticeDates, ...(cloud.writingPracticeDates ?? [])]),
          ]
            .sort()
            .slice(-30),
        })),
      recordSignal: (signal) =>
        set((state) => ({ signals: mergeCoachingSignal(state.signals, signal) })),
      recordSpeakingPractice: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          return state.speakingPracticeDates.includes(today)
            ? state
            : { speakingPracticeDates: [...state.speakingPracticeDates, today].slice(-30) };
        }),
      recordWritingPractice: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          return state.writingPracticeDates.includes(today)
            ? state
            : { writingPracticeDates: [...state.writingPracticeDates, today].slice(-30) };
        }),
      resetCoaching: () =>
        set({
          coachTone: 'supportive',
          completedUnitIds: [],
          preferences: defaultPreferences,
          signals: [],
          speakingPracticeDates: [],
          testDate: null,
          writingPracticeDates: [],
        }),
      setCoachTone: (coachTone) => set({ coachTone }),
      setGoal: (track, goal) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [track]: { ...state.preferences[track], goal },
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTestDate: (testDate) => set({ testDate }),
    }),
    {
      migrate: (persistedState) => {
        const state = persistedState as Partial<PersistedCoachingState>;
        return {
          coachTone: state.coachTone ?? 'supportive',
          completedUnitIds: state.completedUnitIds ?? [],
          preferences: state.preferences ?? defaultPreferences,
          signals: state.signals ?? [],
          speakingPracticeDates: state.speakingPracticeDates ?? [],
          testDate: state.testDate ?? null,
          writingPracticeDates: state.writingPracticeDates ?? [],
        };
      },
      name: 'voka-coaching',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      partialize: (state) => ({
        coachTone: state.coachTone,
        completedUnitIds: state.completedUnitIds,
        preferences: state.preferences,
        signals: state.signals,
        speakingPracticeDates: state.speakingPracticeDates,
        testDate: state.testDate,
        writingPracticeDates: state.writingPracticeDates,
      }),
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
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
