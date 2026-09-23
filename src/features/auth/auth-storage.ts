import AsyncStorage from '@react-native-async-storage/async-storage';

// Web storage remains origin-scoped. Native builds resolve auth-storage.native.ts.
export const authStorage = AsyncStorage;
