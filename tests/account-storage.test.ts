import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createScopedStorage, scopedLearningStorage } from '@/features/sync/scoped-storage';
import { activateLearningScope } from '@/features/sync/learning-scope';
import { useCoachingStore } from '@/features/coaching/store';
import { useProgressStore } from '@/features/progress/store';
import { freshFoundationEntry } from '@/features/foundations/progress';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await scopedLearningStorage.flush();
  await AsyncStorage.clear();
});

describe('account-local learning storage', () => {
  it('keeps offline progress separate and restores it after signing back in', async () => {
    await activateLearningScope('account-a');
    useCoachingStore.getState().setTestDate('2026-12-01');
    useProgressStore.getState().completeScenario('coffee-run');
    useCoachingStore
      .getState()
      .saveFoundation('greetings', { ...freshFoundationEntry(), draft: 'private draft' });
    await activateLearningScope('guest');
    expect(useCoachingStore.getState().testDate).toBeNull();
    expect(useProgressStore.getState().completedScenarioIds).toEqual([]);
    expect(useCoachingStore.getState().foundations).toEqual({});
    useCoachingStore.getState().setTestDate('2027-01-01');
    await activateLearningScope('account-b');
    expect(useCoachingStore.getState().testDate).toBeNull();
    expect(useProgressStore.getState().completedScenarioIds).toEqual([]);
    await activateLearningScope('account-a');
    expect(useCoachingStore.getState().testDate).toBe('2026-12-01');
    expect(useProgressStore.getState().completedScenarioIds).toEqual(['coffee-run']);
    expect(useCoachingStore.getState().foundations.greetings.draft).toBe('private draft');
    await activateLearningScope('guest');
    expect(useCoachingStore.getState().testDate).toBe('2027-01-01');
  });

  it('does not reassign a queued write when the selected account changes', async () => {
    const scoped = createScopedStorage(AsyncStorage);
    scoped.selectScope('a');
    scoped.pauseWrites(false);
    const pending = scoped.storage.setItem('voka-progress', 'private-a');
    scoped.selectScope('b');
    await pending;
    expect(await scoped.storage.getItem('voka-progress')).toBeNull();
    scoped.selectScope('a');
    expect(await scoped.storage.getItem('voka-progress')).toBe('private-a');
  });

  it('does not resurrect a deleted account through a pending failed write', async () => {
    const scoped = createScopedStorage({
      ...AsyncStorage,
      setItem: async () => {
        throw new Error('Disk full');
      },
    });
    scoped.selectScope('deleted-account');
    scoped.pauseWrites(false);
    await scoped.storage.setItem('voka-coaching', 'unsaved-private-data');
    await scoped.clearScope('deleted-account');
    await expect(scoped.flush()).resolves.toBeUndefined();
  });

  it('preserves unowned legacy data for recovery, never silently assigns it to an account', async () => {
    await AsyncStorage.setItem('voka-coaching', 'legacy-offline-data');
    const scoped = createScopedStorage(AsyncStorage);
    await scoped.migrateLegacy('account-b');
    scoped.selectScope('account-b');
    expect(await scoped.storage.getItem('voka-coaching')).toBeNull();
    scoped.selectScope('legacy-unassigned');
    expect(await scoped.storage.getItem('voka-coaching')).toBe('legacy-offline-data');
  });

  it('migrates known legacy data only to its recorded owner', async () => {
    await AsyncStorage.setItem('@voka/cloud-state-owner', 'account-a');
    await AsyncStorage.setItem('voka-coaching', 'private-a');
    const scoped = createScopedStorage(AsyncStorage);
    await scoped.migrateLegacy('account-b');
    scoped.selectScope('account-b');
    expect(await scoped.storage.getItem('voka-coaching')).toBeNull();
    scoped.selectScope('account-a');
    expect(await scoped.storage.getItem('voka-coaching')).toBe('private-a');
    await scoped.clearScope('account-a');
    expect(await scoped.storage.getItem('voka-coaching')).toBeNull();
    expect(await AsyncStorage.getItem('voka-coaching')).toBeNull();
  });
});
