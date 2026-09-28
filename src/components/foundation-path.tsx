import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eyebrow } from './voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import {
  getTrackLessons,
  type FoundationLesson,
  type LessonLevel,
  type LessonTrack,
} from '@/features/foundations/catalog';
import { foundationReviewDue, type FoundationProgress } from '@/features/foundations/progress';
import { useCoachingStore } from '@/features/coaching/store';
import { reviewSummary } from '@/features/review/schedule';
import { nextLesson } from '@/features/foundations/next';

const copy = {
  DE: {
    eyebrow: 'From first words to B1 conversations',
    heading: 'German guided lessons',
    note: 'Lessons build towards selected A1, A2 and B1 skills. They are practice, not a certificate.',
  },
  EN: {
    eyebrow: 'Modern English and IELTS skills',
    heading: 'English guided lessons',
    note: 'IELTS lessons are preparatory practice. They do not award or predict a band score.',
  },
} as const;

function lessonAction(progress: FoundationProgress, lesson: FoundationLesson) {
  const saved = progress[lesson.id];
  if (saved && saved.step > 0 && saved.step < 4) return 'Continue';
  if (foundationReviewDue(saved)) return 'Review due';
  return saved?.attempts.length ? 'Practise again' : 'Start';
}

export function FoundationPath({
  compact = false,
  showHero = true,
  track = 'DE',
}: {
  compact?: boolean;
  /** Home already shows the next lesson in its recommendation card. */
  showHero?: boolean;
  track?: LessonTrack;
}) {
  const router = useRouter();
  const progress = useCoachingStore((state) => state.foundations);
  const lessons = getTrackLessons(track);
  const done = (lesson: FoundationLesson) => Boolean(progress[lesson.id]?.attempts.length);
  const next = nextLesson(progress, track);
  const levels = [...new Set(lessons.map((lesson) => lesson.level))];
  // Derived, so a late language or progress hydration still opens the right level.
  const [picked, setLevel] = useState<LessonLevel | null>(null);
  const level = picked && levels.includes(picked) ? picked : next.level;
  const review = reviewSummary(progress, track);
  const text = copy[track];
  const completed = lessons.filter(done).length;
  const action = lessonAction(progress, next);
  const inLevel = lessons.filter((lesson) => lesson.level === level);

  return (
    <View style={styles.section}>
      {!compact ? (
        <>
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <Text style={styles.heading}>{text.heading}</Text>
        </>
      ) : null}

      {showHero ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action}: ${next.title}`}
          onPress={() => router.push(`/foundation/${next.id}` as Href)}
          style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroMeta}>
              {next.level} · LESSON {lessons.indexOf(next) + 1} OF {lessons.length}
            </Text>
            <Text style={styles.heroMeta}>
              {completed}/{lessons.length} DONE
            </Text>
          </View>
          <Text style={styles.heroTitle}>{next.title}</Text>
          <Text style={styles.heroCopy} numberOfLines={2}>
            {next.outcome}
          </Text>
          <View style={styles.heroBar}>
            <View
              style={[
                styles.heroFill,
                { width: `${Math.max(3, (completed / lessons.length) * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>{action}</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={Palette.ink} />
          </View>
        </Pressable>
      ) : null}

      {review.learning ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            review.due
              ? `Review ${review.due} phrases now`
              : `Review queue: ${review.learning} phrases, none due`
          }
          onPress={() => router.push(`/review?track=${track}` as Href)}
          style={({ pressed }) => [styles.review, pressed && styles.pressed]}
        >
          <View style={[styles.reviewIcon, review.due ? styles.reviewIconDue : null]}>
            <MaterialCommunityIcons name="cards-outline" size={22} color={Palette.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>
              {review.due ? `${review.due} phrases to review` : 'Review is up to date'}
            </Text>
            <Text style={styles.rowCopy}>
              {review.due
                ? `${review.learning} phrases in your review queue`
                : review.nextInDays === 1
                  ? `${review.learning} phrases · next review tomorrow`
                  : `${review.learning} phrases · next review in ${review.nextInDays} days`}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
        </Pressable>
      ) : null}

      {compact ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/sprint?track=${track}` as Href)}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            See all {lessons.length} lessons · {completed} done
          </Text>
        </Pressable>
      ) : (
        <>
          <View accessibilityRole="tablist" style={styles.tabs}>
            {levels.map((value) => {
              const inTab = lessons.filter((lesson) => lesson.level === value);
              return (
                <Pressable
                  key={value}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: level === value }}
                  accessibilityLabel={`${value} lessons, ${inTab.filter(done).length} of ${inTab.length} practised`}
                  onPress={() => setLevel(value)}
                  style={[styles.tab, level === value && styles.tabActive]}
                >
                  <Text style={styles.tabText}>{value}</Text>
                  <Text style={styles.tabCount}>
                    {inTab.filter(done).length}/{inTab.length}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.list}>
            {inLevel.map((lesson) => {
              const isDone = done(lesson);
              const isNext = lesson.id === next.id;
              const rowAction = lessonAction(progress, lesson);
              const latest = progress[lesson.id]?.attempts.at(-1);
              return (
                <Pressable
                  key={lesson.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${rowAction}: ${lesson.title}`}
                  onPress={() => router.push(`/foundation/${lesson.id}` as Href)}
                  style={({ pressed }) => [
                    styles.row,
                    isNext && styles.rowNext,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.number,
                      isDone && styles.numberDone,
                      isNext && !isDone && styles.numberNext,
                    ]}
                  >
                    {isDone ? (
                      <MaterialCommunityIcons name="check" size={18} color={Palette.ink} />
                    ) : (
                      <Text style={[styles.numberText, isNext && { color: Palette.cream }]}>
                        {lessons.indexOf(lesson) + 1}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.rowTitle}>{lesson.title}</Text>
                    <Text style={styles.rowCopy} numberOfLines={2}>
                      {latest
                        ? `${latest.correctFirstTry}/${lesson.checks.length + 1} right first time · ${rowAction}`
                        : lesson.outcome}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.note}>{text.note}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, marginHorizontal: 18, marginTop: 16 },
  heading: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 25 },
  hero: { backgroundColor: Palette.ink, borderRadius: 26, gap: 10, padding: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroMeta: { color: 'rgba(241,237,227,.6)', fontFamily: VokaFonts.monoMedium, fontSize: 11 },
  heroTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  heroCopy: {
    color: 'rgba(241,237,227,.72)',
    fontFamily: VokaFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  heroBar: {
    backgroundColor: 'rgba(241,237,227,.15)',
    borderRadius: 99,
    height: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  heroFill: { backgroundColor: Palette.yellow, height: '100%' },
  heroButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    minHeight: 44,
    paddingHorizontal: 18,
  },
  heroButtonText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 16 },
  review: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    padding: 14,
  },
  reviewIcon: {
    alignItems: 'center',
    backgroundColor: Palette.soft,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  reviewIconDue: { backgroundColor: Palette.yellow },
  tabs: {
    backgroundColor: Palette.soft,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: Palette.white },
  tabText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 16 },
  tabCount: { color: Palette.muted, fontFamily: VokaFonts.monoMedium, fontSize: 11 },
  list: { gap: 8 },
  row: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    padding: 12,
  },
  rowNext: { borderColor: Palette.yellow },
  number: {
    alignItems: 'center',
    backgroundColor: Palette.soft,
    borderRadius: 99,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  numberDone: { backgroundColor: Palette.yellow },
  numberNext: { backgroundColor: Palette.ink },
  numberText: { color: Palette.ink, fontFamily: VokaFonts.monoMedium, fontSize: 13 },
  rowTitle: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 16, lineHeight: 22 },
  rowCopy: { color: Palette.secondary, fontFamily: VokaFonts.body, fontSize: 13, lineHeight: 19 },
  link: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44 },
  linkText: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  note: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.75 },
});
