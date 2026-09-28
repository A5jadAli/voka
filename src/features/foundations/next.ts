import { getTrackLessons, type LessonTrack } from './catalog';
import type { FoundationProgress } from './progress';

/** The lesson a learner should open next: an unfinished one first, then the first not yet done. */
export function nextLesson(progress: FoundationProgress, track: LessonTrack) {
  const lessons = getTrackLessons(track);
  return (
    lessons.find((lesson) => {
      const step = progress[lesson.id]?.step ?? 0;
      return step > 0 && step < 4;
    }) ??
    lessons.find((lesson) => !progress[lesson.id]?.attempts.length) ??
    lessons[0]
  );
}

export function hasStartedPath(progress: FoundationProgress, track: LessonTrack) {
  return getTrackLessons(track).some((lesson) => {
    const entry = progress[lesson.id];
    return Boolean(entry?.attempts.length || (entry && entry.step > 0));
  });
}
