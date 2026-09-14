import { describe, expect, it } from '@jest/globals';

import { compareVersions, parseUpdateManifest } from '@/features/updates/version';

describe('optional app updates', () => {
  it('orders semantic app versions', () => {
    expect(compareVersions('1.0.9', '1.1.0')).toBe(1);
    expect(compareVersions('1.1.0', '1.1.0')).toBe(0);
    expect(compareVersions('2.0.0', '1.9.9')).toBe(-1);
  });

  it('accepts only safe complete manifests', () => {
    expect(
      parseUpdateManifest({
        apkUrl: 'https://example.com/voka.apk',
        latestVersion: '1.2.0',
        notes: 'New lesson',
      }),
    ).toEqual({
      apkUrl: 'https://example.com/voka.apk',
      latestVersion: '1.2.0',
      notes: 'New lesson',
    });
    expect(parseUpdateManifest({ apkUrl: '', latestVersion: '1.2.0' })).toBeNull();
    expect(
      parseUpdateManifest({ apkUrl: 'http://example.com/voka.apk', latestVersion: '1.2.0' }),
    ).toBeNull();
  });
});
