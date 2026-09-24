import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { LessonAudioButton } from '@/components/lesson-audio-button';
import { Palette, VokaFonts } from '@/constants/theme';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';

export default function VocabularyScreen() {
  const router = useRouter();
  const speech = useLessonSpeech('de-DE');
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const words = [
    {
      article: 'DIE',
      example: 'Die Rechnung, bitte.',
      meaning: 'the bill',
      pronunciation: '/ˈʁɛçnʊŋ/',
      word: 'Rechnung',
    },
    {
      article: 'DER',
      example: 'Der Kaffee, bitte.',
      meaning: 'the coffee',
      pronunciation: '/ˈkafeː/',
      word: 'Kaffee',
    },
    {
      article: 'DAS',
      example: 'Das Wasser, bitte.',
      meaning: 'the water',
      pronunciation: '/ˈvasɐ/',
      word: 'Wasser',
    },
  ];
  const current = words[index];
  const move = (direction: number) => {
    speech.stop();
    setIndex((value) => Math.max(0, Math.min(words.length - 1, value + direction)));
    setFlipped(false);
  };
  const isLast = index === words.length - 1;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 20,
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dx > 55) move(-1);
          if (gesture.dx < -55) move(1);
        },
      }),
    // The gesture only needs the stable move behavior for this finite deck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <AppScreen showNav={false}>
      <View style={styles.header}>
        <HeaderBack />
        <View style={styles.progressDots}>
          {words.map((word, dot) => (
            <View
              key={word.word}
              style={[
                styles.dot,
                dot < index && styles.dotDone,
                dot === index && styles.dotCurrent,
              ]}
            />
          ))}
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Flip vocabulary card"
          onPress={() => setFlipped((value) => !value)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          {...panResponder.panHandlers}
        >
          <View style={styles.cardTop}>
            <Text style={styles.article}>{current.article}</Text>
          </View>
          <Text style={styles.word}>{flipped ? current.meaning : current.word}</Text>
          <Text style={styles.pronunciation}>
            {flipped ? current.example : current.pronunciation}
          </Text>
          <View style={styles.divider} />
          <View style={styles.translationRow}>
            <View style={styles.receipt}>
              <MaterialCommunityIcons color={Palette.muted} name="receipt-text-outline" size={20} />
            </View>
            <View>
              <Text style={styles.translation}>{current.meaning}</Text>
              <Text style={styles.example}>{current.example}</Text>
            </View>
          </View>
        </Pressable>
        <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
          <LessonAudioButton speech={speech} text={current.word} label={`Hear ${current.word}`} />
        </View>
        <View style={styles.swipeHint}>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-left" size={18} />
          <Text style={styles.hint}>Swipe between cards · tap card to flip</Text>
          <MaterialCommunityIcons color={Palette.muted} name="chevron-right" size={18} />
        </View>
        <Pressable
          accessibilityLabel={isLast ? 'Finish vocabulary deck' : 'Next vocabulary card'}
          accessibilityRole="button"
          onPress={() => {
            if (isLast) router.replace('/sprint?track=DE');
            else move(1);
          }}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
        >
          <Text style={styles.nextButtonText}>{isLast ? 'Finish deck' : 'Next card'}</Text>
          <MaterialCommunityIcons color={Palette.ink} name="chevron-right" size={21} />
        </Pressable>
        <Text style={styles.hint}>Practise it with the live coach</Text>
        <Pressable
          accessibilityLabel="Open German pronunciation coach"
          onPress={() => router.push('/conversation?track=DE')}
          style={({ pressed }) => [styles.mic, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.yellow} name="microphone" size={34} />
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  spacer: { width: 40 },
  progressDots: { flexDirection: 'row', gap: 5 },
  dot: { backgroundColor: 'rgba(19, 18, 17, 0.15)', borderRadius: 99, height: 8, width: 8 },
  dotDone: { backgroundColor: Palette.yellow },
  dotCurrent: { backgroundColor: Palette.ink },
  content: { alignItems: 'center', flex: 1, paddingHorizontal: 22 },
  card: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 30,
    borderWidth: 1,
    marginTop: 4,
    padding: 28,
    shadowColor: Palette.ink,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.09,
    shadowRadius: 30,
    width: '100%',
  },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  article: {
    backgroundColor: 'rgba(242, 183, 5, 0.25)',
    borderRadius: 99,
    color: Palette.ink,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  word: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 42,
    letterSpacing: -1.4,
    marginTop: 20,
  },
  pronunciation: { color: Palette.muted, fontFamily: VokaFonts.mono, fontSize: 15, marginTop: 8 },
  divider: { backgroundColor: Palette.line, height: 1, marginVertical: 22 },
  translationRow: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  receipt: {
    alignItems: 'center',
    backgroundColor: Palette.soft,
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  translation: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 22 },
  example: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 12, marginTop: 3 },
  hint: { color: Palette.muted, fontFamily: VokaFonts.bodySemiBold, fontSize: 12, marginTop: 22 },
  swipeHint: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  nextButton: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 24,
  },
  nextButtonText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 15 },
  mic: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderColor: 'rgba(242, 183, 5, 0.35)',
    borderRadius: 99,
    borderWidth: 12,
    height: 104,
    justifyContent: 'center',
    marginTop: 18,
    width: 104,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
