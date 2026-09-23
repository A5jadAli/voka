import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { speakingGoalCopy, useCoachingStore } from '@/features/coaching/store';
import { getCurriculumUnits } from '@/features/curriculum/catalog';
import { useSelectedLanguage } from '@/features/language/selection';
import { formatTestDate, getTestDatePlan } from '@/features/profile/test-date';
import { FoundationPath } from '@/components/foundation-path';

export default function SprintScreen() {
  const router = useRouter();
  const [track, setTrack] = useSelectedLanguage();
  const completedIds = useCoachingStore((state) => state.completedUnitIds);
  const goal = useCoachingStore((state) => state.preferences[track].goal);
  const testDate = useCoachingStore((state) => state.testDate);
  const testPlan = getTestDatePlan(testDate);
  const units = getCurriculumUnits(track);
  const accent = track === 'EN' ? Palette.orange : Palette.yellow;

  return (
    <AppScreen activeNav="plan">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Eyebrow>Speaking practice scenarios</Eyebrow>
          <Text style={styles.title}>From first words to real presence</Text>
        </View>
        <View style={styles.trackSwitch}>
          {(['EN', 'DE'] as const).map((item) => (
            <Pressable
              accessibilityLabel={item === 'EN' ? 'English learning path' : 'German learning path'}
              accessibilityRole="button"
              accessibilityState={{ selected: track === item }}
              key={item}
              onPress={() => setTrack(item)}
              style={[styles.trackButton, track === item && { backgroundColor: accent }]}
            >
              <Text style={styles.trackText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityLabel="Change speaking style and goal"
        onPress={() => router.push(`/accent?track=${track}`)}
        style={({ pressed }) => [styles.goalCard, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons color={accent} name="target" size={23} />
        <View style={styles.goalCopy}>
          <Eyebrow color={accent}>Your goal · {speakingGoalCopy[goal].label}</Eyebrow>
          <Text style={styles.goalText}>{speakingGoalCopy[goal].description}</Text>
        </View>
        <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={22} />
      </Pressable>

      {testDate && testPlan ? (
        <Pressable
          accessibilityLabel={`Test-date practice plan for ${formatTestDate(testDate)}`}
          accessibilityRole="button"
          onPress={() => router.push('/test-date' as Href)}
          style={({ pressed }) => [styles.testPlanCard, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="calendar-clock" size={24} />
          <View style={styles.goalCopy}>
            <Eyebrow>Practice suggestions · {formatTestDate(testDate)}</Eyebrow>
            <Text style={styles.testPlanTitle}>{testPlan.cadence}</Text>
            <Text style={styles.testPlanCopy}>{testPlan.recommendation}</Text>
          </View>
          <MaterialCommunityIcons color={Palette.ink} name="chevron-right" size={22} />
        </Pressable>
      ) : null}

      {track === 'DE' ? <FoundationPath /> : null}
      {track === 'EN' ? (
        <View style={{ marginHorizontal: 18, gap: 12 }}>
          {(
            [
              ['Reading practice', '/reading'],
              ['Writing and revision', '/activity/write'],
              ['Optional IELTS practice guide', '/exam-practice'],
            ] as const
          ).map(([title, href]) => (
            <Pressable
              key={href}
              accessibilityRole="button"
              onPress={() => router.push(href as Href)}
              style={{
                padding: 18,
                minHeight: 48,
                borderRadius: 18,
                backgroundColor: Palette.white,
              }}
            >
              <Text style={{ fontFamily: VokaFonts.bodySemiBold, color: Palette.ink }}>
                {title}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.path}>
        <View style={styles.pathLine} />
        {units.map((unit) => {
          const complete = completedIds.includes(unit.id);
          return (
            <Pressable
              accessibilityLabel={`Open ${unit.level} ${unit.title}`}
              accessibilityRole="button"
              key={unit.id}
              onPress={() => router.push(`/conversation?track=${track}&unit=${unit.id}`)}
              style={({ pressed }) => [styles.unitCard, pressed && styles.pressed]}
            >
              <View style={[styles.level, { backgroundColor: complete ? accent : Palette.ink }]}>
                {complete ? (
                  <MaterialCommunityIcons color={Palette.ink} name="check" size={19} />
                ) : (
                  <Text style={styles.levelText}>{unit.level}</Text>
                )}
              </View>
              <View style={styles.unitCopy}>
                <Eyebrow color={complete ? accent : Palette.muted}>
                  {complete ? 'Practised' : unit.context}
                </Eyebrow>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.outcome}>{unit.outcome}</Text>
                <View style={styles.focusRow}>
                  <MaterialCommunityIcons color={accent} name="waveform" size={15} />
                  <Text style={styles.focus}>{unit.pronunciationFocus}</Text>
                </View>
              </View>
              <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={23} />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>
        CEFR labels describe scenario difficulty, not a completed level. These practice scenarios
        are not a complete CEFR course.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, padding: 22, paddingTop: 14 },
  headerCopy: { flex: 1 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 31,
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: 6,
  },
  trackSwitch: {
    backgroundColor: Palette.soft,
    borderRadius: 99,
    flexDirection: 'row',
    padding: 3,
  },
  trackButton: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 },
  trackText: { color: Palette.ink, fontFamily: VokaFonts.monoMedium, fontSize: 10 },
  goalCard: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
    padding: 17,
  },
  goalCopy: { flex: 1 },
  goalText: {
    color: 'rgba(241,237,227,.65)',
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  testPlanCard: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
    marginTop: 12,
    padding: 17,
  },
  testPlanTitle: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayBold,
    fontSize: 18,
    marginTop: 4,
  },
  testPlanCopy: {
    color: 'rgba(19,18,17,.68)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  path: { gap: 12, marginTop: 22, paddingHorizontal: 18 },
  pathLine: {
    backgroundColor: Palette.line,
    bottom: 28,
    left: 46,
    position: 'absolute',
    top: 28,
    width: 2,
  },
  unitCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 132,
    padding: 15,
  },
  level: {
    alignItems: 'center',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  levelText: { color: Palette.cream, fontFamily: VokaFonts.monoMedium, fontSize: 12 },
  unitCopy: { flex: 1 },
  unitTitle: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 19, marginTop: 4 },
  outcome: {
    color: Palette.secondary,
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },
  focusRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 7 },
  focus: {
    color: Palette.muted,
    flex: 1,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 9,
    lineHeight: 14,
  },
  note: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    margin: 22,
    textAlign: 'center',
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
