import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ActionBar,
  InfoCard,
  lessonText,
  PrimaryButton,
  SectionLabel,
  TextButton,
} from '@/components/lesson-ui';
import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { useSelectedLanguage } from '@/features/language/selection';
import { isWritingFeedbackConfigured, requestWritingFeedback } from '@/features/writing/feedback';
import {
  tasksForTrack,
  writingChecklist,
  writingTasks,
  type WritingFeedback,
  type WritingTaskId,
} from '@/features/writing/progress';
import { countWritingWords } from '@/features/writing/validation';

const ratingStyle = {
  strong: { bg: '#E3F2E5', ink: '#1F5A33' },
  developing: { bg: '#FFF4CC', ink: '#6B4E00' },
  'needs work': { bg: '#FFE9E1', ink: '#8E2D1B' },
} as const;

export function WritingActivity() {
  const router = useRouter();
  const [track] = useSelectedLanguage();
  const { task: taskParam } = useLocalSearchParams<{ task?: string }>();
  const ids = tasksForTrack(track);
  const taskId = (ids as string[]).includes(taskParam ?? '')
    ? (taskParam as WritingTaskId)
    : ids[0];
  const task = writingTasks[taskId];
  const exam = 'exam' in task ? task.exam : undefined;
  const draft = useCoachingStore((state) => state.writing[taskId]);
  const saveWriting = useCoachingStore((state) => state.saveWriting);
  const saveFeedback = useCoachingStore((state) => state.saveWritingFeedback);
  const recordWritingPractice = useCoachingStore((state) => state.recordWritingPractice);
  const answer = draft?.text ?? '';
  const submitted = Boolean(answer && draft?.submitted === answer);
  const feedback =
    draft?.feedback && draft.feedback.forText === draft.submitted ? draft.feedback : undefined;
  const [examMode, setExamMode] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const abort = useRef<AbortController | null>(null);
  const minimum = examMode && exam ? exam.minimum : task.minimum;
  const words = countWritingWords(answer);
  const language = track === 'DE' ? 'German' : 'English';

  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  useEffect(() => () => abort.current?.abort(), []);
  const remaining = deadline ? Math.max(0, deadline - now) : 0;
  const clock = `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`;

  const chooseTask = (id: WritingTaskId) => {
    abort.current?.abort();
    router.setParams({ task: id });
    setMessage('');
    setFeedbackError('');
    setExamMode(false);
    setDeadline(null);
  };
  const submit = () => {
    if (words < minimum || new Set(answer.toLowerCase().match(/[a-zäöüß]+/g) ?? []).size < 5) {
      setMessage(
        `Write at least ${minimum} words, using several different words, before you submit.`,
      );
      return;
    }
    Keyboard.dismiss();
    setMessage('');
    setDeadline(null);
    saveWriting(taskId, answer, answer);
    recordWritingPractice();
  };
  const getFeedback = async () => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setFeedbackError('');
    try {
      const result = await requestWritingFeedback(taskId, answer, controller.signal);
      saveFeedback(taskId, result);
    } catch (error) {
      if (!controller.signal.aborted)
        setFeedbackError(
          error instanceof Error ? error.message : 'Feedback is unavailable right now.',
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const footer = (
    <ActionBar>
      {!submitted ? (
        <PrimaryButton title="Submit my writing" disabled={!answer.trim()} onPress={submit} />
      ) : !feedback && isWritingFeedbackConfigured ? (
        <PrimaryButton
          title={loading ? 'Getting feedback…' : 'Get AI feedback'}
          icon="auto-fix"
          disabled={loading}
          onPress={() => void getFeedback()}
        />
      ) : (
        <PrimaryButton
          title="Try the next task"
          icon="arrow-right"
          onPress={() => chooseTask(ids[(ids.indexOf(taskId) + 1) % ids.length])}
        />
      )}
    </ActionBar>
  );

  return (
    <AppScreen showNav={false} keyboardAware footer={footer}>
      <View style={styles.header}>
        <HeaderBack />
        <Text style={styles.headerTitle}>{language} writing</Text>
        {deadline ? (
          <View
            accessibilityLabel={`Time left ${clock}`}
            style={[styles.clock, remaining === 0 && styles.clockDone]}
          >
            <MaterialCommunityIcons name="timer-outline" size={16} color={Palette.ink} />
            <Text style={styles.clockText}>{clock}</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <View style={styles.body}>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {ids.map((id) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: taskId === id }}
              onPress={() => chooseTask(id)}
              style={[styles.tab, taskId === id && styles.tabActive]}
            >
              <Text style={[styles.tabText, taskId === id && styles.tabTextActive]}>
                {writingTasks[id].label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text accessibilityRole="header" style={lessonText.title}>
          {task.title}
        </Text>
        <Text style={styles.prompt}>{task.prompt}</Text>
        {'promptHelp' in task ? (
          <>
            <TextButton
              title={showHelp ? 'Hide English' : 'Show in English'}
              onPress={() => setShowHelp(!showHelp)}
            />
            {showHelp ? <Text style={lessonText.small}>{task.promptHelp}</Text> : null}
          </>
        ) : null}
        <Text style={lessonText.small}>{task.target}</Text>

        {taskId === 'chart' ? <CoffeeChart /> : null}

        {exam && !submitted ? (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: examMode }}
            onPress={() => {
              const next = !examMode;
              setExamMode(next);
              setDeadline(next ? Date.now() + exam.minutes * 60_000 : null);
              setNow(Date.now());
            }}
            style={[styles.examToggle, examMode && styles.examToggleOn]}
          >
            <MaterialCommunityIcons
              name={examMode ? 'timer' : 'timer-outline'}
              size={22}
              color={Palette.ink}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.examTitle}>Timed exam mode</Text>
              <Text style={lessonText.small}>
                {exam.minutes} minutes · at least {exam.minimum} words, as in the real test
              </Text>
            </View>
            <View style={[styles.switch, examMode && styles.switchOn]}>
              <View style={[styles.knob, examMode && styles.knobOn]} />
            </View>
          </Pressable>
        ) : null}

        <TextInput
          accessibilityLabel="Writing response"
          multiline
          editable={!loading}
          onChangeText={(value) => {
            saveWriting(taskId, value);
            setMessage('');
          }}
          maxLength={8000}
          placeholder={`Write your answer in ${language}. Your draft saves automatically.`}
          placeholderTextColor={Palette.muted}
          style={styles.input}
          textAlignVertical="top"
          value={answer}
        />
        <View style={styles.counter}>
          <View style={styles.counterTrack}>
            <View
              style={[
                styles.counterFill,
                { width: `${Math.min(100, (words / minimum) * 100)}%` },
                words >= minimum && { backgroundColor: '#2F7A47' },
              ]}
            />
          </View>
          <Text style={styles.counterText}>
            {words} / {minimum} words
          </Text>
        </View>
        {message ? (
          <Text accessibilityLiveRegion="polite" style={styles.warning}>
            {message}
          </Text>
        ) : null}
        {remaining === 0 && deadline ? (
          <Text accessibilityLiveRegion="polite" style={styles.warning}>
            Time is up. Finish your sentence and submit.
          </Text>
        ) : null}

        {!submitted ? (
          <TextButton
            title="Answer by speaking instead"
            onPress={() => router.push(`/conversation?track=${track}` as Href)}
          />
        ) : null}
        {submitted ? (
          <>
            <Text accessibilityLiveRegion="polite" style={styles.saved}>
              Writing activity complete. {words} words submitted and saved. Editing your text starts
              a new revision.
            </Text>
            <SectionLabel>Quick checks</SectionLabel>
            <View style={styles.checklist}>
              {writingChecklist(answer, taskId, examMode).map((tip) => (
                <View key={tip} style={styles.checkRow}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={18}
                    color={Palette.secondary}
                  />
                  <Text style={[lessonText.small, { flex: 1 }]}>{tip}</Text>
                </View>
              ))}
            </View>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={Palette.ink} />
                <Text style={lessonText.small}>Reading your text carefully…</Text>
              </View>
            ) : null}
            {feedbackError ? (
              <Text accessibilityRole="alert" style={styles.warning}>
                {feedbackError}
              </Text>
            ) : null}
            {feedback ? <FeedbackView feedback={feedback} /> : null}
            {!isWritingFeedbackConfigured ? (
              <Text style={lessonText.small}>AI feedback is not available in this build.</Text>
            ) : null}
            <Model example={task.example} />
            <TextButton
              title="View my progress"
              onPress={() => router.replace('/progress' as Href)}
            />
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

function FeedbackView({ feedback }: { feedback: WritingFeedback }) {
  const [showImproved, setShowImproved] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <SectionLabel>AI feedback</SectionLabel>
      <InfoCard icon="auto-fix" title="Overall" tone="ink">
        {feedback.summary}
      </InfoCard>
      {feedback.criteria.map((criterion) => (
        <View key={criterion.name} style={styles.criterion}>
          <View style={styles.criterionTop}>
            <Text style={styles.criterionName}>{criterion.name}</Text>
            <Text
              style={[
                styles.pill,
                {
                  backgroundColor: ratingStyle[criterion.rating].bg,
                  color: ratingStyle[criterion.rating].ink,
                },
              ]}
            >
              {criterion.rating}
            </Text>
          </View>
          <Text style={lessonText.small}>{criterion.comment}</Text>
        </View>
      ))}
      {feedback.corrections.length ? (
        <View style={styles.criterion}>
          <Text style={styles.criterionName}>Corrections</Text>
          {feedback.corrections.map((item) => (
            <View key={item.original} style={styles.correction}>
              <Text style={styles.original}>{item.original}</Text>
              <Text style={styles.corrected}>{item.corrected}</Text>
              <Text style={lessonText.small}>{item.why}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.criterion}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showImproved }}
          onPress={() => setShowImproved(!showImproved)}
          style={styles.criterionTop}
        >
          <Text style={styles.criterionName}>Improved version</Text>
          <MaterialCommunityIcons
            name={showImproved ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={Palette.ink}
          />
        </Pressable>
        {showImproved ? (
          <Text selectable style={styles.improved}>
            {feedback.improvedVersion}
          </Text>
        ) : (
          <Text style={lessonText.small}>
            Your ideas, rewritten slightly above your level. Compare before you revise.
          </Text>
        )}
      </View>
      <InfoCard icon="flag-checkered" title="Next step" tone="yellow">
        {feedback.nextStep}
      </InfoCard>
      <Text style={lessonText.small}>
        AI feedback can be wrong. It describes this text; it is not a band score, CEFR level or exam
        result.
      </Text>
    </View>
  );
}

function Model({ example }: { example: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.criterion}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={styles.criterionTop}
      >
        <Text style={styles.criterionName}>Compare with a short example</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={Palette.ink}
        />
      </Pressable>
      {open ? (
        <>
          <Text selectable style={styles.improved}>
            {example}
          </Text>
          <Text style={lessonText.small}>One possible response, not the only correct answer.</Text>
        </>
      ) : null}
    </View>
  );
}

function CoffeeChart() {
  const bars = [33, 49, 43, 63, 76, 34, 27];
  return (
    <View
      accessibilityLabel="Bar chart of coffee sold each day: Monday 33, Tuesday 49, Wednesday 43, Thursday 63, Friday 76, Saturday 34, Sunday 27"
      style={styles.chartCard}
    >
      <Text style={lessonText.small}>Coffee sold each day (cups)</Text>
      <View style={styles.chart}>
        {bars.map((value, index) => (
          <View key={index} style={styles.barColumn}>
            <Text style={styles.barLabel}>{value}</Text>
            <View style={[styles.bar, { height: value * 1.3 }, value === 76 && styles.barPeak]} />
            <Text style={styles.barLabel}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.wordChips}>
        {['rose', 'peaked at', 'fell sharply', 'about half', 'overall'].map((word) => (
          <Text key={word} style={styles.wordChip}>
            {word}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: { color: Palette.ink, flex: 1, fontFamily: VokaFonts.bodyBold, fontSize: 16 },
  clock: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clockDone: { backgroundColor: '#FFE9E1' },
  clockText: { color: Palette.ink, fontFamily: VokaFonts.monoMedium, fontSize: 14 },
  body: { gap: 14, paddingBottom: 32, paddingHorizontal: 20 },
  tabs: {
    backgroundColor: Palette.soft,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  tab: { alignItems: 'center', borderRadius: 12, flex: 1, justifyContent: 'center', minHeight: 44 },
  tabActive: { backgroundColor: Palette.ink },
  tabText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 14 },
  tabTextActive: { color: Palette.cream },
  prompt: { color: Palette.ink, fontFamily: VokaFonts.bodyMedium, fontSize: 17, lineHeight: 26 },
  examToggle: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  examToggleOn: { borderColor: Palette.yellow },
  examTitle: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  switch: {
    backgroundColor: 'rgba(19,18,17,.2)',
    borderRadius: 99,
    height: 28,
    padding: 3,
    width: 48,
  },
  switchOn: { backgroundColor: '#2F7A47' },
  knob: { backgroundColor: Palette.white, borderRadius: 99, height: 22, width: 22 },
  knobOn: { transform: [{ translateX: 20 }] },
  input: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 18,
    borderWidth: 2,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    maxHeight: 360,
    minHeight: 180,
    padding: 16,
  },
  counter: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  counterTrack: {
    backgroundColor: 'rgba(19,18,17,.1)',
    borderRadius: 99,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  counterFill: { backgroundColor: Palette.yellow, height: '100%' },
  counterText: { color: Palette.secondary, fontFamily: VokaFonts.monoMedium, fontSize: 12 },
  warning: {
    backgroundColor: '#FFE9E1',
    borderRadius: 14,
    color: '#8E2D1B',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    padding: 12,
  },
  saved: {
    backgroundColor: '#E3F2E5',
    borderRadius: 14,
    color: '#1F5A33',
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 21,
    padding: 12,
  },
  checklist: { backgroundColor: Palette.white, borderRadius: 18, gap: 10, padding: 14 },
  checkRow: { flexDirection: 'row', gap: 8 },
  loading: { alignItems: 'center', flexDirection: 'row', gap: 10, padding: 12 },
  criterion: { backgroundColor: Palette.white, borderRadius: 18, gap: 8, padding: 14 },
  criterionTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  criterionName: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  pill: {
    borderRadius: 99,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: 'capitalize',
  },
  correction: { borderTopColor: Palette.line, borderTopWidth: 1, gap: 4, paddingTop: 10 },
  original: {
    color: '#8E2D1B',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  corrected: { color: '#1F5A33', fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  improved: { color: Palette.ink, fontFamily: VokaFonts.body, fontSize: 15, lineHeight: 24 },
  chartCard: { backgroundColor: Palette.white, borderRadius: 20, gap: 12, padding: 16 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 6, height: 130 },
  barColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  bar: { backgroundColor: '#D9D6CF', borderRadius: 6, marginVertical: 4, width: '100%' },
  barPeak: { backgroundColor: Palette.orange },
  barLabel: { color: Palette.muted, fontFamily: VokaFonts.monoMedium, fontSize: 10 },
  wordChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wordChip: {
    backgroundColor: Palette.soft,
    borderRadius: 99,
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
