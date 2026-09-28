import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are reserved for meaningful moments so they keep their value:
// a light tick on selection, confirm/reject on a checked answer, and a finished lesson.
// Android uses the system haptics API: it needs no VIBRATE permission (blocked in app.json)
// and respects the phone's own touch-feedback setting.
function run(effect: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  effect().catch(() => undefined);
}

const android = (type: Haptics.AndroidHaptics) => () =>
  run(() => Haptics.performAndroidHapticsAsync(type));

export const haptic =
  Platform.OS === 'android'
    ? {
        select: android(Haptics.AndroidHaptics.Segment_Tick),
        correct: android(Haptics.AndroidHaptics.Confirm),
        wrong: android(Haptics.AndroidHaptics.Reject),
        complete: android(Haptics.AndroidHaptics.Long_Press),
      }
    : {
        select: () => run(() => Haptics.selectionAsync()),
        correct: () =>
          run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
        wrong: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
        complete: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
      };
