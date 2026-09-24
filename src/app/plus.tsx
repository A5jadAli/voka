import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/use-auth-session';
import {
  fetchPlusAccess,
  loadVokaPlus,
  purchaseVokaPlus,
  restoreVokaPlus,
  subscriptionManagementUrl,
} from '@/features/subscription/billing';
import type { PlusState, PurchaseOutcome } from '@/features/subscription/types';

export default function PlusScreen() {
  const { session } = useAuthSession();
  return <PlusContent key={session?.user.id ?? 'signed-out'} />;
}

function PlusContent() {
  const router = useRouter();
  const { loading: authLoading, session } = useAuthSession();
  const userId = session && !session.user.is_anonymous ? session.user.id : undefined;
  const [state, setState] = useState<PlusState>();
  const [pending, setPending] = useState<'load' | 'purchase' | 'restore' | 'manage' | null>('load');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (action: 'load' | 'purchase' | 'restore', force = false) => {
      if (!userId || busy.current) return;
      busy.current = true;
      setPending(action);
      setError('');
      const current = () => mounted.current;
      try {
        let outcome: PurchaseOutcome | undefined;
        if (action === 'purchase') outcome = await purchaseVokaPlus(userId);
        if (action === 'restore') outcome = await restoreVokaPlus(userId);
        if (action === 'load' && force) await fetchPlusAccess(userId, true);
        if (!current()) return;
        if (outcome) {
          const messages: Record<PurchaseOutcome, string> = {
            active:
              action === 'restore'
                ? 'Your Voka Plus subscription is restored.'
                : 'Voka Plus is active. Your allowance is ready.',
            cancelled: 'Purchase cancelled. No subscription was started.',
            pending:
              'Your store is waiting for payment approval. Plus will activate after payment is confirmed. Do not purchase again.',
            confirming:
              'Your purchase is being confirmed. You do not need to pay again. We will check automatically, or you can tap Refresh status.',
            'not-found':
              'No active subscription was found. Check that you are using the original Voka and store accounts.',
          };
          setNotice(messages[outcome]);
          setConfirming(outcome === 'pending' || outcome === 'confirming');
        }
        const next = await loadVokaPlus(userId);
        if (!current()) return;
        setState(next);
        setCheckedAt(Date.now());
        if (next.isPlus) {
          setConfirming(false);
          if (force) setNotice('Your subscription is active and up to date.');
        } else if (next.storeEntitled) setConfirming(true);
      } catch (reason) {
        if (current()) setError(reason instanceof Error ? reason.message : 'Please try again.');
      } finally {
        busy.current = false;
        if (current()) setPending(null);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!authLoading && !userId) {
      router.replace('/auth?mode=sign-up');
      return;
    }
  }, [authLoading, router, userId]);

  useFocusEffect(
    useCallback(() => {
      void run('load');
    }, [run]),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (value) => {
      if (value === 'active') void run('load');
    });
    return () => subscription.remove();
  }, [run]);
  useEffect(() => {
    if (!confirming) return;
    let attempts = 0;
    const timer = setInterval(() => {
      if (++attempts > 6) {
        clearInterval(timer);
        return;
      }
      if (AppState.currentState === 'active') void run('load', true);
    }, 12_000);
    return () => clearInterval(timer);
  }, [confirming, run]);

  const manage = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending('manage');
    try {
      await Linking.openURL(state?.managementUrl ?? subscriptionManagementUrl());
    } catch {
      if (mounted.current)
        setError(
          'Open your store app and go to Payments and subscriptions to manage or cancel Voka Plus.',
        );
    } finally {
      busy.current = false;
      if (mounted.current) setPending(null);
    }
  };
  const date = state?.expiresAt ? new Date(state.expiresAt).toLocaleDateString() : undefined;
  const unavailable = !state?.config.enabled || !state.config.salesEnabled;
  const canPurchase = state?.canPurchase && !confirming && !state.isPlus && !pending && !error;
  const showManage = state?.isPlus || confirming || state?.storeEntitled;

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <Text style={styles.logo}>VOKA PLUS</Text>
        <View style={styles.spacer} />
      </View>
      <View style={[styles.body, state?.isPlus && styles.activeBody]}>
        <View style={[styles.icon, state?.isPlus && styles.activeIcon]}>
          <MaterialCommunityIcons color={Palette.ink} name="creation" size={32} />
        </View>
        <Eyebrow color={Palette.orange}>
          {state?.isPlus
            ? 'Active subscription'
            : state && unavailable
              ? 'Coming soon'
              : 'Voka Plus'}
        </Eyebrow>
        <Text style={styles.title}>
          {state?.isPlus ? 'You’re on Plus.' : 'Make speaking a daily habit.'}
        </Text>
        <Text style={styles.copy}>
          {state?.isPlus
            ? `${state.willRenew ? 'Renews' : 'Access until'} ${date}. Manage or cancel in your store settings.`
            : unavailable
              ? 'Subscriptions are not open yet. Keep learning with the free lessons and your current practice allowance.'
              : 'A monthly subscription with a clear daily practice allowance. Your store confirms the price before payment. Cancel anytime in store settings.'}
        </Text>
        {state && !state.isPlus && date && new Date(state.expiresAt!).getTime() <= checkedAt ? (
          <Text style={styles.notice}>
            Your previous Plus access ended on {date}. Free lessons remain available.
          </Text>
        ) : null}
        {state?.config.environment === 'SANDBOX' ? (
          <Text style={styles.notice}>
            Test purchases only. This is not a live subscription offer.
          </Text>
        ) : null}
        {state?.billingIssue && state.isPlus ? (
          <Text style={styles.notice}>
            Your store reported a payment issue. Update your payment method to keep access after the
            grace period.
          </Text>
        ) : null}
        {state?.isPlus ? (
          <Text style={styles.notice}>
            Today: {state.voiceRemaining} session starts and {state.assessmentRemaining} assessment
            requests remaining.
          </Text>
        ) : null}
        {notice || (confirming && !state?.isPlus) ? (
          <Text accessibilityLiveRegion="polite" style={styles.notice}>
            {notice ||
              'The store reports an active purchase. We are confirming access with Voka. Do not purchase again.'}
          </Text>
        ) : null}
        {error || state?.storeError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error || state?.storeError}
          </Text>
        ) : null}
        {showManage ? (
          <Pressable
            accessibilityRole="link"
            accessibilityState={{ disabled: Boolean(pending) }}
            disabled={Boolean(pending)}
            onPress={() => void manage()}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryText}>Manage subscription</Text>
          </Pressable>
        ) : null}
        <View style={styles.benefits}>
          {(state?.config.enabled
            ? [
                `${state.config.voiceDaily} live session starts per day, up to 5 minutes each`,
                `${state.config.assessmentDaily} spoken assessment requests per day`,
                'Daily allowances reset at midnight UTC',
              ]
            : ['English and German learning', 'Your learning progress stays with your account']
          ).map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <MaterialCommunityIcons color={Palette.orange} name="check-circle" size={21} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        {pending && !state ? (
          <ActivityIndicator color={Palette.orange} style={styles.loader} />
        ) : null}
        {!showManage ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canPurchase, busy: pending === 'purchase' }}
            disabled={!canPurchase}
            onPress={() => void run('purchase')}
            style={[styles.primaryButton, !canPurchase && styles.disabled]}
          >
            <Text style={styles.primaryText}>
              {pending === 'purchase'
                ? 'Opening secure checkout...'
                : pending === 'load'
                  ? 'Checking availability...'
                  : state?.price
                    ? `Subscribe · ${state.price}/month`
                    : 'Not available yet'}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(pending) }}
          disabled={Boolean(pending)}
          onPress={() => void run('load', Boolean(state?.config.enabled))}
        >
          <Text style={styles.restore}>
            {pending === 'load' ? 'Checking status...' : 'Refresh status'}
          </Text>
        </Pressable>
        {state?.canRestore ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: Boolean(pending) }}
            disabled={Boolean(pending)}
            onPress={() => void run('restore')}
          >
            <Text style={styles.restore}>
              {pending === 'restore' ? 'Restoring purchases...' : 'Restore purchases'}
            </Text>
          </Pressable>
        ) : null}
        {!state?.isPlus && !confirming ? (
          <Pressable
            accessibilityRole="link"
            disabled={Boolean(pending)}
            onPress={() => void manage()}
          >
            <Text style={styles.restore}>Manage store subscriptions</Text>
          </Pressable>
        ) : null}
        {state?.config.enabled ? (
          <Text style={styles.copy}>
            Lessons and learning history stay free. AI requests count when processing starts; daily
            allowances do not roll over. Service safety limits may temporarily affect availability.
          </Text>
        ) : null}
        {state?.config.enabled ? (
          <Text style={styles.terms}>
            Payment is charged to your store account. Subscriptions renew automatically unless
            cancelled before the current period ends. Cancelling stops future renewals, not access
            for the period already paid. Deleting Voka does not cancel your subscription.
          </Text>
        ) : null}
        <View style={styles.legalLinks}>
          <Pressable
            accessibilityRole="link"
            style={styles.legalTarget}
            onPress={() => router.push('/legal/terms' as Href)}
          >
            <Text style={styles.legalText}>Terms</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            style={styles.legalTarget}
            onPress={() => router.push('/legal/privacy' as Href)}
          >
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
  activeBody: { paddingTop: 20 },
  activeIcon: { width: 48, height: 48, marginBottom: 16 },
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
  benefitText: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  notice: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 20,
  },
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
    color: 'rgba(241,237,227,.7)',
    fontFamily: VokaFonts.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  legalLinks: { flexDirection: 'row', gap: 22, justifyContent: 'center', marginTop: 13 },
  legalTarget: { minHeight: 44, minWidth: 64, justifyContent: 'center', alignItems: 'center' },
  legalText: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
