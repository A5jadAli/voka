import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { AnswerChoice } from '@/components/answer-choice';
import { Palette, VokaFonts } from '@/constants/theme';
import { readingLessons } from '@/features/reading/catalog';
import { useCoachingStore } from '@/features/coaching/store';
export default function ReadingScreen() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const lesson = readingLessons[lessonIndex];
  const question = lesson.questions[questionIndex];
  const complete = useCoachingStore((state) => state.completeUnit);
  const completed = useCoachingStore((state) => state.completedUnitIds);
  const chooseLesson = (index: number) => {
    setLessonIndex(index);
    setQuestionIndex(0);
    setSelected(null);
  };
  return (
    <AppScreen showNav={false}>
      <View style={{ padding: 20, gap: 18 }}>
        <HeaderBack />
        <Eyebrow>Read, check, explain</Eyebrow>
        <Text style={{ color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 28 }}>
          English reading practice
        </Text>
        {readingLessons.map((item, index) => (
          <Button
            key={item.id}
            label={`${item.title}${completed.includes(`reading-${item.id}`) ? ' · Practised' : ''}`}
            selected={lessonIndex === index}
            onPress={() => {
              if (lessonIndex !== index) chooseLesson(index);
            }}
          />
        ))}
        <Eyebrow>{lesson.kind}</Eyebrow>
        <Text style={styles.question}>{lesson.title}</Text>
        <Text selectable style={styles.passage}>
          {lesson.text}
        </Text>
        {question ? (
          <>
            <Text style={styles.copy}>
              Question {questionIndex + 1} of {lesson.questions.length}
            </Text>
            <Text style={styles.question}>{question.prompt}</Text>
            {question.options.map((option, index) => (
              <AnswerChoice
                key={option}
                label={option}
                selected={selected === index}
                result={
                  selected === index
                    ? index === question.answer
                      ? 'correct'
                      : 'incorrect'
                    : undefined
                }
                disabled={selected === question.answer}
                onPress={() => setSelected(index)}
              />
            ))}
            {selected !== null ? (
              <Text accessibilityLiveRegion="polite" style={styles.copy}>
                {selected === question.answer
                  ? 'Correct.'
                  : 'Not quite. Check the evidence and try again.'}{' '}
                {question.explanation}
              </Text>
            ) : null}
            {selected === question.answer ? (
              <Button
                primary
                label={
                  questionIndex === lesson.questions.length - 1
                    ? 'Save reading practice'
                    : 'Next question'
                }
                onPress={() => {
                  if (questionIndex === lesson.questions.length - 1)
                    complete(`reading-${lesson.id}`);
                  setQuestionIndex(questionIndex + 1);
                  setSelected(null);
                }}
              />
            ) : null}
          </>
        ) : (
          <>
            <Eyebrow>Practice saved</Eyebrow>
            <Text style={styles.copy}>
              You checked all three answers. This records practice, not an exam score. Explain one
              answer aloud and point to the words that support it.
            </Text>
            <Button
              primary
              label={
                lessonIndex < readingLessons.length - 1 ? 'Next reading' : 'Back to first reading'
              }
              onPress={() => chooseLesson((lessonIndex + 1) % readingLessons.length)}
            />
          </>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  passage: { color: Palette.ink, fontFamily: VokaFonts.body, fontSize: 17, lineHeight: 28 },
  question: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  copy: { color: Palette.secondary, fontFamily: VokaFonts.body, fontSize: 14, lineHeight: 23 },
});
function Button({
  label,
  onPress,
  disabled = false,
  selected = false,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        padding: 16,
        backgroundColor: primary ? Palette.yellow : selected ? '#FFF1BC' : Palette.white,
        borderColor: selected ? Palette.yellow : Palette.line,
        borderWidth: 2,
        borderRadius: 16,
        opacity: disabled || pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: Palette.ink, fontFamily: VokaFonts.bodySemiBold }}>{label}</Text>
    </Pressable>
  );
}
