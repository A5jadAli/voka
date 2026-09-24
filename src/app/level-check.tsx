import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { LessonAudioButton } from '@/components/lesson-audio-button';
import { Palette, VokaFonts } from '@/constants/theme';
import { useSelectedLanguage } from '@/features/language/selection';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';

const checks = {
  DE: {
    language: 'de-DE',
    sentence: 'Der Bus in die Stadt fährt alle zwanzig Minuten.',
  },
  EN: {
    language: 'en-GB',
    sentence: 'The bus to the city leaves every twenty minutes.',
  },
} as const;

export default function LevelCheckScreen() {
  const router = useRouter();
  const [track, setTrack] = useSelectedLanguage();
  const check = checks[track];
  const speech = useLessonSpeech(check.language);

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.topRow}>
        <HeaderBack dark />
        <Text style={styles.duration}>ABOUT 2 MINUTES</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <Eyebrow color={Palette.orange}>Read out loud</Eyebrow>
        <View accessibilityLabel="Assessment language" style={styles.trackRow}>
          {(['EN', 'DE'] as const).map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: track === item }}
              key={item}
              onPress={() => setTrack(item)}
              style={[styles.trackButton, track === item && styles.trackButtonSelected]}
            >
              <Text style={[styles.trackText, track === item && styles.trackTextSelected]}>
                {item === 'EN' ? 'English' : 'Deutsch'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sentence}>{check.sentence}</Text>
        <View style={{ marginTop: 20 }}>
          <LessonAudioButton
            speech={speech}
            text={check.sentence}
            rate={0.88}
            label="Hear the level check sentence"
            dark
          />
        </View>

        <View style={styles.wave}>
          {[14, 31, 57, 86, 45, 96, 61, 34, 69, 24, 43, 16].map((height, index) => (
            <View key={index} style={[styles.waveBar, { height }]} />
          ))}
        </View>
        <View style={styles.micArea}>
          <Pressable
            accessibilityLabel="Start spoken level check"
            onPress={() => router.push(`/conversation?track=${track}&practice=diagnostic`)}
            style={({ pressed }) => [styles.micHalo, pressed && styles.pressed]}
          >
            <View style={styles.mic}>
              <MaterialCommunityIcons color={Palette.ink} name="microphone" size={35} />
            </View>
          </Pressable>
          <Text style={styles.listenText}>Tap to start your spoken check</Text>
          <Text style={styles.privacy}>Microphone access is requested only after you tap.</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  duration: {
    color: 'rgba(241,237,227,.5)',
    flex: 1,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  spacer: { width: 40 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 34 },
  trackRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  trackButton: {
    backgroundColor: 'rgba(241,237,227,.1)',
    borderRadius: 99,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  trackButtonSelected: { backgroundColor: Palette.orange },
  trackText: { color: Palette.cream, fontFamily: VokaFonts.bodySemiBold, fontSize: 11 },
  trackTextSelected: { color: Palette.ink },
  sentence: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 38,
    letterSpacing: -0.8,
    lineHeight: 44,
    marginTop: 14,
  },
  wave: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 120,
    paddingBottom: 6,
  },
  waveBar: {
    backgroundColor: Palette.orange,
    borderRadius: 9,
    height: 50,
    maxHeight: 96,
    opacity: 0.8,
    width: 5,
  },
  micArea: { alignItems: 'center', paddingBottom: 42 },
  micHalo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,74,23,.18)',
    borderRadius: 99,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  mic: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  listenText: {
    color: 'rgba(241,237,227,.72)',
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 14,
    marginTop: 14,
  },
  privacy: {
    color: 'rgba(241,237,227,.4)',
    fontFamily: VokaFonts.body,
    fontSize: 10,
    marginTop: 6,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
