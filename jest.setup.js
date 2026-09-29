/* global jest */
// Screens now use Reanimated (and its Worklets runtime) for motion; use their official mocks.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
