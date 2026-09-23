import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { scopedLearningStorage } from '@/features/sync/scoped-storage';

type ProgressState = {
  completedScenarioIds: string[];
  hasHydrated: boolean;
  completeScenario: (scenarioId: string) => void;
  mergeCompletedScenarioIds: (scenarioIds: string[]) => void;
  resetProgress: () => void;
  setHasHydrated: (hydrated: boolean) => void;
};

type PersistedProgressState = Pick<ProgressState, 'completedScenarioIds'>;

export const useProgressStore = create<ProgressState>()(
  persist<ProgressState, [], [], PersistedProgressState>(
    (set) => ({
      completedScenarioIds: [],
      hasHydrated: false,
      completeScenario: (scenarioId) =>
        set((state) =>
          state.completedScenarioIds.includes(scenarioId)
            ? state
            : { completedScenarioIds: [...state.completedScenarioIds, scenarioId] },
        ),
      mergeCompletedScenarioIds: (scenarioIds) =>
        set((state) => ({
          completedScenarioIds: [...new Set([...state.completedScenarioIds, ...scenarioIds])],
        })),
      resetProgress: () => set({ completedScenarioIds: [] }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'voka-progress',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      partialize: (state) => ({ completedScenarioIds: state.completedScenarioIds }),
      skipHydration: true,
      storage: createJSONStorage(() => scopedLearningStorage.storage),
      version: 1,
    },
  ),
);
