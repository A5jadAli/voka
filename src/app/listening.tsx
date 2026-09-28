import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useSelectedLanguage } from '@/features/language/selection';
import { getScenarios } from '@/features/listening/scenarios';
import { useProgressStore } from '@/features/progress/store';

export default function ListeningLibrary() {
  const router = useRouter();
  const [track, select] = useSelectedLanguage();
  const completed = useProgressStore((state) => state.completedScenarioIds);
  const scenarios = getScenarios(track);
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
              <Text style={[styles.label, track === language && styles.labelSelected]}>
                {language === 'DE' ? 'Deutsch' : 'English'}
              </Text>
            </Pressable>
          ))}
        </View>
        {track === 'EN' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/activity/listen')}
            style={styles.card}
          >
            <View style={styles.iconTile}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={24} color={Palette.ink} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.cardTitle}>Start with a short warm-up</Text>
              <Text style={styles.copy}>
                One sentence, one question. Replay as often as you need.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Palette.muted} />
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
            <View style={[styles.iconTile, completed.includes(scenario.id) && styles.iconTileDone]}>
              <MaterialCommunityIcons
                name={completed.includes(scenario.id) ? 'check' : scenario.icon}
                size={24}
                color={Palette.ink}
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.meta}>
                {scenario.level} · {scenario.duration}
                {completed.includes(scenario.id) ? ' · Practised' : ''}
              </Text>
              <Text style={styles.cardTitle}>{scenario.title}</Text>
              <Text style={styles.copy} numberOfLines={2}>
                {scenario.context}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Palette.muted} />
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
  languages: {
    backgroundColor: 'rgba(19,18,17,0.07)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  language: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  selected: { backgroundColor: Palette.ink },
  label: { fontFamily: VokaFonts.bodySemiBold, color: Palette.ink, fontSize: 15 },
  labelSelected: { color: Palette.cream },
  card: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: '#FFE3D6',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  iconTileDone: { backgroundColor: Palette.yellow },
  meta: { color: Palette.muted, fontFamily: VokaFonts.bodySemiBold, fontSize: 13 },
  cardTitle: { fontFamily: VokaFonts.bodyBold, fontSize: 17, lineHeight: 23, color: Palette.ink },
});
