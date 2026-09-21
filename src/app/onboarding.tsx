import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { completeOnboarding } from '@/features/onboarding/storage';

const slides = [
  {
    eyebrow: 'Real conversation',
    icon: 'account-voice' as const,
    title: 'Train your ear for how people really speak.',
    copy: 'Practise natural English and German, interrupt the coach, slow things down, and keep live captions on when you need them.',
    accent: Palette.orange,
  },
  {
    eyebrow: 'A clear daily path',
    icon: 'calendar-check-outline' as const,
    title: 'Know exactly what to practise next.',
    copy: 'Small speaking, listening, writing, and vocabulary sessions adapt around your goal, without a maze of random lessons.',
    accent: Palette.yellow,
  },
  {
    eyebrow: 'You stay in control',
    icon: 'shield-check-outline' as const,
    title: 'Start as a guest. Sign in when you are ready.',
    copy: 'Sign in to sync lesson progress and preferences across your devices. Guest progress stays on this device, and you can replay this tour any time.',
    accent: Palette.orange,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const finish = async (destination: '/' | '/auth?mode=sign-up' = '/') => {
    await completeOnboarding();
    router.replace(destination);
  };

  return (
    <AppScreen scroll={false} showNav={false}>
      <View style={styles.screen}>
        <View style={styles.topRow}>
          <Text style={styles.logo}>VOKA</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void finish()}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.progress}>
          {slides.map((item, itemIndex) => (
            <View
              key={item.eyebrow}
              style={[styles.progressBar, itemIndex <= index && styles.progressBarActive]}
            />
          ))}
        </View>

        <View style={[styles.artCard, { backgroundColor: slide.accent }]}>
          <View style={styles.speechBubbleOne} />
          <View style={styles.speechBubbleTwo} />
          <View style={styles.artIcon}>
            <MaterialCommunityIcons color={Palette.cream} name={slide.icon} size={58} />
          </View>
          <Text style={styles.artCaption}>
            {index === 0
              ? 'Listen · interrupt · respond'
              : index === 1
                ? '10 focused minutes'
                : 'Your pace · your choice'}
          </Text>
        </View>

        <View style={styles.copyBlock}>
          <Eyebrow color={slide.accent}>{slide.eyebrow}</Eyebrow>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.copy}>{slide.copy}</Text>
        </View>

        <View style={styles.actions}>
          {isLast ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void finish('/auth?mode=sign-up')}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Create account</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (isLast) void finish();
              else setIndex((value) => value + 1);
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>{isLast ? 'Start learning' : 'Next'}</Text>
            <MaterialCommunityIcons color={Palette.ink} name="arrow-right" size={21} />
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingBottom: 18, paddingHorizontal: 20 },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  logo: { color: Palette.ink, fontFamily: VokaFonts.displayExtraBold, fontSize: 23 },
  skipButton: { paddingHorizontal: 10, paddingVertical: 8 },
  skipText: { color: Palette.muted, fontFamily: VokaFonts.bodySemiBold, fontSize: 13 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 18 },
  progressBar: { backgroundColor: 'rgba(19,18,17,.12)', borderRadius: 99, flex: 1, height: 5 },
  progressBarActive: { backgroundColor: Palette.ink },
  artCard: {
    alignItems: 'center',
    borderRadius: 30,
    flex: 1,
    justifyContent: 'center',
    marginTop: 22,
    maxHeight: 310,
    minHeight: 210,
    overflow: 'hidden',
  },
  artIcon: {
    alignItems: 'center',
    backgroundColor: Palette.ink,
    borderRadius: 99,
    height: 116,
    justifyContent: 'center',
    width: 116,
  },
  speechBubbleOne: {
    backgroundColor: 'rgba(241,237,227,.22)',
    borderRadius: 99,
    height: 145,
    position: 'absolute',
    right: -38,
    top: -35,
    width: 145,
  },
  speechBubbleTwo: {
    backgroundColor: 'rgba(19,18,17,.09)',
    borderRadius: 99,
    bottom: -55,
    height: 170,
    left: -55,
    position: 'absolute',
    width: 170,
  },
  artCaption: {
    color: Palette.ink,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  copyBlock: { marginTop: 25 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 29,
    letterSpacing: -0.8,
    lineHeight: 33,
    marginTop: 8,
  },
  copy: {
    color: Palette.muted,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 11,
  },
  actions: { flexDirection: 'row', gap: 9, marginTop: 20 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 58,
  },
  primaryText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(19,18,17,.16)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
  },
  secondaryText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 13 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
