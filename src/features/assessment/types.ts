import type { LanguageTrack } from '@/features/listening/scenarios';
import { normalizeUiText } from '@/utils/ui-text';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type AssessmentConfidence = 'high' | 'low' | 'medium';

export type SpokenAssessment = {
  confidence: AssessmentConfidence;
  createdAt: string;
  estimatedLevel: CefrLevel;
  evidenceTurnCount: number;
  id: string;
  priorities: string[];
  strengths: string[];
  summary: string;
  track: LanguageTrack;
};

export function parseSpokenAssessment(value: unknown): SpokenAssessment | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const confidences: AssessmentConfidence[] = ['high', 'low', 'medium'];
  const strings = (item: unknown) =>
    Array.isArray(item) && item.every((entry) => typeof entry === 'string')
      ? item
          .map((entry) => normalizeUiText(entry).trim())
          .filter(Boolean)
          .slice(0, 3)
      : null;
  const strengths = strings(candidate.strengths);
  const priorities = strings(candidate.priorities);

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(candidate.createdAt)) ||
    !levels.includes(candidate.estimatedLevel as CefrLevel) ||
    !confidences.includes(candidate.confidence as AssessmentConfidence) ||
    typeof candidate.evidenceTurnCount !== 'number' ||
    candidate.evidenceTurnCount < 1 ||
    typeof candidate.summary !== 'string' ||
    !candidate.summary.trim() ||
    (candidate.track !== 'EN' && candidate.track !== 'DE') ||
    !strengths?.length ||
    !priorities?.length
  ) {
    return null;
  }

  return {
    confidence: candidate.confidence as AssessmentConfidence,
    createdAt: candidate.createdAt,
    estimatedLevel: candidate.estimatedLevel as CefrLevel,
    evidenceTurnCount: Math.floor(candidate.evidenceTurnCount),
    id: candidate.id,
    priorities,
    strengths,
    summary: normalizeUiText(candidate.summary).trim().slice(0, 500),
    track: candidate.track,
  };
}
