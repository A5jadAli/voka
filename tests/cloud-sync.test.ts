import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCloudSync } from '@/features/sync/use-cloud-sync';
import {
  loadLearningCloudState,
  saveLearningCloudState,
  type LearningCloudState,
} from '@/features/sync/cloud-state';
import { useCoachingStore } from '@/features/coaching/store';
import { useSyncStatus } from '@/features/sync/status';
import { scopedLearningStorage } from '@/features/sync/scoped-storage';

let mockSession: { user: { id: string; is_anonymous: boolean } } | null = null;
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/features/auth/use-auth-session', () => ({
  useAuthSession: () => ({ loading: false, session: mockSession }),
}));
jest.mock('@/features/sync/cloud-state', () => ({
  loadLearningCloudState: jest.fn(),
  saveLearningCloudState: jest.fn(),
}));

beforeEach(async () => {
  await scopedLearningStorage.flush();
  await AsyncStorage.clear();
  jest.mocked(loadLearningCloudState).mockReset().mockResolvedValue(null);
  jest.mocked(saveLearningCloudState).mockReset().mockResolvedValue(undefined);
  mockSession = { user: { id: 'account-a', is_anonymous: false } };
});

describe('cloud sync ownership and failures', () => {
  it('keeps failed-first-sync data out of the next account and restores it to the original account', async () => {
    jest.mocked(loadLearningCloudState).mockRejectedValueOnce(new Error('Offline'));
    const hook = await renderHook(() => useCloudSync());
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    await waitFor(() => expect(useSyncStatus.getState().status).toBe('offline'));
    await act(() => useCoachingStore.getState().setTestDate('2026-12-01'));
    mockSession = null;
    await hook.rerender(undefined);
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(useCoachingStore.getState().testDate).toBeNull();
    mockSession = { user: { id: 'account-b', is_anonymous: false } };
    await hook.rerender(undefined);
    await waitFor(() =>
      expect(saveLearningCloudState).toHaveBeenCalledWith(
        'account-b',
        expect.objectContaining({ testDate: null }),
      ),
    );
    mockSession = { user: { id: 'account-a', is_anonymous: false } };
    await hook.rerender(undefined);
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(useCoachingStore.getState().testDate).toBe('2026-12-01');
    await hook.unmount();
  });

  it('ignores an old account cloud response arriving after a switch', async () => {
    let resolveA!: (value: LearningCloudState) => void;
    const delayed = new Promise<LearningCloudState>((resolve) => {
      resolveA = resolve;
    });
    jest
      .mocked(loadLearningCloudState)
      .mockImplementation(async (owner) => (owner === 'account-a' ? delayed : null));
    const hook = await renderHook(() => useCloudSync());
    await waitFor(() => expect(loadLearningCloudState).toHaveBeenCalledWith('account-a'));
    mockSession = { user: { id: 'account-b', is_anonymous: false } };
    await hook.rerender(undefined);
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    await act(() =>
      resolveA({
        foundations: {},
        writing: {},
        assessments: {},
        coachTone: 'tough',
        completedScenarioIds: [],
        completedUnitIds: [],
        preferences: {
          DE: { goal: 'everyday', reference: 'de-DE' },
          EN: { goal: 'interviews', reference: 'en-GB' },
        },
        signals: [],
        speakingPracticeDates: [],
        testDate: '2027-01-01',
        writingPracticeDates: [],
      }),
    );
    expect(useCoachingStore.getState().testDate).toBeNull();
    expect(useCoachingStore.getState().coachTone).toBe('supportive');
    expect(
      jest.mocked(saveLearningCloudState).mock.calls.filter(([owner]) => owner === 'account-a'),
    ).toHaveLength(0);
    await hook.unmount();
  });

  it('exposes retry and never uploads an empty replacement while the initial cloud read fails', async () => {
    jest.mocked(loadLearningCloudState).mockRejectedValueOnce(new Error('Offline'));
    const hook = await renderHook(() => useCloudSync());
    await waitFor(() => expect(useSyncStatus.getState().status).toBe('offline'));
    expect(saveLearningCloudState).not.toHaveBeenCalled();
    await act(() => useSyncStatus.getState().retry());
    await waitFor(() => expect(useSyncStatus.getState().status).toBe('synced'));
    expect(saveLearningCloudState).toHaveBeenCalledTimes(1);
    await hook.unmount();
  });
});
