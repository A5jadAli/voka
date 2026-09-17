import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useAuthSession } from '@/features/auth/use-auth-session';
import { type CoachTone, useCoachingStore } from '@/features/coaching/store';
import { downloadAvailableUpdate, restartWithDownloadedUpdate } from '@/features/updates/ota';

const toneOptions: { description: string; label: string; value: CoachTone }[] = [
  {
    description: 'Patient, specific feedback without teasing.',
    label: 'Supportive',
    value: 'supportive',
  },
  {
    description: 'Switches after recurring struggles across at least 3 practice days.',
    label: 'Adaptive',
    value: 'adaptive',
  },
  {
    description: 'Direct, playful accountability from the next live conversation.',
    label: 'Tough coach',
    value: 'tough',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const coachTone = useCoachingStore((state) => state.coachTone);
  const setCoachTone = useCoachingStore((state) => state.setCoachTone);
  const [checking, setChecking] = useState(false);
  const version = Application.nativeApplicationVersion ?? '1.2.0';
  const build = Application.nativeBuildVersion;
  const isPermanent = Boolean(session && !session.user.is_anonymous);

  const checkForUpdates = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const result = await downloadAvailableUpdate();
      if (result.kind === 'ready') {
        Alert.alert('Update downloaded', 'Restart VOKA now to apply it?', [
          { text: 'Later', style: 'cancel' },
          { text: 'Restart', onPress: () => void restartWithDownloadedUpdate() },
        ]);
      } else if (result.kind === 'disabled') {
        Alert.alert(
          'Update check unavailable here',
          'This works in the signed preview or production app, not a local development build.',
        );
      } else {
        Alert.alert('VOKA is up to date', `Version ${version} is the latest available update.`);
      }
    } catch {
      Alert.alert('Could not check', 'Check your internet connection and try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <AppScreen showNav={false}>
      <View style={styles.header}>
        <HeaderBack />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Eyebrow color={Palette.orange}>Coaching</Eyebrow>
        <Text style={styles.title}>Choose how Voka pushes you</Text>
        <Text style={styles.description}>
          Tough feedback is always your choice. It targets the practice moment—never your identity,
          appearance, intelligence or accent.
        </Text>

        <View style={styles.card}>
          {toneOptions.map((option) => {
            const selected = coachTone === option.value;
            return (
              <Pressable
                accessibilityLabel={`${option.label} coaching${selected ? ', selected' : ''}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={option.value}
                onPress={() => setCoachTone(option.value)}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Eyebrow color={Palette.orange}>Account &amp; app</Eyebrow>
        <View style={styles.card}>
          {isPermanent ? (
            <SettingsRow
              icon="lock-reset"
              label="Change or reset password"
              onPress={() => router.push('/auth?mode=forgot')}
            />
          ) : null}
          <SettingsRow
            icon="map-marker-path"
            label="Replay welcome tour"
            onPress={() => router.push('/onboarding?replay=1')}
          />
          <SettingsRow
            icon="update"
            label={checking ? 'Checking for updates…' : 'Check for updates'}
            onPress={() => void checkForUpdates()}
          />
          <View style={styles.versionRow}>
            <MaterialCommunityIcons color={Palette.ink} name="information-outline" size={21} />
            <Text style={styles.rowLabel}>VOKA version</Text>
            <Text style={styles.rowValue}>
              {version}
              {build ? ` (${build})` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <MaterialCommunityIcons color={Palette.orange} name="shield-lock-outline" size={22} />
          <Text style={styles.privacyText}>
            Live practice sends microphone audio securely to Supabase and OpenAI only while a
            conversation is active. VOKA stops the stream when you end or leave it.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
}: {
  icon: 'lock-reset' | 'map-marker-path' | 'update';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons color={Palette.ink} name={icon} size={21} />
      <Text style={styles.rowLabel}>{label}</Text>
      <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={21} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  headerTitle: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 20 },
  headerSpacer: { width: 40 },
  body: { paddingBottom: 28, paddingHorizontal: 20 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 30,
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: 8,
  },
  description: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  card: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 25,
    marginTop: 10,
    overflow: 'hidden',
  },
  option: {
    alignItems: 'center',
    borderBottomColor: Palette.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 76,
    paddingHorizontal: 16,
  },
  optionCopy: { flex: 1 },
  optionLabel: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 14 },
  optionDescription: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  radio: {
    alignItems: 'center',
    borderColor: Palette.muted,
    borderRadius: 99,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioSelected: { borderColor: Palette.orange },
  radioDot: { backgroundColor: Palette.orange, borderRadius: 99, height: 12, width: 12 },
  row: {
    alignItems: 'center',
    borderBottomColor: Palette.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 60,
    paddingHorizontal: 17,
  },
  versionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    minHeight: 60,
    paddingHorizontal: 17,
  },
  rowLabel: { color: Palette.ink, flex: 1, fontFamily: VokaFonts.bodySemiBold, fontSize: 13 },
  rowValue: { color: Palette.muted, fontFamily: VokaFonts.mono, fontSize: 11 },
  privacyNote: {
    backgroundColor: Palette.ink,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    padding: 17,
  },
  privacyText: {
    color: Palette.cream,
    flex: 1,
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 17,
  },
  pressed: { opacity: 0.7 },
});
