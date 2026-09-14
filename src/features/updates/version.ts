export type UpdateManifest = {
  apkUrl: string;
  latestVersion: string;
  notes?: string;
};

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export function compareVersions(current: string, latest: string) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let index = 0; index < Math.max(currentParts.length, latestParts.length); index += 1) {
    const difference = (latestParts[index] ?? 0) - (currentParts[index] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
}

export function parseUpdateManifest(value: unknown): UpdateManifest | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.latestVersion !== 'string' ||
    !VERSION_PATTERN.test(candidate.latestVersion) ||
    typeof candidate.apkUrl !== 'string' ||
    !candidate.apkUrl.startsWith('https://')
  ) {
    return null;
  }

  return {
    apkUrl: candidate.apkUrl,
    latestVersion: candidate.latestVersion,
    notes: typeof candidate.notes === 'string' ? candidate.notes.trim().slice(0, 160) : undefined,
  };
}
