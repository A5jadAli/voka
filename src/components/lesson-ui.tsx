import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AudioIconButton } from '@/components/lesson-audio-button';
import { Palette, VokaFonts } from '@/constants/theme';
import type { LessonSpeech } from '@/features/listening/use-lesson-speech';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const Feedback = {
  correctBg: '#E3F2E5',
  correctInk: '#1F5A33',
  wrongBg: '#FFE9E1',
  wrongInk: '#8E2D1B',
  closeBg: '#FFF4CC',
  closeInk: '#6B4E00',
} as const;

/** Close control, a thin progress bar and an optional label, as in modern lesson players. */
export function LessonTopBar({ progress, label }: { progress: number; label?: string }) {
  const router = useRouter();
  const value = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="close" size={24} color={Palette.ink} />
      </Pressable>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${Math.max(4, value * 100)}%` }]} />
      </View>
      {label ? <Text style={styles.topLabel}>{label}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  tone = 'yellow',
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'yellow' | 'green' | 'red' | 'ink';
  icon?: IconName;
}) {
  const background = {
    yellow: Palette.yellow,
    green: '#2F7A47',
    red: '#B44931',
    ink: Palette.ink,
  }[tone];
  const color = tone === 'yellow' ? Palette.ink : Palette.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: disabled ? 'rgba(19,18,17,0.12)' : background },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.primaryText, { color: disabled ? Palette.muted : color }]}>{title}</Text>
      {icon ? (
        <MaterialCommunityIcons name={icon} size={20} color={disabled ? Palette.muted : color} />
      ) : null}
    </Pressable>
  );
}

export function TextButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
    >
      <Text style={styles.textButtonLabel}>{title}</Text>
    </Pressable>
  );
}

/** Sticky bottom area. With `feedback`, it becomes a coloured result panel above the action. */
export function ActionBar({
  children,
  feedback,
}: PropsWithChildren<{
  feedback?: { tone: 'correct' | 'wrong' | 'close'; title: string; message?: string };
}>) {
  const bg = feedback
    ? { correct: Feedback.correctBg, wrong: Feedback.wrongBg, close: Feedback.closeBg }[
        feedback.tone
      ]
    : Palette.cream;
  const ink = feedback
    ? { correct: Feedback.correctInk, wrong: Feedback.wrongInk, close: Feedback.closeInk }[
        feedback.tone
      ]
    : Palette.ink;
  return (
    <View style={[styles.actionBar, { backgroundColor: bg }, !feedback && styles.actionBorder]}>
      {feedback ? (
        <View accessibilityLiveRegion="polite" style={styles.feedbackCopy}>
          <View style={styles.feedbackHeading}>
            <MaterialCommunityIcons
              name={
                feedback.tone === 'correct'
                  ? 'check-circle'
                  : feedback.tone === 'close'
                    ? 'alert-circle'
                    : 'close-circle'
              }
              size={26}
              color={ink}
            />
            <Text style={[styles.feedbackTitle, { color: ink }]}>{feedback.title}</Text>
          </View>
          {feedback.message ? (
            <Text style={[styles.feedbackMessage, { color: ink }]}>{feedback.message}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function InfoCard({
  icon,
  title,
  children,
  tone = 'white',
}: PropsWithChildren<{ icon: IconName; title: string; tone?: 'white' | 'yellow' | 'ink' }>) {
  const dark = tone === 'ink';
  return (
    <View
      style={[
        styles.info,
        tone === 'yellow' && { backgroundColor: '#FFF4CC' },
        dark && { backgroundColor: Palette.ink },
      ]}
    >
      <View style={styles.infoHeading}>
        <MaterialCommunityIcons name={icon} size={20} color={dark ? Palette.yellow : Palette.ink} />
        <Text style={[styles.infoTitle, dark && { color: Palette.cream }]}>{title}</Text>
      </View>
      {typeof children === 'string' ? (
        <Text style={[styles.infoText, dark && { color: 'rgba(241,237,227,.8)' }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export function PhraseCard({
  phrase,
  speech,
}: {
  phrase: { target: string; meaning: string; use: string };
  speech: LessonSpeech;
}) {
  return (
    <View style={styles.phrase}>
      <View style={styles.phraseRow}>
        <View style={styles.phraseCopy}>
          <Text style={styles.phraseTarget}>{phrase.target}</Text>
          <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
        </View>
        <View style={styles.phraseAudio}>
          <AudioIconButton speech={speech} text={phrase.target} label={`Hear: ${phrase.target}`} />
          <AudioIconButton
            speech={speech}
            text={phrase.target}
            label={`Hear slowly: ${phrase.target}`}
            rate={0.6}
            slow
          />
        </View>
      </View>
      <Text style={styles.phraseUse}>{phrase.use}</Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export const lessonText = StyleSheet.create({
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 33,
  },
  lead: { color: Palette.secondary, fontFamily: VokaFonts.body, fontSize: 16, lineHeight: 24 },
  prompt: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 23, lineHeight: 30 },
  meta: {
    color: Palette.muted,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  small: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 13, lineHeight: 19 },
});

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  close: { alignItems: 'center', height: 44, justifyContent: 'center', width: 36 },
  track: {
    backgroundColor: 'rgba(19,18,17,0.1)',
    borderRadius: 99,
    flex: 1,
    height: 10,
    overflow: 'hidden',
  },
  fill: { backgroundColor: Palette.yellow, borderRadius: 99, height: '100%' },
  topLabel: { color: Palette.secondary, fontFamily: VokaFonts.monoMedium, fontSize: 12 },
  primary: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  primaryText: { fontFamily: VokaFonts.displayBold, fontSize: 17 },
  textButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  textButtonLabel: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  actionBar: { gap: 12, paddingBottom: 14, paddingHorizontal: 18, paddingTop: 14 },
  actionBorder: { borderTopColor: Palette.line, borderTopWidth: 1 },
  feedbackCopy: { gap: 6 },
  feedbackHeading: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  feedbackTitle: { fontFamily: VokaFonts.displayBold, fontSize: 20 },
  feedbackMessage: { fontFamily: VokaFonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  info: { backgroundColor: Palette.white, borderRadius: 20, gap: 8, padding: 16 },
  infoHeading: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  infoTitle: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  infoText: { color: Palette.secondary, fontFamily: VokaFonts.body, fontSize: 15, lineHeight: 23 },
  phrase: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  phraseRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  phraseCopy: { flex: 1, gap: 4 },
  phraseTarget: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 19,
    lineHeight: 26,
  },
  phraseMeaning: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 15,
    lineHeight: 21,
  },
  phraseAudio: { flexDirection: 'row', gap: 8 },
  phraseUse: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 13, lineHeight: 19 },
  section: {
    color: Palette.secondary,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.75 },
});
