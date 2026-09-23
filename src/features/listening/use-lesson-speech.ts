import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

/** Screen-owned audio: a late voice/stop result must never start playback after leaving. */
export function useLessonSpeech(language: string) {
  const token = useRef(0);
  const focused = useRef<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const stop = useCallback(() => {
    token.current += 1;
    setPlaying(false);
    void Speech.stop().catch(() => undefined);
  }, []);
  useFocusEffect(
    useCallback(() => {
      focused.current = language;
      const subscription = AppState.addEventListener('change', (state) => {
        if (state !== 'active') stop();
      });
      return () => {
        focused.current = null;
        stop();
        subscription.remove();
      };
    }, [stop, language]),
  );

  const playSequence = useCallback(
    async (lines: string[], rate = 0.82, onLine?: (index: number) => void) => {
      if (!lines.length) return;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const generation = ++token.current;
      const current = () =>
        focused.current === language &&
        generation === token.current &&
        AppState.currentState !== 'background' &&
        AppState.currentState !== 'inactive';
      try {
        setError('');
        await Speech.stop();
        const voices = await Promise.race([
          Speech.getAvailableVoicesAsync(),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(() => reject(new Error('Voice loading timed out')), 4000);
          }),
        ]);
        if (!current()) return;
        const voice = voices.find((item) =>
          item.language.toLowerCase().replace('_', '-').startsWith(language.slice(0, 2)),
        );
        if (!voice) {
          setPlaying(false);
          setError(
            'A voice for this language is not available yet. Try audio again, or enable that language in your device speech settings. You can continue with the text.',
          );
          return;
        }
        setPlaying(true);
        lines.forEach((text, index) =>
          Speech.speak(text, {
            language,
            voice: voice.identifier,
            rate,
            onStart: () => {
              if (current()) onLine?.(index);
            },
            onDone: () => {
              if (current() && index === lines.length - 1) setPlaying(false);
            },
            onStopped: () => {
              if (current()) setPlaying(false);
            },
            onError: () => {
              if (current()) {
                stop();
                setError('Audio could not play. Try again or continue with the text.');
              }
            },
          }),
        );
      } catch {
        if (current()) {
          setPlaying(false);
          setError('Audio could not play. Try again or continue with the text.');
        }
      } finally {
        if (timeout) clearTimeout(timeout);
      }
    },
    [language, stop],
  );
  const play = useCallback(
    (text: string, rate?: number) => playSequence([text], rate),
    [playSequence],
  );
  return { play, playSequence, stop, playing, error };
}
