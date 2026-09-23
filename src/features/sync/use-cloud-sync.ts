import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useAssessmentStore } from '@/features/assessment/store';
import { useAuthSession } from '@/features/auth/use-auth-session';
import { useCoachingStore } from '@/features/coaching/store';
import { useProgressStore } from '@/features/progress/store';

import { loadLearningCloudState, saveLearningCloudState } from './cloud-state';
import { activateLearningScope } from './learning-scope';
import { GUEST_SCOPE, scopedLearningStorage } from './scoped-storage';
import { useSyncStatus } from './status';

function currentLearningState() {
  const coaching = useCoachingStore.getState();
  return {
    writing: coaching.writing,
    foundations: coaching.foundations,
    assessments: useAssessmentStore.getState().assessments,
    coachTone: coaching.coachTone,
    completedScenarioIds: useProgressStore.getState().completedScenarioIds,
    completedUnitIds: coaching.completedUnitIds,
    preferences: coaching.preferences,
    signals: coaching.signals,
    speakingPracticeDates: coaching.speakingPracticeDates,
    testDate: coaching.testDate,
    writingPracticeDates: coaching.writingPracticeDates,
  };
}

export function useCloudSync() {
  const { loading, session } = useAuthSession();
  const scope = session && !session.user.is_anonymous ? session.user.id : GUEST_SCOPE;
  const [attempt, setAttempt] = useState(0);
  const requestKey = useMemo(() => ({ scope, attempt }), [scope, attempt]);
  const [preparedRequest, setPreparedRequest] = useState<typeof requestKey | null>(null);
  const [failure, setFailure] = useState<{ request: typeof requestKey; message: string } | null>(
    null,
  );
  const localError = failure?.request === requestKey ? failure.message : '';

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribers: (() => void)[] = [];
    let revision = 0;
    let merging = false;
    let inFlight = false;
    let rerun = false;
    let cloudLoaded = false;
    let retryDelay = 5_000;
    let dirty = false;

    const schedule = (delay = 750) => {
      if (cancelled) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void sync(), delay);
    };
    const sync = async () => {
      if (cancelled) return;
      if (inFlight) {
        rerun = true;
        return;
      }
      inFlight = true;
      useSyncStatus.setState({ status: 'syncing' });
      try {
        if (!cloudLoaded) {
          const cloud = await loadLearningCloudState(scope);
          if (cancelled) return;
          if (cloud) {
            merging = true;
            useProgressStore.getState().mergeCompletedScenarioIds(cloud.completedScenarioIds);
            useCoachingStore.getState().mergeCloudState({
              ...cloud,
              ...(dirty
                ? {
                    coachTone: useCoachingStore.getState().coachTone,
                    preferences: useCoachingStore.getState().preferences,
                    testDate: useCoachingStore.getState().testDate,
                  }
                : {}),
            });
            useAssessmentStore.getState().mergeAssessments(cloud.assessments);
            merging = false;
          }
          cloudLoaded = true;
        }
        const sentRevision = revision;
        const snapshot = currentLearningState();
        await scopedLearningStorage.flush();
        if (cancelled) return;
        await saveLearningCloudState(scope, snapshot);
        if (cancelled) return;
        retryDelay = 5_000;
        if (revision === sentRevision) {
          dirty = false;
          await scopedLearningStorage.storage.setItem('sync-pending', 'clean');
          if (!cancelled) useSyncStatus.setState({ status: 'synced' });
        } else rerun = true;
      } catch {
        merging = false;
        if (!cancelled) {
          useSyncStatus.setState({ status: 'offline' });
          schedule(retryDelay);
          retryDelay = Math.min(retryDelay * 2, 60_000);
        }
      } finally {
        inFlight = false;
        if (rerun && !cancelled) {
          rerun = false;
          schedule();
        }
      }
    };

    const run = async () => {
      try {
        const { hasLocalData } = await activateLearningScope(scope);
        if (cancelled) return;
        if (scope === GUEST_SCOPE) {
          setPreparedRequest(requestKey);
          useSyncStatus.setState({ status: 'local', retry: () => {} });
          return;
        }
        const marker = await scopedLearningStorage.storage.getItem('sync-pending');
        if (cancelled) return;
        dirty = marker === 'pending' || (marker !== 'clean' && hasLocalData);
        const changed = () => {
          if (cancelled || merging) return;
          revision += 1;
          dirty = true;
          void scopedLearningStorage.storage.setItem('sync-pending', 'pending');
          schedule();
        };
        const subscription = AppState.addEventListener('change', (next) => {
          if (next === 'active') schedule(0);
        });
        unsubscribers = [
          useProgressStore.subscribe(changed),
          useCoachingStore.subscribe(changed),
          useAssessmentStore.subscribe(changed),
          () => subscription.remove(),
        ];
        useSyncStatus.setState({ retry: () => schedule(0) });
        setPreparedRequest(requestKey);
        void sync();
      } catch {
        if (!cancelled)
          setFailure({
            request: requestKey,
            message: 'Your saved learning data could not be opened. Please retry.',
          });
      }
    };
    void run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [loading, requestKey, scope]);

  return {
    scope,
    ready: !loading && preparedRequest === requestKey && !localError,
    localError,
    retry: () => setAttempt((value) => value + 1),
  };
}
