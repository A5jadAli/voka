import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ActionBar, InfoCard, lessonText, PrimaryButton, TextButton } from '@/components/lesson-ui';
import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { emailProviderName, openEmailInbox } from '@/features/auth/email-app';
import { supabase } from '@/features/auth/supabase';
import { haptic } from '@/features/feedback/haptics';

const RESEND_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; kind?: string }>();
  const email = (params.email ?? '').trim().toLowerCase();
  // An upgraded guest keeps a session while the new address awaits confirmation.
  const kind = params.kind === 'email_change' ? 'email_change' : 'signup';
  const provider = emailProviderName(email);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const checkConfirmed = useCallback(async () => {
    if (!supabase || kind !== 'email_change') return;
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user?.email?.toLowerCase() === email && user.email_confirmed_at && !user.new_email) {
      setConfirmed(true);
      haptic.correct();
    }
  }, [email, kind]);

  // Coming back from the email app is the moment the link was most likely tapped.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void checkConfirmed();
    });
    return () => subscription.remove();
  }, [checkConfirmed]);

  const resend = async () => {
    if (!supabase || cooldown > 0 || sending) return;
    setSending(true);
    setNotice(null);
    const { error } =
      kind === 'signup'
        ? await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: 'voka://auth?mode=confirmed' },
          })
        : await supabase.auth.resend({ type: 'email_change', email });
    setSending(false);
    if (error) {
      setNotice({ tone: 'error', text: error.message });
      return;
    }
    setCooldown(RESEND_SECONDS);
    setNotice({ tone: 'ok', text: `A new link is on its way to ${email}.` });
  };

  if (confirmed)
    return (
      <AppScreen
        showNav={false}
        footer={
          <ActionBar>
            <PrimaryButton
              title="Continue"
              icon="arrow-right"
              onPress={() => router.replace('/profile' as Href)}
            />
          </ActionBar>
        }
      >
        <View style={styles.center}>
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={[styles.badge, styles.ok]}
          >
            <MaterialCommunityIcons name="check-bold" size={44} color={Palette.ink} />
          </Animated.View>
          <Text accessibilityRole="header" style={[lessonText.title, styles.centerText]}>
            Email confirmed
          </Text>
          <Text style={[lessonText.lead, styles.centerText]}>
            Your account is ready and your progress is saved to it.
          </Text>
        </View>
      </AppScreen>
    );

  return (
    <AppScreen
      showNav={false}
      footer={
        <ActionBar>
          <PrimaryButton
            title={provider ? `Open ${provider}` : 'Open email app'}
            icon="email-open-outline"
            onPress={() => void openEmailInbox(email).catch(() => undefined)}
          />
          <TextButton
            title={
              sending
                ? 'Sending…'
                : cooldown > 0
                  ? `Resend email in 0:${String(cooldown).padStart(2, '0')}`
                  : 'Resend email'
            }
            disabled={sending || cooldown > 0}
            onPress={() => void resend()}
          />
        </ActionBar>
      }
    >
      <View style={styles.header}>
        <HeaderBack />
      </View>
      <View style={styles.body}>
        <View style={styles.center}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.badge}>
            <MaterialCommunityIcons name="email-fast-outline" size={44} color={Palette.ink} />
          </Animated.View>
          <Text accessibilityRole="header" style={[lessonText.title, styles.centerText]}>
            Check your email
          </Text>
          <Text style={[lessonText.lead, styles.centerText]}>We sent a verification link to</Text>
          <Text selectable style={styles.email}>
            {email || 'your email address'}
          </Text>
        </View>

        <InfoCard icon="format-list-numbered" title="Three quick steps">
          <View style={styles.steps}>
            {[
              'Open the email we just sent you.',
              'Tap the confirmation link inside.',
              kind === 'email_change'
                ? 'Come back here. Vokeno continues automatically.'
                : 'Vokeno opens and signs you in.',
            ].map((step, index) => (
              <View key={step} style={styles.step}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </InfoCard>

        {notice ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.notice, notice.tone === 'error' && styles.noticeError]}
          >
            {notice.text}
          </Text>
        ) : null}

        <Text style={[lessonText.small, styles.centerText]}>
          Can’t find it? Check your Spam or Promotions folder. The link expires after 1 hour.
        </Text>
        <View style={styles.links}>
          {kind === 'signup' ? (
            <TextButton
              title="I’ve confirmed. Sign in"
              onPress={() => router.replace('/auth?mode=sign-in' as Href)}
            />
          ) : (
            <TextButton title="I’ve confirmed it" onPress={() => void checkConfirmed()} />
          )}
          <TextButton
            title="Use a different email"
            onPress={() => router.replace('/auth?mode=sign-up' as Href)}
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  body: { gap: 18, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 },
  center: { alignItems: 'center', gap: 10, paddingTop: 12 },
  centerText: { textAlign: 'center' },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    height: 96,
    justifyContent: 'center',
    marginBottom: 6,
    width: 96,
  },
  ok: { backgroundColor: '#BFE5C8' },
  email: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 17,
    textAlign: 'center',
  },
  steps: { gap: 10 },
  step: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  stepNumber: {
    backgroundColor: Palette.ink,
    borderRadius: 99,
    color: Palette.cream,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 13,
    height: 24,
    lineHeight: 24,
    overflow: 'hidden',
    textAlign: 'center',
    width: 24,
  },
  stepText: {
    color: Palette.ink,
    flex: 1,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 15,
    lineHeight: 23,
  },
  notice: {
    backgroundColor: '#E3F2E5',
    borderRadius: 14,
    color: '#1F5A33',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    padding: 12,
  },
  noticeError: { backgroundColor: '#FFE9E1', color: '#8E2D1B' },
  links: { gap: 8 },
});
