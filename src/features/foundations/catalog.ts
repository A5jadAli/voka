import { englishLessons } from './english-lessons';
import { germanA1Lessons } from './german-a1';
import { germanA2Lessons } from './german-a2';
import { germanB1Lessons } from './german-b1';
import type { FoundationLesson, LessonTrack } from './types';

export type { FoundationLesson, LessonCheck, LessonLevel, LessonTrack } from './types';

// Original guided lessons. German runs from first words to selected B1 tasks; English covers
// modern everyday communication and optional IELTS skills. Neither is a certified course.
export const germanLessons = [...germanA1Lessons, ...germanA2Lessons, ...germanB1Lessons];
export const foundationLessons: FoundationLesson[] = [...germanLessons, ...englishLessons];

export function getTrackLessons(track: LessonTrack) {
  return foundationLessons.filter((lesson) => lesson.track === track);
}

export function normaliseFoundationAnswer(value: string) {
  return value
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/['’‘`]/g, '')
    .replace(/[.,!?;:„“”"–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkFoundationWriting(lesson: FoundationLesson, value: string) {
  const answer = normaliseFoundationAnswer(value);
  return lesson.writing.accepted.some((item) => normaliseFoundationAnswer(item) === answer);
}

/** True when an answer is not accepted but is within two letters of an accepted one. */
export function isNearMiss(lesson: FoundationLesson, value: string) {
  const answer = normaliseFoundationAnswer(value);
  if (answer.length < 4 || checkFoundationWriting(lesson, value)) return false;
  return lesson.writing.accepted.some(
    (item) => editDistance(normaliseFoundationAnswer(item), answer, 2) <= 2,
  );
}

function editDistance(a: string, b: string, limit: number) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++)
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    previous = current;
  }
  return previous[b.length];
}

/** A stable shuffled display order, so the correct option is not predictable by position. */
export function optionOrder(seed: string, count: number) {
  let state = 0;
  for (const char of seed) state = (Math.imul(state, 31) + char.charCodeAt(0)) >>> 0;
  const order = Array.from({ length: count }, (_, index) => index);
  for (let i = count - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
