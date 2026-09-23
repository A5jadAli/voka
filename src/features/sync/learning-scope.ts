import { useAssessmentStore } from '@/features/assessment/store';
import { useCoachingStore } from '@/features/coaching/store';
import { useProgressStore } from '@/features/progress/store';
import { scopedLearningStorage } from './scoped-storage';

let transitions: Promise<unknown> = Promise.resolve();
export function activateLearningScope(scope: string) {
  const transition = transitions
    .catch(() => undefined)
    .then(async () => {
      await scopedLearningStorage.flush();
      scopedLearningStorage.pauseWrites(true);
      await scopedLearningStorage.migrateLegacy(scope);
      const hasLocalData = await scopedLearningStorage.hasLearningData(scope);
      scopedLearningStorage.selectScope(scope);
      useProgressStore.getState().resetProgress();
      useCoachingStore.getState().resetCoaching();
      useAssessmentStore.getState().resetAssessment();
      useProgressStore.getState().setHasHydrated(false);
      useCoachingStore.getState().setHasHydrated(false);
      useAssessmentStore.getState().setHasHydrated(false);
      await Promise.all([
        useProgressStore.persist.rehydrate(),
        useCoachingStore.persist.rehydrate(),
        useAssessmentStore.persist.rehydrate(),
      ]);
      if (
        !useProgressStore.getState().hasHydrated ||
        !useCoachingStore.getState().hasHydrated ||
        !useAssessmentStore.getState().hasHydrated
      ) {
        throw new Error('Your saved learning data could not be opened. Please try again.');
      }
      scopedLearningStorage.pauseWrites(false);
      return { hasLocalData };
    });
  transitions = transition;
  return transition;
}
