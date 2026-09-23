import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { listeningScenarios, type LanguageTrack } from '@/features/listening/scenarios';
import { hasCompletedOnboarding } from '@/features/onboarding/storage';
import { useProgressStore } from '@/features/progress/store';
import { useSelectedLanguage } from '@/features/language/selection';
import { getCurriculumUnits } from '@/features/curriculum/catalog';
import { FoundationPath } from '@/components/foundation-path';
import { LearningRecommendation } from '@/components/learning-recommendation';

export default function HomeScreen() {
  const [track, setTrack] = useSelectedLanguage();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void hasCompletedOnboarding().then((completed) => {
      if (!completed) router.replace('/onboarding');
    });
  }, [router]);

  return (
    <AppScreen activeNav="home">
      <View style={styles.header}>
        <Text style={styles.logo}>VOKA</Text>
        <TrackSwitch track={track} onChange={setTrack} />
      </View>
      <LearningRecommendation track={track} />
      {track === 'EN' ? <EnglishHome /> : <GermanHome />}
    </AppScreen>
  );
}

function TrackSwitch({
  onChange,
  track,
}: {
  onChange: (track: LanguageTrack) => void;
  track: LanguageTrack;
}) {
  return (
    <View accessibilityLabel="Practice language" style={styles.trackSwitch}>
      {(['EN', 'DE'] as const).map((item) => (
        <Pressable
          accessibilityLabel={item === 'EN' ? 'English' : 'German'}
          accessibilityRole="button"
          accessibilityState={{ selected: item === track }}
          key={item}
          onPress={() => onChange(item)}
          style={[
            styles.trackButton,
            item === track && styles.trackButtonSelected,
            item === 'DE' && item === track && styles.trackButtonGerman,
          ]}
        >
          <Text
            style={[
              styles.trackText,
              item === track && styles.trackTextSelected,
              item === 'DE' && item === track && styles.trackTextGerman,
            ]}
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function EnglishHome() {
  const router = useRouter();
  const completedIds = useProgressStore((state) => state.completedScenarioIds);
  const writingPracticeDays = useCoachingStore((state) => state.writingPracticeDates.length);
  const englishScenarios = listeningScenarios.filter((scenario) => scenario.track === 'EN');
  const completedEnglish = englishScenarios.filter((scenario) =>
    completedIds.includes(scenario.id),
  ).length;

  return (
    <>
      <Pressable
        accessibilityLabel="Open English listening lessons"
        onPress={() => router.push('/listening?track=EN' as Href)}
        style={({ pressed }) => [styles.deadlineCard, pressed && styles.pressed]}
      >
        <View style={styles.deadlineRing}>
          <View style={styles.deadlineRingInner}>
            <Text style={styles.deadlineDays}>{completedEnglish}</Text>
            <Text style={styles.deadlineUnit}>DONE</Text>
          </View>
        </View>
        <View style={styles.deadlineCopy}>
          <Text style={styles.deadlineTitle}>Build real-world listening</Text>
          <Text style={styles.deadlineMeta}>
            {completedEnglish} of {englishScenarios.length} English lessons complete
          </Text>
        </View>
      </Pressable>

      <EyebrowBlock>Choose your next practice</EyebrowBlock>
      <View style={styles.taskList}>
        <TaskCard
          accessibilityLabel="Open live English conversation"
          color={Palette.orange}
          icon="microphone"
          onPress={() => router.push('/conversation?track=EN')}
          subtitle="Natural conversation · interrupt anytime"
          title="Speak"
        />
        <TaskCard
          color={Palette.ink}
          icon="format-letter-case"
          onPress={() => router.push('/activity/write')}
          subtitle={
            writingPracticeDays
              ? `${writingPracticeDays} writing ${writingPracticeDays === 1 ? 'day' : 'days'} complete`
              : 'Short guided response · saved progress'
          }
          title="Write"
        />
        <TaskCard
          color={Palette.yellow}
          icon="book-open-page-variant"
          onPress={() => router.push('/reading' as Href)}
          subtitle="Read, check meaning and explain your answer"
          title="Read"
        />
        <TaskCard
          color={Palette.soft}
          icon="volume-high"
          iconColor={Palette.ink}
          onPress={() => router.push('/listening?track=EN' as Href)}
          subtitle="Everyday speech · subtitles available"
          title="Listen"
        />
      </View>

      <View style={styles.streakStrip}>
        <View style={styles.streakDots}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <View
              key={day}
              style={[
                styles.streakDot,
                day < Math.min(completedIds.length, 7) && styles.streakDotDone,
              ]}
            />
          ))}
        </View>
        <Text style={styles.streakText}>
          {completedIds.length} {completedIds.length === 1 ? 'lesson' : 'lessons'} completed
        </Text>
      </View>
    </>
  );
}

function GermanHome() {
  const router = useRouter();
  const completed = useCoachingStore((state) => state.completedUnitIds);
  const units = getCurriculumUnits('DE');
  const nextUnit = units.find((unit) => !completed.includes(unit.id));
  return (
    <>
      <View style={styles.germanHero}>
        <Text style={styles.greeting}>Everyday German</Text>
        <View style={styles.levelPill}>
          <View style={styles.levelDot} />
          <Text style={styles.levelText}>Guided practice · choose your level</Text>
        </View>
      </View>

      <FoundationPath compact />
      <EyebrowBlock>Speaking practice</EyebrowBlock>
      <View style={styles.pathCard}>
        <View style={styles.pathLine} />
        {units.slice(0, 3).map((unit) => (
          <Pressable
            key={unit.id}
            accessibilityRole="button"
            accessibilityLabel={`Practise ${unit.title}`}
            onPress={() => router.push(`/conversation?track=DE&unit=${unit.id}`)}
          >
            <PathStep
              color={nextUnit?.id === unit.id ? Palette.ink : Palette.soft}
              icon="account-voice"
              label={`${unit.level} · ${unit.title}`}
              active={nextUnit?.id === unit.id}
            />
          </Pressable>
        ))}
        <Pressable
          accessibilityLabel="Open German learning path"
          accessibilityRole="button"
          onPress={() => router.push('/sprint?track=DE')}
          style={{ paddingVertical: 14 }}
        >
          <Text
            style={{
              fontFamily: VokaFonts.bodySemiBold,
              color: Palette.ink,
              textDecorationLine: 'underline',
            }}
          >
            See speaking scenarios
          </Text>
        </Pressable>
      </View>

      <View style={styles.taskList}>
        <TaskCard
          accessibilityLabel="Open German listening lessons"
          color={Palette.yellow}
          icon="volume-high"
          iconColor={Palette.ink}
          onPress={() => router.push('/listening?track=DE' as Href)}
          subtitle="All German dialogues · slow audio and meanings"
          title="Listen"
        />
      </View>
      <Pressable
        accessibilityLabel="Open German vocabulary"
        onPress={() => router.push('/vocabulary')}
        style={({ pressed }) => [styles.germanToday, pressed && styles.pressed]}
      >
        <View style={styles.germanTodayIcon}>
          <MaterialCommunityIcons color={Palette.ink} name="cards-outline" size={26} />
        </View>
        <View style={styles.germanTodayCopy}>
          <Eyebrow color={Palette.yellow}>Vocabulary · 3 cards</Eyebrow>
          <Text style={styles.germanTodayTitle}>Order naturally at a café</Text>
        </View>
        <MaterialCommunityIcons color={Palette.cream} name="chevron-right" size={25} />
      </Pressable>
      <Pressable
        accessibilityLabel="Open live German conversation"
        onPress={() => router.push('/conversation?track=DE')}
        style={({ pressed }) => [styles.liveGerman, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons color={Palette.ink} name="microphone" size={20} />
        <Text style={styles.liveGermanText}>Practise this with the live coach</Text>
      </Pressable>
    </>
  );
}

function EyebrowBlock({ children }: { children: string }) {
  return (
    <View style={styles.eyebrowBlock}>
      <Eyebrow>{children}</Eyebrow>
    </View>
  );
}

function TaskCard({
  accessibilityLabel,
  color,
  icon,
  iconColor = Palette.cream,
  onPress,
  subtitle,
  title,
}: {
  accessibilityLabel?: string;
  color: string;
  icon: 'format-letter-case' | 'microphone' | 'volume-high' | 'book-open-page-variant';
  iconColor?: string;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? `Open ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.taskCard, pressed && styles.pressed]}
    >
      <View style={[styles.taskIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons color={iconColor} name={icon} size={25} />
      </View>
      <View style={styles.taskCopy}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={styles.taskSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons color="rgba(19,18,17,.3)" name="chevron-right" size={24} />
    </Pressable>
  );
}

function PathStep({
  active = false,
  color,
  icon,
  label,
}: {
  active?: boolean;
  color: string;
  icon: 'account-voice' | 'briefcase-outline' | 'food-fork-drink' | 'train';
  label: string;
}) {
  return (
    <View style={styles.pathStep}>
      <View style={[styles.pathIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons
          color={active ? Palette.yellow : Palette.ink}
          name={icon}
          size={18}
        />
      </View>
      <Text style={[styles.pathLabel, active && styles.pathLabelActive]}>{label}</Text>
      {active ? <Text style={styles.pathCurrent}>NEXT</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  logo: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 22,
    letterSpacing: -0.9,
  },
  trackSwitch: {
    backgroundColor: Palette.soft,
    borderRadius: 99,
    flexDirection: 'row',
    padding: 3,
  },
  trackButton: { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 7 },
  trackButtonSelected: { backgroundColor: Palette.ink },
  trackButtonGerman: { backgroundColor: Palette.yellow },
  trackText: { color: Palette.muted, fontFamily: VokaFonts.monoMedium, fontSize: 12 },
  trackTextSelected: { color: Palette.cream },
  trackTextGerman: { color: Palette.ink },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  deadlineCard: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 20,
    marginHorizontal: 18,
    padding: 24,
  },
  deadlineRing: {
    alignItems: 'center',
    borderColor: Palette.orange,
    borderRadius: 99,
    borderRightColor: 'rgba(241,237,227,.16)',
    borderWidth: 10,
    height: 92,
    justifyContent: 'center',
    transform: [{ rotate: '-35deg' }],
    width: 92,
  },
  deadlineRingInner: { alignItems: 'center', transform: [{ rotate: '35deg' }] },
  deadlineDays: { color: Palette.cream, fontFamily: VokaFonts.displayExtraBold, fontSize: 26 },
  deadlineUnit: {
    color: 'rgba(241,237,227,.5)',
    fontFamily: VokaFonts.monoMedium,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  deadlineCopy: { flex: 1 },
  deadlineTitle: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 20 },
  deadlineMeta: {
    color: 'rgba(241,237,227,.6)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  eyebrowBlock: { paddingBottom: 12, paddingHorizontal: 22, paddingTop: 26 },
  taskList: { gap: 10, paddingHorizontal: 18 },
  taskCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  taskIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  taskCopy: { flex: 1 },
  taskTitle: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 19 },
  taskSubtitle: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 12,
    marginTop: 2,
  },
  streakStrip: {
    alignItems: 'center',
    borderColor: 'rgba(19,18,17,.18)',
    borderRadius: 22,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 14,
    margin: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  streakDots: { flexDirection: 'row', gap: 5 },
  streakDot: { backgroundColor: 'rgba(19,18,17,.15)', borderRadius: 99, height: 13, width: 13 },
  streakDotDone: { backgroundColor: Palette.orange },
  streakText: { color: Palette.secondary, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  germanHero: { paddingHorizontal: 22, paddingTop: 1 },
  greeting: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1.1,
  },
  levelPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(242,183,5,.22)',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  levelDot: { backgroundColor: Palette.yellow, borderRadius: 99, height: 8, width: 8 },
  levelText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  pathCard: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 24,
    borderWidth: 1,
    gap: 4,
    marginHorizontal: 18,
    padding: 18,
    position: 'relative',
  },
  pathLine: {
    backgroundColor: Palette.line,
    bottom: 42,
    left: 37,
    position: 'absolute',
    top: 42,
    width: 2,
  },
  pathStep: { alignItems: 'center', flexDirection: 'row', gap: 14, minHeight: 57 },
  pathIcon: {
    alignItems: 'center',
    borderRadius: 99,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  pathLabel: {
    color: Palette.secondary,
    flex: 1,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 14,
  },
  pathLabelActive: { color: Palette.ink, fontFamily: VokaFonts.bodyBold },
  pathCurrent: {
    color: Palette.yellow,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 9,
    letterSpacing: 1,
  },
  germanToday: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 14,
    marginHorizontal: 18,
    marginTop: 16,
    padding: 18,
  },
  germanTodayIcon: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  germanTodayCopy: { flex: 1 },
  germanTodayTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 18,
    marginTop: 5,
  },
  liveGerman: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginBottom: 18,
    marginHorizontal: 18,
    marginTop: 10,
    minHeight: 52,
  },
  liveGermanText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 12 },
});
