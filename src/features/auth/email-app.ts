import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const webmail: [RegExp, string, string][] = [
  [/@(gmail|googlemail)\./i, 'Gmail', 'https://mail.google.com/mail/u/0/#inbox'],
  [/@(outlook|hotmail|live|msn)\./i, 'Outlook', 'https://outlook.live.com/mail/'],
  [/@(yahoo|ymail)\./i, 'Yahoo Mail', 'https://mail.yahoo.com/'],
  [/@(icloud|me|mac)\.com$/i, 'iCloud Mail', 'https://www.icloud.com/mail'],
];

/** The provider name to show on the button, when the address makes it obvious. */
export function emailProviderName(email: string) {
  return webmail.find(([pattern]) => pattern.test(email))?.[1];
}

/**
 * Opens the user's inbox (not a new-message screen) where the platform allows it:
 * the Android email-app chooser, Apple Mail on iOS, or the provider's webmail on the web.
 */
export async function openEmailInbox(email: string) {
  if (Platform.OS === 'android') {
    try {
      // Loaded lazily: builds without this native module fall back to mailto.
      const IntentLauncher = await import('expo-intent-launcher');
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        category: 'android.intent.category.APP_EMAIL',
        flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
      });
      return;
    } catch {
      // Fall through to the generic mail handler.
    }
  }
  if (Platform.OS === 'ios') {
    try {
      await Linking.openURL('message://');
      return;
    } catch {
      // Fall through.
    }
  }
  const provider = webmail.find(([pattern]) => pattern.test(email));
  await Linking.openURL(Platform.OS === 'web' && provider ? provider[2] : 'mailto:');
}
