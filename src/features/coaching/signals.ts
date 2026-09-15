import type { CoachingSignal } from './store-types';

export function mergeCoachingSignal(
  signals: CoachingSignal[],
  incoming: Omit<CoachingSignal, 'count' | 'lastSeenAt'>,
  now = new Date().toISOString(),
) {
  const existing = signals.find(
    (signal) => signal.track === incoming.track && signal.label === incoming.label,
  );
  const next: CoachingSignal = existing
    ? { ...existing, ...incoming, count: existing.count + 1, lastSeenAt: now }
    : { ...incoming, count: 1, lastSeenAt: now };

  return [
    next,
    ...signals.filter(
      (signal) => signal.track !== incoming.track || signal.label !== incoming.label,
    ),
  ].slice(0, 12);
}
