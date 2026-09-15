import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

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

async function safetyIdentifier(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sessionInstructions(track: Track, goal: Goal, unitId?: UnitId, diagnostic = false) {
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
  return `You are Voka, a warm language conversation coach. Run ${settings.scenario}.

Speak naturally, with connected speech and current everyday expressions, but never imitate a named living person. Match the learner's demonstrated level. Keep each turn brief—usually one or two sentences—so the learner speaks most of the time. Ask natural follow-up questions instead of lecturing.

If the learner interrupts, stop immediately and listen. Understand imperfect grammar and pronunciation from context. When they hesitate, repeat a word, search for a phrase, or misunderstand, keep the conversation flowing first; then give one short, kind correction or a more natural alternative. Recycle a difficult word later to check learning.

Coach intelligibility and comprehensibility, not accent erasure. Consider both articulation and prosody: sound contrasts, word stress, sentence prominence, rhythm, chunking, and intonation. Give at most one high-impact delivery tip at a time, using qualitative language. Never invent a pronunciation percentage or claim phoneme-level certainty from ordinary conversation audio. Use ${settings.language === 'de' ? 'German by default, with brief English help only when needed; accept standard and intelligible regional variation' : 'contemporary, broadly understood British English, explaining advanced wording plainly when needed'}.

${goalBrief} ${unitBrief} ${diagnosticBrief}

Do not claim to be human. Do not ask for sensitive personal information. Start the role-play immediately.`;
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return Response.json({ error: 'The voice service is not configured.' }, { status: 503 });
    }

    let body: {
      goal?: unknown;
      practice?: unknown;
      sdp?: unknown;
      track?: unknown;
      unitId?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const track = body.track === 'DE' ? 'DE' : body.track === 'EN' ? 'EN' : undefined;
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
      instructions: sessionInstructions(track, goal, unitId, diagnostic),
      model: 'gpt-realtime-2.1',
      output_modalities: ['audio'],
      type: 'realtime',
    };

    const form = new FormData();
    form.set('sdp', body.sdp);
    form.set('session', JSON.stringify(session));

    const userId = context.userClaims?.id ?? context.jwtClaims?.sub;
    if (typeof userId !== 'string' || !userId) {
      return Response.json({ error: 'Authentication is required.' }, { status: 401 });
    }
    const upstream = await fetch('https://api.openai.com/v1/realtime/calls', {
      body: form,
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'OpenAI-Safety-Identifier': await safetyIdentifier(userId),
      },
      method: 'POST',
    });
    const answerSdp = await upstream.text();

    if (!upstream.ok) {
      console.error('OpenAI Realtime connection failed', upstream.status, answerSdp.slice(0, 500));
      return Response.json(
        { error: 'The live coach could not connect. Please try again.' },
        { status: 502 },
      );
    }

    return Response.json({
      session: { id: upstream.headers.get('openai-request-id') ?? undefined },
      transport: { sdp: answerSdp },
    });
  }),
};
