import { describe, expect, it } from '@jest/globals';

import {
  detectStruggleSignals,
  parseRealtimeEvent,
  upsertTranscriptTurn,
} from '@/features/conversation/events';
import { getConversationMode } from '@/features/conversation/modes';

describe('realtime conversation helpers', () => {
  it('maps transcript and speech lifecycle events', () => {
    expect(
      parseRealtimeEvent({
        delta: 'Guten ',
        item_id: 'user-1',
        type: 'conversation.item.input_audio_transcription.delta',
      }),
    ).toEqual({ id: 'user-1', kind: 'user-delta', text: 'Guten ' });
    expect(parseRealtimeEvent({ type: 'input_audio_buffer.speech_started' })).toEqual({
      kind: 'listening',
    });
  });

  it('reconciles partial and corrected final transcripts', () => {
    const partial = upsertTranscriptTurn([], {
      final: false,
      id: '1',
      role: 'user',
      text: 'I went ',
    });
    const final = upsertTranscriptTurn(partial, {
      final: true,
      id: '1',
      role: 'user',
      text: 'I went to London.',
    });
    expect(final).toEqual([{ id: '1', role: 'user', text: 'I went to London.' }]);
  });

  it('identifies conservative struggle signals without pretending to score pronunciation', () => {
    expect(detectStruggleSignals('Um, um, how do I say this?')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Hesitation' }),
        expect.objectContaining({ label: 'Word search' }),
      ]),
    );
    expect(detectStruggleSignals('I really enjoyed the interview.')).toEqual([]);
  });

  it('provides a safe mode for every supported language track', () => {
    expect(getConversationMode('EN').languageCode).toBe('en');
    expect(getConversationMode('DE').languageCode).toBe('de');
  });
});
