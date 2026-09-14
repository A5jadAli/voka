import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

const days = Array.from({ length: 30 }, (_, index) => index + 1);

export default function SprintScreen() {
  const router = useRouter();
  return (
    <AppScreen activeNav="plan">
      <View style={styles.headerRow}>
        <Eyebrow>September — October</Eyebrow>
        <Text style={styles.title}>Your 30 days</Text>
      </View>

      <View style={styles.legend}>
        <Legend color={Palette.orange} label="Done" />
        <Legend color={Palette.white} label="Today" outline />
        <Legend color={Palette.soft} label="Later" />
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const done = day < 9;
          const today = day === 9;
          return (
            <View
              key={day}
              style={[
                styles.day,
                done && styles.dayDone,
                today && styles.dayToday,
                day === 30 && styles.dayFinish,
              ]}
            >
              {day === 30 ? (
                <MaterialCommunityIcons
                  color={Palette.orange}
                  name="shield-check-outline"
                  size={22}
                />
              ) : (
                <>
                  <Text style={[styles.dayText, today && styles.dayTextToday]}>{day}</Text>
                  {today ? <View style={styles.todayMarker} /> : null}
                </>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityLabel="Open today's speaking task"
        onPress={() => router.push('/conversation?track=EN')}
        style={({ pressed }) => [styles.todayCard, pressed && styles.pressed]}
      >
        <View style={styles.todayCopy}>
          <Eyebrow color={Palette.orange}>Day 9 · Today</Eyebrow>
          <Text style={styles.todayTitle}>Speaking Part 2 & chart writing</Text>
          <View style={styles.chips}>
            <Text style={styles.chip}>25 min</Text>
            <Text style={styles.chip}>3 tasks</Text>
          </View>
        </View>
        <MaterialCommunityIcons color={Palette.cream} name="chevron-right" size={28} />
      </Pressable>
    </AppScreen>
  );
}

function Legend({
  color,
  label,
  outline = false,
}: {
  color: string;
  label: string;
  outline?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[styles.legendSwatch, { backgroundColor: color }, outline && styles.legendOutline]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 22, paddingTop: 14 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1.1,
    marginTop: 5,
  },
  legend: { flexDirection: 'row', gap: 16, paddingHorizontal: 22, paddingVertical: 18 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  legendSwatch: { borderRadius: 5, height: 14, width: 14 },
  legendOutline: { borderColor: Palette.ink, borderWidth: 2 },
  legendText: { color: Palette.secondary, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  day: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: Palette.soft,
    borderRadius: 14,
    justifyContent: 'center',
    width: '17%',
  },
  dayDone: { backgroundColor: Palette.orange },
  dayToday: { backgroundColor: Palette.ink },
  dayFinish: { backgroundColor: Palette.ink },
  dayText: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    transform: [{ translateY: -9 }],
  },
  dayTextToday: { color: Palette.cream },
  todayMarker: {
    backgroundColor: Palette.orange,
    bottom: 8,
    borderRadius: 9,
    height: 3,
    position: 'absolute',
    width: 16,
  },
  todayCard: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 24,
    flexDirection: 'row',
    margin: 20,
    padding: 20,
  },
  todayCopy: { flex: 1 },
  todayTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 20,
    marginTop: 8,
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: {
    backgroundColor: 'rgba(241, 237, 227, 0.13)',
    borderRadius: 99,
    color: Palette.cream,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pressed: { opacity: 0.7 },
});
