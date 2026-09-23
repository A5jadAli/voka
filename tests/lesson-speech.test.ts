import { act, renderHook } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Speech from 'expo-speech';
import { AppState, type AppStateStatus } from 'react-native';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));
jest.mock('expo-speech', () => ({
  stop: jest.fn(),
  speak: jest.fn(),
  getAvailableVoicesAsync: jest.fn(),
}));
let appStateChanged: (state: AppStateStatus) => void;
const voices = [
  { identifier: 'test-de', language: 'de-DE', name: 'German', quality: 'Default' },
] as Speech.Voice[];

beforeEach(() => {
  jest.mocked(Speech.stop).mockReset().mockResolvedValue(undefined);
  jest.mocked(Speech.speak).mockReset();
  jest.mocked(Speech.getAvailableVoicesAsync).mockReset().mockResolvedValue(voices);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
    appStateChanged = callback as typeof appStateChanged;
    return { remove: jest.fn() };
  });
});

describe('screen-owned lesson audio', () => {
  it('stops playing audio when the app backgrounds and when the screen leaves', async () => {
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    expect(Speech.speak).toHaveBeenCalledWith(
      'Hallo',
      expect.objectContaining({ voice: 'test-de' }),
    );
    expect(hook.result.current.playing).toBe(true);
    await act(() => appStateChanged('background'));
    expect(hook.result.current.playing).toBe(false);
    const stops = jest.mocked(Speech.stop).mock.calls.length;
    await hook.unmount();
    expect(Speech.stop).toHaveBeenCalledTimes(stops + 1);
  });
  it('does not start delayed audio after leaving', async () => {
    let finish!: (value: Speech.Voice[]) => void;
    jest.mocked(Speech.getAvailableVoicesAsync).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    let playing!: Promise<void>;
    await act(() => {
      playing = hook.result.current.play('Hallo');
    });
    await hook.unmount();
    finish(voices);
    await playing;
    expect(Speech.speak).not.toHaveBeenCalled();
  });
  it('explains missing language audio instead of silently using another language voice', async () => {
    jest.mocked(Speech.getAvailableVoicesAsync).mockResolvedValueOnce([]);
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    expect(hook.result.current.error).toContain('continue with the text');
    expect(Speech.speak).not.toHaveBeenCalled();
    await hook.unmount();
  });
  it('stops the remaining dialogue queue when speech reports an error', async () => {
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.playSequence(['Hallo', 'Guten Tag']);
    });
    const options = jest.mocked(Speech.speak).mock.calls[0][1];
    await act(() => options?.onError?.(new Error('Audio denied')));
    expect(hook.result.current.playing).toBe(false);
    expect(hook.result.current.error).toContain('Audio could not play');
    await hook.unmount();
  });
});
