import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { learningRecommendation } from '@/features/coaching/recommendation';

export function LearningRecommendation({ track }: { track: 'DE' | 'EN' }) {
  const router = useRouter();
  const choices = useCoachingStore((state) => state.preferences[track]);
  const recommendation = learningRecommendation(track, choices.ability, choices.studyGoal);
  return (
    <View style={styles.card}>
      <Eyebrow>Recommended next</Eyebrow>
      <Text style={styles.title}>{recommendation.title}</Text>
      <Text style={styles.copy}>{recommendation.why}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open practice: ${recommendation.title}`}
        onPress={() => router.push(recommendation.href as Href)}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Open practice</Text>
        <MaterialCommunityIcons name="arrow-right" size={21} color={Palette.ink} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change my starting point and goal"
        onPress={() => router.push('/learning-plan' as Href)}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="tune-variant" size={19} color={Palette.secondary} />
        <Text style={styles.secondaryText}>Starting point & goal</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={Palette.secondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 18,
    padding: 18,
    gap: 12,
    borderRadius: 22,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  title: { fontFamily: VokaFonts.displayBold, fontSize: 23, lineHeight: 29, color: Palette.ink },
  copy: { fontFamily: VokaFonts.body, fontSize: 13, lineHeight: 20, color: Palette.secondary },
  primary: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Palette.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryText: {
    fontFamily: VokaFonts.displayBold,
    fontSize: 18,
    color: Palette.ink,
    flexShrink: 1,
  },
  secondary: {
    minHeight: 48,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryText: {
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 19,
    color: Palette.secondary,
    flex: 1,
  },
  pressed: { opacity: 0.7 },
});
