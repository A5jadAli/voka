import { createContext, Fragment, useContext, type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Palette, VokaFonts } from '@/constants/theme';

import { useCloudSync } from '@/features/sync/use-cloud-sync';

const LearningScopeContext = createContext({ ready: false, failed: false, scope: 'guest' });

/** Keep the root navigator mounted, but never retain another account's screen-local state. */
export function LearningScopeScreen({ children }: PropsWithChildren) {
  const { ready, scope } = useContext(LearningScopeContext);
  return ready ? <Fragment key={scope}>{children}</Fragment> : null;
}

/** True once saved progress is open, or when opening it failed and an error is shown. */
export function useLearningScopeReady() {
  const { ready, failed } = useContext(LearningScopeContext);
  return ready || failed;
}

export function CloudSyncProvider({ children }: PropsWithChildren) {
  const { ready, scope, localError, retry } = useCloudSync();
  return (
    <LearningScopeContext.Provider value={{ ready, failed: Boolean(localError), scope }}>
      <View style={{ flex: 1 }}>
        <View
          pointerEvents={ready ? 'auto' : 'none'}
          aria-hidden={!ready}
          accessibilityElementsHidden={!ready}
          importantForAccessibility={ready ? 'auto' : 'no-hide-descendants'}
          style={{ flex: 1, display: ready ? 'flex' : 'none' }}
        >
          {children}
        </View>
        {!ready ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              alignItems: 'center',
              backgroundColor: Palette.ink,
              justifyContent: 'center',
              padding: 28,
              gap: 20,
            }}
          >
            {localError ? (
              <>
                <Text
                  accessibilityRole="alert"
                  style={{
                    color: Palette.cream,
                    fontFamily: VokaFonts.bodyMedium,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: 'center',
                  }}
                >
                  {localError}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={retry}
                  style={{
                    backgroundColor: Palette.yellow,
                    borderRadius: 16,
                    minHeight: 52,
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                  }}
                >
                  <Text
                    style={{ color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 16 }}
                  >
                    Try again
                  </Text>
                </Pressable>
              </>
            ) : (
              <ActivityIndicator
                accessibilityLabel="Opening your learning progress"
                color={Palette.yellow}
              />
            )}
          </View>
        ) : null}
      </View>
    </LearningScopeContext.Provider>
  );
}
