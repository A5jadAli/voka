import type { AssessmentsByTrack } from '@/features/assessment/store';
import { parseSpokenAssessment } from '@/features/assessment/types';
import type {
  CoachTone,
  PersistedCoachingState,
  SpeakingGoal,
  SpeakingPreferences,
} from '@/features/coaching/store';
import type { CoachingSignal } from '@/features/coaching/store-types';
import { supabase } from '@/features/auth/supabase';

export type LearningCloudState = PersistedCoachingState & {
  assessments: AssessmentsByTrack;
  completedScenarioIds: string[];
};

type LearningStateRow = {
  assessments: unknown;
  coach_tone: unknown;
  completed_scenario_ids: unknown;
  completed_unit_ids: unknown;
  preferences: unknown;
  signals: unknown;
  speaking_practice_dates: unknown;
  test_date: unknown;
  writing_practice_dates: unknown;
};

const goals: SpeakingGoal[] = ['everyday', 'interviews', 'work-study'];
const tones: CoachTone[] = ['adaptive', 'supportive', 'tough'];

function stringArray(value: unknown, maximum = 200) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
    ? [...new Set(value.map((entry) => entry.trim()).filter(Boolean))].slice(0, maximum)
    : [];
}

function parsePreferences(value: unknown): SpeakingPreferences | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const en = candidate.EN as Record<string, unknown> | undefined;
  const de = candidate.DE as Record<string, unknown> | undefined;
  if (
    !en ||
    !de ||
    !goals.includes(en.goal as SpeakingGoal) ||
    !goals.includes(de.goal as SpeakingGoal)
  ) {
    return null;
  }
  return {
    DE: { goal: de.goal as SpeakingGoal, reference: 'de-DE' },
    EN: { goal: en.goal as SpeakingGoal, reference: 'en-GB' },
  };
}

function parseSignals(value: unknown): CoachingSignal[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === 'object'),
    )
    .flatMap((entry) => {
      if (
        (entry.track !== 'EN' && entry.track !== 'DE') ||
        typeof entry.count !== 'number' ||
        typeof entry.focus !== 'string' ||
        typeof entry.label !== 'string' ||
        typeof entry.lastSeenAt !== 'string' ||
        typeof entry.reason !== 'string'
      ) {
        return [];
      }
      return [
        {
          count: Math.max(1, Math.floor(entry.count)),
          focus: entry.focus.slice(0, 160),
          label: entry.label.slice(0, 120),
          lastSeenAt: entry.lastSeenAt,
          reason: entry.reason.slice(0, 300),
          track: entry.track,
        } satisfies CoachingSignal,
      ];
    })
    .slice(0, 12);
}

function parseAssessments(value: unknown): AssessmentsByTrack {
  if (!value || typeof value !== 'object') return {};
  const candidate = value as Record<string, unknown>;
  const EN = parseSpokenAssessment(candidate.EN);
  const DE = parseSpokenAssessment(candidate.DE);
  return { ...(EN ? { EN } : {}), ...(DE ? { DE } : {}) };
}

export async function loadLearningCloudState(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_learning_state')
    .select(
      'assessments, coach_tone, completed_scenario_ids, completed_unit_ids, preferences, signals, speaking_practice_dates, test_date, writing_practice_dates',
    )
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as LearningStateRow;
  const preferences = parsePreferences(row.preferences);
  return {
    assessments: parseAssessments(row.assessments),
    coachTone: tones.includes(row.coach_tone as CoachTone)
      ? (row.coach_tone as CoachTone)
      : 'supportive',
    completedScenarioIds: stringArray(row.completed_scenario_ids),
    completedUnitIds: stringArray(row.completed_unit_ids),
    preferences:
      preferences ??
      ({
        DE: { goal: 'everyday', reference: 'de-DE' },
        EN: { goal: 'interviews', reference: 'en-GB' },
      } satisfies SpeakingPreferences),
    signals: parseSignals(row.signals),
    speakingPracticeDates: stringArray(row.speaking_practice_dates, 30),
    testDate:
      typeof row.test_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.test_date)
        ? row.test_date
        : null,
    writingPracticeDates: stringArray(row.writing_practice_dates, 30),
  } satisfies LearningCloudState;
}

export async function saveLearningCloudState(userId: string, state: LearningCloudState) {
  if (!supabase) return;
  const { error } = await supabase.from('user_learning_state').upsert({
    assessments: state.assessments,
    coach_tone: state.coachTone,
    completed_scenario_ids: state.completedScenarioIds,
    completed_unit_ids: state.completedUnitIds,
    preferences: state.preferences,
    signals: state.signals,
    speaking_practice_dates: state.speakingPracticeDates,
    test_date: state.testDate,
    writing_practice_dates: state.writingPracticeDates,
    updated_at: new Date().toISOString(),
    user_id: userId,
  });
  if (error) throw error;
}
