import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProgressState = {
  completedScenarioIds: string[];
  completeScenario: (scenarioId: string) => void;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedScenarioIds: [],
      completeScenario: (scenarioId) =>
        set((state) =>
          state.completedScenarioIds.includes(scenarioId)
            ? state
            : { completedScenarioIds: [...state.completedScenarioIds, scenarioId] },
        ),
    }),
    {
      name: 'voka-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
