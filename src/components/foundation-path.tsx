import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eyebrow } from './voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { foundationLessons } from '@/features/foundations/catalog';
import { foundationReviewDue } from '@/features/foundations/progress';
import { useCoachingStore } from '@/features/coaching/store';

export function FoundationPath({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const progress = useCoachingStore((state) => state.foundations);
  const next =
    foundationLessons.find(
      (lesson) =>
        progress[lesson.id] && progress[lesson.id].step > 0 && progress[lesson.id].step < 4,
    ) ??
    foundationLessons.find((lesson) => foundationReviewDue(progress[lesson.id])) ??
    foundationLessons.find((lesson) => !progress[lesson.id]?.attempts.length) ??
    foundationLessons[0];
  const lessons = compact ? [next] : foundationLessons;
  return (
    <View style={styles.section}>
      <Eyebrow>From first words to practical situations</Eyebrow>
      <Text style={styles.heading}>German guided lessons</Text>
      <Text style={styles.copy}>
        English explanations, slow audio and short checks. No microphone or account needed.
      </Text>
      {lessons.map((lesson) => {
        const saved = progress[lesson.id];
        const latest = saved?.attempts.at(-1);
        const unfinished = saved && saved.step > 0 && saved.step < 4;
        const action = unfinished
          ? 'Continue'
          : foundationReviewDue(saved)
            ? 'Review due'
            : latest
              ? 'Practise again'
              : 'Start';
        return (
          <Pressable
            key={lesson.id}
            accessibilityRole="button"
            accessibilityLabel={`${action}: ${lesson.title}`}
            onPress={() => router.push(`/foundation/${lesson.id}` as Href)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.step}>
              {lesson.level ?? 'A1'} practice · Lesson {foundationLessons.indexOf(lesson) + 1} of{' '}
              {foundationLessons.length} · {action}
            </Text>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.copy}>{lesson.outcome}</Text>
            {latest ? (
              <Text style={styles.record}>
                Last practice: {latest.correctFirstTry}/3 checks right first time.{' '}
                {latest.spoken ? 'Self-reported speaking practice.' : 'Speaking was skipped.'}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
      <Text style={styles.note}>
        These lessons target selected A1, A2 and B1 skills, not a complete course or a level
        certificate. Review suggestions appear here after 24 hours; no notification is sent.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 18, marginTop: 20, gap: 9 },
  heading: { fontFamily: VokaFonts.displayBold, fontSize: 25, color: Palette.ink },
  copy: { fontFamily: VokaFonts.body, fontSize: 14, lineHeight: 21, color: Palette.secondary },
  card: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 7,
    minHeight: 100,
  },
  step: { fontFamily: VokaFonts.bodySemiBold, fontSize: 12, color: Palette.secondary },
  title: { fontFamily: VokaFonts.displayBold, fontSize: 20, color: Palette.ink },
  record: {
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    color: Palette.secondary,
  },
  note: { fontFamily: VokaFonts.body, fontSize: 12, lineHeight: 18, color: Palette.muted },
});
