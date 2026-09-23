import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LanguageTrack } from '@/features/listening/scenarios';

// Interface preference only; private learning data remains account-scoped.
export const useLanguageSelection = create<{
  track: LanguageTrack;
  hydrated: boolean;
  choose: (track: LanguageTrack) => void;
  setHydrated: () => void;
}>()(
  persist(
    (set) => ({
      track: 'EN',
      hydrated: false,
      choose: (track) => set({ track }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'voka-language-selection',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ track }) => ({ track }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export function useSelectedLanguage() {
  const { track: requested } = useLocalSearchParams<{ track?: string }>();
  const router = useRouter();
  const { track, hydrated, choose } = useLanguageSelection();
  useFocusEffect(
    useCallback(() => {
      if (hydrated && (requested === 'DE' || requested === 'EN')) choose(requested);
    }, [choose, hydrated, requested]),
  );
  const select = useCallback(
    (next: LanguageTrack) => {
      choose(next);
      router.setParams({ track: next });
    },
    [choose, router],
  );
  return [track, select] as const;
}
