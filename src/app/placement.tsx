import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AnswerChoice } from '@/components/answer-choice';
import { AudioIconButton } from '@/components/lesson-audio-button';
import {
  ActionBar,
  InfoCard,
  LessonTopBar,
  lessonText,
  PrimaryButton,
  SectionLabel,
  TextButton,
} from '@/components/lesson-ui';
import { AppScreen } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { optionOrder } from '@/features/foundations/catalog';
import { useSelectedLanguage } from '@/features/language/selection';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';
import {
  evaluatePlacement,
  placementStages,
  STAGE_PASS_MARK,
  stagePassed,
} from '@/features/placement/items';

export default function PlacementScreen() {
  const [track, setTrack] = useSelectedLanguage();
  return <PlacementCheck key={track} track={track} onTrack={setTrack} />;
}

function PlacementCheck({
  track,
  onTrack,
}: {
  track: 'DE' | 'EN';
  onTrack: (track: 'DE' | 'EN') => void;
}) {
  const router = useRouter();
  const speech = useLessonSpeech(track === 'EN' ? 'en-GB' : 'de-DE');
  const stages = placementStages(track);
  const [started, setStarted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const stage = stages[stageIndex];
  const item = stage[itemIndex];
  const language = track === 'EN' ? 'English' : 'German';
  const totalItems = stages.reduce((sum, value) => sum + value.length, 0);
  const answeredCount = Object.keys(answers).length;

  const next = () => {
    if (selected === null) return;
    speech.stop();
    const updated = { ...answers, [item.id]: selected };
    setAnswers(updated);
    setSelected(null);
    if (itemIndex < stage.length - 1) setItemIndex(itemIndex + 1);
    else if (stagePassed(stage, updated) && stageIndex < stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setItemIndex(0);
    } else setFinished(true);
  };
  const restart = () => {
    speech.stop();
    setAnswers({});
    setStageIndex(0);
    setItemIndex(0);
    setSelected(null);
    setFinished(false);
  };

  if (!started)
    return (
      <AppScreen
        showNav={false}
        footer={
          <ActionBar>
            <PrimaryButton
              title="Start the check"
              icon="arrow-right"
              onPress={() => setStarted(true)}
            />
          </ActionBar>
        }
      >
        <LessonTopBar progress={0} />
        <View style={styles.body}>
          <Text style={lessonText.meta}>Where should I start?</Text>
          <Text accessibilityRole="header" style={lessonText.title}>
            {language} placement check
          </Text>
          <Text style={lessonText.lead}>
            About 3–5 minutes. Questions get harder while you answer securely, and the check stops
            at the right level. You will see your answers at the end, so choose what you really
            think rather than guessing.
          </Text>
          <View accessibilityRole="radiogroup" style={styles.trackRow}>
            {(['DE', 'EN'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: track === value }}
                onPress={() => onTrack(value)}
                style={[styles.trackButton, track === value && styles.trackSelected]}
              >
                <Text style={styles.trackText}>{value === 'DE' ? 'German' : 'English'}</Text>
              </Pressable>
            ))}
          </View>
          <InfoCard icon="format-list-checks" title="What it covers">
            Grammar, vocabulary, listening and real-world phrasing, five questions per level.
            Listening questions use your device voice; turn your sound on.
          </InfoCard>
        </View>
      </AppScreen>
    );

  if (finished) {
    const result = evaluatePlacement(track, answers);
    const missed = stages
      .flat()
      .filter((entry) => answers[entry.id] !== undefined && answers[entry.id] !== entry.answer);
    return (
      <AppScreen
        showNav={false}
        footer={
          <ActionBar>
            <PrimaryButton
              title="Start practice"
              accessibilityLabel="Start recommended practice"
              icon="arrow-right"
              onPress={() => router.replace(result.recommendation.href as Href)}
            />
          </ActionBar>
        }
      >
        <LessonTopBar progress={1} />
        <View style={styles.body}>
          <View style={styles.center}>
            <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.badge}>
              <Text style={styles.badgeText}>{result.secure ?? 'A0'}</Text>
            </Animated.View>
            <Text accessibilityRole="header" style={[lessonText.title, { textAlign: 'center' }]}>
              {result.secure ? `Secure up to ${result.secure} tasks` : 'Start from the beginning'}
            </Text>
            <Text style={[lessonText.lead, { textAlign: 'center' }]}>
              {result.correct} of {result.answered} answers correct. A level counts as secure with{' '}
              {STAGE_PASS_MARK} of 5. This suggests where to start; it is not a certified CEFR level
              or an exam score.
            </Text>
          </View>
          <InfoCard icon="compass-outline" title={result.recommendation.title} tone="yellow">
            {result.recommendation.why}
          </InfoCard>
          {missed.length ? (
            <>
              <SectionLabel>Review what you missed</SectionLabel>
              {missed.map((entry) => (
                <View key={entry.id} style={styles.missed}>
                  <Text style={lessonText.meta}>
                    {entry.level} · {entry.skill}
                  </Text>
                  <Text style={styles.missedPrompt}>{entry.prompt}</Text>
                  <View style={styles.missedAnswer}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#1F5A33" />
                    <Text style={styles.missedAnswerText}>{entry.options[entry.answer]}</Text>
                  </View>
                  <Text style={lessonText.small}>{entry.explanation}</Text>
                </View>
              ))}
            </>
          ) : null}
          <TextButton
            title="Try the spoken level check"
            onPress={() => router.push('/level-check')}
          />
          <TextButton title="Take the check again" onPress={restart} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      showNav={false}
      footer={
        <ActionBar>
          <PrimaryButton
            title={itemIndex === stage.length - 1 ? 'Finish this stage' : 'Next question'}
            disabled={selected === null}
            onPress={next}
          />
        </ActionBar>
      }
    >
      <LessonTopBar progress={answeredCount / totalItems} label={item.level} />
      <View style={styles.body}>
        <Text style={lessonText.meta}>
          Stage {stageIndex + 1} of {stages.length} · {item.level} · Question {itemIndex + 1} of{' '}
          {stage.length}
        </Text>
        <Text accessibilityRole="header" style={lessonText.prompt}>
          {item.prompt}
        </Text>
        {item.audio ? (
          <View style={styles.listen}>
            <AudioIconButton
              speech={speech}
              label="Play the question audio"
              text={item.audio}
              size={76}
              tone="accent"
            />
            <AudioIconButton
              speech={speech}
              label="Play the question audio slowly"
              text={item.audio}
              rate={0.6}
              slow
              size={56}
            />
          </View>
        ) : null}
        <View style={{ gap: 10 }}>
          {optionOrder(item.id, item.options.length).map((choice) => (
            <AnswerChoice
              key={item.options[choice]}
              label={item.options[choice]}
              selected={selected === choice}
              onPress={() => setSelected(choice)}
            />
          ))}
        </View>
        {speech.error ? (
          <Text accessibilityRole="alert" style={lessonText.small}>
            {speech.error}
          </Text>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 },
  center: { alignItems: 'center', gap: 12, paddingTop: 12 },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  badgeText: { color: Palette.ink, fontFamily: VokaFonts.displayExtraBold, fontSize: 32 },
  trackRow: { flexDirection: 'row', gap: 8 },
  trackButton: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  trackSelected: { backgroundColor: '#FFF1BC', borderColor: Palette.yellow },
  trackText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 16 },
  listen: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  missed: { backgroundColor: Palette.white, borderRadius: 18, gap: 8, padding: 16 },
  missedPrompt: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 23,
  },
  missedAnswer: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  missedAnswerText: { color: '#1F5A33', fontFamily: VokaFonts.bodyBold, fontSize: 15 },
});
