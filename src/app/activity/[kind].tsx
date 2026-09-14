import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

export default function ActivityScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  if (kind === 'write') return <WritingActivity />;
  if (kind === 'listen') return <ListeningActivity />;
  return <SpeakingActivity />;
}

function ActivityHeader({ dark = false, progress = 2 }: { dark?: boolean; progress?: number }) {
  return (
    <View style={styles.header}>
      <HeaderBack dark={dark} />
      <View style={styles.progressBars}>
        {[0, 1, 2, 3, 4].map((item) => (
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

function WritingActivity() {
  const router = useRouter();
  const [writing, setWriting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  const bars = [33, 49, 43, 63, 76, 34, 27];
  return (
    <AppScreen showNav={false}>
      <ActivityHeader />
      <View style={styles.activityBody}>
        <Eyebrow color={Palette.orange}>Writing · Task 1</Eyebrow>
        <Text style={styles.prompt}>Look at the chart. Write what you see.</Text>
        <View style={styles.chartCard}>
          <Text style={styles.chartCaption}>Coffee sold each day</Text>
          <View style={styles.chart}>
            {bars.map((height, index) => (
              <View key={index} style={styles.barColumn}>
                <View
                  style={[
                    styles.chartBar,
                    { height },
                    index > 2 && index < 5 && styles.chartBarHot,
                  ]}
                />
                <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
              </View>
            ))}
          </View>
        </View>
        <Eyebrow>Use these words</Eyebrow>
        <View style={styles.wordChips}>
          {['rose', 'the highest', 'fell sharply', 'about half'].map((word) => (
            <Text key={word} style={styles.wordChip}>
              {word}
            </Text>
          ))}
        </View>
        {writing ? (
          <TextInput
            accessibilityLabel="Writing response"
            multiline
            onChangeText={(value) => {
              setAnswer(value);
              setSaved(false);
            }}
            placeholder="Describe the main trend and compare the busiest days…"
            placeholderTextColor={Palette.muted}
            style={styles.writingInput}
            textAlignVertical="top"
            value={answer}
          />
        ) : null}
        {saved ? (
          <Text accessibilityLiveRegion="polite" style={styles.savedText}>
            Draft saved on this device for this session.
          </Text>
        ) : null}
      </View>
      <View style={styles.bottomActionRow}>
        <Pressable
          accessibilityLabel="Answer by speaking instead"
          onPress={() => router.push('/conversation?track=EN')}
          style={styles.smallAction}
        >
          <MaterialCommunityIcons color={Palette.ink} name="microphone" size={23} />
        </Pressable>
        <Pressable
          accessibilityLabel={writing ? 'Save writing response' : 'Start writing'}
          onPress={() => {
            if (!writing) setWriting(true);
            else if (answer.trim().length >= 20) setSaved(true);
          }}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
        >
          <Text style={styles.primaryActionText}>
            {writing ? 'Save response' : 'Start writing'}
          </Text>
          <MaterialCommunityIcons color={Palette.ink} name="chevron-right" size={22} />
        </Pressable>
      </View>
    </AppScreen>
  );
}

function ListeningActivity() {
  const [selected, setSelected] = useState(1);
  const [showText, setShowText] = useState(false);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();
  const sample = 'Let’s meet outside the station at half past three.';
  const play = (rate = 0.92) => Speech.speak(sample, { language: 'en-GB', rate });
  return (
    <AppScreen showNav={false}>
      <ActivityHeader progress={2} />
      <View style={styles.activityBody}>
        <View style={styles.audioCard}>
          <Pressable
            accessibilityLabel="Play listening sample"
            onPress={() => play()}
            style={styles.pauseButton}
          >
            <MaterialCommunityIcons color={Palette.ink} name="play" size={30} />
          </Pressable>
          <Waveform />
          <View style={styles.audioControls}>
            <Pressable accessibilityLabel="Play slowly" onPress={() => play(0.72)}>
              <Text style={styles.slowChip}>✦ Slow</Text>
            </Pressable>
            <Pressable accessibilityLabel="Replay audio" onPress={() => play()}>
              <Text style={styles.audioChip}>Replay</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Show transcript"
              onPress={() => setShowText((value) => !value)}
            >
              <Text style={styles.audioChip}>{showText ? 'Hide text' : 'Show text'}</Text>
            </Pressable>
          </View>
          {showText ? <Text style={styles.audioTranscript}>{sample}</Text> : null}
        </View>
        <View style={styles.questionBlock}>
          <Eyebrow>Question 3</Eyebrow>
          <Text style={styles.question}>Where will they meet?</Text>
          <View style={styles.answers}>
            {['At the library', 'Outside the station', 'In the café'].map((answer, index) => (
              <Pressable
                key={answer}
                onPress={() => {
                  setSelected(index);
                  setFeedback('');
                }}
                style={[styles.answer, selected === index && styles.answerSelected]}
              >
                <View style={[styles.radio, selected === index && styles.radioSelected]}>
                  {selected === index ? (
                    <MaterialCommunityIcons color={Palette.ink} name="check" size={15} />
                  ) : null}
                </View>
                <Text style={[styles.answerText, selected === index && styles.answerTextSelected]}>
                  {answer}
                </Text>
              </Pressable>
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
      <Pressable
        onPress={() => {
          if (feedback && selected === 1) router.push('/lesson/coffee-run');
          else
            setFeedback(
              selected === 1
                ? 'Correct — they will meet outside the station.'
                : 'Not quite. Replay it slowly and listen for the place.',
            );
        }}
        style={({ pressed }) => [styles.checkButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryActionText}>
          {feedback && selected === 1 ? 'Continue' : 'Check'}
        </Text>
      </Pressable>
    </AppScreen>
  );
}

function SpeakingActivity() {
  const router = useRouter();
  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <ActivityHeader dark progress={3} />
      <View style={styles.speakingBody}>
        <Eyebrow color={Palette.orange}>You said</Eyebrow>
        <Text style={styles.transcript}>
          I want to <Text style={styles.mistake}>telling</Text> about a place I{' '}
          <Text style={styles.mistake}>visit</Text> last summer with my family.
        </Text>
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackTitleRow}>
            <View style={styles.sparkIcon}>
              <MaterialCommunityIcons color={Palette.ink} name="creation" size={18} />
            </View>
            <Text style={styles.feedbackTitle}>Fix these two</Text>
          </View>
          <Correction from="telling" to="tell" />
          <Correction from="visit" to="visited" />
        </View>
        <View style={styles.metrics}>
          <Metric label="Clear sound" score={4} />
          <Metric label="Smooth speaking" score={3} />
          <Metric label="Right words" score={2} />
        </View>
      </View>
      <View style={styles.darkActions}>
        <Pressable onPress={() => router.replace('/activity/speak')} style={styles.againButton}>
          <MaterialCommunityIcons color={Palette.cream} name="restart" size={20} />
          <Text style={styles.againText}>Again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.nextButton}>
          <Text style={styles.primaryActionText}>Next</Text>
        </Pressable>
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

function Correction({ from, to }: { from: string; to: string }) {
  return (
    <View style={styles.correction}>
      <Text style={styles.correctionFrom}>{from}</Text>
      <MaterialCommunityIcons color={Palette.orange} name="arrow-right" size={18} />
      <Text style={styles.correctionTo}>{to}</Text>
    </View>
  );
}

function Metric({ label, score }: { label: string; score: number }) {
  return (
    <View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricBars}>
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} style={[styles.metricBar, item < score && styles.metricBarDone]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 15,
  },
  savedText: { color: '#3B754C', fontFamily: VokaFonts.bodySemiBold, fontSize: 11, marginTop: 8 },
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
  audioControls: { flexDirection: 'row', gap: 7, marginTop: 18 },
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
  answer: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  answerSelected: { backgroundColor: Palette.ink },
  radio: {
    borderColor: 'rgba(19, 18, 17, 0.25)',
    borderRadius: 99,
    borderWidth: 1.5,
    height: 25,
    width: 25,
  },
  radioSelected: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderColor: Palette.orange,
    justifyContent: 'center',
  },
  answerText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 16 },
  answerTextSelected: { color: Palette.cream, fontFamily: VokaFonts.bodyBold },
  checkButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    justifyContent: 'center',
    margin: 18,
    minHeight: 60,
  },
  speakingBody: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  transcript: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 27,
    lineHeight: 35,
    marginTop: 12,
  },
  mistake: {
    color: Palette.orange,
    textDecorationColor: Palette.orange,
    textDecorationLine: 'underline',
  },
  feedbackCard: { backgroundColor: '#242321', borderRadius: 22, marginTop: 24, padding: 18 },
  feedbackTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 10 },
  sparkIcon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  feedbackTitle: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  correction: {
    alignItems: 'center',
    borderBottomColor: 'rgba(241, 237, 227, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  correctionFrom: {
    color: 'rgba(241, 237, 227, 0.45)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
  },
  correctionTo: { color: Palette.cream, fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  metrics: { gap: 12, marginTop: 18 },
  metricLabel: {
    color: 'rgba(241, 237, 227, 0.55)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 11,
    marginBottom: 6,
  },
  metricBars: { flexDirection: 'row', gap: 4 },
  metricBar: { backgroundColor: 'rgba(241, 237, 227, 0.12)', borderRadius: 99, height: 7, flex: 1 },
  metricBarDone: { backgroundColor: Palette.orange },
  darkActions: { flexDirection: 'row', gap: 8, padding: 18 },
  againButton: {
    alignItems: 'center',
    borderColor: 'rgba(241, 237, 227, 0.2)',
    borderRadius: 18,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    height: 60,
    justifyContent: 'center',
  },
  againText: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 18 },
  nextButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    flex: 1,
    height: 60,
    justifyContent: 'center',
  },
});
