import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

export default function VocabularyScreen() {
  const [flipped, setFlipped] = useState(false);
  return (
    <AppScreen activeNav="cards">
      <View style={styles.header}>
        <HeaderBack />
        <View style={styles.progressDots}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
            <View
              key={dot}
              style={[styles.dot, dot < 3 && styles.dotDone, dot === 3 && styles.dotCurrent]}
            />
          ))}
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Pressable
          onPress={() => setFlipped((value) => !value)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.cardTop}>
            <Text style={styles.article}>DIE</Text>
            <View style={styles.sound}>
              <MaterialCommunityIcons color={Palette.cream} name="volume-high" size={19} />
            </View>
          </View>
          <Text style={styles.word}>{flipped ? 'the bill' : 'Rechnung'}</Text>
          <Text style={styles.pronunciation}>{flipped ? 'Die Rechnung, bitte.' : '/ˈʁɛçnʊŋ/'}</Text>
          <View style={styles.divider} />
          <View style={styles.translationRow}>
            <View style={styles.receipt}>
              <MaterialCommunityIcons color={Palette.muted} name="receipt-text-outline" size={20} />
            </View>
            <View>
              <Text style={styles.translation}>the bill</Text>
              <Text style={styles.example}>Die Rechnung, bitte.</Text>
            </View>
          </View>
        </Pressable>
        <Text style={styles.hint}>Swipe to skip · tap card to flip</Text>
        <Text style={styles.hint}>Hold and say it</Text>
        <Pressable style={({ pressed }) => [styles.mic, pressed && styles.pressed]}>
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
  sound: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 99,
    height: 40,
    justifyContent: 'center',
    width: 40,
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
