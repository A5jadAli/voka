import type { PropsWithChildren } from 'react';

import { useCloudSync } from '@/features/sync/use-cloud-sync';

export function CloudSyncProvider({ children }: PropsWithChildren) {
  useCloudSync();
  return children;
}
