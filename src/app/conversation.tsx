import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { isConversationBackendConfigured } from '@/features/conversation/backend';
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
import type {
  RealtimeSessionHandle,
  RealtimeSessionStatus,
} from '@/features/conversation/realtime-types';
import type { LanguageTrack } from '@/features/listening/scenarios';
import { getCurriculumUnit } from '@/features/curriculum/catalog';

const statusCopy: Record<RealtimeSessionStatus | 'idle', string> = {
  connecting: 'Connecting securely…',
  ended: 'Conversation ended',
  error: 'Connection needs attention',
  idle: 'Ready when you are',
  listening: 'Listening — jump in anytime',
  speaking: 'Voka is speaking — you can interrupt',
  thinking: 'Understanding what you meant…',
};

export default function ConversationScreen() {
  const params = useLocalSearchParams<{
    diagnostic?: string;
    practice?: string;
    track?: string;
    unit?: string;
  }>();
  const diagnostic = params.practice === 'diagnostic' || params.diagnostic === '1';
  const initialTrack: LanguageTrack = params.track === 'DE' ? 'DE' : 'EN';
  const [track, setTrack] = useState<LanguageTrack>(initialTrack);
  const [status, setStatus] = useState<RealtimeSessionStatus | 'idle'>('idle');
  const [captions, setCaptions] = useState(true);
  const [muted, setMuted] = useState(false);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [signals, setSignals] = useState<StruggleSignal[]>([]);
  const [error, setError] = useState('');
  const sessionRef = useRef<RealtimeSessionHandle | undefined>(undefined);
  const userTurnCountRef = useRef(0);
  const completeUnit = useCoachingStore((state) => state.completeUnit);
  const goal = useCoachingStore((state) => state.preferences[track].goal);
  const recordSignal = useCoachingStore((state) => state.recordSignal);
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

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      const parsed = parseRealtimeEvent(event);
      if (!parsed) return;

      if (parsed.kind === 'error') {
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
          userTurnCountRef.current += 1;
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
    [recordSignal, track, unit?.pronunciationFocus],
  );

  useEffect(
    () => () => {
      sessionRef.current?.stop();
    },
    [],
  );

  const start = async () => {
    if (!isConversationBackendConfigured) {
      setError(
        'Live voice is temporarily unavailable because the secure voice service is not connected.',
      );
      setStatus('error');
      return;
    }

    setError('');
    setSignals([]);
    setTurns([]);
    userTurnCountRef.current = 0;
    try {
      sessionRef.current = await startRealtimeSession({
        goal,
        onEvent: handleEvent,
        onStatus: setStatus,
        practice: diagnostic ? 'diagnostic' : 'conversation',
        starter: mode.starter,
        track,
        unitId: unit?.id,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The live coach could not connect.');
      setStatus('error');
    }
  };

  const stop = () => {
    sessionRef.current?.stop();
    sessionRef.current = undefined;
    setMuted(false);
    setStatus('ended');
    if (unit && userTurnCountRef.current >= 2) completeUnit(unit.id);
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

        {!diagnostic && !unit ? (
          <View accessibilityLabel="Conversation language" style={styles.trackRow}>
            {(['EN', 'DE'] as const).map((item) => (
              <Pressable
                accessibilityLabel={item === 'EN' ? 'English conversation' : 'German conversation'}
                accessibilityRole="button"
                accessibilityState={{ disabled: active, selected: track === item }}
                disabled={active}
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
            {active
              ? 'Speak normally. Pauses, corrections and interruptions are welcome.'
              : 'A short, adaptive conversation with live help when you get stuck.'}
          </Text>

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
                onPress={stop}
                style={[styles.controlButton, styles.endButton]}
              >
                <MaterialCommunityIcons color={Palette.white} name="phone-hangup" size={23} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityLabel="Start live conversation"
              accessibilityRole="button"
              onPress={start}
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: mode.accent },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons color={Palette.ink} name="microphone" size={22} />
              <Text style={styles.startText}>
                {status === 'ended' || status === 'error' ? 'Try again' : 'Start conversation'}
              </Text>
            </Pressable>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
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
});
