import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { getScenario, type SubtitleMode } from '@/features/listening/scenarios';
import { useProgressStore } from '@/features/progress/store';
import { useLessonSpeech } from '@/features/listening/use-lesson-speech';

export default function ListeningLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = useMemo(() => getScenario(id), [id]);
  const speech = useLessonSpeech(scenario.language);
  const isPlaying = speech.playing;
  const [isSlow, setIsSlow] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('target');
  const [selectedAnswer, setSelectedAnswer] = useState<number>();
  const [checked, setChecked] = useState(false);
  const completeScenario = useProgressStore((state) => state.completeScenario);

  const play = async () => {
    if (isPlaying) {
      speech.stop();
      return;
    }
    setChecked(false);
    await speech.playSequence(
      scenario.lines.map((line) => line.text),
      isSlow ? 0.68 : 0.94,
      setLineIndex,
    );
  };

  const cycleSubtitles = () => {
    setSubtitleMode((mode) =>
      mode === 'target' ? 'meaning' : mode === 'meaning' ? 'off' : 'target',
    );
  };

  const activeLine = scenario.lines[lineIndex];
  const isCorrect = selectedAnswer === scenario.question.correctIndex;
  const subtitleLabel =
    subtitleMode === 'target'
      ? scenario.languageName
      : subtitleMode === 'meaning'
        ? 'Meaning'
        : 'Off';

  const checkAnswer = () => {
    if (checked && isCorrect) {
      router.replace(`/listening?track=${scenario.track}` as Href);
      return;
    }
    setChecked(true);
    if (isCorrect) completeScenario(scenario.id);
  };

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <View style={styles.headerTitle}>
          <Eyebrow color={Palette.orange}>{scenario.level} · Real-life listening</Eyebrow>
          <Text numberOfLines={1} style={styles.title}>
            {scenario.title}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.player}>
        {speech.error ? (
          <Text accessibilityRole="alert" style={{ color: Palette.cream, padding: 12 }}>
            {speech.error}
          </Text>
        ) : null}
        <View style={styles.playerTop}>
          <Pressable
            accessibilityLabel={isPlaying ? 'Stop audio' : 'Play audio'}
            onPress={play}
            style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons
              color={Palette.ink}
              name={isPlaying ? 'stop' : 'play'}
              size={31}
            />
          </Pressable>
          <Waveform active={isPlaying} />
        </View>
        <View style={styles.controls}>
          <Pressable
            onPress={() => setIsSlow((value) => !value)}
            style={[styles.control, isSlow && styles.controlActive]}
          >
            <MaterialCommunityIcons
              color={isSlow ? Palette.ink : Palette.cream}
              name="speedometer-slow"
              size={17}
            />
            <Text style={[styles.controlText, isSlow && styles.controlTextActive]}>Slow</Text>
          </Pressable>
          <Pressable onPress={play} style={styles.control}>
            <MaterialCommunityIcons color={Palette.cream} name="replay" size={17} />
            <Text style={styles.controlText}>Replay</Text>
          </Pressable>
          <Pressable onPress={cycleSubtitles} style={styles.control}>
            <MaterialCommunityIcons color={Palette.cream} name="subtitles-outline" size={17} />
            <Text style={styles.controlText}>{subtitleLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.subtitleArea}>
          {subtitleMode === 'off' ? (
            <Text style={styles.subtitleOff}>Subtitles are off. Listen for the situation.</Text>
          ) : (
            <>
              <Text style={styles.speaker}>{activeLine.speaker}</Text>
              <Text style={styles.subtitle}>
                {subtitleMode === 'target' ? activeLine.text : activeLine.translation}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.lightPanel}>
        <Eyebrow>What natives compress</Eyebrow>
        <View style={styles.phraseList}>
          {scenario.phrases.slice(0, 3).map((phrase) => (
            <View key={phrase.heard} style={styles.phraseRow}>
              <View style={styles.heardPill}>
                <Text style={styles.heardText}>{phrase.heard}</Text>
              </View>
              <View style={styles.phraseCopy}>
                <Text style={styles.fullPhrase}>{phrase.full}</Text>
                <Text style={styles.meaning}>{phrase.meaning}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.questionBlock}>
          <Eyebrow>Quick check</Eyebrow>
          <Text style={styles.question}>{scenario.question.prompt}</Text>
          <View style={styles.answers}>
            {scenario.question.options.map((option, index) => {
              const selected = selectedAnswer === index;
              const showCorrect = checked && index === scenario.question.correctIndex;
              const showWrong = checked && selected && !showCorrect;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option}
                  onPress={() => {
                    setSelectedAnswer(index);
                    setChecked(false);
                  }}
                  style={[
                    styles.answer,
                    selected && styles.answerSelected,
                    showCorrect && styles.answerCorrect,
                    showWrong && styles.answerWrong,
                  ]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? (
                      <MaterialCommunityIcons color={Palette.cream} name="check" size={14} />
                    ) : null}
                  </View>
                  <Text style={styles.answerText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          {checked ? (
            <Text
              style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}
            >
              {isCorrect
                ? 'Exactly. You caught the key instruction.'
                : 'Not quite. Replay it slowly, then try once more.'}
            </Text>
          ) : null}
          <Pressable
            accessibilityLabel={checked && isCorrect ? 'Back to learning path' : 'Check answer'}
            disabled={selectedAnswer === undefined}
            onPress={checkAnswer}
            style={({ pressed }) => [
              styles.checkButton,
              selectedAnswer === undefined && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.checkText}>
              {checked && isCorrect ? 'More listening practice' : 'Check answer'}
            </Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

function Waveform({ active }: { active: boolean }) {
  const heights = [13, 25, 37, 21, 43, 30, 49, 35, 22, 39, 17, 28, 12];
  return (
    <View style={styles.waveform}>
      {heights.map((height, index) => (
        <View
          key={index}
          style={[styles.waveBar, { height }, active && index < 8 && styles.waveBarActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1 },
  headerSpacer: { width: 40 },
  title: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 20, marginTop: 3 },
  player: { paddingHorizontal: 18, paddingTop: 12 },
  playerTop: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  playButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    height: 66,
    justifyContent: 'center',
    width: 66,
  },
  waveform: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 4, height: 58 },
  waveBar: { backgroundColor: 'rgba(241, 237, 227, 0.2)', borderRadius: 99, flex: 1 },
  waveBarActive: { backgroundColor: Palette.cream },
  controls: { flexDirection: 'row', gap: 8, marginTop: 20 },
  control: {
    alignItems: 'center',
    backgroundColor: 'rgba(241, 237, 227, 0.1)',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  controlActive: { backgroundColor: Palette.orange },
  controlText: { color: Palette.cream, fontFamily: VokaFonts.bodySemiBold, fontSize: 11 },
  controlTextActive: { color: Palette.ink },
  subtitleArea: { justifyContent: 'center', minHeight: 150, paddingVertical: 22 },
  speaker: {
    color: Palette.orange,
    fontFamily: VokaFonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 28,
    lineHeight: 35,
    marginTop: 8,
  },
  subtitleOff: {
    color: 'rgba(241, 237, 227, 0.48)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 15,
    textAlign: 'center',
  },
  lightPanel: {
    backgroundColor: Palette.cream,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 22,
  },
  phraseList: { gap: 14, marginTop: 16 },
  phraseRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  heardPill: {
    backgroundColor: Palette.orange,
    borderRadius: 99,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  heardText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 11 },
  phraseCopy: { flex: 1 },
  fullPhrase: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 13 },
  meaning: {
    color: Palette.secondary,
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  questionBlock: { borderTopColor: Palette.line, borderTopWidth: 1, marginTop: 24, paddingTop: 22 },
  question: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 23,
    lineHeight: 28,
    marginTop: 8,
  },
  answers: { gap: 8, marginTop: 15 },
  answer: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  answerSelected: { borderColor: Palette.ink, borderWidth: 2 },
  answerCorrect: { backgroundColor: '#E4F4E7', borderColor: '#337A45' },
  answerWrong: { backgroundColor: '#FBE6E1', borderColor: Palette.orange },
  radio: {
    borderColor: 'rgba(19, 18, 17, 0.24)',
    borderRadius: 99,
    borderWidth: 1.5,
    height: 24,
    width: 24,
  },
  radioSelected: { alignItems: 'center', backgroundColor: Palette.ink, justifyContent: 'center' },
  answerText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 14 },
  feedback: { fontFamily: VokaFonts.bodySemiBold, fontSize: 12, lineHeight: 18, marginTop: 12 },
  feedbackCorrect: { color: '#337A45' },
  feedbackWrong: { color: '#B23818' },
  checkButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    marginTop: 14,
    padding: 17,
  },
  checkText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
