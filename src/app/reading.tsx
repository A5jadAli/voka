import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
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
        <Text style={{ fontFamily: VokaFonts.displayBold, fontSize: 28 }}>
          English reading practice
        </Text>
        {readingLessons.map((item, index) => (
          <Button
            key={item.id}
            label={`${item.title}${completed.includes(`reading-${item.id}`) ? ' · Practised' : ''}`}
            onPress={() => chooseLesson(index)}
          />
        ))}
        <Eyebrow>{lesson.kind}</Eyebrow>
        <Text style={{ fontSize: 20, fontFamily: VokaFonts.bodySemiBold }}>{lesson.title}</Text>
        <Text selectable style={{ fontSize: 17, lineHeight: 28 }}>
          {lesson.text}
        </Text>
        {question ? (
          <>
            <Text>
              Question {questionIndex + 1} of {lesson.questions.length}
            </Text>
            <Text style={{ fontSize: 19 }}>{question.prompt}</Text>
            {question.options.map((option, index) => (
              <Button
                key={option}
                label={option}
                disabled={selected === question.answer}
                onPress={() => setSelected(index)}
              />
            ))}
            {selected !== null ? (
              <Text accessibilityLiveRegion="polite">
                {selected === question.answer
                  ? 'Correct.'
                  : 'Not quite. Check the evidence and try again.'}{' '}
                {question.explanation}
              </Text>
            ) : null}
            {selected === question.answer ? (
              <Button
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
            <Text>
              You checked all three answers. This records practice, not an exam score. Explain one
              answer aloud and point to the words that support it.
            </Text>
            <Button
              label={lessonIndex < readingLessons.length - 1 ? 'Next reading' : 'Read again'}
              onPress={() => chooseLesson((lessonIndex + 1) % readingLessons.length)}
            />
          </>
        )}
      </View>
    </AppScreen>
  );
}
function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 48,
        padding: 16,
        backgroundColor: Palette.white,
        borderColor: Palette.line,
        borderWidth: 1,
        borderRadius: 16,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ color: Palette.ink, fontFamily: VokaFonts.bodySemiBold }}>{label}</Text>
    </Pressable>
  );
}
