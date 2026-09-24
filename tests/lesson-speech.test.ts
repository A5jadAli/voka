import { act, renderHook } from '@testing-library/react-native';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
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
afterEach(() => {
  jest.useRealTimers();
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
    expect(hook.result.current.loading).toBe(true);
    await act(() => jest.mocked(Speech.speak).mock.calls[0][1]?.onStart?.());
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
    jest.mocked(Speech.getAvailableVoicesAsync).mockResolvedValue([]);
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

  it('immediately shows preparation, reuses the warmed voice and clears on completion', async () => {
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    expect(Speech.speak).not.toHaveBeenCalled();
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    expect(hook.result.current.loading).toBe(true);
    expect(hook.result.current.activeText).toBe('Hallo');
    expect(hook.result.current.playing).toBe(false);
    await act(() => jest.mocked(Speech.speak).mock.calls[0][1]?.onStart?.());
    expect(hook.result.current.playing).toBe(true);
    await act(() => jest.mocked(Speech.speak).mock.calls[0][1]?.onDone?.());
    expect(hook.result.current.busy).toBe(false);
    await act(async () => {
      await hook.result.current.play('Guten Tag', 0.65);
    });
    expect(Speech.getAvailableVoicesAsync).toHaveBeenCalledTimes(1);
    expect(hook.result.current.activeRate).toBe(0.65);
    await hook.unmount();
  });

  it('cancels during preparation and ignores a late voice result', async () => {
    let finish!: (value: Speech.Voice[]) => void;
    jest.mocked(Speech.getAvailableVoicesAsync).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    let request!: Promise<void>;
    await act(() => {
      request = hook.result.current.play('Hallo');
    });
    expect(hook.result.current.loading).toBe(true);
    await act(() => hook.result.current.stop());
    expect(hook.result.current.busy).toBe(false);
    await act(async () => {
      finish(voices);
      await request;
    });
    expect(Speech.speak).not.toHaveBeenCalled();
    await hook.unmount();
  });

  it('does not let an older playback callback change the new selection', async () => {
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    const old = jest.mocked(Speech.speak).mock.calls[0][1];
    await act(async () => {
      await hook.result.current.play('Guten Tag');
    });
    await act(() => {
      old?.onStart?.();
      old?.onStopped?.();
      old?.onError?.(new Error('Late error'));
    });
    expect(hook.result.current.activeText).toBe('Guten Tag');
    expect(hook.result.current.loading).toBe(true);
    expect(hook.result.current.error).toBe('');
    await hook.unmount();
  });

  it('times out a silent engine, stays retryable and ignores its late start', async () => {
    jest.useFakeTimers();
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    const late = jest.mocked(Speech.speak).mock.calls[0][1];
    await act(() => jest.advanceTimersByTime(8000));
    expect(hook.result.current.busy).toBe(false);
    expect(hook.result.current.error).toContain('too long');
    await act(() => late?.onStart?.());
    expect(hook.result.current.busy).toBe(false);
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    expect(hook.result.current.loading).toBe(true);
    expect(hook.result.current.error).toBe('');
    await hook.unmount();
  });

  it('waits for the final dialogue line and uses its actual start for subtitles', async () => {
    const onLine = jest.fn();
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.playSequence(['Hallo', 'Danke'], 0.82, onLine);
    });
    const [first, last] = jest.mocked(Speech.speak).mock.calls.map((call) => call[1]);
    await act(() => {
      first?.onStart?.();
      first?.onDone?.();
    });
    expect(hook.result.current.playing).toBe(true);
    await act(() => last?.onStart?.());
    expect(onLine).toHaveBeenLastCalledWith(1);
    expect(hook.result.current.activeText).toBe('Danke');
    await act(() => last?.onDone?.());
    expect(hook.result.current.busy).toBe(false);
    await hook.unmount();
  });

  it('shows preparation even while the previous native stop is pending', async () => {
    let stopped!: () => void;
    jest.mocked(Speech.stop).mockReturnValueOnce(
      new Promise((resolve) => {
        stopped = resolve;
      }),
    );
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    let request!: Promise<void>;
    await act(() => {
      request = hook.result.current.play('Hallo');
    });
    expect(hook.result.current.loading).toBe(true);
    expect(Speech.speak).not.toHaveBeenCalled();
    await act(() => hook.result.current.stop());
    await act(async () => {
      stopped();
      await request;
    });
    expect(Speech.speak).not.toHaveBeenCalled();
    expect(hook.result.current.busy).toBe(false);
    await hook.unmount();
  });

  it('refreshes a missing voice on retry without reopening the lesson', async () => {
    jest.mocked(Speech.getAvailableVoicesAsync).mockResolvedValue([]);
    const hook = await renderHook(() => useLessonSpeech('de-DE'));
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    expect(hook.result.current.error).not.toBe('');
    jest.mocked(Speech.getAvailableVoicesAsync).mockResolvedValue(voices);
    await act(async () => {
      await hook.result.current.play('Hallo');
    });
    expect(hook.result.current.error).toBe('');
    expect(Speech.speak).toHaveBeenCalledWith(
      'Hallo',
      expect.objectContaining({ voice: 'test-de' }),
    );
    await hook.unmount();
  });
});
