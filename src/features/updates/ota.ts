import * as Updates from 'expo-updates';

export type OtaUpdateResult = { kind: 'current' } | { kind: 'disabled' } | { kind: 'ready' };

export async function downloadAvailableUpdate(): Promise<OtaUpdateResult> {
  if (!Updates.isEnabled) return { kind: 'disabled' };

  const check = await Updates.checkForUpdateAsync();
  if (!check.isAvailable) return { kind: 'current' };

  const fetched = await Updates.fetchUpdateAsync();
  return fetched.isNew ? { kind: 'ready' } : { kind: 'current' };
}

export function restartWithDownloadedUpdate() {
  return Updates.reloadAsync();
}
