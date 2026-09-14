import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [reminderEnabled, setReminderEnabled] = useState(true);

  return (
    <AppScreen activeNav="profile">
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PHOTO</Text>
        </View>
        <View>
          <Text style={styles.name}>Demo learner</Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>EN · B1</Text>
            <Text style={[styles.badge, styles.germanBadge]}>DE · A2</Text>
          </View>
        </View>
      </View>
      <View style={styles.planCard}>
        <Eyebrow color={Palette.orange}>MVP preview</Eyebrow>
        <Text style={styles.planTitle}>Built for the gap between lessons and real life</Text>
        {[
          'Live English and German AI conversations',
          'Natural interruption and smart captions',
          'Offline listening and phrase decoding',
        ].map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <MaterialCommunityIcons color={Palette.orange} name="check-circle" size={17} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityLabel="Sign in or create account"
        accessibilityRole="button"
        onPress={() => router.push('/auth')}
        style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons color={Palette.ink} name="account-plus-outline" size={21} />
        <View style={styles.accountCopy}>
          <Text style={styles.accountTitle}>Save your learning memory</Text>
          <Text style={styles.accountDescription}>Sign in or create an account</Text>
        </View>
        <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={22} />
      </Pressable>
      <View style={styles.settings}>
        <Setting icon="translate" label="Hint language" value="English" />
        <View style={styles.settingRow}>
          <MaterialCommunityIcons color={Palette.ink} name="bell-outline" size={19} />
          <Text style={styles.settingLabel}>Daily reminder</Text>
          <Switch
            onValueChange={setReminderEnabled}
            trackColor={{ false: '#CCC', true: Palette.orange }}
            value={reminderEnabled}
          />
        </View>
        <Setting icon="account-voice" label="Practice focus" value="Real conversations" />
      </View>
    </AppScreen>
  );
}

function Setting({
  icon,
  label,
  value,
}: {
  icon: 'account-voice' | 'translate';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingRow}>
      <MaterialCommunityIcons color={Palette.ink} name={icon} size={19} />
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', flexDirection: 'row', gap: 14, padding: 22 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#DEDAD0',
    borderRadius: 99,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarText: { color: Palette.muted, fontFamily: VokaFonts.mono, fontSize: 8 },
  name: { color: Palette.ink, fontFamily: VokaFonts.displayExtraBold, fontSize: 26 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: {
    backgroundColor: 'rgba(255, 74, 23, 0.18)',
    borderRadius: 99,
    color: Palette.ink,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  germanBadge: { backgroundColor: 'rgba(242, 183, 5, 0.28)' },
  planCard: { backgroundColor: Palette.ink, borderRadius: 28, marginHorizontal: 18, padding: 22 },
  planTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 23,
    lineHeight: 28,
    marginBottom: 14,
    marginTop: 8,
  },
  benefit: { alignItems: 'center', flexDirection: 'row', gap: 9, marginTop: 8 },
  benefitText: { color: Palette.cream, fontFamily: VokaFonts.bodyMedium, fontSize: 12 },
  settings: { backgroundColor: Palette.white, borderRadius: 22, margin: 18, overflow: 'hidden' },
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
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: Palette.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  settingLabel: { color: Palette.ink, flex: 1, fontFamily: VokaFonts.bodySemiBold, fontSize: 13 },
  settingValue: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 12 },
});
