import type { LanguageTrack } from '@/features/listening/scenarios';

export type ConversationModeId = 'interview' | 'real-life';

export type ConversationMode = {
  accent: string;
  description: string;
  id: ConversationModeId;
  language: string;
  languageCode: 'de' | 'en';
  level: string;
  starter: string;
  title: string;
  track: LanguageTrack;
};

export const conversationModes: ConversationMode[] = [
  {
    accent: '#FF4A17',
    description:
      'A quick, natural British conversation with current expressions, connected speech and interview-style follow-ups.',
    id: 'interview',
    language: 'English',
    languageCode: 'en',
    level: 'B1–C1',
    starter: 'Start with a warm, surprising interview question about everyday life.',
    title: 'Modern interview English',
    track: 'EN',
  },
  {
    accent: '#F2B705',
    description:
      'Handle a realistic everyday situation at native speed, then get gentle help with the phrases that slowed you down.',
    id: 'real-life',
    language: 'German',
    languageCode: 'de',
    level: 'A2–B2',
    starter: 'Begin a friendly conversation as a local at a busy bakery in Berlin.',
    title: 'Everyday German',
    track: 'DE',
  },
];

export function getConversationMode(track: LanguageTrack) {
  return conversationModes.find((mode) => mode.track === track) ?? conversationModes[0];
}
