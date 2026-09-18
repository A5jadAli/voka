import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAssessmentStore } from '@/features/assessment/store';
import { useAuthSession } from '@/features/auth/use-auth-session';
import { useCoachingStore } from '@/features/coaching/store';
import { useProgressStore } from '@/features/progress/store';

import { loadLearningCloudState, saveLearningCloudState } from './cloud-state';

const CLOUD_OWNER_KEY = '@voka/cloud-state-owner';
const SYNC_DEBOUNCE_MS = 750;

function resetLocalLearningState() {
  useProgressStore.getState().resetProgress();
  useCoachingStore.getState().resetCoaching();
  useAssessmentStore.getState().resetAssessment();
}

function currentLearningState() {
  const progress = useProgressStore.getState();
  const coaching = useCoachingStore.getState();
  return {
    assessments: useAssessmentStore.getState().assessments,
    coachTone: coaching.coachTone,
    completedScenarioIds: progress.completedScenarioIds,
    completedUnitIds: coaching.completedUnitIds,
    preferences: coaching.preferences,
    signals: coaching.signals,
    speakingPracticeDates: coaching.speakingPracticeDates,
    testDate: coaching.testDate,
  };
}

export function useCloudSync() {
  const { loading, session } = useAuthSession();
  const assessmentHydrated = useAssessmentStore((state) => state.hasHydrated);
  const coachingHydrated = useCoachingStore((state) => state.hasHydrated);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);

  useEffect(() => {
    if (loading || !assessmentHydrated || !coachingHydrated || !progressHydrated) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribers: (() => void)[] = [];
    const permanentUserId = session && !session.user.is_anonymous ? session.user.id : null;

    const run = async () => {
      const previousOwner = await AsyncStorage.getItem(CLOUD_OWNER_KEY);
      if (cancelled) return;

      if (!permanentUserId) {
        if (previousOwner) {
          resetLocalLearningState();
          await AsyncStorage.removeItem(CLOUD_OWNER_KEY);
        }
        return;
      }

      if (previousOwner && previousOwner !== permanentUserId) resetLocalLearningState();

      try {
        const cloud = await loadLearningCloudState(permanentUserId);
        if (cancelled) return;
        if (cloud) {
          useProgressStore.getState().mergeCompletedScenarioIds(cloud.completedScenarioIds);
          useCoachingStore.getState().mergeCloudState(cloud);
          useAssessmentStore.getState().mergeAssessments(cloud.assessments);
        }
        await saveLearningCloudState(permanentUserId, currentLearningState());
        await AsyncStorage.setItem(CLOUD_OWNER_KEY, permanentUserId);
      } catch {
        // Local state remains authoritative while offline and will retry after the next auth event.
      }
      if (cancelled) return;

      const scheduleUpload = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          void saveLearningCloudState(permanentUserId, currentLearningState()).catch(() => {
            // Keep local changes for a later retry when the network is available.
          });
        }, SYNC_DEBOUNCE_MS);
      };
      const appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') scheduleUpload();
      });
      unsubscribers = [
        useProgressStore.subscribe(scheduleUpload),
        useCoachingStore.subscribe(scheduleUpload),
        useAssessmentStore.subscribe(scheduleUpload),
        () => appStateSubscription.remove(),
      ];
    };

    void run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [assessmentHydrated, coachingHydrated, loading, progressHydrated, session]);
}
