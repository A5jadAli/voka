import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ActionBar,
  ActionRow,
  InfoCard,
  lessonText,
  PrimaryButton,
  SectionLabel,
} from '@/components/lesson-ui';
import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { learningRecommendation } from '@/features/coaching/recommendation';
import { useCoachingStore, type StartingAbility, type StudyGoal } from '@/features/coaching/store';
import { useSelectedLanguage } from '@/features/language/selection';

const abilities: [StartingAbility, string][] = [
  ['new', 'I am starting from zero'],
  ['basics', 'I know some words and short phrases'],
  ['conversational', 'I can already have a simple conversation'],
];

export default function LearningPlanScreen() {
  const router = useRouter();
  const [track, setTrack] = useSelectedLanguage();
  const preferences = useCoachingStore((state) => state.preferences[track]);
  const setChoices = useCoachingStore((state) => state.setLearningChoices);
  const ability = preferences.ability ?? 'new';
  const goal = preferences.studyGoal ?? 'everyday';
  const next = learningRecommendation(track, ability, goal);
  const goals: [StudyGoal, string][] = [
    ['everyday', 'Everyday life'],
    ['work-study', 'Work and study'],
    ...(track === 'EN'
      ? ([
          ['ielts-academic', 'IELTS Academic'],
          ['ielts-general', 'IELTS General Training'],
        ] as [StudyGoal, string][])
      : []),
  ];
  return (
    <AppScreen
      showNav={false}
      footer={
        <ActionBar>
          <PrimaryButton
            title="Start practice"
            accessibilityLabel="Start recommended practice"
            icon="arrow-right"
            onPress={() => router.replace(next.href as Href)}
          />
        </ActionBar>
      }
    >
      <View style={styles.header}>
        <HeaderBack />
      </View>
      <View style={styles.body}>
        <Text style={lessonText.meta}>Your learning plan</Text>
        <Text accessibilityRole="header" style={lessonText.title}>
          A useful place to start
        </Text>
        <Text style={lessonText.lead}>
          Choose what fits today. You can change it any time from Home.
        </Text>

        <View accessibilityRole="tablist" style={styles.segment}>
          {(['DE', 'EN'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: track === value }}
              aria-pressed={track === value}
              onPress={() => setTrack(value)}
              style={[styles.segmentItem, track === value && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, track === value && styles.segmentTextActive]}>
                {value === 'DE' ? 'German' : 'English'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ActionRow
          icon="compass-outline"
          title="Not sure? Take the 5-minute placement check"
          onPress={() => router.push('/placement' as Href)}
        />

        <SectionLabel>How much do you know?</SectionLabel>
        <View style={styles.group}>
          {abilities.map(([value, label]) => (
            <ActionRow
              key={value}
              title={label}
              selected={ability === value}
              onPress={() => setChoices(track, value, goal)}
            />
          ))}
        </View>

        <SectionLabel>What would you like to use it for?</SectionLabel>
        <View style={styles.group}>
          {goals.map(([value, label]) => (
            <ActionRow
              key={value}
              title={label}
              selected={goal === value}
              onPress={() => setChoices(track, ability, value)}
            />
          ))}
        </View>

        <InfoCard icon="arrow-right-circle-outline" title={next.title} tone="yellow">
          {next.why}
        </InfoCard>
        <Text style={lessonText.small}>
          Practice supports learning, not a certified CEFR level or IELTS result. IELTS goals
          include a four-skill practice guide in Learn.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  body: { gap: 14, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 },
  group: { gap: 8 },
  segment: {
    backgroundColor: 'rgba(19,18,17,0.07)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentActive: { backgroundColor: Palette.ink },
  segmentText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 15 },
  segmentTextActive: { color: Palette.cream },
});
