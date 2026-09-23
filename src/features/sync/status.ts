import { create } from 'zustand';
export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline';
export const useSyncStatus = create<{ status: SyncStatus; retry: () => void }>(() => ({
  status: 'local',
  retry: () => {},
}));
export const syncStatusCopy: Record<SyncStatus, string> = {
  local: 'Guest progress is saved on this device.',
  syncing: 'Syncing your learning progress…',
  synced: 'Your learning progress is synced.',
  offline: 'Cloud sync is waiting. Keep this app installed to retain your local progress.',
};
