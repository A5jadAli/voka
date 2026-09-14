import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { getScenarios } from '@/features/listening/scenarios';
import { useProgressStore } from '@/features/progress/store';

export default function ProgressScreen() {
  const completedIds = useProgressStore((state) => state.completedScenarioIds);
  const englishCompleted = getScenarios('EN').filter((item) =>
    completedIds.includes(item.id),
  ).length;
  const germanCompleted = getScenarios('DE').filter((item) =>
    completedIds.includes(item.id),
  ).length;
  const totalCompleted = englishCompleted + germanCompleted;
  const minutes = [12, 20, 16, 31, 24, 38, Math.max(12, totalCompleted * 12)];

  return (
    <AppScreen activeNav="progress">
      <View style={styles.header}>
        <Eyebrow>Your listening journey</Eyebrow>
        <Text style={styles.title}>You are moving</Text>
      </View>
      <View style={styles.streakCard}>
        <View style={styles.flame}>
          <MaterialCommunityIcons color={Palette.ink} name="fire" size={30} />
        </View>
        <View>
          <Text style={styles.days}>{totalCompleted} complete</Text>
          <Text style={styles.subtext}>lessons saved on this device</Text>
        </View>
        <View style={styles.week}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <View key={day} style={[styles.weekDay, day < totalCompleted && styles.weekDayDone]} />
          ))}
        </View>
      </View>
      <View style={styles.trackCards}>
        <TrackCard
          color={Palette.orange}
          label="English ear"
          note="real-world scenarios"
          value={`${englishCompleted}/3`}
        />
        <TrackCard
          color={Palette.yellow}
          label="German ear"
          note="real-world scenarios"
          value={`${germanCompleted}/3`}
        />
      </View>
      <View style={styles.chartSection}>
        <Eyebrow>Listening minutes</Eyebrow>
        <View style={styles.chart}>
          {minutes.map((height, index) => (
            <View key={index} style={[styles.bar, { height }, index === 6 && styles.barToday]} />
          ))}
        </View>
      </View>
    </AppScreen>
  );
}

function TrackCard({
  color,
  label,
  note,
  value,
}: {
  color: string;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <View style={styles.trackCard}>
      <View style={[styles.trackRing, { borderColor: color }]}>
        <Text style={styles.trackValue}>{value}</Text>
      </View>
      <Text style={styles.trackLabel}>{label}</Text>
      <Text style={styles.trackNote}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, padding: 22 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1.1,
  },
  streakCard: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginHorizontal: 18,
    padding: 22,
  },
  flame: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  days: { color: Palette.cream, fontFamily: VokaFonts.displayExtraBold, fontSize: 31 },
  subtext: { color: 'rgba(241, 237, 227, 0.5)', fontFamily: VokaFonts.bodyMedium, fontSize: 12 },
  week: { flexDirection: 'row', gap: 6, marginTop: 8, width: '100%' },
  weekDay: { backgroundColor: 'rgba(241, 237, 227, 0.13)', borderRadius: 10, flex: 1, height: 46 },
  weekDayDone: { backgroundColor: Palette.orange },
  trackCards: { flexDirection: 'row', gap: 10, padding: 18 },
  trackCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 22,
    flex: 1,
    padding: 18,
  },
  trackRing: {
    alignItems: 'center',
    borderRadius: 99,
    borderWidth: 7,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  trackValue: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 16 },
  trackLabel: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 12, marginTop: 10 },
  trackNote: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 10, marginTop: 2 },
  chartSection: { padding: 22 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 8, height: 110, marginTop: 18 },
  bar: { backgroundColor: '#D3D1CC', borderRadius: 8, flex: 1 },
  barToday: { backgroundColor: Palette.orange },
});
