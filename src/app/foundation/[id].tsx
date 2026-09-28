import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useCallback, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnswerChoice } from '@/components/answer-choice';
import { AudioIconButton } from '@/components/lesson-audio-button';
import {
  ActionBar,
  InfoCard,
  LessonTopBar,
  lessonText,
  PhraseCard,
  PrimaryButton,
  SectionLabel,
  TextButton,
} from '@/components/lesson-ui';
import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import {
  checkFoundationWriting,
  foundationLessons,
  getTrackLessons,
  isNearMiss,
  optionOrder,
  type FoundationLesson,
} from '@/features/foundations/catalog';
import {
  freshFoundationEntry,
  MAX_DRAFT_LENGTH,
  MAX_FOUNDATION_ATTEMPTS,
  type FoundationEntry,
} from '@/features/foundations/progress';
import { useLanguageSelection } from '@/features/language/selection';
import { useLessonSpeech, type LessonSpeech } from '@/features/listening/use-lesson-speech';
import { REVIEW_INTERVALS, seedCards } from '@/features/review/schedule';

export default function FoundationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = foundationLessons.find((item) => item.id === id);
  if (!lesson)
    return (
      <AppScreen showNav={false}>
        <HeaderBack />
        <View style={styles.body}>
          <Text style={lessonText.title}>Lesson not found</Text>
          <Text style={lessonText.lead}>Go back and choose a lesson from your learning path.</Text>
        </View>
      </AppScreen>
    );
  return <GuidedLesson key={lesson.id} lesson={lesson} />;
}

type Result = { tone: 'correct' | 'wrong' | 'close'; title: string; message?: string };

function GuidedLesson({ lesson }: { lesson: FoundationLesson }) {
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      useLanguageSelection.getState().choose(lesson.track);
    }, [lesson.track]),
  );
  const languageName = lesson.track === 'EN' ? 'English' : 'German';
  const saved = useCoachingStore((state) => state.foundations[lesson.id]);
  const save = useCoachingStore((state) => state.saveFoundation);
  const entry = saved ?? freshFoundationEntry();
  const speech = useLessonSpeech(lesson.track === 'EN' ? 'en-GB' : 'de-DE');
  const [selected, setSelected] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const update = (change: Partial<FoundationEntry>) =>
    save(lesson.id, { ...entry, ...change, updatedAt: new Date().toISOString() });
  const resetTransient = () => {
    speech.stop();
    setSelected(null);
    setPinned(null);
    setResult(null);
    setShowHelp(false);
  };
  const advance = (step: number) => {
    resetTransient();
    update({ step });
  };

  const checks = lesson.checks;
  const firstUnanswered = entry.answers.findIndex(
    (answer, index) => answer !== checks[index]?.answer,
  );
  const index = pinned ?? (firstUnanswered >= 0 ? firstUnanswered : entry.answers.length);
  const question = checks[index];
  const trackLessons = getTrackLessons(lesson.track);
  const next = trackLessons[trackLessons.indexOf(lesson) + 1];
  const totalChecks = checks.length + 1;
  const lastAttempt = entry.attempts.at(-1);
  const correctNow = result?.tone === 'correct';
  const segments = checks.length + 3;
  const position =
    entry.step === 0
      ? 0.4
      : entry.step === 1
        ? 1 + index + (correctNow ? 1 : 0)
        : entry.step === 2
          ? 1 + checks.length + (correctNow ? 1 : 0)
          : entry.step === 3
            ? segments - 1
            : segments;

  const checkAnswer = () => {
    if (selected === null || !question) return;
    const correct = selected === question.answer;
    const answers = [...entry.answers];
    answers[index] = selected;
    const firstTry = [...entry.firstTry];
    if (firstTry[index] === undefined) firstTry[index] = correct;
    update({ answers, firstTry });
    if (correct) {
      setPinned(index);
      setResult({ tone: 'correct', title: 'Correct', message: question.explanation });
    } else {
      setResult({
        tone: 'wrong',
        title: 'Not quite',
        message: question.audio
          ? 'Listen again, slowly if you like, then try another answer.'
          : 'Look at the phrases again if you need to, then try another answer.',
      });
    }
  };
  const checkWriting = () => {
    Keyboard.dismiss();
    if (checkFoundationWriting(lesson, entry.draft)) {
      setResult({ tone: 'correct', title: 'Correct', message: lesson.writing.explanation });
      return;
    }
    update({ writingMistakes: entry.writingMistakes + 1 });
    setResult(
      isNearMiss(lesson, entry.draft)
        ? {
            tone: 'close',
            title: 'Very close',
            message: `One or two letters differ. Check endings, umlauts and spelling. ${lesson.writing.hint}`,
          }
        : { tone: 'wrong', title: 'Not yet', message: lesson.writing.hint },
    );
  };
  const complete = (spoken: boolean) => {
    resetTransient();
    update({
      step: 4,
      cards: seedCards(lesson, entry),
      attempts: [
        ...entry.attempts,
        {
          at: new Date().toISOString(),
          correctFirstTry:
            entry.firstTry.filter(Boolean).length + (entry.writingMistakes === 0 ? 1 : 0),
          spoken,
        },
      ].slice(-MAX_FOUNDATION_ATTEMPTS),
    });
  };
  const retry = () => {
    resetTransient();
    save(lesson.id, { ...freshFoundationEntry(), attempts: entry.attempts, cards: entry.cards });
  };

  let footer: ReactNode = null;
  if (entry.step === 0)
    footer = (
      <ActionBar>
        <PrimaryButton
          title="Practise these phrases"
          icon="arrow-right"
          onPress={() => advance(1)}
        />
      </ActionBar>
    );
  else if (entry.step === 1)
    footer = (
      <ActionBar feedback={result ?? undefined}>
        {!question ? (
          <PrimaryButton title="Continue to writing" onPress={() => advance(2)} />
        ) : correctNow ? (
          <PrimaryButton
            tone="green"
            title={index === checks.length - 1 ? 'Continue to writing' : 'Next question'}
            onPress={() => {
              if (index === checks.length - 1) advance(2);
              else resetTransient();
            }}
          />
        ) : result ? (
          <PrimaryButton
            tone="red"
            title="Try again"
            onPress={() => {
              setResult(null);
              setSelected(null);
            }}
          />
        ) : (
          <PrimaryButton title="Check" disabled={selected === null} onPress={checkAnswer} />
        )}
      </ActionBar>
    );
  else if (entry.step === 2)
    footer = (
      <ActionBar feedback={result ?? undefined}>
        {correctNow ? (
          <PrimaryButton
            tone="green"
            title="Continue to speaking practice"
            onPress={() => advance(3)}
          />
        ) : (
          <PrimaryButton
            title="Check my phrase"
            disabled={!entry.draft.trim()}
            onPress={checkWriting}
          />
        )}
      </ActionBar>
    );
  else if (entry.step === 3)
    footer = (
      <ActionBar>
        <PrimaryButton title="I practised aloud" icon="check" onPress={() => complete(true)} />
        <TextButton title="Skip speaking for now" onPress={() => complete(false)} />
      </ActionBar>
    );
  else if (lastAttempt)
    footer = (
      <ActionBar>
        {next ? (
          <PrimaryButton
            title={`Next lesson: ${next.title}`}
            icon="arrow-right"
            onPress={() => router.replace(`/foundation/${next.id}` as Href)}
          />
        ) : (
          <PrimaryButton
            title={`Try ${languageName} listening`}
            onPress={() => router.replace(`/listening?track=${lesson.track}` as Href)}
          />
        )}
      </ActionBar>
    );

  return (
    <AppScreen showNav={false} keyboardAware footer={footer}>
      <LessonTopBar progress={position / segments} label={`${lesson.level}`} />
      <View style={styles.body}>
        {speech.error ? (
          <Text accessibilityRole="alert" style={styles.alert}>
            {speech.error}
          </Text>
        ) : null}

        {entry.step === 0 ? (
          <>
            <Text style={lessonText.meta}>
              {languageName.toUpperCase()} · {lesson.level} · {lesson.phrases.length} PHRASES
            </Text>
            <Text accessibilityRole="header" style={lessonText.title}>
              {lesson.title}
            </Text>
            <Text style={lessonText.lead}>{lesson.outcome}</Text>
            {lesson.reading ? (
              <ReadingCard
                lesson={lesson}
                speech={speech}
                showTranslation={showTranslation}
                onToggle={() => setShowTranslation(!showTranslation)}
              />
            ) : null}
            <SectionLabel>Key phrases</SectionLabel>
            <PhraseList lesson={lesson} speech={speech} />
            <InfoCard icon="lightbulb-on-outline" title="How it works" tone="yellow">
              {lesson.notice}
            </InfoCard>
            {lesson.pronunciation ? (
              <InfoCard icon="waveform" title="Sound and rhythm">
                {lesson.pronunciation}
              </InfoCard>
            ) : null}
          </>
        ) : null}

        {entry.step === 1 ? (
          question ? (
            <>
              <Text style={lessonText.meta}>
                Question {index + 1} of {checks.length}
              </Text>
              {lesson.reading && !question.audio ? (
                <ReadingCard
                  lesson={lesson}
                  speech={speech}
                  showTranslation={showTranslation}
                  onToggle={() => setShowTranslation(!showTranslation)}
                />
              ) : null}
              <Text accessibilityRole="header" style={lessonText.prompt}>
                {question.prompt}
              </Text>
              {question.audio ? (
                <View style={styles.listenBlock}>
                  <AudioIconButton
                    speech={speech}
                    text={question.audio}
                    label="Play the listening question"
                    size={76}
                    tone="accent"
                  />
                  <AudioIconButton
                    speech={speech}
                    text={question.audio}
                    label="Play the listening question slowly"
                    rate={0.6}
                    slow
                    size={56}
                  />
                  <Text style={[lessonText.small, { flex: 1 }]}>
                    Listen first. The words appear after you answer correctly.
                  </Text>
                </View>
              ) : null}
              <View style={styles.options}>
                {optionOrder(`${lesson.id}:${index}`, question.options.length).map((choice) => (
                  <AnswerChoice
                    key={question.options[choice]}
                    label={question.options[choice]}
                    selected={selected === choice}
                    result={
                      result && selected === choice
                        ? correctNow
                          ? 'correct'
                          : 'incorrect'
                        : undefined
                    }
                    disabled={correctNow}
                    onPress={() => {
                      setSelected(choice);
                      setResult(null);
                    }}
                  />
                ))}
              </View>
              {correctNow && question.audio ? (
                <InfoCard icon="text-box-outline" title="You heard">
                  {question.audio}
                </InfoCard>
              ) : null}
              <TextButton
                title={showHelp ? 'Hide phrase help' : 'Show phrase help'}
                onPress={() => setShowHelp(!showHelp)}
              />
              {showHelp ? <PhraseList lesson={lesson} speech={speech} /> : null}
            </>
          ) : (
            <Text style={lessonText.lead}>
              All checks are complete. Next, use a phrase yourself.
            </Text>
          )
        ) : null}

        {entry.step === 2 ? (
          <>
            <Text style={lessonText.meta}>WRITE IT</Text>
            <Text accessibilityRole="header" style={lessonText.prompt}>
              {lesson.writing.prompt}
            </Text>
            <TextInput
              accessibilityLabel={`Your ${languageName} answer`}
              autoCapitalize="sentences"
              autoCorrect={false}
              maxLength={MAX_DRAFT_LENGTH}
              multiline
              placeholder={`Type in ${languageName}`}
              placeholderTextColor={Palette.muted}
              style={[
                styles.input,
                result?.tone === 'correct' && { borderColor: '#2F7A47' },
                result?.tone === 'wrong' && { borderColor: '#B44931' },
              ]}
              value={entry.draft}
              editable={!correctNow}
              onChangeText={(draft) => {
                setResult(null);
                update({ draft });
              }}
            />
            <Text style={lessonText.small}>
              Punctuation and capital letters are not marked. No ß or umlaut key? Type ss, ae, oe or
              ue. Your draft is saved.
            </Text>
            {entry.writingMistakes >= 2 && !correctNow ? (
              <TextButton
                title="Show one possible answer"
                onPress={() =>
                  setResult({
                    tone: 'close',
                    title: 'One possible answer',
                    message: `${lesson.writing.accepted[0]}. Type it yourself to continue.`,
                  })
                }
              />
            ) : null}
            <TextButton
              title={showHelp ? 'Hide phrase help' : 'Show phrase help'}
              onPress={() => {
                setShowHelp(!showHelp);
                if (!showHelp) update({ writingMistakes: Math.max(entry.writingMistakes, 1) });
              }}
            />
            {showHelp ? <PhraseList lesson={lesson} speech={speech} /> : null}
          </>
        ) : null}

        {entry.step === 3 ? (
          <>
            <Text style={lessonText.meta}>SAY IT</Text>
            <Text accessibilityRole="header" style={lessonText.prompt}>
              Speak out loud
            </Text>
            <InfoCard icon="account-voice" title="Your task" tone="ink">
              {lesson.speaking}
            </InfoCard>
            <Text style={lessonText.small}>
              Say each phrase, then play it to compare. Nothing is recorded here. For feedback on
              your speaking, practise with the live coach.
            </Text>
            <PhraseList lesson={lesson} speech={speech} />
            <TextButton
              title="Practise with the live coach"
              onPress={() => router.push(`/conversation?track=${lesson.track}` as Href)}
            />
          </>
        ) : null}

        {entry.step === 4 && lastAttempt ? (
          <>
            <View style={styles.celebrate}>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="check-bold" size={40} color={Palette.ink} />
              </View>
              <Text accessibilityRole="header" style={lessonText.title}>
                Lesson complete
              </Text>
              <Text style={styles.score}>
                {lastAttempt.correctFirstTry}/{totalChecks} checks right first time
              </Text>
            </View>
            <View style={styles.stats}>
              <Stat label="Phrases" value={String(lesson.phrases.length)} />
              <Stat label="Speaking" value={lastAttempt.spoken ? 'Done' : 'Skipped'} />
              <Stat label="Review" value={`In ${REVIEW_INTERVALS[0]} day`} />
            </View>
            <Text style={lessonText.lead}>
              {lastAttempt.spoken
                ? 'You also marked the speaking practice as done.'
                : 'You skipped the speaking practice this time.'}{' '}
              These phrases are now in your review queue, so they come back just before you are
              likely to forget them. This is practice evidence, not a language level.
            </Text>
            {next ? (
              <InfoCard icon="arrow-right-circle-outline" title="Up next">
                {next.outcome}
              </InfoCard>
            ) : null}
            <TextButton title="Practise this lesson again" onPress={retry} />
            <TextButton
              title="See my learning path"
              onPress={() => router.replace(`/sprint?track=${lesson.track}` as Href)}
            />
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

function ReadingCard({
  lesson,
  speech,
  showTranslation,
  onToggle,
}: {
  lesson: FoundationLesson;
  speech: LessonSpeech;
  showTranslation: boolean;
  onToggle: () => void;
}) {
  if (!lesson.reading) return null;
  return (
    <InfoCard icon="book-open-variant" title="Read in context">
      <View style={styles.readingRow}>
        <Text selectable style={styles.readingText}>
          {lesson.reading.target}
        </Text>
        <AudioIconButton
          speech={speech}
          text={lesson.reading.target}
          label="Listen to the short text"
          rate={0.82}
        />
      </View>
      {showTranslation ? <Text style={lessonText.small}>{lesson.reading.meaning}</Text> : null}
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {showTranslation ? 'Hide translation' : 'Show translation'}
        </Text>
      </Pressable>
    </InfoCard>
  );
}

function PhraseList({ lesson, speech }: { lesson: FoundationLesson; speech: LessonSpeech }) {
  return (
    <View style={{ gap: 10 }}>
      {lesson.phrases.map((phrase) => (
        <PhraseCard key={phrase.target} phrase={phrase} speech={speech} />
      ))}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={lessonText.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 },
  alert: {
    backgroundColor: '#FFF4CC',
    borderRadius: 14,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    padding: 12,
  },
  listenBlock: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  options: { gap: 10 },
  input: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 18,
    borderWidth: 2,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 19,
    minHeight: 120,
    padding: 16,
    textAlignVertical: 'top',
  },
  readingRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  readingText: {
    color: Palette.ink,
    flex: 1,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 17,
    lineHeight: 26,
  },
  toggle: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  toggleText: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  celebrate: { alignItems: 'center', gap: 10, paddingTop: 16 },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  score: { color: Palette.secondary, fontFamily: VokaFonts.bodySemiBold, fontSize: 16 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 18,
    flex: 1,
    gap: 2,
    paddingVertical: 14,
  },
  statValue: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 18 },
});
