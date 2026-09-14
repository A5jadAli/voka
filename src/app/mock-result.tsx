import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

const scores = [
  { label: 'Listening', score: '6.5', width: '72%', weak: false },
  { label: 'Reading', score: '6.5', width: '72%', weak: false },
  { label: 'Speaking', score: '5.5', width: '61%', weak: true },
  { label: 'Writing', score: '5.0', width: '55%', weak: true },
] as const;

export default function MockResultScreen() {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <Eyebrow color="rgba(241,237,227,.45)">Mock test 2 · 9 Sep</Eyebrow>
        <View style={styles.spacer} />
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.overall}>6.0</Text>
        <View style={styles.overallCopy}>
          <Text style={styles.overallLabel}>Overall band</Text>
          <View style={styles.improvement}>
            <MaterialCommunityIcons color={Palette.orange} name="arrow-up" size={13} />
            <Text style={styles.improvementText}>+0.5</Text>
          </View>
        </View>
      </View>
      <View style={styles.scores}>
        {scores.map((item) => (
          <ScoreBar key={item.label} {...item} />
        ))}
      </View>
      <View style={styles.nextCard}>
        <Eyebrow color={Palette.orange}>Do this next</Eyebrow>
        <Text style={styles.nextTitle}>
          Your sentences are too short. Practise joining two ideas.
        </Text>
        <View style={styles.nextActions}>
          <Pressable
            onPress={() => setAdded(true)}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addText}>{added ? 'Added to plan' : 'Add to my plan'}</Text>
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.notNow}>Not now</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.bottom}>
        <Pressable
          accessibilityLabel="See every mock test answer"
          onPress={() => router.push('/sprint')}
          style={({ pressed }) => [styles.answersButton, pressed && styles.pressed]}
        >
          <Text style={styles.answersText}>See every answer</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function ScoreBar({ label, score, weak, width }: (typeof scores)[number]) {
  return (
    <View>
      <View style={styles.scoreLabelRow}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, weak && styles.scoreWeak, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  spacer: { width: 40 },
  scoreRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  overall: {
    color: Palette.orange,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 92,
    letterSpacing: -4,
    lineHeight: 92,
  },
  overallCopy: { paddingBottom: 10 },
  overallLabel: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 19 },
  improvement: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,74,23,.18)',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  improvementText: { color: Palette.orange, fontFamily: VokaFonts.monoMedium, fontSize: 11 },
  scores: { gap: 18, paddingHorizontal: 22, paddingTop: 28 },
  scoreLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  scoreLabel: { color: Palette.cream, fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  scoreValue: { color: 'rgba(241,237,227,.55)', fontFamily: VokaFonts.monoMedium, fontSize: 14 },
  scoreTrack: {
    backgroundColor: 'rgba(241,237,227,.13)',
    borderRadius: 9,
    height: 12,
    overflow: 'hidden',
  },
  scoreFill: { backgroundColor: Palette.cream, borderRadius: 9, height: '100%' },
  scoreWeak: { backgroundColor: Palette.orange },
  nextCard: {
    backgroundColor: 'rgba(241,237,227,.07)',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 26,
    padding: 22,
  },
  nextTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 21,
    lineHeight: 27,
    marginTop: 10,
  },
  nextActions: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 18 },
  addButton: {
    backgroundColor: Palette.orange,
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  addText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 13 },
  notNow: { color: 'rgba(241,237,227,.5)', fontFamily: VokaFonts.bodySemiBold, fontSize: 13 },
  bottom: { padding: 20 },
  answersButton: {
    alignItems: 'center',
    borderColor: 'rgba(241,237,227,.2)',
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 62,
  },
  answersText: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 18 },
  pressed: { opacity: 0.72 },
});
