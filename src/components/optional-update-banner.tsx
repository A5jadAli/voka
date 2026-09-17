import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, VokaFonts } from '@/constants/theme';
import {
  compareVersions,
  parseUpdateManifest,
  type UpdateManifest,
} from '@/features/updates/version';
import { downloadAvailableUpdate, restartWithDownloadedUpdate } from '@/features/updates/ota';

const MANIFEST_URL = 'https://raw.githubusercontent.com/A5jadAli/voka/main/app-version.json';
const UPDATE_SNOOZE_KEY = '@voka/update-snoozed-until';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function OptionalUpdateBanner() {
  const insets = useSafeAreaInsets();
  const [update, setUpdate] = useState<UpdateManifest | null>(null);
  const [otaReady, setOtaReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    async function checkForUpdate() {
      try {
        const snoozedUntil = Number(await AsyncStorage.getItem(UPDATE_SNOOZE_KEY));
        if (Number.isFinite(snoozedUntil) && snoozedUntil > Date.now()) return;

        const ota = await downloadAvailableUpdate();
        if (ota.kind === 'ready') {
          setOtaReady(true);
          return;
        }

        const response = await fetch(MANIFEST_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const manifest = parseUpdateManifest(await response.json());
        const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
        if (manifest && compareVersions(currentVersion, manifest.latestVersion) > 0) {
          setUpdate(manifest);
        }
      } catch {
        // Update checks must never interrupt normal app use.
      } finally {
        clearTimeout(timeout);
      }
    }

    void checkForUpdate();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if ((!update && !otaReady) || Platform.OS === 'web') return null;

  const dismiss = async () => {
    await AsyncStorage.setItem(UPDATE_SNOOZE_KEY, String(Date.now() + ONE_DAY_MS));
    setUpdate(null);
    setOtaReady(false);
  };

  return (
    <View pointerEvents="box-none" style={[styles.layer, { paddingTop: insets.top + 8 }]}>
      <View accessibilityLiveRegion="polite" style={styles.banner}>
        <View style={styles.icon}>
          <MaterialCommunityIcons color={Palette.ink} name="arrow-up-bold" size={21} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>
            {otaReady ? 'A VOKA update is ready' : `VOKA ${update?.latestVersion} is ready`}
          </Text>
          <Text numberOfLines={2} style={styles.notes}>
            {otaReady
              ? 'Restart now to apply it, or continue and update later.'
              : update?.notes || 'A newer version is available.'}
          </Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => void dismiss()}>
              <Text style={styles.later}>Later</Text>
            </Pressable>
            <Pressable
              accessibilityRole={otaReady ? 'button' : 'link'}
              onPress={() =>
                otaReady
                  ? void restartWithDownloadedUpdate()
                  : void Linking.openURL(update?.apkUrl ?? '')
              }
              style={styles.updateButton}
            >
              <Text style={styles.updateText}>{otaReady ? 'Restart' : 'Update'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    left: 12,
    position: 'absolute',
    right: 12,
    top: 0,
    zIndex: 100,
  },
  banner: {
    backgroundColor: Palette.ink,
    borderRadius: 22,
    elevation: 7,
    flexDirection: 'row',
    gap: 13,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: { flex: 1 },
  title: { color: Palette.cream, fontFamily: VokaFonts.bodyBold, fontSize: 14 },
  notes: {
    color: 'rgba(241,237,227,.64)',
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 18, marginTop: 12 },
  later: { color: Palette.cream, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  updateButton: {
    backgroundColor: Palette.orange,
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  updateText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 12 },
});
