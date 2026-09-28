import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';
import { AnswerChoice } from '@/components/answer-choice';
import { WritingActivity } from '@/components/writing-activity';

export default function ActivityScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  if (kind === 'write') return <WritingActivity />;
  if (kind === 'listen') return <ListeningActivity />;
  return <Redirect href="/conversation?track=EN" />;
}

function ActivityHeader({
  dark = false,
  progress = 1,
  total = 3,
}: {
  dark?: boolean;
  progress?: number;
  total?: number;
}) {
  return (
    <View style={styles.header}>
      <HeaderBack dark={dark} />
      <View style={styles.progressBars}>
        {Array.from({ length: total }, (_, item) => (
          <View
            key={item}
            style={[
              styles.progressBar,
              { backgroundColor: dark ? 'rgba(241, 237, 227, 0.15)' : 'rgba(19, 18, 17, 0.15)' },
              item < progress && styles.progressDone,
            ]}
          />
        ))}
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function ListeningActivity() {
  const speech = useLessonSpeech('en-GB');
  const [selected, setSelected] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();
  const sample = 'Let’s meet outside the station at half past three.';
  const play = (rate = 0.92) => void speech.play(sample, rate);
  const footer = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={feedback && selected === 1 ? 'Continue' : 'Check answer'}
      accessibilityState={{ disabled: selected === null }}
      disabled={selected === null}
      onPress={() => {
        if (feedback && selected === 1) router.push('/lesson/coffee-run');
        else
          setFeedback(
            selected === 1
              ? 'Correct. They will meet outside the station.'
              : 'Not quite. Replay it slowly and listen for the place.',
          );
      }}
      style={({ pressed }) => [
        styles.checkButton,
        selected === null && styles.actionDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.primaryActionText}>
        {feedback && selected === 1 ? 'Continue' : 'Check'}
      </Text>
    </Pressable>
  );
  return (
    <AppScreen footer={footer} showNav={false}>
      <ActivityHeader progress={feedback && selected === 1 ? 1 : 0} total={1} />
      {speech.error ? (
        <Text accessibilityRole="alert" style={{ padding: 18, color: Palette.ink }}>
          {speech.error}
        </Text>
      ) : null}
      <View style={styles.activityBody}>
        <View style={styles.audioCard}>
          <Pressable
            accessibilityLabel={
              speech.loading
                ? 'Cancel listening sample'
                : speech.busy
                  ? 'Stop listening sample'
                  : 'Play listening sample'
            }
            accessibilityRole="button"
            accessibilityState={{ busy: speech.loading }}
            aria-busy={speech.loading}
            onPress={() => (speech.busy ? speech.stop() : play())}
            style={styles.pauseButton}
          >
            {speech.loading ? (
              <ActivityIndicator color={Palette.ink} />
            ) : (
              <MaterialCommunityIcons
                color={Palette.ink}
                name={speech.playing ? 'stop' : 'play'}
                size={30}
              />
            )}
          </Pressable>
          <Waveform />
          <Text
            accessibilityLiveRegion="polite"
            style={{
              color: Palette.cream,
              fontFamily: VokaFonts.body,
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            {speech.loading
              ? 'Preparing audio...'
              : speech.playing
                ? 'Playing audio'
                : 'Tap play to listen'}
          </Text>
          <View style={styles.audioControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Play slowly"
              accessibilityState={{ selected: speech.busy && speech.activeRate === 0.72 }}
              aria-pressed={speech.busy && speech.activeRate === 0.72}
              style={styles.audioControl}
              onPress={() => play(0.72)}
            >
              <Text
                style={
                  speech.busy && speech.activeRate === 0.72 ? styles.slowChip : styles.audioChip
                }
              >
                ✦ Slow
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replay audio"
              style={styles.audioControl}
              onPress={() => play()}
            >
              <Text style={styles.audioChip}>Replay</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showText ? 'Hide transcript' : 'Show transcript'}
              accessibilityState={{ expanded: showText }}
              aria-expanded={showText}
              style={styles.audioControl}
              onPress={() => setShowText((value) => !value)}
            >
              <Text style={styles.audioChip}>{showText ? 'Hide text' : 'Show text'}</Text>
            </Pressable>
          </View>
          {showText ? <Text style={styles.audioTranscript}>{sample}</Text> : null}
        </View>
        <View style={styles.questionBlock}>
          <Eyebrow>Question 1 of 1</Eyebrow>
          <Text style={styles.question}>Where will they meet?</Text>
          <View style={styles.answers}>
            {['At the library', 'Outside the station', 'In the café'].map((answer, index) => (
              <AnswerChoice
                label={answer}
                selected={selected === index}
                result={
                  feedback && selected === index
                    ? selected === 1
                      ? 'correct'
                      : 'incorrect'
                    : undefined
                }
                disabled={Boolean(feedback && selected === 1)}
                key={answer}
                onPress={() => {
                  setSelected(index);
                  setFeedback('');
                }}
              />
            ))}
          </View>
          {feedback ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.answerFeedback, selected === 1 && styles.answerFeedbackCorrect]}
            >
              {feedback}
            </Text>
          ) : null}
        </View>
      </View>
    </AppScreen>
  );
}

function Waveform() {
  return (
    <View style={styles.wave}>
      {[10, 20, 30, 18, 35, 27, 41, 30, 18, 26, 14, 22].map((height, index) => (
        <View key={index} style={[styles.waveBar, { height }, index > 6 && styles.waveMuted]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  writingCopy: { color: Palette.secondary },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerSpacer: { width: 40 },
  progressBars: { flexDirection: 'row', gap: 4 },
  progressBar: { borderRadius: 99, height: 5, width: 20 },
  progressDone: { backgroundColor: Palette.orange },
  activityBody: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  prompt: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 27,
    lineHeight: 33,
    marginTop: 8,
  },
  chartCard: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 18,
    padding: 16,
  },
  chartCaption: { color: Palette.muted, fontFamily: VokaFonts.bodyMedium, fontSize: 11 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 8, height: 110, marginTop: 12 },
  barColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  chartBar: { backgroundColor: '#D9D9D7', borderRadius: 5, width: '100%' },
  chartBarHot: { backgroundColor: Palette.orange },
  barLabel: { color: Palette.muted, fontFamily: VokaFonts.monoMedium, fontSize: 8, marginTop: 6 },
  wordChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  wordChip: {
    backgroundColor: Palette.ink,
    borderRadius: 99,
    color: Palette.cream,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  writingInput: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 18,
    borderWidth: 1,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
    minHeight: 130,
    maxHeight: 220,
    padding: 15,
  },
  savedText: { color: '#3B754C', fontFamily: VokaFonts.bodySemiBold, fontSize: 11, marginTop: 8 },
  wordCount: {
    color: Palette.muted,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 10,
    marginTop: 8,
    textAlign: 'right',
  },
  validationText: { color: '#A4391B' },
  bottomActionRow: { flexDirection: 'row', gap: 8, padding: 18 },
  smallAction: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 18,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryActionText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 18 },
  pressed: { opacity: 0.7 },
  actionDisabled: { opacity: 0.45 },
  audioCard: { backgroundColor: Palette.ink, borderRadius: 26, padding: 20 },
  pauseButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  wave: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 50,
    marginLeft: 72,
    marginTop: -54,
  },
  waveBar: { backgroundColor: Palette.cream, borderRadius: 9, flex: 1 },
  waveMuted: { backgroundColor: 'rgba(241, 237, 227, 0.25)' },
  audioControls: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 18 },
  audioControl: { minHeight: 44, justifyContent: 'center' },
  audioTranscript: {
    color: 'rgba(241,237,227,.72)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  slowChip: {
    backgroundColor: Palette.orange,
    borderRadius: 99,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 11,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  audioChip: {
    backgroundColor: 'rgba(241, 237, 227, 0.12)',
    borderRadius: 99,
    color: Palette.cream,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  questionBlock: { marginTop: 28 },
  question: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 27,
    marginTop: 8,
  },
  answers: { gap: 10, marginTop: 18 },
  answerFeedback: {
    color: '#A4391B',
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  answerFeedbackCorrect: { color: '#39734A' },
  checkButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    justifyContent: 'center',
    margin: 18,
    minHeight: 60,
  },
});
