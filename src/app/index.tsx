import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { getScenarios, type LanguageTrack } from '@/features/listening/scenarios';
import { useProgressStore } from '@/features/progress/store';

const trackDetails = {
  EN: {
    name: 'English',
    description: 'Catch the shortcuts, blended words and everyday phrases native speakers use.',
    level: 'A2–B1 · British English preview',
    accent: Palette.orange,
  },
  DE: {
    name: 'German',
    description: 'Train your ear for the words, shortcuts and speed you will hear in Germany.',
    level: 'A2–B1 · everyday situations',
    accent: Palette.yellow,
  },
} as const;

export default function HomeScreen() {
  const [track, setTrack] = useState<LanguageTrack>('EN');

  return (
    <AppScreen activeNav="home">
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>VOKA</Text>
          <Text style={styles.tagline}>Understand people, not just lessons.</Text>
        </View>
        <TrackSwitch track={track} onChange={setTrack} />
      </View>
      <ListeningHome track={track} />
    </AppScreen>
  );
}

function TrackSwitch({
  onChange,
  track,
}: {
  onChange: (track: LanguageTrack) => void;
  track: LanguageTrack;
}) {
  return (
    <View accessibilityLabel="Practice language" style={styles.trackSwitch}>
      {(['EN', 'DE'] as const).map((item) => (
        <Pressable
          accessibilityLabel={item === 'EN' ? 'English' : 'German'}
          accessibilityRole="button"
          accessibilityState={{ selected: item === track }}
          key={item}
          onPress={() => onChange(item)}
          style={({ pressed }) => [
            styles.trackButton,
            item === track && styles.trackButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.trackText, item === track && styles.trackTextSelected]}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ListeningHome({ track }: { track: LanguageTrack }) {
  const router = useRouter();
  const details = trackDetails[track];
  const scenarios = getScenarios(track);
  const completedIds = useProgressStore((state) => state.completedScenarioIds);

  return (
    <>
      <View style={styles.hero}>
        <Eyebrow color={details.accent}>Real-world listening</Eyebrow>
        <Text style={styles.heroTitle}>Understand real {details.name}</Text>
        <Text style={styles.heroSubtitle}>{details.description}</Text>
        <View style={[styles.levelPill, { backgroundColor: `${details.accent}2E` }]}>
          <View style={[styles.levelDot, { backgroundColor: details.accent }]} />
          <Text style={styles.levelText}>{details.level}</Text>
        </View>
      </View>

      <View style={styles.valueStrip}>
        <ValueItem icon="speedometer-slow" label="Slow it down" />
        <ValueItem icon="subtitles-outline" label="Smart subtitles" />
        <ValueItem icon="lightbulb-on-outline" label="Decode phrases" />
      </View>

      <SectionLabel>Listen like a local</SectionLabel>
      <View style={styles.scenarioList}>
        {scenarios.map((scenario, index) => (
          <Pressable
            accessibilityLabel={`Open ${scenario.title}`}
            key={scenario.id}
            onPress={() => router.push(`/lesson/${scenario.id}`)}
            style={({ pressed }) => [styles.scenarioCard, pressed && styles.pressed]}
          >
            <View style={[styles.scenarioIcon, index === 0 && { backgroundColor: details.accent }]}>
              <MaterialCommunityIcons
                color={index === 0 ? Palette.ink : details.accent}
                name={scenario.icon}
                size={24}
              />
            </View>
            <View style={styles.scenarioCopy}>
              <View style={styles.scenarioMeta}>
                <Text style={[styles.scenarioLevel, { backgroundColor: `${details.accent}36` }]}>
                  {scenario.level}
                </Text>
                <Text style={styles.scenarioDuration}>{scenario.duration}</Text>
                {completedIds.includes(scenario.id) ? (
                  <Text style={styles.scenarioDone}>DONE</Text>
                ) : null}
              </View>
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              <Text numberOfLines={2} style={styles.scenarioContext}>
                {scenario.context}
              </Text>
            </View>
            <MaterialCommunityIcons color="rgba(19, 18, 17, 0.3)" name="chevron-right" size={25} />
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityLabel={`Start first ${details.name} lesson`}
        onPress={() => router.push(`/lesson/${scenarios[0].id}`)}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <View style={styles.ctaCopy}>
          <Eyebrow color={details.accent}>Start here · under 5 min</Eyebrow>
          <Text style={styles.ctaTitle}>Can you catch what they really mean?</Text>
        </View>
        <View style={[styles.ctaArrow, { backgroundColor: details.accent }]}>
          <MaterialCommunityIcons color={Palette.ink} name="chevron-right" size={28} />
        </View>
      </Pressable>
    </>
  );
}

function ValueItem({
  icon,
  label,
}: {
  icon: 'lightbulb-on-outline' | 'speedometer-slow' | 'subtitles-outline';
  label: string;
}) {
  return (
    <View style={styles.valueItem}>
      <MaterialCommunityIcons color={Palette.ink} name={icon} size={18} />
      <Text style={styles.valueLabel}>{label}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Eyebrow>{children}</Eyebrow>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  logo: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 22,
    letterSpacing: -0.8,
  },
  tagline: { color: Palette.muted, fontFamily: VokaFonts.bodyMedium, fontSize: 9, marginTop: 1 },
  trackSwitch: {
    backgroundColor: Palette.soft,
    borderRadius: 99,
    flexDirection: 'row',
    padding: 3,
  },
  trackButton: { borderRadius: 99, paddingHorizontal: 15, paddingVertical: 8 },
  trackButtonSelected: { backgroundColor: Palette.ink },
  trackText: { color: Palette.muted, fontFamily: VokaFonts.monoMedium, fontSize: 11 },
  trackTextSelected: { color: Palette.cream },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  hero: { paddingHorizontal: 22, paddingTop: 8 },
  heroTitle: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1.1,
    lineHeight: 39,
    marginTop: 7,
  },
  heroSubtitle: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  levelPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  levelDot: { borderRadius: 99, height: 8, width: 8 },
  levelText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 11 },
  valueStrip: {
    flexDirection: 'row',
    gap: 7,
    marginHorizontal: 18,
    marginTop: 22,
  },
  valueItem: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    minHeight: 72,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  valueLabel: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 9,
    textAlign: 'center',
  },
  sectionLabel: { paddingBottom: 12, paddingHorizontal: 22, paddingTop: 26 },
  scenarioList: { gap: 10, paddingHorizontal: 18 },
  scenarioCard: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  scenarioIcon: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  scenarioCopy: { flex: 1 },
  scenarioMeta: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  scenarioLevel: {
    borderRadius: 99,
    color: Palette.ink,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  scenarioDuration: { color: Palette.muted, fontFamily: VokaFonts.mono, fontSize: 9 },
  scenarioDone: {
    color: '#337A45',
    fontFamily: VokaFonts.monoMedium,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  scenarioTitle: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayBold,
    fontSize: 18,
    marginTop: 4,
  },
  scenarioContext: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 26,
    flexDirection: 'row',
    gap: 14,
    margin: 18,
    padding: 22,
  },
  ctaCopy: { flex: 1 },
  ctaTitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 22,
    lineHeight: 27,
    marginTop: 8,
  },
  ctaArrow: {
    alignItems: 'center',
    borderRadius: 99,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});
