import { Pressable, Text, View } from 'react-native';
import { Palette, VokaFonts } from '@/constants/theme';
import { syncStatusCopy, useSyncStatus } from '@/features/sync/status';

export function SyncStatusNotice() {
  const { status, retry } = useSyncStatus();
  return (
    <View style={{ paddingHorizontal: 22, paddingVertical: 12, gap: 6 }}>
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: Palette.secondary, fontFamily: VokaFonts.body, fontSize: 12 }}
      >
        {syncStatusCopy[status]}
      </Text>
      {status === 'offline' ? (
        <Pressable accessibilityRole="button" onPress={retry} style={{ paddingVertical: 10 }}>
          <Text style={{ color: Palette.ink, textDecorationLine: 'underline' }}>
            Retry cloud sync
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
