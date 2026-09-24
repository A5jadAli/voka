import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette, VokaFonts } from '@/constants/theme';
import { type LessonSpeech } from '@/features/listening/use-lesson-speech';

/** Label and status space stay mounted, so starting/stopping never moves the target. */
export function LessonAudioButton({
  speech,
  text,
  label,
  rate = 0.82,
  dark = false,
}: {
  speech: LessonSpeech;
  text: string;
  label: string;
  rate?: number;
  dark?: boolean;
}) {
  const ownsAudio = speech.activeText === text && speech.activeRate === rate;
  const active = ownsAudio && speech.busy;
  const loading = active && speech.loading;
  const error = ownsAudio ? speech.error : '';
  const color = dark && !active ? Palette.cream : Palette.ink;
  const status = loading ? 'Preparing audio...' : active ? 'Playing audio' : 'Tap to listen';
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={
          active ? (loading ? 'Preparing audio. Tap to cancel.' : 'Playing. Tap to stop.') : status
        }
        accessibilityState={{ busy: loading, selected: active }}
        aria-busy={loading}
        aria-pressed={active}
        onPress={() => (active ? speech.stop() : void speech.play(text, rate))}
        style={({ pressed }) => [
          styles.button,
          dark && styles.dark,
          active && styles.active,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.icon}>
          {loading ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <MaterialCommunityIcons
              name={active ? 'stop' : 'volume-high'}
              size={22}
              color={color}
            />
          )}
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color }]}>
            {status}
          </Text>
        </View>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, dark && { color: Palette.cream }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Palette.soft,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 12,
    minHeight: 76,
  },
  dark: { backgroundColor: '#242321' },
  active: { backgroundColor: '#FFF1BC', borderColor: Palette.yellow },
  pressed: { opacity: 0.8 },
  icon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  label: { fontFamily: VokaFonts.bodySemiBold, fontSize: 15, lineHeight: 22 },
  status: { fontFamily: VokaFonts.body, fontSize: 12, lineHeight: 18 },
  error: { fontFamily: VokaFonts.body, color: Palette.secondary, fontSize: 14, lineHeight: 22 },
});
