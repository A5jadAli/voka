import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useAssessmentStore } from '@/features/assessment/store';
import { useSelectedLanguage } from '@/features/language/selection';

export default function AssessmentResultScreen() {
  const router = useRouter();
  const [track] = useSelectedLanguage();
  const assessment = useAssessmentStore((state) => state.assessments[track]);
  const hasHydrated = useAssessmentStore((state) => state.hasHydrated);

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <Eyebrow color="rgba(241,237,227,.55)">Assessment results</Eyebrow>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        {!hasHydrated ? (
          <>
            <Eyebrow color={Palette.orange}>Loading result</Eyebrow>
            <Text style={styles.title}>Checking your saved assessment…</Text>
          </>
        ) : assessment ? (
          <>
            <View style={styles.levelCircle}>
              <Text style={styles.level}>{assessment.estimatedLevel}</Text>
            </View>
            <Eyebrow color={Palette.orange}>
              {track === 'DE' ? 'German' : 'English'} · {assessment.confidence} confidence
            </Eyebrow>
            <Text style={styles.title}>Your current spoken range</Text>
            <Text style={styles.copy}>{assessment.summary}</Text>
            <ResultList
              icon="check-circle-outline"
              items={assessment.strengths}
              title="Strengths"
            />
            <ResultList
              icon="arrow-up-circle-outline"
              items={assessment.priorities}
              title="Next priorities"
            />
            <Text style={styles.disclaimer}>
              Estimated from {assessment.evidenceTurnCount} transcribed responses. This is not a
              certified CEFR result and does not score pronunciation.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.icon}>
              <MaterialCommunityIcons color={Palette.ink} name="account-voice" size={38} />
            </View>
            <Eyebrow color={Palette.orange}>No result yet</Eyebrow>
            <Text style={styles.title}>Complete a real conversation first.</Text>
            <Text style={styles.copy}>
              Voka only estimates a level after it has enough transcript evidence. It never fills
              this page with a made-up score.
            </Text>
          </>
        )}
        {hasHydrated ? (
          <Pressable
            accessibilityLabel={
              assessment ? 'Retake spoken level check' : 'Start spoken level check'
            }
            accessibilityRole="button"
            onPress={() => router.replace('/level-check')}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color={Palette.ink} name="microphone" size={21} />
            <Text style={styles.buttonText}>
              {assessment ? 'Retake check' : 'Start spoken check'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </AppScreen>
  );
}

function ResultList({
  icon,
  items,
  title,
}: {
  icon: 'arrow-up-circle-outline' | 'check-circle-outline';
  items: string[];
  title: string;
}) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.resultRow}>
          <MaterialCommunityIcons color={Palette.orange} name={icon} size={18} />
          <Text style={styles.resultText}>{item}</Text>
        </View>
      ))}
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
  body: { flex: 1, padding: 24, paddingTop: 42 },
  icon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    marginBottom: 22,
    width: 72,
  },
  levelCircle: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    height: 82,
    justifyContent: 'center',
    marginBottom: 20,
    width: 82,
  },
  level: { color: Palette.ink, fontFamily: VokaFonts.displayExtraBold, fontSize: 32 },
  title: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 39,
    marginTop: 10,
  },
  copy: {
    color: 'rgba(241,237,227,.68)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  resultCard: { backgroundColor: '#282623', borderRadius: 20, gap: 10, marginTop: 18, padding: 16 },
  resultTitle: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  resultRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 9 },
  resultText: {
    color: 'rgba(241,237,227,.72)',
    flex: 1,
    fontFamily: VokaFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  disclaimer: {
    color: 'rgba(241,237,227,.4)',
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 16,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 14 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
