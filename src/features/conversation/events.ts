import { normalizeUiText } from '@/utils/ui-text';

export type ConversationRole = 'assistant' | 'user';

export type TranscriptTurn = {
  id: string;
  role: ConversationRole;
  text: string;
};

export type RealtimeEvent = {
  delta?: string;
  error?: { message?: string };
  item_id?: string;
  response?: {
    output?: {
      content?: { transcript?: string; type?: string }[];
      id?: string;
      role?: string;
    }[];
  };
  transcript?: string;
  type: string;
};

export type ParsedRealtimeEvent =
  | { kind: 'assistant-delta'; id: string; text: string }
  | { kind: 'assistant-final'; id: string; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'listening' }
  | { kind: 'speaking' }
  | { kind: 'user-delta'; id: string; text: string }
  | { kind: 'user-final'; id: string; text: string }
  | { kind: 'waiting' };

const FALLBACK_ITEM_ID = 'current';

export function parseRealtimeEvent(event: RealtimeEvent): ParsedRealtimeEvent | undefined {
  const id = event.item_id ?? FALLBACK_ITEM_ID;

  switch (event.type) {
    case 'input_audio_buffer.speech_started':
      return { kind: 'listening' };
    case 'input_audio_buffer.speech_stopped':
      return { kind: 'waiting' };
    case 'response.created':
      return { kind: 'waiting' };
    case 'response.output_audio.delta':
      return { kind: 'speaking' };
    case 'response.done':
      return { kind: 'listening' };
    case 'conversation.item.input_audio_transcription.delta':
      return event.delta
        ? { id, kind: 'user-delta', text: normalizeUiText(event.delta) }
        : undefined;
    case 'conversation.item.input_audio_transcription.completed':
      return event.transcript
        ? { id, kind: 'user-final', text: normalizeUiText(event.transcript) }
        : undefined;
    case 'response.output_audio_transcript.delta':
      return event.delta
        ? { id, kind: 'assistant-delta', text: normalizeUiText(event.delta) }
        : undefined;
    case 'response.output_audio_transcript.done':
      return event.transcript
        ? { id, kind: 'assistant-final', text: normalizeUiText(event.transcript) }
        : undefined;
    case 'error':
      return { kind: 'error', message: event.error?.message ?? 'The live session failed.' };
    default:
      return undefined;
  }
}

export function upsertTranscriptTurn(
  turns: TranscriptTurn[],
  update: { final: boolean; id: string; role: ConversationRole; text: string },
) {
  const existingIndex = turns.findIndex(
    (turn) => turn.id === update.id && turn.role === update.role,
  );

  if (existingIndex === -1) {
    return [...turns, { id: update.id, role: update.role, text: update.text.trimStart() }];
  }

  return turns.map((turn, index) => {
    if (index !== existingIndex) return turn;
    return {
      ...turn,
      text: update.final ? update.text.trim() : `${turn.text}${update.text}`,
    };
  });
}

export type StruggleSignal = {
  label: string;
  reason: string;
};

export function detectStruggleSignals(transcript: string): StruggleSignal[] {
  const normalized = transcript.trim().toLowerCase();
  if (!normalized) return [];

  const signals: StruggleSignal[] = [];
  const hesitationCount = normalized.match(/\b(?:er+|erm+|uh+|um+)\b/g)?.length ?? 0;
  if (hesitationCount >= 2) {
    signals.push({
      label: 'Hesitation',
      reason: 'Several fillers suggest you may need a more automatic phrase for this idea.',
    });
  }

  if (
    /\b(?:how do (?:i|you) say|what is the word|ich weiß nicht|wie sagt man)\b/u.test(normalized)
  ) {
    signals.push({
      label: 'Word search',
      reason: 'You asked for a word, so Voka will save and recycle it later.',
    });
  }

  const words = normalized.match(/[\p{L}']+/gu) ?? [];
  const repeated = words.find(
    (word, index) =>
      index > 0 && word === words[index - 1] && !/^(?:er+|erm+|uh+|um+)$/u.test(word),
  );
  if (repeated) {
    signals.push({
      label: repeated,
      reason: `You repeated “${repeated}”. Voka can practise it in a shorter phrase.`,
    });
  }

  return signals.slice(0, 2);
}
