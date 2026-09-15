import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { supabase } from '@/features/auth/supabase';
import { useAuthSession } from '@/features/auth/use-auth-session';

export default function ProfileScreen() {
  const router = useRouter();
  const { loading, session } = useAuthSession();
  const isPermanent = Boolean(session && !session.user.is_anonymous);
  const displayName = isPermanent
    ? String(
        session?.user.user_metadata.display_name || session?.user.email?.split('@')[0] || 'Learner',
      )
    : 'Guest learner';

  const handleAccount = async () => {
    if (!isPermanent) {
      router.push('/auth');
      return;
    }
    await supabase?.auth.signOut();
  };

  return (
    <AppScreen activeNav="profile">
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons color={Palette.muted} name="account-outline" size={25} />
        </View>
        <View style={styles.profileCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {loading ? 'Loading…' : displayName}
          </Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>EN · Not assessed</Text>
            <Text style={[styles.badge, styles.germanBadge]}>DE · Not assessed</Text>
          </View>
        </View>
      </View>

      <View style={styles.planCard}>
        <View style={styles.planGlow} />
        <View>
          <Eyebrow color={Palette.orange}>Planned Voka Plus</Eyebrow>
          <Text style={styles.planTitle}>Unlimited practice after the pilot</Text>
          {[
            'Longer live conversations',
            'Personal practice history',
            'English and German tracks',
          ].map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <View style={styles.benefitCheck}>
                <MaterialCommunityIcons color={Palette.ink} name="check" size={14} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
          <Text style={styles.price}>Planned launch price · Rs 200/month</Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel={isPermanent ? 'Sign out' : 'Sign in or create account'}
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleAccount()}
        style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons
          color={Palette.ink}
          name={isPermanent ? 'logout-variant' : 'account-plus-outline'}
          size={21}
        />
        <View style={styles.accountCopy}>
          <Text style={styles.accountTitle}>
            {isPermanent ? session?.user.email : 'Sign in for secure live sessions'}
          </Text>
          <Text style={styles.accountDescription}>
            {isPermanent
              ? 'Tap to sign out'
              : 'Lesson progress remains on this device during pilot'}
          </Text>
        </View>
        <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={22} />
      </Pressable>

      <View style={styles.settings}>
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
          onPress={() => router.push('/level-check')}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="account-voice" size={20} />
          <Text style={styles.settingLabel}>Spoken level check</Text>
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
        <Setting icon="calendar-blank-outline" label="Test date" value="Not set" />
      </View>
    </AppScreen>
  );
}

function Setting({
  icon,
  label,
  value,
}: {
  icon: 'calendar-blank-outline' | 'web';
  label: string;
  value: string;
}) {
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
    backgroundColor: '#DEDAD0',
    borderColor: 'rgba(19,18,17,.2)',
    borderRadius: 99,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 52,
    justifyContent: 'center',
    width: 52,
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
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
