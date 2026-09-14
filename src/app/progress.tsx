import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useProgressStore } from '@/features/progress/store';

export default function ProgressScreen() {
  const router = useRouter();
  const completed = useProgressStore((state) => state.completedScenarioIds.length);
  const recentMinutes = [35, 55, 42, 78, 66, 92, Math.max(100, completed * 15)];

  return (
    <AppScreen activeNav="progress">
      <Text style={styles.title}>You are moving</Text>
      <View style={styles.streakCard}>
        <View style={styles.streakTop}>
          <View style={styles.flame}>
            <MaterialCommunityIcons color={Palette.ink} name="fire" size={30} />
          </View>
          <View>
            <Text style={styles.days}>5 days</Text>
            <Text style={styles.subtext}>in a row · best is 12</Text>
          </View>
        </View>
        <View style={styles.week}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <View
              key={day}
              style={[
                styles.weekDay,
                day < 5 && styles.weekDayDone,
                day === 5 && styles.weekDayToday,
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.trackCards}>
        <TrackCard
          color={Palette.orange}
          label={'IELTS plan\nalmost two thirds'}
          track="EN"
          progress={0.65}
        />
        <TrackCard
          color={Palette.yellow}
          label={'German A2\none third done'}
          track="DE"
          progress={0.34}
        />
      </View>
      <View style={styles.chartSection}>
        <Eyebrow>Speaking minutes</Eyebrow>
        <View style={styles.chart}>
          {recentMinutes.map((height, index) => (
            <View
              key={index}
              style={[
                styles.bar,
                { height: `${height}%` },
                index === 5 && styles.barRecent,
                index === 6 && styles.barToday,
              ]}
            />
          ))}
        </View>
      </View>
      <Pressable
        accessibilityLabel="Open latest mock test result"
        onPress={() => router.push('/mock-result')}
        style={({ pressed }) => [styles.mockCard, pressed && styles.pressed]}
      >
        <View>
          <Eyebrow color={Palette.orange}>Latest mock test</Eyebrow>
          <Text style={styles.mockTitle}>Band 6.0 · up 0.5</Text>
        </View>
        <MaterialCommunityIcons color={Palette.ink} name="chevron-right" size={24} />
      </Pressable>
    </AppScreen>
  );
}

function TrackCard({
  color,
  label,
  progress,
  track,
}: {
  color: string;
  label: string;
  progress: number;
  track: string;
}) {
  return (
    <View style={styles.trackCard}>
      <View
        style={[
          styles.trackRing,
          {
            borderColor: color,
            borderRightColor: Palette.line,
            borderBottomColor: progress < 0.6 ? Palette.line : color,
          },
        ]}
      >
        <View style={styles.trackRingInner}>
          <Text style={styles.trackValue}>{track}</Text>
        </View>
      </View>
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
  streakCard: {
    backgroundColor: Palette.ink,
    borderRadius: 28,
    marginHorizontal: 18,
    marginTop: 22,
    padding: 24,
  },
  streakTop: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  flame: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  days: { color: Palette.cream, fontFamily: VokaFonts.displayExtraBold, fontSize: 32 },
  subtext: {
    color: 'rgba(241,237,227,.55)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    marginTop: 4,
  },
  week: { flexDirection: 'row', gap: 7, marginTop: 22 },
  weekDay: { backgroundColor: 'rgba(241,237,227,.14)', borderRadius: 12, flex: 1, height: 46 },
  weekDayDone: { backgroundColor: Palette.orange },
  weekDayToday: { borderColor: 'rgba(241,237,227,.3)', borderStyle: 'dashed', borderWidth: 1.5 },
  trackCards: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingTop: 14 },
  trackCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    padding: 20,
  },
  trackRing: {
    alignItems: 'center',
    borderRadius: 99,
    borderWidth: 10,
    height: 82,
    justifyContent: 'center',
    transform: [{ rotate: '-25deg' }],
    width: 82,
  },
  trackRingInner: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 99,
    height: 62,
    justifyContent: 'center',
    transform: [{ rotate: '25deg' }],
    width: 62,
  },
  trackValue: { color: Palette.ink, fontFamily: VokaFonts.monoMedium, fontSize: 13 },
  trackLabel: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  chartSection: { paddingHorizontal: 22, paddingTop: 26 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 8, height: 100, marginTop: 16 },
  bar: { backgroundColor: 'rgba(19,18,17,.14)', borderRadius: 8, flex: 1 },
  barRecent: { backgroundColor: Palette.ink },
  barToday: { backgroundColor: Palette.orange },
  mockCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 18,
    padding: 17,
  },
  mockTitle: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 17, marginTop: 5 },
  pressed: { opacity: 0.72 },
});
