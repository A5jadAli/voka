import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { ActionBar, lessonText, PrimaryButton } from '@/components/lesson-ui';
import { AppScreen } from '@/components/voka-ui';
import { Palette } from '@/constants/theme';
import { completeGoogleSignIn, startGoogleSignIn } from '@/features/auth/google';

/** Where Google sign-in returns to. Finishes the session, then moves on to the profile. */
export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ u?: string }>();
  const linkingUrl = Linking.useLinkingURL();
  const url =
    params.u ?? (Platform.OS === 'web' ? globalThis.location?.href : (linkingUrl ?? undefined));
  const [failure, setFailure] = useState('');
  const [note, setNote] = useState('Signing you in…');
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!url || handled.current.has(url)) return;
    handled.current.add(url);
    let active = true;
    void (async () => {
      let outcome = await completeGoogleSignIn(url);
      if (outcome.status === 'existing-account') {
        // This Google account already has an account: sign in to it instead of linking.
        if (active) setNote('Found your account. Signing you in…');
        try {
          const next = await startGoogleSignIn({ link: false });
          if (next.type === 'redirecting') return;
          outcome =
            next.type === 'returned'
              ? await completeGoogleSignIn(next.url)
              : { status: 'cancelled' };
        } catch (error) {
          outcome = {
            status: 'error',
            message: error instanceof Error ? error.message : 'Google sign-in did not complete.',
          };
        }
      }
      if (!active) return;
      if (outcome.status === 'signed-in') {
        if (router.canDismiss()) router.dismissAll();
        router.replace('/profile');
      } else if (outcome.status === 'cancelled') {
        router.replace('/auth' as Href);
      } else if (outcome.status === 'error') {
        setFailure(outcome.message);
      }
    })();
    return () => {
      active = false;
    };
  }, [router, url]);

  return (
    <AppScreen
      showNav={false}
      footer={
        failure ? (
          <ActionBar>
            <PrimaryButton
              title="Back to sign in"
              onPress={() => router.replace('/auth' as Href)}
            />
          </ActionBar>
        ) : undefined
      }
    >
      <View style={styles.body}>
        {failure ? (
          <>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color={Palette.ink} />
            </View>
            <Text accessibilityRole="header" style={[lessonText.title, styles.center]}>
              Google sign-in didn’t finish
            </Text>
            <Text accessibilityRole="alert" style={[lessonText.lead, styles.center]}>
              {failure}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator color={Palette.ink} size="large" />
            <Text accessibilityLiveRegion="polite" style={[lessonText.lead, styles.center]}>
              {note}
            </Text>
          </>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 28 },
  center: { textAlign: 'center' },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    height: 88,
    justifyContent: 'center',
    marginBottom: 8,
    width: 88,
  },
});
