import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/use-auth-session';
import { loadVokaPlus, purchaseVokaPlus, restoreVokaPlus } from '@/features/subscription/billing';

type PlusState = { isPlus: boolean; managementUrl?: string | null; price?: string };

export default function PlusScreen() {
  const router = useRouter();
  const { loading: authLoading, session } = useAuthSession();
  const userId = session && !session.user.is_anonymous ? session.user.id : undefined;
  const [state, setState] = useState<PlusState>();
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !userId) {
      router.replace('/auth?mode=sign-up');
      return;
    }
    if (!userId) return;
    let cancelled = false;
    void loadVokaPlus(userId)
      .then((result) => {
        if (!cancelled) setState(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Voka Plus could not be loaded.');
        }
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, router, userId]);

  const purchase = async () => {
    if (!userId || pending) return;
    setPending(true);
    setError('');
    try {
      if (await purchaseVokaPlus(userId)) {
        setState(await loadVokaPlus(userId));
        Alert.alert('Welcome to Voka Plus', 'Your subscription is active.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The purchase could not be completed.');
    } finally {
      setPending(false);
    }
  };

  const restore = async () => {
    if (!userId || pending) return;
    setPending(true);
    setError('');
    try {
      const restored = await restoreVokaPlus(userId);
      setState(await loadVokaPlus(userId));
      Alert.alert(
        restored ? 'Voka Plus restored' : 'No subscription found',
        restored
          ? 'Your subscription is active again on this device.'
          : 'No active Voka Plus purchase was found for this store account.',
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Purchases could not be restored.');
    } finally {
      setPending(false);
    }
  };

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <Text style={styles.logo}>VOKA PLUS</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <View style={styles.icon}>
          <MaterialCommunityIcons color={Palette.ink} name="creation" size={32} />
        </View>
        <Eyebrow color={Palette.orange}>
          {state?.isPlus ? 'Active subscription' : 'Voka Plus'}
        </Eyebrow>
        <Text style={styles.title}>
          {state?.isPlus ? 'You’re on Plus.' : 'Make speaking a daily habit.'}
        </Text>
        <Text style={styles.copy}>
          Your store confirms the price and renewal terms before purchase. Cancel anytime in your
          store subscription settings.
        </Text>
        <View style={styles.benefits}>
          {[
            'Unlimited live practice',
            'Personal learning history',
            'English and German tracks',
          ].map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <MaterialCommunityIcons color={Palette.orange} name="check-circle" size={21} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        {pending && !state ? (
          <ActivityIndicator color={Palette.orange} style={styles.loader} />
        ) : null}
        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {state?.isPlus ? (
          state.managementUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(state.managementUrl!)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>Manage subscription</Text>
            </Pressable>
          ) : null
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: pending || !state?.price }}
            disabled={pending || !state?.price}
            onPress={() => void purchase()}
            style={[styles.primaryButton, (pending || !state?.price) && styles.disabled]}
          >
            <Text style={styles.primaryText}>
              {pending ? 'Loading…' : state?.price ? `Continue · ${state.price}` : 'Unavailable'}
            </Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" disabled={pending} onPress={() => void restore()}>
          <Text style={styles.restore}>Restore purchases</Text>
        </Pressable>
        <Text style={styles.terms}>
          Payment is charged to your store account. Subscriptions renew automatically unless
          cancelled before the current period ends.
        </Text>
        <View style={styles.legalLinks}>
          <Pressable onPress={() => router.push('/legal/terms' as Href)}>
            <Text style={styles.legalText}>Terms</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/legal/privacy' as Href)}>
            <Text style={styles.legalText}>Privacy</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  logo: { color: Palette.cream, fontFamily: VokaFonts.displayExtraBold, fontSize: 17 },
  spacer: { width: 40 },
  body: { padding: 24, paddingTop: 34 },
  icon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 22,
    width: 64,
  },
  title: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 38,
    letterSpacing: -1.2,
    lineHeight: 42,
    marginTop: 9,
  },
  copy: {
    color: 'rgba(241,237,227,.64)',
    fontFamily: VokaFonts.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  benefits: { gap: 14, marginTop: 27 },
  benefit: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  benefitText: { color: Palette.cream, fontFamily: VokaFonts.bodySemiBold, fontSize: 15 },
  loader: { marginTop: 28 },
  error: {
    color: '#FFB49E',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 22,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    marginTop: 28,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  disabled: { opacity: 0.45 },
  restore: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 13,
    paddingVertical: 18,
    textAlign: 'center',
  },
  terms: {
    color: 'rgba(241,237,227,.38)',
    fontFamily: VokaFonts.body,
    fontSize: 9,
    lineHeight: 15,
    textAlign: 'center',
  },
  legalLinks: { flexDirection: 'row', gap: 22, justifyContent: 'center', marginTop: 13 },
  legalText: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
