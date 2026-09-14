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

async function safetyIdentifier(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sessionInstructions(track: Track) {
  const settings = trackSettings[track];
  return `You are Voka, a warm language conversation coach. Run ${settings.scenario}.

Speak naturally, with connected speech and current everyday expressions, but never imitate a named living person. Match the learner's demonstrated level. Keep each turn brief—usually one or two sentences—so the learner speaks most of the time. Ask natural follow-up questions instead of lecturing.

If the learner interrupts, stop immediately and listen. Understand imperfect grammar and pronunciation from context. When they hesitate, repeat a word, search for a phrase, or misunderstand, keep the conversation flowing first; then give one short, kind correction or a more natural alternative. Never invent pronunciation scores. Recycle a difficult word later to check learning. Use ${settings.language === 'de' ? 'German by default, with brief English help only when needed' : 'modern British English, explaining advanced wording plainly when needed'}.

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

    let body: { sdp?: unknown; track?: unknown };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const track = body.track === 'DE' ? 'DE' : body.track === 'EN' ? 'EN' : undefined;
    if (!track || typeof body.sdp !== 'string' || body.sdp.length > 100_000) {
      return Response.json({ error: 'Invalid voice connection request.' }, { status: 400 });
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
      instructions: sessionInstructions(track),
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
