import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useAssessmentStore } from '@/features/assessment/store';
import { deleteCurrentAccount } from '@/features/auth/account';
import { supabase } from '@/features/auth/supabase';
import { useAuthSession } from '@/features/auth/use-auth-session';
import { getProfileDisplayName, getProfileInitials } from '@/features/profile/name';
import { formatTestDate } from '@/features/profile/test-date';
import { useCoachingStore } from '@/features/coaching/store';

export default function ProfileScreen() {
  const router = useRouter();
  const { loading, session } = useAuthSession();
  const [accountPending, setAccountPending] = useState(false);
  const isPermanent = Boolean(session && !session.user.is_anonymous);
  const displayName = getProfileDisplayName({
    email: session?.user.email,
    isPermanent,
    metadata: session?.user.user_metadata,
  });
  const initials = getProfileInitials(displayName);
  const assessments = useAssessmentStore((state) => state.assessments);
  const testDate = useCoachingStore((state) => state.testDate);

  const handleAccount = () => {
    if (!isPermanent) {
      router.push('/auth');
      return;
    }

    Alert.alert('Sign out of VOKA?', 'You can sign in again at any time.', [
      { style: 'cancel', text: 'Cancel' },
      {
        style: 'destructive',
        text: 'Sign out',
        onPress: () => {
          void (async () => {
            setAccountPending(true);
            const { error } = (await supabase?.auth.signOut()) ?? {};
            setAccountPending(false);
            if (error) {
              Alert.alert('Could not sign out', 'Check your connection and try again.');
            }
          })();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Permanently delete account?',
      'This permanently deletes your VOKA account and synced learning data. Cancel any store subscription first: deleting your account does not stop billing, and its purchases cannot be restored to a new Voka account.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          style: 'destructive',
          text: 'Delete account',
          onPress: () => {
            void (async () => {
              setAccountPending(true);
              try {
                await deleteCurrentAccount();
                router.replace('/');
              } catch (reason) {
                Alert.alert(
                  'Could not delete account',
                  reason instanceof Error ? reason.message : 'Please try again.',
                );
              } finally {
                setAccountPending(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <AppScreen activeNav="profile">
      <View style={styles.profileHeader}>
        <View
          accessibilityLabel={`${displayName} profile initials`}
          accessibilityRole="image"
          accessible
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{loading ? '…' : initials}</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {loading ? 'Loading…' : displayName}
          </Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>
              EN · {assessments.EN?.estimatedLevel ?? 'Not assessed'}
            </Text>
            <Text style={[styles.badge, styles.germanBadge]}>
              DE · {assessments.DE?.estimatedLevel ?? 'Not assessed'}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View Voka Plus"
        onPress={() => router.push((isPermanent ? '/plus' : '/auth?mode=sign-up') as Href)}
        style={styles.planCard}
      >
        <View style={styles.planGlow} />
        <View>
          <Eyebrow color={Palette.orange}>Voka Plus</Eyebrow>
          <Text style={styles.planTitle}>Make room for more practice</Text>
          {[
            'Explore live practice plans',
            'See your subscription and allowance',
            'Your free lessons stay free',
          ].map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <View style={styles.benefitCheck}>
                <MaterialCommunityIcons color={Palette.ink} name="check" size={14} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
          <Text style={[styles.price, { textDecorationLine: 'underline' }]}>
            View plans and availability
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel={isPermanent ? 'Sign out' : 'Sign in or create account'}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading || accountPending }}
        disabled={loading || accountPending}
        onPress={handleAccount}
        style={({ pressed }) => [
          styles.accountButton,
          (loading || accountPending) && styles.accountButtonDisabled,
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          color={Palette.ink}
          name={isPermanent ? 'logout-variant' : 'account-plus-outline'}
          size={21}
        />
        <View style={styles.accountCopy}>
          <Text style={styles.accountTitle}>
            {accountPending
              ? 'Signing out…'
              : isPermanent
                ? session?.user.email
                : 'Sign in for secure live sessions'}
          </Text>
          <Text style={styles.accountDescription}>
            {isPermanent
              ? 'Signed in · Syncs when online · Tap to sign out'
              : 'Sign in to sync your progress'}
          </Text>
        </View>
        <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={22} />
      </Pressable>

      <View style={styles.settings}>
        <Pressable
          accessibilityLabel="Open settings"
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="cog-outline" size={20} />
          <Text style={styles.settingLabel}>Settings &amp; app version</Text>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={20} />
        </Pressable>
        {isPermanent ? (
          <Pressable
            accessibilityLabel="Delete account"
            accessibilityRole="button"
            disabled={accountPending}
            onPress={handleDeleteAccount}
            style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color="#A4391B" name="delete-outline" size={20} />
            <Text style={[styles.settingLabel, styles.dangerText]}>Delete account</Text>
            <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={20} />
          </Pressable>
        ) : null}
        <Setting icon="web" label="Support language" value="English" />
        <Pressable
          accessibilityLabel="Open speaking style and goals"
          onPress={() => router.push('/accent')}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="waveform" size={20} />
          <Text style={styles.settingLabel}>Speaking style &amp; goals</Text>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={20} />
        </Pressable>
        <Pressable
          accessibilityLabel="Open spoken level check"
          onPress={() =>
            router.push((assessments.EN ? '/assessment-result?track=EN' : '/level-check') as Href)
          }
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="account-voice" size={20} />
          <Text style={styles.settingLabel}>
            {assessments.EN ? 'Latest English assessment' : 'Spoken level check'}
          </Text>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={20} />
        </Pressable>
        <Pressable
          accessibilityLabel="Replay app tour"
          onPress={() => router.push('/onboarding?replay=1')}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="map-marker-path" size={20} />
          <Text style={styles.settingLabel}>Replay app tour</Text>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={20} />
        </Pressable>
        <Pressable
          accessibilityLabel={`Set test date, currently ${formatTestDate(testDate)}`}
          accessibilityRole="button"
          onPress={() => router.push('/test-date' as Href)}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="calendar-blank-outline" size={20} />
          <Text style={styles.settingLabel}>Test date</Text>
          <Text style={styles.settingValue}>{formatTestDate(testDate)}</Text>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={20} />
        </Pressable>
      </View>

      <View style={styles.identityNote}>
        <View style={styles.identityIcon}>
          <MaterialCommunityIcons color={Palette.orange} name="account-lock-outline" size={23} />
        </View>
        <View style={styles.identityCopy}>
          <Eyebrow>Private by design</Eyebrow>
          <Text style={styles.identityText}>
            Your initials come from your name. Voka has no profile photos or public profiles.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

function Setting({ icon, label, value }: { icon: 'web'; label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <MaterialCommunityIcons color={Palette.ink} name={icon} size={20} />
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  profileCopy: { flex: 1 },
  avatar: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 99,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  name: { color: Palette.ink, fontFamily: VokaFonts.displayExtraBold, fontSize: 24 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badge: {
    backgroundColor: 'rgba(255,74,23,.2)',
    borderRadius: 99,
    color: Palette.ink,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 11,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  germanBadge: { backgroundColor: 'rgba(242,183,5,.28)' },
  planCard: {
    backgroundColor: Palette.ink,
    borderRadius: 28,
    marginHorizontal: 18,
    marginTop: 26,
    overflow: 'hidden',
    padding: 24,
  },
  planGlow: {
    backgroundColor: 'rgba(255,74,23,.16)',
    borderRadius: 99,
    height: 150,
    position: 'absolute',
    right: -40,
    top: -40,
    width: 150,
  },
  planTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 28,
    letterSpacing: -1,
    lineHeight: 31,
    marginBottom: 12,
    marginTop: 10,
  },
  benefit: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 10 },
  benefitCheck: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  benefitText: { color: Palette.cream, fontFamily: VokaFonts.bodySemiBold, fontSize: 14 },
  price: {
    color: 'rgba(241,237,227,.45)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  accountButton: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
    marginTop: 14,
    padding: 16,
  },
  accountCopy: { flex: 1 },
  accountButtonDisabled: { opacity: 0.55 },
  accountTitle: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 13 },
  accountDescription: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 10,
    marginTop: 3,
  },
  settings: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 22,
    borderWidth: 1,
    margin: 18,
    overflow: 'hidden',
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: Palette.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 58,
    paddingHorizontal: 18,
  },
  settingLabel: { color: Palette.ink, flex: 1, fontFamily: VokaFonts.bodySemiBold, fontSize: 14 },
  settingValue: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 13 },
  dangerText: { color: '#A4391B' },
  identityNote: {
    alignItems: 'center',
    backgroundColor: Palette.soft,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
    marginHorizontal: 18,
    marginTop: -4,
    padding: 16,
  },
  identityIcon: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  identityCopy: { flex: 1 },
  identityText: {
    color: Palette.secondary,
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
