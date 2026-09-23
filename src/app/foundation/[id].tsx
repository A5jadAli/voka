import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import {
  checkFoundationWriting,
  foundationLessons,
  type FoundationLesson,
} from '@/features/foundations/catalog';
import { freshFoundationEntry, type FoundationEntry } from '@/features/foundations/progress';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';
import { useLanguageSelection } from '@/features/language/selection';

export default function FoundationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = foundationLessons.find((item) => item.id === id);
  if (!lesson)
    return (
      <AppScreen showNav={false}>
        <HeaderBack />
        <View style={styles.body}>
          <Text style={styles.title}>Lesson not found</Text>
          <Text style={styles.copy}>Go back and choose a lesson from German from zero.</Text>
        </View>
      </AppScreen>
    );
  return <GuidedLesson key={lesson.id} lesson={lesson} />;
}

function GuidedLesson({ lesson }: { lesson: FoundationLesson }) {
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      useLanguageSelection.getState().choose('DE');
    }, []),
  );
  const saved = useCoachingStore((state) => state.foundations[lesson.id]);
  const save = useCoachingStore((state) => state.saveFoundation);
  const entry = saved ?? freshFoundationEntry();
  const [message, setMessage] = useState('');
  const [writingCorrect, setWritingCorrect] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedbackQuestion, setFeedbackQuestion] = useState<number | null>(null);
  const speech = useLessonSpeech('de-DE');
  const update = (change: Partial<FoundationEntry>) => save(lesson.id, { ...entry, ...change });
  const advance = (step: number) => {
    speech.stop();
    setMessage('');
    setShowHelp(false);
    update({ step });
  };
  const questionIndex = entry.answers.findIndex(
    (answer, index) => answer !== lesson.checks[index]?.answer,
  );
  const index = feedbackQuestion ?? (questionIndex >= 0 ? questionIndex : entry.answers.length);
  const question = lesson.checks[index];
  const questionCorrect = Boolean(question && entry.answers[index] === question.answer);
  const lastAttempt = entry.attempts.at(-1);
  const next = foundationLessons[foundationLessons.indexOf(lesson) + 1];
  const complete = (spoken: boolean) => {
    speech.stop();
    const at = new Date().toISOString();
    update({
      step: 4,
      attempts: [
        ...entry.attempts,
        {
          at,
          correctFirstTry:
            entry.firstTry.filter(Boolean).length + (entry.writingMistakes === 0 ? 1 : 0),
          spoken,
        },
      ].slice(-10),
    });
  };
  const retry = () => {
    setFeedbackQuestion(null);
    setMessage('');
    setWritingCorrect(false);
    setShowHelp(false);
    save(lesson.id, { ...freshFoundationEntry(), attempts: entry.attempts });
  };
  return (
    <AppScreen showNav={false} keyboardAware>
      <View style={styles.header}>
        <HeaderBack />
        <Text style={styles.meta}>
          German {lesson.level ?? 'A1'} practice ·{' '}
          {entry.step === 4 ? 'Practice saved' : `Step ${entry.step + 1} of 4`}
        </Text>
      </View>
      <View style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>
          {lesson.title}
        </Text>
        <Text style={styles.copy}>{lesson.outcome}</Text>
        {lesson.reading && entry.step < 2 ? (
          <View style={{ gap: 10 }}>
            <Eyebrow>Read in context</Eyebrow>
            <Text style={styles.question}>{lesson.reading.german}</Text>
            <Action
              secondary
              title="Listen to the short text"
              onPress={() => void speech.play(lesson.reading!.german, 0.8)}
            />
            <Text style={styles.copy}>{lesson.reading.english}</Text>
          </View>
        ) : null}
        {speech.error ? (
          <Text accessibilityRole="alert" style={styles.feedback}>
            {speech.error}
          </Text>
        ) : null}
        {speech.playing ? <Action title="Stop audio" secondary onPress={speech.stop} /> : null}
        {entry.step === 0 ? (
          <>
            <Eyebrow>1. Learn and listen</Eyebrow>
            <Text style={styles.copy}>
              Read the English meaning, then tap a German phrase to hear it. Audio uses your device
              voice; the written lesson works offline.
            </Text>
            <PhraseList lesson={lesson} play={speech.play} />
            <Text style={styles.feedback}>{lesson.notice}</Text>
            <Action title="Practise these phrases" onPress={() => advance(1)} />
          </>
        ) : null}
        {entry.step === 1 ? (
          <>
            <Eyebrow>2. Check the meaning</Eyebrow>
            {question ? (
              <>
                <Text style={styles.copy}>
                  Question {index + 1} of {lesson.checks.length}. Choose an answer. Your first
                  choice is recorded even if you correct it later.
                </Text>
                <Text style={styles.question}>{question.prompt}</Text>
                {question.options.map((option, choice) => (
                  <Action
                    key={option}
                    secondary
                    title={option}
                    disabled={questionCorrect}
                    onPress={() => {
                      const correct = choice === question.answer;
                      const answers = [...entry.answers];
                      answers[index] = choice;
                      const firstTry = [...entry.firstTry];
                      if (firstTry[index] === undefined) firstTry[index] = correct;
                      update({ answers, firstTry });
                      if (correct) setFeedbackQuestion(index);
                      setMessage(
                        `${correct ? 'Correct.' : 'Not quite. Try another answer.'} ${question.explanation}`,
                      );
                    }}
                  />
                ))}
              </>
            ) : (
              <Text style={styles.copy}>
                Both meaning checks are complete. Next, use a phrase yourself.
              </Text>
            )}
            {message ? (
              <Text accessibilityLiveRegion="polite" style={styles.feedback}>
                {message}
              </Text>
            ) : null}
            {questionCorrect ? (
              <Action
                title={index === lesson.checks.length - 1 ? 'Continue to writing' : 'Next question'}
                onPress={() => {
                  setFeedbackQuestion(null);
                  setMessage('');
                  if (index === lesson.checks.length - 1) advance(2);
                }}
              />
            ) : null}
            {!question ? <Action title="Continue to writing" onPress={() => advance(2)} /> : null}
            <Action
              secondary
              title={showHelp ? 'Hide phrase help' : 'Show phrase help'}
              onPress={() => setShowHelp(!showHelp)}
            />
            {showHelp ? <PhraseList lesson={lesson} play={speech.play} /> : null}
          </>
        ) : null}
        {entry.step === 2 ? (
          <>
            <Eyebrow>3. Use it in writing</Eyebrow>
            <Text style={styles.question}>{lesson.writing.prompt}</Text>
            <TextInput
              accessibilityLabel="Your German answer"
              autoCapitalize="sentences"
              autoCorrect={false}
              maxLength={256}
              multiline
              placeholder="Type your German phrase"
              placeholderTextColor={Palette.muted}
              style={styles.input}
              value={entry.draft}
              onChangeText={(draft) => {
                setWritingCorrect(false);
                setMessage('');
                update({ draft });
              }}
            />
            <Text style={styles.note}>
              Your draft stays with this guest profile or signed-in account. Punctuation and
              capitalisation are not scored in this beginner exercise.
            </Text>
            {message ? (
              <Text accessibilityLiveRegion="polite" style={styles.feedback}>
                {message}
              </Text>
            ) : null}
            <Action
              title={writingCorrect ? 'Continue to speaking practice' : 'Check my phrase'}
              disabled={!entry.draft.trim()}
              onPress={() => {
                Keyboard.dismiss();
                if (writingCorrect) {
                  advance(3);
                  return;
                }
                if (checkFoundationWriting(lesson, entry.draft)) {
                  setWritingCorrect(true);
                  setMessage(`Correct. ${lesson.writing.explanation}`);
                } else {
                  update({ writingMistakes: entry.writingMistakes + 1 });
                  setMessage(`This does not match this exercise yet. ${lesson.writing.hint}`);
                }
              }}
            />
            <Action
              secondary
              title={showHelp ? 'Hide phrase help' : 'Show phrase help'}
              onPress={() => {
                setShowHelp(!showHelp);
                if (!showHelp) update({ writingMistakes: Math.max(entry.writingMistakes, 1) });
              }}
            />
            {showHelp ? <PhraseList lesson={lesson} play={speech.play} /> : null}
          </>
        ) : null}
        {entry.step === 3 ? (
          <>
            <Eyebrow>4. Say it yourself</Eyebrow>
            <Text style={styles.question}>{lesson.speaking}</Text>
            <Text style={styles.copy}>
              Say the phrases aloud, then compare with the audio below. Voka is not recording or
              grading your pronunciation here.
            </Text>
            <PhraseList lesson={lesson} play={speech.play} />
            <Action title="I practised aloud. Save practice" onPress={() => complete(true)} />
            <Action secondary title="Save without speaking" onPress={() => complete(false)} />
          </>
        ) : null}
        {entry.step === 4 && lastAttempt ? (
          <>
            <Eyebrow>Practice saved</Eyebrow>
            <Text style={styles.question}>
              {lastAttempt.correctFirstTry}/3 checks right first time
            </Text>
            <Text style={styles.copy}>
              You completed the meaning and writing checks, with corrections where needed.{' '}
              {lastAttempt.spoken
                ? 'You also marked the speaking practice as done.'
                : 'You skipped the speaking practice this time.'}
            </Text>
            <Text style={styles.feedback}>
              Next:{' '}
              {next
                ? next.outcome
                : 'Try the first German listening dialogue or repeat these lessons.'}{' '}
              Return tomorrow for a review suggestion in Learn. This result is practice evidence,
              not a language level.
            </Text>
            {next ? (
              <Action
                title={`Next lesson: ${next.title}`}
                onPress={() => router.replace(`/foundation/${next.id}` as Href)}
              />
            ) : (
              <Action
                title="Try German listening"
                onPress={() => router.replace('/listening?track=DE' as Href)}
              />
            )}
            <Action secondary title="Practise this lesson again" onPress={retry} />
            <Action
              secondary
              title="See my learning path"
              onPress={() => router.replace('/sprint?track=DE')}
            />
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

function PhraseList({
  lesson,
  play,
}: {
  lesson: FoundationLesson;
  play: (text: string, rate?: number) => Promise<void>;
}) {
  return (
    <View style={{ gap: 12 }}>
      {lesson.phrases.map((phrase) => (
        <View key={phrase.german} style={styles.card}>
          <Text style={styles.question}>{phrase.german}</Text>
          <Text style={styles.translation}>{phrase.english}</Text>
          <Text style={styles.copy}>{phrase.use}</Text>
          <Action
            secondary
            title={`Hear: ${phrase.german}`}
            onPress={() => void play(phrase.german)}
          />
          <Action
            secondary
            title={`Hear slowly: ${phrase.german}`}
            onPress={() => void play(phrase.german, 0.65)}
          />
        </View>
      ))}
    </View>
  );
}

function Action({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  meta: { flex: 1, fontFamily: VokaFonts.bodyMedium, fontSize: 13, color: Palette.secondary },
  body: { padding: 20, paddingBottom: 48, gap: 16 },
  title: {
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 30,
    lineHeight: 36,
    color: Palette.ink,
  },
  copy: { fontFamily: VokaFonts.body, fontSize: 15, lineHeight: 23, color: Palette.secondary },
  question: { fontFamily: VokaFonts.bodyBold, fontSize: 20, lineHeight: 28, color: Palette.ink },
  translation: { fontFamily: VokaFonts.bodySemiBold, fontSize: 16, color: Palette.ink },
  feedback: {
    backgroundColor: Palette.soft,
    borderRadius: 14,
    padding: 16,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
  },
  card: { backgroundColor: Palette.white, borderRadius: 18, padding: 16, gap: 10 },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: Palette.muted,
    borderRadius: 14,
    padding: 16,
    textAlignVertical: 'top',
    color: Palette.ink,
    fontSize: 18,
    fontFamily: VokaFonts.body,
    backgroundColor: Palette.white,
  },
  note: { fontFamily: VokaFonts.body, fontSize: 12, lineHeight: 18, color: Palette.muted },
  button: {
    backgroundColor: Palette.yellow,
    borderRadius: 14,
    padding: 16,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: Palette.soft },
  buttonText: {
    fontFamily: VokaFonts.bodySemiBold,
    color: Palette.ink,
    fontSize: 15,
    textAlign: 'center',
  },
});
