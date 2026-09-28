import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are reserved for meaningful moments so they keep their value:
// a light tick on selection, success/error on a checked answer, and a finished lesson.
function run(effect: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  effect().catch(() => undefined);
}

export const haptic = {
  select: () => run(() => Haptics.selectionAsync()),
  correct: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  wrong: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  complete: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
};
