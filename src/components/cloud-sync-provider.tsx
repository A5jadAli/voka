import { createContext, Fragment, useContext, type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Palette } from '@/constants/theme';

import { useCloudSync } from '@/features/sync/use-cloud-sync';

const LearningScopeContext = createContext({ ready: false, scope: 'guest' });

/** Keep the root navigator mounted, but never retain another account's screen-local state. */
export function LearningScopeScreen({ children }: PropsWithChildren) {
  const { ready, scope } = useContext(LearningScopeContext);
  return ready ? <Fragment key={scope}>{children}</Fragment> : null;
}

export function CloudSyncProvider({ children }: PropsWithChildren) {
  const { ready, scope, localError, retry } = useCloudSync();
  return (
    <LearningScopeContext.Provider value={{ ready, scope }}>
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
              backgroundColor: Palette.cream,
              justifyContent: 'center',
              padding: 28,
              gap: 20,
            }}
          >
            {localError ? (
              <>
                <Text accessibilityRole="alert">{localError}</Text>
                <Pressable accessibilityRole="button" onPress={retry} style={{ padding: 18 }}>
                  <Text>Retry opening your progress</Text>
                </Pressable>
              </>
            ) : (
              <ActivityIndicator
                accessibilityLabel="Opening your learning progress"
                color={Palette.orange}
              />
            )}
          </View>
        ) : null}
      </View>
    </LearningScopeContext.Provider>
  );
}
