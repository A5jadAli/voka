import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { speakingGoalCopy, type SpeakingGoal, useCoachingStore } from '@/features/coaching/store';
import { useSelectedLanguage } from '@/features/language/selection';

const goals = Object.keys(speakingGoalCopy) as SpeakingGoal[];

export default function AccentScreen() {
  const router = useRouter();
  const [track, setTrack] = useSelectedLanguage();
  const preferences = useCoachingStore((state) => state.preferences);
  const hasHydrated = useCoachingStore((state) => state.hasHydrated);
  const setGoal = useCoachingStore((state) => state.setGoal);
  const accent = track === 'EN' ? Palette.orange : Palette.yellow;

  if (!hasHydrated) {
    return (
      <AppScreen activeNav="profile">
        <View style={styles.header}>
          <HeaderBack />
          <Eyebrow>Speaking profile</Eyebrow>
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.loading}>
          Loading speaking profile…
        </Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen activeNav="profile">
      <View style={styles.header}>
        <HeaderBack />
        <Eyebrow>Speaking profile</Eyebrow>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Sound clear, natural and like yourself.</Text>
        <Text style={styles.intro}>
          Choose what you need. VOKA targets intelligibility, rhythm and useful modern speech, not
          accent erasure or imitation of a celebrity.
        </Text>

        <View accessibilityLabel="Speaking profile language" style={styles.trackRow}>
          {(['EN', 'DE'] as const).map((item) => (
            <Pressable
              accessibilityLabel={
                item === 'EN' ? 'English speaking profile' : 'German speaking profile'
              }
              accessibilityRole="button"
              accessibilityState={{ selected: track === item }}
              key={item}
              onPress={() => setTrack(item)}
              style={[styles.trackButton, track === item && { backgroundColor: accent }]}
            >
              <Text style={styles.trackText}>{item === 'EN' ? 'English' : 'Deutsch'}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.referenceCard}>
          <MaterialCommunityIcons color={accent} name="waveform" size={25} />
          <View style={styles.referenceCopy}>
            <Text style={styles.referenceTitle}>
              {track === 'EN' ? 'Contemporary British reference' : 'Standard German reference'}
            </Text>
            <Text style={styles.referenceText}>
              {track === 'EN'
                ? 'Widely understood modern British speech, including connected speech and current phrases, never a named person’s voice.'
                : 'Widely understood German from Germany, while recognising natural reductions and regional variation.'}
            </Text>
          </View>
        </View>

        <Eyebrow>What are you preparing for?</Eyebrow>
        <View style={styles.goalList}>
          {goals.map((goal) => {
            const selected = preferences[track].goal === goal;
            return (
              <Pressable
                aria-checked={selected}
                accessibilityLabel={`${speakingGoalCopy[goal].label} speaking goal`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={goal}
                onPress={() => setGoal(track, goal)}
                style={[styles.goalCard, selected && { borderColor: accent, borderWidth: 2 }]}
              >
                <View style={[styles.radio, selected && { backgroundColor: accent }]}>
                  {selected ? (
                    <MaterialCommunityIcons color={Palette.ink} name="check" size={14} />
                  ) : null}
                </View>
                <View style={styles.goalCopy}>
                  <Text style={styles.goalTitle}>{speakingGoalCopy[goal].label}</Text>
                  <Text style={styles.goalDescription}>{speakingGoalCopy[goal].description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityLabel="Start speaking diagnostic"
          accessibilityRole="button"
          onPress={() => router.push(`/conversation?track=${track}&practice=diagnostic`)}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: accent },
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="account-voice" size={21} />
          <Text style={styles.primaryText}>Try a short speaking check</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          Feedback is qualitative and adaptive. It is not a certified language assessment.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  body: { padding: 22, paddingTop: 20 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 38,
  },
  intro: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
  },
  trackRow: {
    backgroundColor: Palette.soft,
    borderRadius: 99,
    flexDirection: 'row',
    marginVertical: 20,
    padding: 4,
  },
  trackButton: { alignItems: 'center', borderRadius: 99, flex: 1, paddingVertical: 11 },
  trackText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 13 },
  referenceCard: {
    backgroundColor: Palette.ink,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 13,
    marginBottom: 24,
    padding: 18,
  },
  referenceCopy: { flex: 1 },
  referenceTitle: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  referenceText: {
    color: 'rgba(241,237,227,.62)',
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  goalList: { gap: 10, marginTop: 13 },
  goalCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 78,
    padding: 14,
  },
  radio: {
    alignItems: 'center',
    borderColor: Palette.muted,
    borderRadius: 99,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  goalCopy: { flex: 1 },
  goalTitle: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 14 },
  goalDescription: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 56,
  },
  primaryText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 15 },
  disclaimer: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 9,
    textAlign: 'center',
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  loading: { color: Palette.muted, fontFamily: VokaFonts.bodyMedium, fontSize: 13, padding: 22 },
});
