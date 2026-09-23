import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useSelectedLanguage } from '@/features/language/selection';
import { listeningScenarios } from '@/features/listening/scenarios';
import { useProgressStore } from '@/features/progress/store';

export default function ListeningLibrary() {
  const router = useRouter();
  const [track, select] = useSelectedLanguage();
  const completed = useProgressStore((state) => state.completedScenarioIds);
  const scenarios = listeningScenarios.filter((scenario) => scenario.track === track);
  return (
    <AppScreen activeNav="plan">
      <View style={styles.header}>
        <HeaderBack />
        <Eyebrow>Listening practice</Eyebrow>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{track === 'DE' ? 'German' : 'English'} listening</Text>
        <Text style={styles.copy}>
          Choose a dialogue. Listen slowly, follow the meaning, then check what you understood.
        </Text>
        <View style={styles.languages}>
          {(['EN', 'DE'] as const).map((language) => (
            <Pressable
              key={language}
              accessibilityRole="button"
              accessibilityLabel={`${language === 'DE' ? 'German' : 'English'} listening library`}
              accessibilityState={{ selected: track === language }}
              onPress={() => select(language)}
              style={[styles.language, track === language && styles.selected]}
            >
              <Text style={styles.label}>{language === 'DE' ? 'Deutsch' : 'English'}</Text>
            </Pressable>
          ))}
        </View>
        {track === 'EN' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/activity/listen')}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Start with a short warm-up</Text>
            <Text style={styles.copy}>
              One sentence, one question. Replay as often as you need.
            </Text>
          </Pressable>
        ) : null}
        {scenarios.map((scenario) => (
          <Pressable
            key={scenario.id}
            accessibilityRole="button"
            accessibilityLabel={`Open listening lesson ${scenario.title}`}
            onPress={() => router.push(`/lesson/${scenario.id}`)}
            style={styles.card}
          >
            <View style={styles.row}>
              <MaterialCommunityIcons name={scenario.icon} size={24} color={Palette.orange} />
              <Eyebrow>
                {scenario.level} · {scenario.duration}
              </Eyebrow>
            </View>
            <Text style={styles.cardTitle}>{scenario.title}</Text>
            <Text style={styles.copy}>{scenario.context}</Text>
            <Text style={styles.action}>
              {completed.includes(scenario.id) ? 'Practised · replay lesson' : 'Start lesson'} →
            </Text>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  header: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  body: { paddingHorizontal: 22, paddingBottom: 28, gap: 14 },
  title: { fontFamily: VokaFonts.displayExtraBold, color: Palette.ink, fontSize: 32 },
  copy: { fontFamily: VokaFonts.body, color: Palette.secondary, fontSize: 14, lineHeight: 21 },
  languages: { flexDirection: 'row', gap: 10 },
  language: { padding: 14, borderWidth: 1, borderColor: Palette.line, borderRadius: 14 },
  selected: { backgroundColor: Palette.yellow },
  label: { fontFamily: VokaFonts.bodySemiBold, color: Palette.ink },
  card: {
    backgroundColor: Palette.white,
    padding: 20,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  cardTitle: { fontFamily: VokaFonts.displayBold, fontSize: 21, color: Palette.ink },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  action: {
    fontFamily: VokaFonts.bodySemiBold,
    color: Palette.ink,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});
