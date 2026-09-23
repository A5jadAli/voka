import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';
import { countWritingWords } from '@/features/writing/validation';
import { writingChecklist, writingTasks, type WritingTaskId } from '@/features/writing/progress';

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

function WritingActivity() {
  const router = useRouter();
  const { task: taskParam } = useLocalSearchParams<{ task?: string }>();
  const taskId: WritingTaskId =
    taskParam === 'letter' || taskParam === 'opinion' ? taskParam : 'chart';
  const task = writingTasks[taskId];
  const draft = useCoachingStore((state) => state.writing[taskId]);
  const saveWriting = useCoachingStore((state) => state.saveWriting);
  const [started, setStarted] = useState(false);
  const answer = draft?.text ?? '';
  const writing = started || Boolean(answer);
  const completed = Boolean(answer && draft?.submitted === answer);
  const [validationMessage, setValidationMessage] = useState('');
  const recordWritingPractice = useCoachingStore((state) => state.recordWritingPractice);
  const wordCount = countWritingWords(answer);
  const bars = [33, 49, 43, 63, 76, 34, 27];
  const footer = (
    <View style={styles.bottomActionRow}>
      <Pressable
        accessibilityLabel="Answer by speaking instead"
        accessibilityRole="button"
        onPress={() => router.push('/conversation?track=EN')}
        style={styles.smallAction}
      >
        <MaterialCommunityIcons color={Palette.ink} name="microphone" size={23} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          completed
            ? 'View writing progress'
            : writing
              ? 'Finish writing activity'
              : 'Start writing'
        }
        onPress={() => {
          if (completed) {
            router.replace('/progress');
            return;
          }
          if (!writing) {
            setStarted(true);
            return;
          }
          if (
            wordCount < task.minimum ||
            new Set(answer.toLowerCase().match(/[a-z]+/g) ?? []).size < 5
          ) {
            setValidationMessage(
              `Use at least ${task.minimum} words and several different words to answer the prompt.`,
            );
            return;
          }
          Keyboard.dismiss();
          setValidationMessage('');
          saveWriting(taskId, answer, answer);
          recordWritingPractice();
        }}
        style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
      >
        <Text style={styles.primaryActionText}>
          {completed ? 'View progress' : writing ? 'Finish writing' : 'Start writing'}
        </Text>
        <MaterialCommunityIcons color={Palette.ink} name="chevron-right" size={22} />
      </Pressable>
    </View>
  );
  return (
    <AppScreen footer={footer} showNav={false} keyboardAware>
      <ActivityHeader progress={completed ? 3 : writing ? 2 : 1} />
      <View style={styles.activityBody}>
        <Eyebrow color={Palette.orange}>Writing practice</Eyebrow>
        <Text style={styles.prompt}>{task.title}</Text>
        <Text style={[styles.audioTranscript, styles.writingCopy]}>{task.prompt}</Text>
        <Text style={styles.wordCount}>{task.target}</Text>
        <View style={styles.wordChips}>
          {(Object.keys(writingTasks) as WritingTaskId[]).map((id) => (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: taskId === id }}
              onPress={() => {
                router.setParams({ task: id });
                setValidationMessage('');
                setStarted(false);
              }}
            >
              <Text style={styles.wordChip}>
                {id === 'chart' ? 'Chart' : id === 'letter' ? 'Letter' : 'Opinion'}
              </Text>
            </Pressable>
          ))}
        </View>
        {taskId === 'chart' ? (
          <View style={styles.chartCard}>
            <Text style={styles.chartCaption}>Coffee sold each day</Text>
            <View style={styles.chart}>
              {bars.map((height, index) => (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barLabel}>{height}</Text>
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
        ) : null}
        {taskId === 'chart' ? (
          <>
            <Eyebrow>Use these words</Eyebrow>
            <View style={styles.wordChips}>
              {['rose', 'the highest', 'fell sharply', 'about half'].map((word) => (
                <Text key={word} style={styles.wordChip}>
                  {word}
                </Text>
              ))}
            </View>
          </>
        ) : null}
        {writing ? (
          <TextInput
            accessibilityLabel="Writing response"
            multiline
            onChangeText={(value) => {
              saveWriting(taskId, value);
              setValidationMessage('');
            }}
            maxLength={8000}
            placeholder="Write your response here. Your draft is saved automatically."
            placeholderTextColor={Palette.muted}
            style={styles.writingInput}
            textAlignVertical="top"
            value={answer}
          />
        ) : null}
        {writing && !completed ? (
          <Text style={styles.wordCount}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {task.minimum} minimum · Draft saved
            on this device
          </Text>
        ) : null}
        {completed || validationMessage ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.savedText, validationMessage && styles.validationText]}
          >
            {validationMessage ||
              `Writing activity complete. ${wordCount} words written. Your response and completion are saved. Review the prompts below, then revise your response if needed.`}
          </Text>
        ) : null}
        {completed ? (
          <View style={{ gap: 12, marginTop: 18 }}>
            <Eyebrow>Review and revise</Eyebrow>
            {writingChecklist(answer, taskId).map((tip) => (
              <Text key={tip} style={[styles.audioTranscript, styles.writingCopy]}>
                {tip}
              </Text>
            ))}
            <Eyebrow>Compare with a short example</Eyebrow>
            <Text style={[styles.audioTranscript, styles.writingCopy]}>{task.example}</Text>
            <Text style={styles.wordCount}>
              This is one possible response, not the only correct answer. Editing your text opens a
              new revision. Your last submitted version stays saved until you finish again.
            </Text>
          </View>
        ) : null}
      </View>
    </AppScreen>
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
            accessibilityLabel="Play listening sample"
            accessibilityRole="button"
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
          <Eyebrow>Question 1 of 1</Eyebrow>
          <Text style={styles.question}>Where will they meet?</Text>
          <View style={styles.answers}>
            {['At the library', 'Outside the station', 'In the café'].map((answer, index) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected === index }}
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
});
