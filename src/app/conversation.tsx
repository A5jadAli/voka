import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { haptic } from '@/features/feedback/haptics';
import { ReportContent } from '@/components/report-content';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useAssessmentStore } from '@/features/assessment/store';
import { useCoachingStore } from '@/features/coaching/store';
import {
  createAssessmentRequest,
  isConversationBackendConfigured,
} from '@/features/conversation/backend';
import {
  detectStruggleSignals,
  parseRealtimeEvent,
  type RealtimeEvent,
  type StruggleSignal,
  type TranscriptTurn,
  upsertTranscriptTurn,
} from '@/features/conversation/events';
import { getConversationMode } from '@/features/conversation/modes';
import { startRealtimeSession } from '@/features/conversation/realtime-session';
import { prepareMicrophoneAccess } from '@/features/conversation/microphone-access';
import type {
  RealtimeSessionHandle,
  RealtimeSessionStatus,
} from '@/features/conversation/realtime-types';
import { useSelectedLanguage } from '@/features/language/selection';
import { getCurriculumUnit } from '@/features/curriculum/catalog';
import { formatClock, useMockNotes } from '@/features/speaking-mock/store';
import {
  getSpeakingCard,
  type SpeakingCard,
} from '../../supabase/functions/_shared/speaking-cards';

const JOINING_SILENT_MS = 8000;
const JOINING_MAX_MS = 25000;

const statusCopy: Record<RealtimeSessionStatus | 'idle', string> = {
  connecting: 'Connecting to your coach…',
  ended: 'Conversation ended',
  error: 'Connection needs attention',
  idle: 'Ready when you are',
  joining: 'Your coach is saying hello…',
  listening: 'Your turn. Speak anytime',
  speaking: 'Coach is speaking. You can interrupt',
  thinking: 'Thinking…',
};

const statusHint: Partial<Record<RealtimeSessionStatus | 'idle', string>> = {
  idle: 'Tap start. Your AI coach says hello first, then it’s your turn.',
  connecting: 'This takes a few seconds. Your coach will speak first.',
  joining: 'Listen first. Your microphone opens when your coach finishes.',
};

export default function ConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    diagnostic?: string;
    practice?: string;
    track?: string;
    unit?: string;
    card?: string;
  }>();
  const diagnostic = params.practice === 'diagnostic' || params.diagnostic === '1';
  const [track, setTrack] = useSelectedLanguage();
  const [status, setStatus] = useState<RealtimeSessionStatus | 'idle'>('idle');
  const [captions, setCaptions] = useState(true);
  const [muted, setMuted] = useState(false);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [signals, setSignals] = useState<StruggleSignal[]>([]);
  const [error, setError] = useState('');
  const [microphoneHint, setMicrophoneHint] = useState('');
  const [permissionPending, setPermissionPending] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const permissionPendingRef = useRef(false);
  const focusedRef = useRef(false);
  const [assessmentPending, setAssessmentPending] = useState(false);
  const sessionRef = useRef<RealtimeSessionHandle | undefined>(undefined);
  const startAbortRef = useRef<AbortController | undefined>(undefined);
  const userTurnIdsRef = useRef(new Set<string>());
  // The coach opens every call. The microphone stays closed until that greeting ends, so room
  // noise cannot cut it off and "your turn" is only shown when it is true.
  const greetingDoneRef = useRef(false);
  const coachAudioRef = useRef(false);
  const mutedRef = useRef(false);
  const finishGreeting = useCallback(() => {
    if (greetingDoneRef.current) return;
    greetingDoneRef.current = true;
    sessionRef.current?.setMuted(mutedRef.current);
    haptic.select();
  }, []);
  // If the greeting never plays (dropped response, muted output) or never reports its end,
  // don't leave the learner waiting on "saying hello": hand the turn over.
  useEffect(() => {
    if (status !== 'joining') return;
    const handOver = () => {
      finishGreeting();
      setStatus((current) => (current === 'joining' ? 'listening' : current));
    };
    const silent = setTimeout(() => {
      if (!coachAudioRef.current) handOver();
    }, JOINING_SILENT_MS);
    const cap = setTimeout(handOver, JOINING_MAX_MS);
    return () => {
      clearTimeout(silent);
      clearTimeout(cap);
    };
  }, [finishGreeting, status]);
  const generationRef = useRef(0);
  const assessmentAbortRef = useRef<AbortController | undefined>(undefined);
  const completeUnit = useCoachingStore((state) => state.completeUnit);
  const coachTonePreference = useCoachingStore((state) => state.coachTone);
  const goal = useCoachingStore((state) => state.preferences[track].goal);
  const practiceDates = useCoachingStore((state) => state.speakingPracticeDates);
  const recordSpeakingPractice = useCoachingStore((state) => state.recordSpeakingPractice);
  const recordSignal = useCoachingStore((state) => state.recordSignal);
  const mergeAssessment = useAssessmentStore((state) => state.mergeAssessment);
  const storedSignals = useCoachingStore((state) => state.signals);
  const useAdaptiveToughCoach =
    coachTonePreference === 'adaptive' &&
    practiceDates.length >= 3 &&
    storedSignals.some((signal) => signal.track === track && signal.count >= 3);
  const activeCoachTone =
    coachTonePreference === 'tough' || useAdaptiveToughCoach ? 'tough' : 'supportive';
  const requestedUnit = getCurriculumUnit(params.unit);
  const unit = requestedUnit?.track === track ? requestedUnit : undefined;
  const requestedCard = getSpeakingCard(params.card);
  const examCard = requestedCard?.track === track ? requestedCard : undefined;
  const baseMode = getConversationMode(track);
  const mode = unit
    ? {
        ...baseMode,
        description: unit.outcome,
        level: unit.level,
        starter: unit.coachBrief,
        title: unit.title,
      }
    : diagnostic
      ? {
          ...baseMode,
          description:
            'Read the sentence naturally, then answer a few short questions. Vokeno adapts to what it hears without inventing a pronunciation score.',
          level: 'Adaptive',
          starter:
            track === 'EN'
              ? 'Run a brief spoken English check. First ask the learner to read: “The bus to the city leaves every twenty minutes.” Then ask two progressively harder everyday questions. Give a broad CEFR range only when there is enough evidence, and explain that it is an estimate rather than a certified result.'
              : 'Run a brief spoken German check. First ask the learner to read: “Der Bus in die Stadt fährt alle zwanzig Minuten.” Then ask two progressively harder everyday questions. Give a broad CEFR range only when there is enough evidence, and explain that it is an estimate rather than a certified result.',
          title: 'Spoken level check',
        }
      : baseMode;
  const active = !['ended', 'error', 'idle'].includes(status);

  const releaseSession = useCallback(() => {
    generationRef.current += 1;
    const starting = startAbortRef.current;
    const session = sessionRef.current;
    startAbortRef.current = undefined;
    sessionRef.current = undefined;
    starting?.abort();
    session?.stop();
    mutedRef.current = false;
    setMuted(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      setPermissionPending(permissionPendingRef.current);
      const leave = () => {
        releaseSession();
        assessmentAbortRef.current?.abort();
        assessmentAbortRef.current = undefined;
        setAssessmentPending(false);
        setStatus((current) => (current === 'idle' ? current : 'ended'));
      };
      const subscription = AppState.addEventListener('change', (next) => {
        if (next !== 'active') leave();
      });
      return () => {
        focusedRef.current = false;
        subscription.remove();
        leave();
      };
    }, [releaseSession]),
  );

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      const parsed = parseRealtimeEvent(event);
      if (!parsed) return;

      if (parsed.kind === 'error') {
        releaseSession();
        setError(parsed.message);
        setStatus('error');
        return;
      }
      if (parsed.kind === 'coach-audio-start' || parsed.kind === 'speaking') {
        coachAudioRef.current = true;
        // The greeting keeps its own "saying hello" state; later replies can be interrupted.
        if (greetingDoneRef.current) setStatus('speaking');
      }
      if (parsed.kind === 'coach-audio-stop') {
        coachAudioRef.current = false;
        finishGreeting();
        setStatus('listening');
      }
      // Replies without audio (including a greeting that produced none) still hand the turn
      // back once generation finishes.
      if (parsed.kind === 'response-done' && !coachAudioRef.current) {
        finishGreeting();
        setStatus('listening');
      }
      if (parsed.kind === 'listening' && greetingDoneRef.current) setStatus('listening');
      if (parsed.kind === 'waiting' && greetingDoneRef.current) setStatus('thinking');
      if (parsed.kind === 'assistant-delta' || parsed.kind === 'assistant-final') {
        setTurns((current) =>
          upsertTranscriptTurn(current, {
            final: parsed.kind === 'assistant-final',
            id: parsed.id,
            role: 'assistant',
            text: parsed.text,
          }),
        );
      }
      if (parsed.kind === 'user-delta' || parsed.kind === 'user-final') {
        setTurns((current) =>
          upsertTranscriptTurn(current, {
            final: parsed.kind === 'user-final',
            id: parsed.id,
            role: 'user',
            text: parsed.text,
          }),
        );
        if (parsed.kind === 'user-final') {
          if (userTurnIdsRef.current.has(parsed.id) || !parsed.text.trim()) return;
          userTurnIdsRef.current.add(parsed.id);
          const detected = detectStruggleSignals(parsed.text);
          if (detected.length) {
            setSignals((current) => [...detected, ...current].slice(0, 3));
            detected.forEach((signal) =>
              recordSignal({
                ...signal,
                focus: unit?.pronunciationFocus ?? 'Spontaneous speech',
                track,
              }),
            );
          }
        }
      }
    },
    [finishGreeting, recordSignal, releaseSession, track, unit?.pronunciationFocus],
  );

  const start = async () => {
    if (startAbortRef.current || sessionRef.current || permissionPendingRef.current) return;
    if (!isConversationBackendConfigured) {
      setError(
        'Live voice is temporarily unavailable because the secure voice service is not connected.',
      );
      setStatus('error');
      return;
    }

    const permissionGeneration = generationRef.current;
    permissionPendingRef.current = true;
    setPermissionPending(true);
    setPermissionBlocked(false);
    setMicrophoneHint('');
    setError('');
    try {
      const access = await prepareMicrophoneAccess();
      if (!focusedRef.current) return;
      if (access !== 'ready') {
        // Never open a microphone as a delayed side effect of dismissing the
        // Android permission dialog or returning from another application.
        setStatus(access === 'enabled' ? 'idle' : 'error');
        if (access === 'enabled') {
          setMicrophoneHint('Microphone enabled. Tap Start conversation when you are ready.');
        } else {
          setPermissionBlocked(access === 'blocked');
          setError(
            access === 'blocked'
              ? 'Microphone access is off. Enable it in your phone settings to use live voice. Text lessons still work without it.'
              : 'Microphone access was not allowed. Tap Try again to allow it, or continue with text lessons.',
          );
        }
        return;
      }
    } catch {
      if (focusedRef.current) {
        setError('Could not check microphone access. Please try again.');
        setStatus('error');
      }
      return;
    } finally {
      permissionPendingRef.current = false;
      if (focusedRef.current) setPermissionPending(false);
    }
    if (
      !focusedRef.current ||
      AppState.currentState !== 'active' ||
      permissionGeneration !== generationRef.current
    )
      return;

    setError('');
    setSignals([]);
    setTurns([]);
    userTurnIdsRef.current.clear();
    const generation = ++generationRef.current;
    const startAbort = new AbortController();
    startAbortRef.current = startAbort;
    greetingDoneRef.current = false;
    coachAudioRef.current = false;
    try {
      const session = await startRealtimeSession({
        coachTone: activeCoachTone,
        goal,
        onEvent: (event) => {
          if (generationRef.current === generation) handleEvent(event);
        },
        onStatus: (next) => {
          if (generationRef.current !== generation) return;
          if (next === 'error') {
            releaseSession();
            setError('The voice connection was interrupted. Please try again.');
          }
          if (next === 'ended' && sessionRef.current) {
            releaseSession();
            if (userTurnIdsRef.current.size >= 2) {
              recordSpeakingPractice();
              if (unit) completeUnit(unit.id);
            }
          }
          // Connected is not the learner's turn yet: the coach is about to greet them.
          setStatus(next === 'listening' && !greetingDoneRef.current ? 'joining' : next);
        },
        practice: diagnostic ? 'diagnostic' : 'conversation',
        signal: startAbort.signal,
        starter: mode.starter,
        startMuted: true,
        track,
        unitId: unit?.id,
        cardId: examCard?.id,
      });
      if (startAbort.signal.aborted || generationRef.current !== generation) {
        session.stop();
        return;
      }
      sessionRef.current = session;
      session.setMuted(!greetingDoneRef.current || mutedRef.current);
    } catch (reason) {
      if (startAbort.signal.aborted || generationRef.current !== generation) return;
      releaseSession();
      setError(reason instanceof Error ? reason.message : 'The live coach could not connect.');
      setStatus('error');
    } finally {
      if (startAbortRef.current === startAbort) startAbortRef.current = undefined;
    }
  };

  const calculateAssessment = async () => {
    if (assessmentAbortRef.current) return;
    const controller = new AbortController();
    assessmentAbortRef.current = controller;
    setAssessmentPending(true);
    setError('');
    try {
      const assessment = await createAssessmentRequest(
        track,
        turns,
        activeCoachTone,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      mergeAssessment(assessment);
      router.replace(`/assessment-result?track=${track}` as Href);
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(
        reason instanceof Error ? reason.message : 'The assessment could not be calculated.',
      );
    } finally {
      if (assessmentAbortRef.current === controller) {
        assessmentAbortRef.current = undefined;
        setAssessmentPending(false);
      }
    }
  };

  const stop = async () => {
    releaseSession();
    setStatus('ended');
    if (unit && userTurnIdsRef.current.size >= 2) completeUnit(unit.id);
    if (userTurnIdsRef.current.size >= 2) recordSpeakingPractice();
    if (diagnostic) await calculateAssessment();
  };

  const toggleMute = () => {
    const next = !muted;
    mutedRef.current = next;
    sessionRef.current?.setMuted(next || !greetingDoneRef.current);
    setMuted(next);
  };

  return (
    <AppScreen activeNav="speak" backgroundColor={Palette.ink} dark>
      <View style={styles.header}>
        <HeaderBack dark />
        <Text style={styles.logo}>VOKENO LIVE</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>BETA</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Eyebrow color={mode.accent}>
          {examCard ? 'Exam mock' : 'Natural conversation'} · {mode.level}
        </Eyebrow>
        <Text style={styles.title}>{mode.title}</Text>
        <Text style={styles.description}>{mode.description}</Text>
        <Text style={styles.description}>
          Sessions last up to five minutes. You can stop at any time; your microphone also stops
          when you leave this screen or background the app.
        </Text>

        {!diagnostic && !unit ? (
          <View accessibilityLabel="Conversation language" style={styles.trackRow}>
            {(['EN', 'DE'] as const).map((item) => (
              <Pressable
                accessibilityLabel={item === 'EN' ? 'English conversation' : 'German conversation'}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: active || permissionPending,
                  selected: track === item,
                }}
                disabled={active || permissionPending}
                key={item}
                onPress={() => {
                  setTrack(item);
                  setError('');
                  setStatus('idle');
                }}
                style={[styles.trackButton, track === item && { backgroundColor: mode.accent }]}
              >
                <Text style={[styles.trackLabel, track === item && styles.trackLabelSelected]}>
                  {item === 'EN' ? 'English' : 'Deutsch'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {examCard ? <ExamCardPanel card={examCard} active={active} /> : null}
        {unit && !examCard ? (
          <View style={styles.practiceCard}>
            <View style={styles.practiceHeading}>
              <MaterialCommunityIcons color={mode.accent} name="waveform" size={18} />
              <Text style={styles.practiceFocus}>{unit.pronunciationFocus}</Text>
            </View>
            <View style={styles.phraseRow}>
              {unit.phrases.map((phrase) => (
                <Text key={phrase.phrase} style={styles.phraseChip}>
                  {phrase.phrase}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View style={[styles.stage, { borderColor: `${mode.accent}55` }]}>
          <PulseOrb
            color={mode.accent}
            pulsing={['connecting', 'joining', 'speaking'].includes(status) || permissionPending}
          >
            {['connecting', 'joining'].includes(status) || permissionPending ? (
              <ActivityIndicator color={Palette.ink} size="large" />
            ) : (
              <MaterialCommunityIcons
                color={Palette.ink}
                name={status === 'listening' ? 'microphone' : 'account-voice'}
                size={42}
              />
            )}
          </PulseOrb>
          <Text accessibilityLiveRegion="polite" style={styles.status}>
            {permissionPending ? 'Getting your microphone ready…' : statusCopy[status]}
          </Text>
          <Text style={styles.statusHint}>
            {microphoneHint ||
              statusHint[status] ||
              (active
                ? 'Speak normally. Pauses, corrections and interruptions are welcome.'
                : 'A short, adaptive conversation with live help when you get stuck.')}
          </Text>
          {active ? (
            <Text style={styles.audioRouteHint}>
              Replies use your phone’s current audio output, including Bluetooth.
            </Text>
          ) : null}

          {active ? (
            <View style={styles.controls}>
              <Pressable
                accessibilityLabel={muted ? 'Unmute microphone' : 'Mute microphone'}
                accessibilityRole="button"
                onPress={toggleMute}
                style={styles.controlButton}
              >
                <MaterialCommunityIcons
                  color={Palette.cream}
                  name={muted ? 'microphone-off' : 'microphone'}
                  size={23}
                />
              </Pressable>
              <Pressable
                accessibilityLabel="End conversation"
                accessibilityRole="button"
                disabled={assessmentPending}
                onPress={() => void stop()}
                style={[
                  styles.controlButton,
                  styles.endButton,
                  assessmentPending && styles.disabled,
                ]}
              >
                <MaterialCommunityIcons color={Palette.white} name="phone-hangup" size={23} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityLabel="Start live conversation"
              accessibilityRole="button"
              accessibilityState={{ disabled: assessmentPending || permissionPending }}
              disabled={assessmentPending || permissionPending}
              onPress={start}
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: mode.accent },
                (assessmentPending || permissionPending) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons color={Palette.ink} name="microphone" size={22} />
              <Text style={styles.startText}>
                {permissionPending
                  ? 'Checking microphone…'
                  : assessmentPending
                    ? 'Calculating result…'
                    : status === 'error'
                      ? 'Try again'
                      : status === 'ended'
                        ? 'Start a new conversation'
                        : 'Start conversation'}
              </Text>
            </Pressable>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {permissionBlocked ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void Linking.openSettings().catch(() =>
                  setError('Open your phone settings, then Vokeno, Permissions and Microphone.'),
                )
              }
              style={{ padding: 16 }}
            >
              <Text
                style={{
                  color: Palette.cream,
                  fontFamily: VokaFonts.bodySemiBold,
                  textDecorationLine: 'underline',
                }}
              >
                Open microphone settings
              </Text>
            </Pressable>
          ) : null}
          {diagnostic && status === 'ended' && turns.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              disabled={assessmentPending}
              onPress={() => void calculateAssessment()}
              style={{ padding: 16 }}
            >
              <Text style={{ color: Palette.cream, textDecorationLine: 'underline' }}>
                {error
                  ? 'Retry assessment with this conversation'
                  : 'Calculate an estimate from this conversation'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {turns.some((turn) => turn.role === 'assistant') ? (
          <View style={styles.reportRow}>
            <Text style={styles.aiNote}>Replies are generated by AI and can be wrong.</Text>
            <ReportContent
              dark
              surface="conversation"
              track={track}
              excerpt={turns
                .filter((turn) => turn.role === 'assistant')
                .slice(-2)
                .map((turn) => turn.text)
                .join('\n')}
            />
          </View>
        ) : null}

        <View style={styles.captionHeader}>
          <View>
            <Eyebrow color={Palette.cream}>Live captions</Eyebrow>
            <Text style={styles.captionHint}>Follow along without losing the conversation.</Text>
          </View>
          <Switch
            accessibilityLabel="Show live captions"
            onValueChange={setCaptions}
            trackColor={{ false: '#47443F', true: mode.accent }}
            value={captions}
          />
        </View>

        {captions ? (
          <View style={styles.transcript}>
            {turns.length ? (
              turns.slice(-6).map((turn) => (
                <View
                  key={`${turn.role}-${turn.id}`}
                  style={[styles.turn, turn.role === 'user' && styles.userTurn]}
                >
                  <Text style={styles.turnRole}>{turn.role === 'user' ? 'YOU' : 'VOKENO'}</Text>
                  <Text style={styles.turnText}>{turn.text}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyTranscript}>
                Your conversation will appear here. Captions are generated live and may contain
                mistakes.
              </Text>
            )}
          </View>
        ) : null}

        <View style={styles.coachCard}>
          <View style={styles.coachHeading}>
            <MaterialCommunityIcons color={mode.accent} name="creation" size={20} />
            <Text style={styles.coachTitle}>Vokeno notices the struggle, not just the mistake</Text>
          </View>
          {signals.length ? (
            signals.map((signal, index) => (
              <View key={`${signal.label}-${index}`} style={styles.signal}>
                <Text style={[styles.signalLabel, { color: mode.accent }]}>{signal.label}</Text>
                <Text style={styles.signalReason}>{signal.reason}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.coachCopy}>
              Hesitations, repeated words and requests for help can become gentle in-conversation
              coaching. Vokeno never invents a pronunciation score.
            </Text>
          )}
        </View>
        <Text style={styles.privacy}>Microphone audio is processed for this live session.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  logo: { color: Palette.cream, fontFamily: VokaFonts.displayExtraBold, fontSize: 16 },
  livePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(241,237,227,0.1)',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: { backgroundColor: '#55DB8A', borderRadius: 99, height: 7, width: 7 },
  liveText: { color: Palette.cream, fontFamily: VokaFonts.monoMedium, fontSize: 8 },
  body: { paddingBottom: 34, paddingHorizontal: 20, paddingTop: 15 },
  title: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 35,
    letterSpacing: -1,
    lineHeight: 39,
    marginTop: 8,
  },
  description: {
    color: 'rgba(241,237,227,0.67)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
  },
  trackRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  trackButton: {
    backgroundColor: 'rgba(241,237,227,0.1)',
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  trackLabel: { color: Palette.cream, fontFamily: VokaFonts.bodySemiBold, fontSize: 11 },
  trackLabelSelected: { color: Palette.ink },
  practiceCard: {
    backgroundColor: 'rgba(241,237,227,.08)',
    borderRadius: 18,
    marginTop: 15,
    padding: 14,
  },
  practiceHeading: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  reportRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 14,
  },
  aiNote: {
    color: 'rgba(241,237,227,.6)',
    flex: 1,
    fontFamily: VokaFonts.body,
    fontSize: 12,
  },
  examClock: { color: Palette.cream, fontFamily: VokaFonts.monoMedium, fontSize: 14 },
  examBullet: {
    color: 'rgba(241,237,227,.8)',
    fontFamily: VokaFonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  examNotes: {
    color: Palette.yellow,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  practiceFocus: {
    color: Palette.cream,
    flex: 1,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 17,
  },
  phraseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  phraseChip: {
    backgroundColor: 'rgba(241,237,227,.1)',
    borderRadius: 99,
    color: Palette.cream,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stage: {
    alignItems: 'center',
    backgroundColor: '#1D1C1A',
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 17,
    padding: 22,
  },
  orb: {
    alignItems: 'center',
    borderRadius: 99,
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  status: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayBold,
    fontSize: 20,
    marginTop: 17,
    textAlign: 'center',
  },
  statusHint: {
    color: 'rgba(241,237,227,0.55)',
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
    textAlign: 'center',
  },
  audioRouteHint: {
    color: 'rgba(241,237,227,0.42)',
    fontFamily: VokaFonts.body,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  startButton: {
    alignItems: 'center',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 54,
    paddingHorizontal: 22,
  },
  startText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 16 },
  controls: { flexDirection: 'row', gap: 13, marginTop: 20 },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#3A3733',
    borderRadius: 99,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  endButton: { backgroundColor: '#C8422F' },
  error: {
    color: '#FFB49E',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
    textAlign: 'center',
  },
  captionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  captionHint: {
    color: 'rgba(241,237,227,0.5)',
    fontFamily: VokaFonts.body,
    fontSize: 10,
    marginTop: 5,
  },
  transcript: {
    backgroundColor: '#1D1C1A',
    borderRadius: 22,
    gap: 10,
    marginTop: 12,
    minHeight: 100,
    padding: 15,
  },
  turn: { alignSelf: 'flex-start', maxWidth: '90%' },
  userTurn: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  turnRole: {
    color: 'rgba(241,237,227,0.4)',
    fontFamily: VokaFonts.monoMedium,
    fontSize: 8,
    marginBottom: 3,
  },
  turnText: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyTranscript: {
    color: 'rgba(241,237,227,0.45)',
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 17,
  },
  coachCard: { backgroundColor: '#282623', borderRadius: 22, marginTop: 18, padding: 17 },
  coachHeading: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  coachTitle: { color: Palette.cream, flex: 1, fontFamily: VokaFonts.displayBold, fontSize: 15 },
  coachCopy: {
    color: 'rgba(241,237,227,0.58)',
    fontFamily: VokaFonts.body,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 10,
  },
  signal: {
    borderTopColor: 'rgba(241,237,227,0.1)',
    borderTopWidth: 1,
    marginTop: 11,
    paddingTop: 10,
  },
  signalLabel: { fontFamily: VokaFonts.bodyBold, fontSize: 11 },
  signalReason: {
    color: 'rgba(241,237,227,0.58)',
    fontFamily: VokaFonts.body,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },
  privacy: {
    color: 'rgba(241,237,227,0.35)',
    fontFamily: VokaFonts.mono,
    fontSize: 8,
    marginTop: 14,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});

function ExamCardPanel({ card, active }: { card: SpeakingCard; active: boolean }) {
  const notes = useMockNotes((state) => state.notes[card.id] ?? '');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setStartedAt((value) => value ?? Date.now());
      setNow(Date.now());
    }, 500);
    return () => clearInterval(timer);
  }, [active]);
  const elapsed = startedAt ? now - startedAt : 0;
  const limit = card.speakSeconds * 1000;
  return (
    <View style={styles.practiceCard}>
      <View style={styles.practiceHeading}>
        <MaterialCommunityIcons color={Palette.yellow} name="card-text-outline" size={18} />
        <Text style={styles.practiceFocus}>{card.title}</Text>
        <Text
          accessibilityLabel={`Speaking time ${formatClock(elapsed)} of ${formatClock(limit)}`}
          style={[styles.examClock, elapsed >= limit && { color: Palette.yellow }]}
        >
          {formatClock(elapsed)} / {formatClock(limit)}
        </Text>
      </View>
      {card.bullets.map((bullet) => (
        <Text key={bullet} style={styles.examBullet}>
          • {bullet}
        </Text>
      ))}
      {notes ? <Text style={styles.examNotes}>Your notes: {notes}</Text> : null}
    </View>
  );
}

/** The coach orb breathes while connecting and while the coach is talking. */
function PulseOrb({
  color,
  pulsing,
  children,
}: {
  color: string;
  pulsing: boolean;
  children: ReactNode;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = pulsing
      ? withRepeat(withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true)
      : withTiming(1, { duration: 200 });
  }, [pulsing, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.orb, { backgroundColor: color }, style]}>
      {children}
    </Animated.View>
  );
}
