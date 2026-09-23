import { PermissionsAndroid } from 'react-native';
import type { MicrophoneAccess } from './microphone-access';

export async function prepareMicrophoneAccess(): Promise<MicrophoneAccess> {
  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  if (await PermissionsAndroid.check(permission)) return 'ready';
  const result = await PermissionsAndroid.request(permission);
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'enabled';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
  return 'denied';
}
