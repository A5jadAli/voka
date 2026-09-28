import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AudioIconButton } from '@/components/lesson-audio-button';
import { ProgressFill, Tactile } from '@/components/motion';
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
        <ProgressFill value={value} color={Palette.yellow} track="rgba(19,18,17,0.1)" />
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
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'yellow' | 'green' | 'red' | 'ink';
  icon?: IconName;
  accessibilityLabel?: string;
}) {
  const look = {
    yellow: { face: Palette.yellow, lip: '#C99600', ink: Palette.ink },
    green: { face: '#2F7A47', lip: '#1C4D2C', ink: Palette.white },
    red: { face: '#B44931', lip: '#7E2716', ink: Palette.white },
    ink: { face: Palette.ink, lip: '#000000', ink: Palette.cream },
  }[tone];
  const face = disabled ? '#DEDAD2' : look.face;
  const ink = disabled ? Palette.muted : look.ink;
  return (
    <Tactile
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled}
      onPress={onPress}
      face={face}
      lip={look.lip}
      radius={16}
      depth={4}
    >
      <View style={styles.primary}>
        <Text style={[styles.primaryText, { color: ink }]}>{title}</Text>
        {icon ? <MaterialCommunityIcons name={icon} size={20} color={ink} /> : null}
      </View>
    </Tactile>
  );
}

/** A quiet secondary action: a soft pill rather than an underlined web-style link. */
export function TextButton({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.textButton, pressed && styles.softPressed]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={18} color={Palette.ink} /> : null}
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
    <Animated.View
      key={feedback ? 'feedback' : 'plain'}
      entering={feedback ? FadeIn.duration(160) : undefined}
      style={[styles.actionBar, { backgroundColor: bg }, !feedback && styles.actionBorder]}
    >
      {feedback ? (
        <Animated.View
          key={`${feedback.tone}-${feedback.title}`}
          entering={FadeInDown.duration(220)}
          accessibilityLiveRegion="polite"
          style={styles.feedbackCopy}
        >
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
        </Animated.View>
      ) : null}
      {children}
    </Animated.View>
  );
}

/** A full-width tappable row: icon, title, optional subtitle and a chevron. */
export function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  accent = Palette.yellow,
  selected = false,
  trailing,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  accent?: string;
  selected?: boolean;
  trailing?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}: ${subtitle}` : title}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && { borderColor: accent, backgroundColor: '#FFF8E0' },
        pressed && styles.softPressed,
      ]}
    >
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: accent }]}>
          <MaterialCommunityIcons name={icon} size={22} color={Palette.ink} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text style={styles.rowTrailing}>{trailing}</Text> : null}
      <MaterialCommunityIcons
        name={selected ? 'check-circle' : 'chevron-right'}
        size={22}
        color={selected ? Palette.ink : Palette.muted}
      />
    </Pressable>
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
  meta: { color: Palette.muted, fontFamily: VokaFonts.bodySemiBold, fontSize: 13, lineHeight: 18 },
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
  track: { flex: 1, flexDirection: 'row' },
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
  textButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(19,18,17,0.06)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  textButtonLabel: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 15 },
  softPressed: { backgroundColor: 'rgba(19,18,17,0.12)' },
  actionBar: {
    gap: 12,
    overflow: 'hidden',
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
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
  section: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 17, marginTop: 8 },
  row: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowTitle: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 16, lineHeight: 22 },
  rowSubtitle: {
    color: Palette.secondary,
    fontFamily: VokaFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  rowTrailing: { color: Palette.muted, fontFamily: VokaFonts.bodySemiBold, fontSize: 14 },
  pressed: { opacity: 0.75 },
});
