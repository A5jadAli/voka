import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

type Phase = 'idle' | 'loading' | 'playing';
const audioError = 'Audio could not play. Try again or continue with the text.';

/** Screen-owned audio: late callbacks cannot start or change playback after leaving. */
export function useLessonSpeech(language: string) {
  const token = useRef(0);
  const focused = useRef<string | null>(null);
  const startupTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const voiceRequest = useRef<Promise<Speech.Voice | undefined> | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeText, setActiveText] = useState('');
  const [activeRate, setActiveRate] = useState(0.82);
  const [error, setError] = useState('');
  const clearStartupTimer = useCallback(() => {
    clearTimeout(startupTimer.current);
    startupTimer.current = undefined;
  }, []);
  const stop = useCallback(() => {
    token.current += 1;
    clearStartupTimer();
    setPhase('idle');
    void Speech.stop().catch(() => undefined);
  }, [clearStartupTimer]);

  // Warm the voice catalogue without playing any audio. Reuse successful lookups
  // while this screen is focused; failures stay retryable and refocus refreshes it.
  const loadVoice = useCallback(() => {
    if (voiceRequest.current) return voiceRequest.current;
    let timer: ReturnType<typeof setTimeout>;
    const request = Promise.race([
      Speech.getAvailableVoicesAsync(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Voice loading timed out')), 4000);
      }),
    ])
      .then((voices) => {
        const normalise = (value: string) => value.toLowerCase().replace(/_/g, '-');
        return (
          voices.find((voice) => normalise(voice.language) === normalise(language)) ??
          voices.find((voice) => normalise(voice.language).split('-')[0] === language.slice(0, 2))
        );
      })
      .finally(() => clearTimeout(timer));
    voiceRequest.current = request;
    const invalidate = () => {
      if (voiceRequest.current === request) voiceRequest.current = null;
    };
    void request.then((voice) => {
      if (!voice) invalidate();
    }, invalidate);
    return request;
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      focused.current = language;
      voiceRequest.current = null;
      setError('');
      void loadVoice().catch(() => undefined);
      const subscription = AppState.addEventListener('change', (state) => {
        if (state !== 'active') stop();
      });
      return () => {
        focused.current = null;
        stop();
        subscription.remove();
      };
    }, [stop, language, loadVoice]),
  );

  const playSequence = useCallback(
    async (lines: string[], rate = 0.82, onLine?: (index: number) => void) => {
      if (
        !lines.length ||
        focused.current !== language ||
        AppState.currentState === 'background' ||
        AppState.currentState === 'inactive'
      )
        return;
      const generation = ++token.current;
      const current = () => focused.current === language && generation === token.current;
      clearStartupTimer();
      setError('');
      setActiveText(lines[0]);
      setActiveRate(rate);
      setPhase('loading');
      // Includes stop, voice lookup and the native engine's first onStart callback.
      startupTimer.current = setTimeout(() => {
        if (current()) {
          stop();
          voiceRequest.current = null;
          setError('Audio took too long to start. Try again or continue with the text.');
        }
      }, 8000);
      try {
        await Speech.stop();
        if (!current()) return;
        const voice = await loadVoice();
        if (!current()) return;
        if (!voice) {
          stop();
          setError(
            'A voice for this language is not available yet. Try audio again, or enable that language in your device speech settings. You can continue with the text.',
          );
          return;
        }
        lines.forEach((text, index) =>
          Speech.speak(text, {
            language,
            voice: voice.identifier,
            rate,
            onStart: () => {
              if (current()) {
                clearStartupTimer();
                setPhase('playing');
                setActiveText(text);
                onLine?.(index);
              }
            },
            onDone: () => {
              if (current() && index === lines.length - 1) {
                clearStartupTimer();
                token.current += 1;
                setPhase('idle');
              }
            },
            onStopped: () => {
              if (current()) stop();
            },
            onError: () => {
              if (current()) {
                stop();
                voiceRequest.current = null;
                setError(audioError);
              }
            },
          }),
        );
      } catch {
        if (current()) {
          stop();
          voiceRequest.current = null;
          setError(audioError);
        }
      }
    },
    [language, stop, loadVoice, clearStartupTimer],
  );
  const play = useCallback(
    (text: string, rate?: number) => playSequence([text], rate),
    [playSequence],
  );
  return {
    play,
    playSequence,
    stop,
    playing: phase === 'playing',
    loading: phase === 'loading',
    busy: phase !== 'idle',
    activeText,
    activeRate,
    error,
  };
}

export type LessonSpeech = ReturnType<typeof useLessonSpeech>;
