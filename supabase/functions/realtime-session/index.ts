import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';
import { claimAiBudget, readBoundedJson } from '../_shared/ai-budget.ts';
import type { Database } from '../_shared/database.types.ts';
import { hangUpCall, providerCallId } from '../_shared/voice-control.ts';

const trackSettings = {
  EN: {
    language: 'en',
    scenario: 'a lively, contemporary British-English interview about everyday life',
  },
  DE: {
    language: 'de',
    scenario: 'a realistic everyday conversation with a friendly local in Germany',
  },
} as const;

type Track = keyof typeof trackSettings;

const unitSettings = {
  'en-a1-first-contact': {
    level: 'A1',
    focus: 'clear word stress and weak forms',
    phrases: ['Hiya, how’s it going?', 'Could I get …, please?'],
    track: 'EN',
  },
  'en-a2-making-plans': {
    level: 'A2',
    focus: 'linking, contractions and short-reply rhythm',
    phrases: ['Do you fancy grabbing a coffee?', 'Sounds good to me.'],
    track: 'EN',
  },
  'en-b1-interview-flow': {
    level: 'B1',
    focus: 'sentence stress, reductions and turn-taking',
    phrases: ['To be fair, …', 'I reckon …', 'Pretty much.'],
    track: 'EN',
  },
  'en-b2-storytelling': {
    level: 'B2',
    focus: 'thought groups, contrastive stress and expressive intonation',
    phrases: ['It turned out that …', 'I ended up …'],
    track: 'EN',
  },
  'en-c1-presence': {
    level: 'C1',
    focus: 'prosodic control, emphasis and deliberate pacing',
    phrases: ['What struck me was …', 'Having said that, …'],
    track: 'EN',
  },
  'de-a1-first-contact': {
    level: 'A1',
    focus: 'vowel length, word stress and final consonants',
    phrases: ['Ich hätte gern …', 'Das war’s, danke.'],
    track: 'DE',
  },
  'de-a2-einkaufen': {
    level: 'A2',
    focus: 'schwa reduction and shortened verb endings',
    phrases: ['Sonst noch was?', 'Ich nehm …', 'Passt so.'],
    track: 'DE',
  },
  'de-b1-phone': {
    level: 'B1',
    focus: 'consonant clusters, reductions and question intonation',
    phrases: ['Ich meld mich wegen …', 'Kommt drauf an.'],
    track: 'DE',
  },
  'de-b2-discussion': {
    level: 'B2',
    focus: 'sentence stress, rhythm and long-clause chunking',
    phrases: ['Ehrlich gesagt, …', 'Ich sehe das etwas anders.'],
    track: 'DE',
  },
  'de-c1-praezision': {
    level: 'C1',
    focus: 'flexible prominence, intonation and controlled speech rate',
    phrases: ['Soweit ich das beurteilen kann, …', 'Unterm Strich …'],
    track: 'DE',
  },
} as const;

type UnitId = keyof typeof unitSettings;
type Goal = 'everyday' | 'interviews' | 'work-study';
type AssessmentTurn = { role: 'assistant' | 'user'; text: string };

async function safetyIdentifier(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sessionInstructions(
  track: Track,
  goal: Goal,
  unitId?: UnitId,
  diagnostic = false,
  toughCoach = false,
) {
  const settings = trackSettings[track];
  const unit = unitId ? unitSettings[unitId] : undefined;
  const goalBrief = {
    everyday: 'Prioritise fast, practical exchanges and automatic useful chunks.',
    interviews: 'Prioritise natural answers, follow-up questions and confident modern phrasing.',
    'work-study':
      'Prioritise clear explanations, discussion and appropriate professional register.',
  }[goal];
  const unitBrief = unit
    ? `This is a ${unit.level} unit. Elicit these phrases naturally: ${unit.phrases.join(' / ')}. The delivery focus is ${unit.focus}.`
    : '';
  const diagnosticBrief = diagnostic
    ? 'This is a brief adaptive diagnostic. Gather several samples before estimating a broad CEFR range. State clearly that it is not a certified result.'
    : '';
  const toneBrief = toughCoach
    ? `The learner explicitly opted into Tough Coach. Be direct, energetic and playfully witty. You may use one brief, light roast about the learner's current practice behaviour or the specific language stumble, followed immediately by an actionable retry. Never target identity, nationality, accent, appearance, intelligence, disability, trauma, or any protected trait; never humiliate, threaten, swear at them, or imply they cannot learn. If they sound upset or ask you to stop, return to warm coaching immediately.`
    : 'Use encouraging, specific feedback without teasing the learner.';
  return `You are Voka, a warm language conversation coach. Run ${settings.scenario}.

Speak naturally, with connected speech and current everyday expressions, but never imitate a named living person. Match the learner's demonstrated level. Keep each turn brief, usually one or two sentences, so the learner speaks most of the time. Ask natural follow-up questions instead of lecturing.

If the learner interrupts, stop immediately and listen. Understand imperfect grammar and pronunciation from context. When they hesitate, repeat a word, search for a phrase, or misunderstand, keep the conversation flowing first; then give one short, kind correction or a more natural alternative. Recycle a difficult word later to check learning.

Coach intelligibility and comprehensibility, not accent erasure. Consider both articulation and prosody: sound contrasts, word stress, sentence prominence, rhythm, chunking, and intonation. Give at most one high-impact delivery tip at a time, using qualitative language. Never invent a pronunciation percentage or claim phoneme-level certainty from ordinary conversation audio. Use ${settings.language === 'de' ? 'German by default, with brief English help only when needed; accept standard and intelligible regional variation' : 'contemporary, broadly understood British English, explaining advanced wording plainly when needed'}.

${goalBrief} ${unitBrief} ${diagnosticBrief} ${toneBrief}

Do not claim to be human. Do not ask for sensitive personal information. Start the role-play immediately.`;
}

async function assessTranscript(
  provider: { apiKey: string; name: 'openai' | 'xai' },
  userId: string,
  track: Track,
  turns: AssessmentTurn[],
  toughCoach: boolean,
) {
  const learnerTurns = turns.filter((turn) => turn.role === 'user' && turn.text.trim());
  const learnerTextLength = learnerTurns.reduce((total, turn) => total + turn.text.length, 0);
  if (learnerTurns.length < 3 || learnerTextLength < 80) {
    return Response.json(
      { error: 'Keep speaking a little longer so Voka has enough evidence for an estimate.' },
      { status: 422 },
    );
  }

  const transcript = turns
    .map((turn) => `${turn.role === 'user' ? 'LEARNER' : 'VOKA'}: ${turn.text.trim()}`)
    .join('\n');
  const userHash = await safetyIdentifier(userId);
  const feedbackStyle =
    provider.name === 'xai' && toughCoach
      ? 'The learner explicitly selected Tough Coach. Make the summary high-energy, blunt and playfully unhinged in a learning-first way: use at most one vivid metaphor or light roast about this specific practice attempt, then give a concrete next move. Never shame, swear at, humiliate, or insult the learner, their identity, intelligence, nationality, disability, or accent.'
      : 'Keep the summary encouraging, clear, and specific without teasing the learner.';
  const providerResult = await fetch(
    provider.name === 'xai'
      ? 'https://api.x.ai/v1/responses'
      : 'https://api.openai.com/v1/responses',
    {
      body: JSON.stringify({
        input: [
          {
            content:
              `Assess this ${track === 'DE' ? 'German' : 'English'} learner transcript against CEFR A1-C1. ` +
              'Use only demonstrated vocabulary, grammar, fluency of expression, comprehension, and task response. ' +
              'Do not infer pronunciation, accent, audio quality, identity, or a numeric score from text. ' +
              'This is a broad, non-certified estimate. Keep each strength and priority concrete and under 100 characters. ' +
              `If the evidence is sparse or transcription appears unreliable, use low confidence. ${feedbackStyle}\n\n` +
              transcript,
            role: 'user',
          },
        ],
        model:
          provider.name === 'xai'
            ? (Deno.env.get('XAI_ASSESSMENT_MODEL') ?? 'grok-4.6')
            : (Deno.env.get('OPENAI_ASSESSMENT_MODEL') ?? 'gpt-4o-mini'),
        ...(provider.name === 'xai'
          ? { prompt_cache_key: `assessment-${userHash}`, reasoning: { effort: 'low' } }
          : { safety_identifier: userHash }),
        max_output_tokens: 2000,
        store: false,
        text: {
          format: {
            name: 'spoken_assessment',
            schema: {
              additionalProperties: false,
              properties: {
                confidence: { enum: ['low', 'medium', 'high'], type: 'string' },
                estimatedLevel: { enum: ['A1', 'A2', 'B1', 'B2', 'C1'], type: 'string' },
                priorities: {
                  items: { type: 'string' },
                  maxItems: 3,
                  minItems: 1,
                  type: 'array',
                },
                strengths: {
                  items: { type: 'string' },
                  maxItems: 3,
                  minItems: 1,
                  type: 'array',
                },
                summary: { maxLength: 400, minLength: 1, type: 'string' },
              },
              required: ['estimatedLevel', 'confidence', 'summary', 'strengths', 'priorities'],
              type: 'object',
            },
            strict: true,
            type: 'json_schema',
          },
        },
      }),
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: AbortSignal.timeout(30_000),
    },
  )
    .then(async (upstream) => ({ upstream, responseBody: await upstream.json() }))
    .catch(() => null);
  if (!providerResult) {
    return Response.json(
      { error: 'The assessment service did not respond. Please try again.' },
      { status: 502, headers: { 'X-Voka-Assessment-Failure': 'timeout-or-network' } },
    );
  }
  const { upstream, responseBody } = providerResult;
  if (!upstream.ok) {
    console.error(`${provider.name} assessment failed`, upstream.status);
    return Response.json(
      { error: 'The assessment could not be calculated. Please try again.' },
      { status: 502, headers: { 'X-Voka-Assessment-Failure': `provider-http-${upstream.status}` } },
    );
  }
  const outputText =
    responseBody.output_text ??
    responseBody.output
      ?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? [])
      .find((item: { text?: string }) => typeof item.text === 'string')?.text;
  if (typeof outputText !== 'string') {
    return Response.json(
      { error: 'The assessment service returned an invalid result.' },
      { status: 502 },
    );
  }
  try {
    const result = JSON.parse(outputText);
    return Response.json({
      assessment: {
        ...result,
        createdAt: new Date().toISOString(),
        evidenceTurnCount: learnerTurns.length,
        id: crypto.randomUUID(),
        track,
      },
      provider: provider.name,
    });
  } catch {
    return Response.json(
      { error: 'The assessment service returned an invalid result.' },
      { status: 502 },
    );
  }
}

export default {
  fetch: withSupabase<Database>({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const xAiKey = Deno.env.get('XAI_API_KEY');

    let body: {
      action?: unknown;
      leaseId?: unknown;
      goal?: unknown;
      coachTone?: unknown;
      practice?: unknown;
      sdp?: unknown;
      track?: unknown;
      turns?: unknown;
      unitId?: unknown;
    };
    try {
      const parsed = await readBoundedJson(request);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error('Invalid request.');
      body = parsed;
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (body.action !== undefined && body.action !== 'assess' && body.action !== 'end') {
      return Response.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const track = body.track === 'DE' ? 'DE' : body.track === 'EN' ? 'EN' : undefined;
    const toughCoach = body.coachTone === 'tough';
    const userId = context.userClaims?.id ?? context.jwtClaims?.sub;
    if (typeof userId !== 'string' || !userId) {
      return Response.json({ error: 'Authentication is required.' }, { status: 401 });
    }
    if (body.action === 'end') {
      if (!openAiKey || typeof body.leaseId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.leaseId))
        return Response.json({ error: 'Invalid session.' }, { status: 400 });
      const { data, error } = await context.supabaseAdmin.rpc('voka_voice_control', {
        p_action: 'lookup',
        p_user_id: userId,
        p_lease_id: body.leaseId,
      });
      if (error) return Response.json({ error: 'Could not close session.' }, { status: 503 });
      const lease = data as { id?: string; callId?: string };
      if (lease.callId) await hangUpCall(openAiKey, lease.callId);
      if (lease.id)
        await context.supabaseAdmin.rpc('voka_voice_control', {
          p_action: 'finish',
          p_user_id: userId,
          p_lease_id: lease.id,
        });
      return Response.json({ closed: true });
    }
    if (body.action === 'assess') {
      const provider = xAiKey
        ? { apiKey: xAiKey, name: 'xai' as const }
        : openAiKey
          ? { apiKey: openAiKey, name: 'openai' as const }
          : undefined;
      if (!provider) {
        return Response.json(
          { error: 'The assessment service is not configured.' },
          { status: 503 },
        );
      }
      if (!track || !Array.isArray(body.turns) || body.turns.length > 30) {
        return Response.json({ error: 'Invalid assessment request.' }, { status: 400 });
      }
      const turns = body.turns.flatMap((value): AssessmentTurn[] => {
        if (!value || typeof value !== 'object') return [];
        const turn = value as Record<string, unknown>;
        if (
          (turn.role !== 'assistant' && turn.role !== 'user') ||
          typeof turn.text !== 'string' ||
          !turn.text.trim() ||
          turn.text.length > 2_000
        )
          return [];
        return [{ role: turn.role, text: turn.text }];
      });
      if (turns.length !== body.turns.length) {
        return Response.json({ error: 'Invalid assessment transcript.' }, { status: 400 });
      }
      const learnerTurns = turns.filter((turn) => turn.role === 'user');
      if (
        learnerTurns.length < 3 ||
        learnerTurns.reduce((count, turn) => count + turn.text.length, 0) < 80
      ) {
        return Response.json(
          { error: 'Keep speaking a little longer so Voka has enough evidence for an estimate.' },
          { status: 422 },
        );
      }
      const budget = await claimAiBudget(context.supabaseAdmin, userId, 'assessment');
      if (!budget.allowed)
        return Response.json(
          { error: budget.error },
          { status: budget.status, headers: { 'Retry-After': String(budget.retryAfter) } },
        );
      const response = await assessTranscript(provider, userId, track, turns, toughCoach);
      if (provider.name === 'xai' && !response.ok && response.status >= 500 && openAiKey) {
        console.warn('xAI assessment unavailable; retrying with OpenAI.');
        const fallback = await assessTranscript(
          { apiKey: openAiKey, name: 'openai' },
          userId,
          track,
          turns,
          toughCoach,
        );
        fallback.headers.set(
          'X-Voka-Assessment-Fallback',
          response.headers.get('X-Voka-Assessment-Failure') ?? 'invalid-result',
        );
        return fallback;
      }
      return response;
    }
    if (!openAiKey) {
      return Response.json({ error: 'The voice service is not configured.' }, { status: 503 });
    }
    const goal =
      body.goal === 'everyday' || body.goal === 'interviews' || body.goal === 'work-study'
        ? body.goal
        : undefined;
    const unitId =
      typeof body.unitId === 'string' && body.unitId in unitSettings
        ? (body.unitId as UnitId)
        : undefined;
    const diagnostic = body.practice === 'diagnostic';
    if (!track || typeof body.sdp !== 'string' || body.sdp.length > 100_000) {
      return Response.json({ error: 'Invalid voice connection request.' }, { status: 400 });
    }
    if (
      !goal ||
      (body.unitId !== undefined && !unitId) ||
      (unitId && unitSettings[unitId].track !== track)
    ) {
      return Response.json({ error: 'Invalid coaching request.' }, { status: 400 });
    }

    const reservation = await context.supabaseAdmin.rpc('voka_voice_control', {
      p_action: 'reserve',
      p_user_id: userId,
    });
    const lease = reservation.data as { id?: string; error?: string } | null;
    if (reservation.error || !lease?.id)
      return Response.json(
        { error: lease?.error ?? 'Voice safety checks are temporarily unavailable.' },
        { status: 503 },
      );
    const release = () =>
      context.supabaseAdmin.rpc('voka_voice_control', {
        p_action: 'finish',
        p_user_id: userId,
        p_lease_id: lease.id!,
      });
    const budget = await claimAiBudget(context.supabaseAdmin, userId, 'voice');
    if (!budget.allowed) {
      await release();
      return Response.json(
        { error: budget.error },
        { status: budget.status, headers: { 'Retry-After': String(budget.retryAfter) } },
      );
    }
    const settings = trackSettings[track];
    const session = {
      audio: {
        input: {
          transcription: { language: settings.language, model: 'gpt-live-transcribe' },
          turn_detection: {
            create_response: true,
            eagerness: 'medium',
            interrupt_response: true,
            type: 'semantic_vad',
          },
        },
        output: { voice: 'marin' },
      },
      instructions: sessionInstructions(track, goal, unitId, diagnostic, toughCoach),
      model: 'gpt-realtime-2.1',
      output_modalities: ['audio'],
      type: 'realtime',
    };

    const form = new FormData();
    form.set('sdp', body.sdp);
    form.set('session', JSON.stringify(session));

    let upstream: Response;
    try {
      upstream = await fetch('https://api.openai.com/v1/realtime/calls', {
        signal: AbortSignal.timeout(30_000),
        body: form,
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'OpenAI-Safety-Identifier': await safetyIdentifier(userId),
        },
        method: 'POST',
      });
    } catch {
      await release();
      return Response.json(
        { error: 'The live coach could not connect. Please try again.' },
        { status: 502 },
      );
    }
    const answerSdp = await upstream.text();

    if (!upstream.ok) {
      await release();
      console.error('OpenAI Realtime connection failed', upstream.status);
      return Response.json(
        { error: 'The live coach could not connect. Please try again.' },
        { status: 502 },
      );
    }

    const callId = providerCallId(upstream.headers.get('location'));
    if (!callId) {
      // Never return an untracked SDP connection. Retain the reservation until timeout.
      return Response.json(
        { error: 'Could not safely initialise voice. Please try again shortly.' },
        { status: 502 },
      );
    }
    const bound = await context.supabaseAdmin.rpc('voka_voice_control', {
      p_action: 'bind',
      p_user_id: userId,
      p_lease_id: lease.id,
      p_call_id: callId,
    });
    if (bound.error) {
      await hangUpCall(openAiKey, callId);
      await release();
      return Response.json(
        { error: 'Could not save voice session. Please try again.' },
        { status: 503 },
      );
    }

    return Response.json({
      session: { id: lease.id, expiresAt: (bound.data as { expiresAt: string }).expiresAt },
      transport: { sdp: answerSdp },
    });
  }),
};
