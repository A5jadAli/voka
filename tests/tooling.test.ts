import { describe, expect, it } from '@jest/globals';
import { Platform } from 'react-native';

describe('test environment', () => {
  it('loads the React Native platform mock through jest-expo', () => {
    expect(['android', 'ios', 'web']).toContain(Platform.OS);
  });
});
