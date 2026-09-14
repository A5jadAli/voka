import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@voka/onboarding-complete';

export async function hasCompletedOnboarding() {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
}

export async function completeOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
