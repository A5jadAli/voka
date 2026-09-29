import { getOrCreateSession, supabase } from '@/features/auth/supabase';

export type ReportSurface = 'conversation' | 'writing-feedback' | 'assessment';
export type ReportReason = 'offensive' | 'harmful' | 'incorrect' | 'other';

export const REPORT_REASONS: { key: ReportReason; label: string }[] = [
  { key: 'offensive', label: 'Offensive or inappropriate' },
  { key: 'harmful', label: 'Harmful or unsafe' },
  { key: 'incorrect', label: 'Wrong or misleading' },
  { key: 'other', label: 'Something else' },
];

/** Files an in-app report about AI-generated content. Reports are write-only for learners. */
export async function reportAiContent(report: {
  surface: ReportSurface;
  reason: ReportReason;
  details?: string;
  excerpt?: string;
  track?: 'EN' | 'DE';
}) {
  if (!supabase) throw new Error('Reporting is not available in this build.');
  await getOrCreateSession();
  const { error } = await supabase.from('ai_content_reports').insert({
    surface: report.surface,
    reason: report.reason,
    details: report.details?.trim().slice(0, 500) || null,
    content_excerpt: report.excerpt?.slice(0, 2000) || null,
    track: report.track ?? null,
  });
  if (error) throw new Error(error.message || 'The report could not be sent. Please try again.');
}
