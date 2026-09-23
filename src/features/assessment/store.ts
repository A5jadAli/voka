import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LanguageTrack } from '@/features/listening/scenarios';
import { scopedLearningStorage } from '@/features/sync/scoped-storage';

import type { SpokenAssessment } from './types';

export type AssessmentsByTrack = Partial<Record<LanguageTrack, SpokenAssessment>>;

type AssessmentState = {
  hasHydrated: boolean;
  assessments: AssessmentsByTrack;
  mergeAssessment: (assessment: SpokenAssessment | null) => void;
  mergeAssessments: (assessments: AssessmentsByTrack) => void;
  resetAssessment: () => void;
  setHasHydrated: (hydrated: boolean) => void;
};

type PersistedAssessmentState = Pick<AssessmentState, 'assessments'>;

function newest(current: SpokenAssessment | undefined, incoming: SpokenAssessment | undefined) {
  if (!incoming) return current;
  if (!current || Date.parse(incoming.createdAt) > Date.parse(current.createdAt)) return incoming;
  return current;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist<AssessmentState, [], [], PersistedAssessmentState>(
    (set) => ({
      hasHydrated: false,
      assessments: {},
      mergeAssessment: (assessment) =>
        set((state) => {
          if (!assessment) return state;
          const next = newest(state.assessments[assessment.track], assessment);
          return next === state.assessments[assessment.track]
            ? state
            : { assessments: { ...state.assessments, [assessment.track]: next } };
        }),
      mergeAssessments: (incoming) =>
        set((state) => ({
          assessments: {
            DE: newest(state.assessments.DE, incoming.DE),
            EN: newest(state.assessments.EN, incoming.EN),
          },
        })),
      resetAssessment: () => set({ assessments: {} }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'voka-assessment',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      partialize: (state) => ({ assessments: state.assessments }),
      skipHydration: true,
      storage: createJSONStorage(() => scopedLearningStorage.storage),
      version: 2,
    },
  ),
);
