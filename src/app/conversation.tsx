import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

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

const statusCopy: Record<RealtimeSessionStatus | 'idle', string> = {
  connecting: 'Connecting securely…',
  ended: 'Conversation ended',
  error: 'Connection needs attention',
  idle: 'Ready when you are',
  listening: 'Listening. Jump in anytime',
  speaking: 'Voka is speaking. You can interrupt',
  thinking: 'Understanding what you meant…',
};

export default function ConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    diagnostic?: string;
    practice?: string;
    track?: string;
    unit?: string;
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
            'Read the sentence naturally, then answer a few short questions. Voka adapts to what it hears without inventing a pronunciation score.',
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
      if (parsed.kind === 'listening') setStatus('listening');
      if (parsed.kind === 'waiting') setStatus('thinking');
      if (parsed.kind === 'speaking') setStatus('speaking');
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
    [recordSignal, releaseSession, track, unit?.pronunciationFocus],
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
          setStatus(next);
        },
        practice: diagnostic ? 'diagnostic' : 'conversation',
        signal: startAbort.signal,
        starter: mode.starter,
        track,
        unitId: unit?.id,
      });
      if (startAbort.signal.aborted || generationRef.current !== generation) {
        session.stop();
        return;
      }
      sessionRef.current = session;
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
    sessionRef.current?.setMuted(next);
    setMuted(next);
  };

  return (
    <AppScreen activeNav="speak" backgroundColor={Palette.ink} dark>
      <View style={styles.header}>
        <HeaderBack dark />
        <Text style={styles.logo}>VOKA LIVE</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>BETA</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Eyebrow color={mode.accent}>Natural conversation · {mode.level}</Eyebrow>
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

        {unit ? (
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
          <View style={[styles.orb, { backgroundColor: mode.accent }]}>
            <MaterialCommunityIcons
              color={Palette.ink}
              name={status === 'listening' ? 'ear-hearing' : 'account-voice'}
              size={42}
            />
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.status}>
            {statusCopy[status]}
          </Text>
          <Text style={styles.statusHint}>
            {microphoneHint ||
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
                    : status === 'ended' || status === 'error'
                      ? 'Try again'
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
                  setError('Open your phone settings, then VOKA, Permissions and Microphone.'),
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
                  <Text style={styles.turnRole}>{turn.role === 'user' ? 'YOU' : 'VOKA'}</Text>
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
            <Text style={styles.coachTitle}>Voka notices the struggle, not just the mistake</Text>
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
              coaching. Voka never invents a pronunciation score.
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
    fontSize: 9,
    paddingHorizontal: 9,
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
