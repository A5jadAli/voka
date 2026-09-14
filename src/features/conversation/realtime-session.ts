import type { RealtimeSessionHandle, StartRealtimeSessionOptions } from './realtime-types';

export type {
  RealtimeSessionHandle,
  RealtimeSessionStatus,
  StartRealtimeSessionOptions,
} from './realtime-types';

export async function startRealtimeSession(
  _options: StartRealtimeSessionOptions,
): Promise<RealtimeSessionHandle> {
  throw new Error('A platform-specific Realtime implementation was not loaded.');
}
