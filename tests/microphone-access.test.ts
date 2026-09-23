import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PermissionsAndroid } from 'react-native';
import { prepareMicrophoneAccess } from '@/features/conversation/microphone-access.android';

beforeEach(() => {
  jest.restoreAllMocks();
});
describe('Android microphone setup before starting a connection', () => {
  it('starts normally when permission was already granted', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
    const request = jest.spyOn(PermissionsAndroid, 'request');
    expect(await prepareMicrophoneAccess()).toBe('ready');
    expect(request).not.toHaveBeenCalled();
  });
  it('requires a fresh start tap after the system permission dialog grants access', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted');
    expect(await prepareMicrophoneAccess()).toBe('enabled');
  });
  it('distinguishes denial from a settings-only permission block', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValueOnce('denied')
      .mockResolvedValueOnce('never_ask_again');
    expect(await prepareMicrophoneAccess()).toBe('denied');
    expect(await prepareMicrophoneAccess()).toBe('blocked');
  });
});
