import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { listeningScenarios, type LanguageTrack } from '@/features/listening/scenarios';
import { useProgressStore } from '@/features/progress/store';

export default function ProgressScreen() {
  const router = useRouter();
  const completedIds = useProgressStore((state) => state.completedScenarioIds);
  const completed = completedIds.length;
  const completedFor = (track: LanguageTrack) =>
    listeningScenarios.filter(
      (scenario) => scenario.track === track && completedIds.includes(scenario.id),
    ).length;
  const totalFor = (track: LanguageTrack) =>
    listeningScenarios.filter((scenario) => scenario.track === track).length;

  return (
    <AppScreen activeNav="progress">
      <Text style={styles.title}>Your progress</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons color={Palette.ink} name="check-decagram" size={30} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.completedValue}>{completed}</Text>
          <Text style={styles.summaryLabel}>
            {completed === 1 ? 'listening lesson completed' : 'listening lessons completed'}
          </Text>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Eyebrow>Recorded on this device</Eyebrow>
        <View style={styles.activityDots}>
          {Array.from({ length: 7 }, (_, index) => (
            <View
              key={index}
              style={[styles.activityDot, index < Math.min(completed, 7) && styles.activityDotDone]}
            />
          ))}
        </View>
        <Text style={styles.activityHint}>
          Complete a lesson check to add it here. VOKA does not invent streaks or scores.
        </Text>
      </View>

      <View style={styles.trackCards}>
        <TrackCard
          color={Palette.orange}
          completed={completedFor('EN')}
          label="English listening"
          total={totalFor('EN')}
          track="EN"
        />
        <TrackCard
          color={Palette.yellow}
          completed={completedFor('DE')}
          label="German listening"
          total={totalFor('DE')}
          track="DE"
        />
      </View>

      <View style={styles.nextCard}>
        <View style={styles.nextCopy}>
          <Eyebrow color={Palette.orange}>Next step</Eyebrow>
          <Text style={styles.nextTitle}>
            {completed
              ? 'Keep the momentum with a live conversation.'
              : 'Start with a real conversation.'}
          </Text>
          <Text style={styles.nextDescription}>
            Live captions and interruption support stay available while you practise.
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Start live conversation from progress"
          accessibilityRole="button"
          onPress={() => router.push('/conversation?track=EN')}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="microphone" size={20} />
          <Text style={styles.nextButtonText}>Practise now</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function TrackCard({
  color,
  completed,
  label,
  total,
  track,
}: {
  color: string;
  completed: number;
  label: string;
  total: number;
  track: LanguageTrack;
}) {
  return (
    <View style={styles.trackCard}>
      <View style={[styles.trackBadge, { backgroundColor: color }]}>
        <Text style={styles.trackValue}>{track}</Text>
      </View>
      <Text style={styles.trackCount}>
        {completed}/{total}
      </Text>
      <Text style={styles.trackLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1.1,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 18,
    marginHorizontal: 18,
    marginTop: 22,
    padding: 24,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  summaryCopy: { flex: 1 },
  completedValue: { color: Palette.cream, fontFamily: VokaFonts.displayExtraBold, fontSize: 34 },
  summaryLabel: {
    color: 'rgba(241,237,227,.62)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  activitySection: { paddingHorizontal: 22, paddingTop: 24 },
  activityDots: { flexDirection: 'row', gap: 8, marginTop: 14 },
  activityDot: { backgroundColor: Palette.soft, borderRadius: 12, flex: 1, height: 42 },
  activityDotDone: { backgroundColor: Palette.orange },
  activityHint: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  trackCards: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingTop: 18 },
  trackCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    padding: 18,
  },
  trackBadge: {
    alignItems: 'center',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  trackValue: { color: Palette.ink, fontFamily: VokaFonts.monoMedium, fontSize: 13 },
  trackCount: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayBold,
    fontSize: 20,
    marginTop: 10,
  },
  trackLabel: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  nextCard: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 24,
    borderWidth: 1,
    margin: 18,
    padding: 20,
  },
  nextCopy: { gap: 7 },
  nextTitle: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayBold,
    fontSize: 21,
    lineHeight: 26,
  },
  nextDescription: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  nextButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  nextButtonText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 13 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
