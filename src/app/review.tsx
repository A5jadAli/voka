import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AnswerChoice } from '@/components/answer-choice';
import { AudioIconButton } from '@/components/lesson-audio-button';
import {
  ActionBar,
  InfoCard,
  LessonTopBar,
  lessonText,
  PrimaryButton,
  TextButton,
} from '@/components/lesson-ui';
import { AppScreen } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { freshFoundationEntry } from '@/features/foundations/progress';
import { useSelectedLanguage } from '@/features/language/selection';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';
import {
  buildReviewSession,
  dayNumber,
  gradeCard,
  reviewSummary,
  type ReviewItem,
} from '@/features/review/schedule';

export default function ReviewScreen() {
  const [track] = useSelectedLanguage();
  return <ReviewSession key={track} track={track} />;
}

function ReviewSession({ track }: { track: 'DE' | 'EN' }) {
  const router = useRouter();
  const progress = useCoachingStore((state) => state.foundations);
  const save = useCoachingStore((state) => state.saveFoundation);
  const speech = useLessonSpeech(track === 'EN' ? 'en-GB' : 'de-DE');
  const language = track === 'EN' ? 'English' : 'German';
  // Build once so grading does not reshuffle the running session.
  const [queue, setQueue] = useState<ReviewItem[]>(() => buildReviewSession(progress, track));
  const [total] = useState(queue.length);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<'correct' | 'wrong' | null>(null);
  const graded = useRef(new Set<string>());
  const [remembered, setRemembered] = useState(0);
  const item = queue[position];

  const grade = (correct: boolean) => {
    // Only the first attempt in a session moves the card; retries are for learning.
    if (!graded.current.has(item.key)) {
      graded.current.add(item.key);
      const entry =
        useCoachingStore.getState().foundations[item.lessonId] ?? freshFoundationEntry();
      save(item.lessonId, gradeCard(entry, item.phraseIndex, correct, dayNumber()));
      if (correct) setRemembered((value) => value + 1);
    }
    if (!correct) setQueue((items) => [...items, { ...item, kind: 'recall' }]);
  };
  const nextItem = () => {
    speech.stop();
    setSelected(null);
    setRevealed(false);
    setOutcome(null);
    setPosition(position + 1);
  };

  if (!total || !item) {
    const summary = reviewSummary(useCoachingStore.getState().foundations, track);
    return (
      <AppScreen
        showNav={false}
        footer={
          <ActionBar>
            <PrimaryButton
              title={total ? 'Back to learning' : 'Open lessons'}
              onPress={() => router.replace(`/sprint?track=${track}` as Href)}
            />
          </ActionBar>
        }
      >
        <LessonTopBar progress={total ? 1 : 0} />
        <View style={styles.center}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.badge}>
            <MaterialCommunityIcons
              name={total ? 'brain' : 'calendar-check'}
              size={40}
              color={Palette.ink}
            />
          </Animated.View>
          <Text accessibilityRole="header" style={lessonText.title}>
            {total ? 'Review complete' : 'Nothing to review yet'}
          </Text>
          <Text style={[lessonText.lead, { textAlign: 'center' }]}>
            {total
              ? `You remembered ${remembered} of ${total} phrases on the first try. Missed phrases come back tomorrow; remembered ones come back later each time.`
              : summary.learning
                ? 'You are up to date. Phrases come back just before you are likely to forget them.'
                : 'Finish a guided lesson and its phrases will appear here the next day.'}
          </Text>
          {summary.learning ? (
            <View style={styles.stats}>
              <Stat label="In review" value={summary.learning} />
              <Stat label="Strong" value={summary.strong} />
              <Stat label="Due now" value={summary.due} />
            </View>
          ) : null}
        </View>
      </AppScreen>
    );
  }

  const objective = item.kind !== 'recall';
  const correct = objective && selected === item.answer;
  const footer = objective ? (
    <ActionBar
      feedback={
        outcome
          ? outcome === 'correct'
            ? { tone: 'correct', title: 'Correct', message: `${item.target}: ${item.meaning}` }
            : { tone: 'wrong', title: 'Not quite', message: `${item.target}: ${item.meaning}` }
          : undefined
      }
    >
      {outcome ? (
        <PrimaryButton
          tone={outcome === 'correct' ? 'green' : 'red'}
          title="Continue"
          onPress={nextItem}
        />
      ) : (
        <PrimaryButton
          title="Check"
          disabled={selected === null}
          onPress={() => {
            setOutcome(correct ? 'correct' : 'wrong');
            grade(correct);
          }}
        />
      )}
    </ActionBar>
  ) : (
    <ActionBar>
      {revealed ? (
        <View style={styles.selfGrade}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              tone="red"
              title="Not yet"
              onPress={() => {
                grade(false);
                nextItem();
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              tone="green"
              title="I knew it"
              onPress={() => {
                grade(true);
                nextItem();
              }}
            />
          </View>
        </View>
      ) : (
        <PrimaryButton title="Show answer" onPress={() => setRevealed(true)} />
      )}
    </ActionBar>
  );

  return (
    <AppScreen showNav={false} footer={footer}>
      <LessonTopBar
        progress={position / queue.length}
        label={`${Math.min(position + 1, queue.length)}/${queue.length}`}
      />
      <View style={styles.body}>
        <Text style={lessonText.meta}>
          {language} review ·{' '}
          {item.kind === 'choose' ? 'recognise' : item.kind === 'listen' ? 'listen' : 'recall'}
        </Text>
        {item.kind === 'choose' ? (
          <>
            <Text style={lessonText.prompt}>Which phrase means:</Text>
            <InfoCard icon="translate" title={item.meaning}>
              {item.use}
            </InfoCard>
          </>
        ) : null}
        {item.kind === 'listen' ? (
          <>
            <Text style={lessonText.prompt}>What does this mean?</Text>
            <View style={styles.listen}>
              <AudioIconButton
                speech={speech}
                text={item.target}
                label="Play the phrase"
                size={76}
                tone="accent"
              />
              <AudioIconButton
                speech={speech}
                text={item.target}
                label="Play the phrase slowly"
                rate={0.6}
                slow
                size={56}
              />
            </View>
          </>
        ) : null}
        {objective ? (
          <View style={{ gap: 10 }}>
            {item.options.map((option, index) => (
              <AnswerChoice
                key={option}
                label={option}
                selected={selected === index}
                result={
                  outcome && selected === index
                    ? outcome === 'correct'
                      ? 'correct'
                      : 'incorrect'
                    : undefined
                }
                disabled={Boolean(outcome)}
                onPress={() => setSelected(index)}
              />
            ))}
          </View>
        ) : (
          <>
            <Text style={lessonText.prompt}>Say it in {language} before you reveal it:</Text>
            <InfoCard icon="translate" title={item.meaning}>
              {item.use}
            </InfoCard>
            {revealed ? (
              <View style={styles.answer}>
                <Text selectable style={styles.answerText}>
                  {item.target}
                </Text>
                <AudioIconButton speech={speech} text={item.target} label="Hear the answer" />
              </View>
            ) : (
              <Text style={lessonText.small}>
                Saying it out loud builds speaking recall. Be honest when you grade yourself.
              </Text>
            )}
          </>
        )}
        {speech.error ? (
          <Text accessibilityRole="alert" style={lessonText.small}>
            {speech.error}
          </Text>
        ) : null}
        <TextButton title="End review" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={lessonText.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 },
  center: { alignItems: 'center', gap: 14, padding: 24, paddingTop: 40 },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  stats: { alignSelf: 'stretch', flexDirection: 'row', gap: 10 },
  stat: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 18,
    flex: 1,
    paddingVertical: 14,
  },
  statValue: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 22 },
  listen: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'center' },
  answer: {
    alignItems: 'center',
    backgroundColor: '#E3F2E5',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  answerText: {
    color: Palette.ink,
    flex: 1,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 20,
    lineHeight: 27,
  },
  selfGrade: { flexDirection: 'row', gap: 10 },
});
