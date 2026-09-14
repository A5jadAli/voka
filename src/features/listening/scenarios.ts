export type LanguageTrack = 'EN' | 'DE';
export type SubtitleMode = 'target' | 'meaning' | 'off';

export type DialogueLine = {
  speaker: string;
  text: string;
  translation: string;
};

export type ListeningScenario = {
  id: string;
  track: LanguageTrack;
  language: 'en-GB' | 'de-DE';
  languageName: 'English' | 'German';
  title: string;
  context: string;
  level: 'A2' | 'B1' | 'B2';
  duration: string;
  accent: string;
  icon:
    | 'account-group-outline'
    | 'coffee-outline'
    | 'food-croissant'
    | 'home-city-outline'
    | 'office-building-outline'
    | 'train';
  lines: DialogueLine[];
  phrases: { heard: string; full: string; meaning: string }[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
};

export const listeningScenarios: ListeningScenario[] = [
  {
    id: 'coffee-run',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'Coffee on the go',
    context: 'A quick order during the morning rush',
    level: 'A2',
    duration: '40 sec',
    accent: 'Everyday British English',
    icon: 'coffee-outline',
    lines: [
      {
        speaker: 'Barista',
        text: 'Hiya, what can I get you?',
        translation: 'Hello, what would you like?',
      },
      {
        speaker: 'Customer',
        text: 'Could I get a flat white to take away?',
        translation: 'I would like a takeaway flat white.',
      },
      {
        speaker: 'Barista',
        text: 'Sure thing. D’you want an extra shot in that?',
        translation: 'Certainly. Would you like an extra espresso shot?',
      },
      {
        speaker: 'Customer',
        text: 'No, I’m all right, thanks.',
        translation: 'No, thank you.',
      },
    ],
    phrases: [
      { heard: 'Hiya', full: 'Hi / hello', meaning: 'A friendly, informal greeting.' },
      {
        heard: 'D’you want…?',
        full: 'Do you want…?',
        meaning: '“Do” and “you” blend together in fast speech.',
      },
      {
        heard: 'I’m all right',
        full: 'No, thank you',
        meaning: 'In this context it politely declines the offer.',
      },
    ],
    question: {
      prompt: 'What extra does the barista offer?',
      options: ['A larger cup', 'An extra espresso shot', 'Oat milk'],
      correctIndex: 1,
    },
  },
  {
    id: 'platform-change-en',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'Platform change',
    context: 'A station announcement changes your plan',
    level: 'B1',
    duration: '35 sec',
    accent: 'Public announcement',
    icon: 'train',
    lines: [
      {
        speaker: 'Announcement',
        text: 'We’re sorry to announce that the twelve-ten service to Leeds is running approximately fifteen minutes late.',
        translation: 'The 12:10 train to Leeds is about 15 minutes late.',
      },
      {
        speaker: 'Announcement',
        text: 'This service will now depart from platform eight instead of platform six.',
        translation: 'The train will leave from platform 8, not platform 6.',
      },
    ],
    phrases: [
      {
        heard: 'twelve-ten service',
        full: 'the train scheduled for 12:10',
        meaning: 'Announcements often replace “train” with “service.”',
      },
      {
        heard: 'running late',
        full: 'delayed',
        meaning: 'A common phrase for transport that is behind schedule.',
      },
      {
        heard: 'instead of',
        full: 'in place of',
        meaning: 'Signals that the original platform has changed.',
      },
    ],
    question: {
      prompt: 'Which platform should you go to?',
      options: ['Platform 6', 'Platform 8', 'Platform 15'],
      correctIndex: 1,
    },
  },
  {
    id: 'monday-catch-up',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'Monday catch-up',
    context: 'Colleagues speak casually before a meeting',
    level: 'B1',
    duration: '50 sec',
    accent: 'Casual workplace speech',
    icon: 'office-building-outline',
    lines: [
      {
        speaker: 'Maya',
        text: 'You all right? How was your weekend?',
        translation: 'Hello. How was your weekend?',
      },
      {
        speaker: 'Sam',
        text: 'Yeah, not bad. Didn’t get up to much, to be honest.',
        translation: 'It was fine. I did not do very much.',
      },
      {
        speaker: 'Maya',
        text: 'Fair enough. We’d better head in — the stand-up’s about to start.',
        translation: 'I understand. We should go in because the meeting will start soon.',
      },
    ],
    phrases: [
      {
        heard: 'You all right?',
        full: 'Hello, how are you?',
        meaning: 'Usually a casual greeting, not a concern about a problem.',
      },
      {
        heard: 'didn’t get up to much',
        full: 'did not do very much',
        meaning: 'A natural way to say the weekend was quiet.',
      },
      {
        heard: 'we’d better head in',
        full: 'we should go inside now',
        meaning: 'Suggests it is time to leave or move somewhere.',
      },
    ],
    question: {
      prompt: 'Why do Maya and Sam need to go inside?',
      options: ['It is raining', 'Their meeting is starting', 'They need coffee'],
      correctIndex: 1,
    },
  },
  {
    id: 'bakery-morning',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'At the bakery',
    context: 'A quick order before work',
    level: 'A2',
    duration: '45 sec',
    accent: 'Everyday German',
    icon: 'food-croissant',
    lines: [
      {
        speaker: 'Verkäuferin',
        text: 'Morgen! Was darf’s sein?',
        translation: 'Morning! What can I get you?',
      },
      {
        speaker: 'Kundin',
        text: 'Zwei normale Brötchen, bitte.',
        translation: 'Two regular bread rolls, please.',
      },
      { speaker: 'Verkäuferin', text: 'Sonst noch was?', translation: 'Anything else?' },
      {
        speaker: 'Kundin',
        text: 'Nee, das war’s. Kann ich mit Karte zahlen?',
        translation: 'No, that’s it. Can I pay by card?',
      },
      {
        speaker: 'Verkäuferin',
        text: 'Klar, einfach hier dranhalten.',
        translation: 'Sure, just tap it here.',
      },
    ],
    phrases: [
      { heard: 'Morgen!', full: 'Guten Morgen!', meaning: 'The everyday shortened greeting.' },
      {
        heard: 'Sonst noch was?',
        full: 'Möchten Sie sonst noch etwas?',
        meaning: 'A natural, less formal “anything else?”',
      },
      {
        heard: 'Nee, das war’s.',
        full: 'Nein, das war alles.',
        meaning: 'Common spoken German for “no, that’s it.”',
      },
    ],
    question: {
      prompt: 'What does the cashier tell you to do?',
      options: ['Insert the card', 'Tap the card here', 'Pay at another counter'],
      correctIndex: 1,
    },
  },
  {
    id: 'train-delay',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'Train announcement',
    context: 'Your platform changes suddenly',
    level: 'B1',
    duration: '35 sec',
    accent: 'Station audio',
    icon: 'train',
    lines: [
      {
        speaker: 'Ansage',
        text: 'Achtung auf Gleis sieben.',
        translation: 'Attention on platform seven.',
      },
      {
        speaker: 'Ansage',
        text: 'Der Regionalexpress nach Köln hat heute circa zehn Minuten Verspätung.',
        translation: 'The regional express to Cologne is about ten minutes late today.',
      },
      {
        speaker: 'Ansage',
        text: 'Die Abfahrt erfolgt abweichend von Gleis neun.',
        translation: 'The train will depart from platform nine instead.',
      },
    ],
    phrases: [
      {
        heard: 'circa zehn Minuten',
        full: 'ungefähr zehn Minuten',
        meaning: 'Approximately ten minutes.',
      },
      {
        heard: 'abweichend von',
        full: 'anders als geplant',
        meaning: 'Different from what was scheduled.',
      },
      {
        heard: 'erfolgt von Gleis neun',
        full: 'findet auf Gleis neun statt',
        meaning: 'Formal announcement language for “will be from platform nine.”',
      },
    ],
    question: {
      prompt: 'Where will the train now leave from?',
      options: ['Platform 7', 'Platform 9', 'Platform 10'],
      correctIndex: 1,
    },
  },
  {
    id: 'landlord-call',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'Call from a landlord',
    context: 'A fast voicemail about a flat',
    level: 'B1',
    duration: '50 sec',
    accent: 'Casual phone speech',
    icon: 'home-city-outline',
    lines: [
      {
        speaker: 'Vermieter',
        text: 'Hallo, ich meld mich wegen der Wohnung.',
        translation: 'Hello, I’m getting in touch about the flat.',
      },
      {
        speaker: 'Vermieter',
        text: 'Die wär ab nächstem Monat frei.',
        translation: 'It would be available from next month.',
      },
      {
        speaker: 'Vermieter',
        text: 'Wenn Sie noch Interesse haben, rufen Sie mich einfach kurz zurück.',
        translation: 'If you’re still interested, just give me a quick call back.',
      },
    ],
    phrases: [
      {
        heard: 'ich meld mich',
        full: 'ich melde mich',
        meaning: 'The final “e” is often dropped in casual speech.',
      },
      {
        heard: 'die wär frei',
        full: 'die Wohnung wäre frei',
        meaning: 'The subject and ending are shortened when context is clear.',
      },
      {
        heard: 'einfach kurz zurückrufen',
        full: 'bitte kurz zurückrufen',
        meaning: '“Einfach” softens a casual request here.',
      },
    ],
    question: {
      prompt: 'When is the flat available?',
      options: ['Immediately', 'Next month', 'In three months'],
      correctIndex: 1,
    },
  },
];

export function getScenarios(track: LanguageTrack) {
  return listeningScenarios.filter((scenario) => scenario.track === track);
}

export function getScenario(id?: string) {
  return listeningScenarios.find((scenario) => scenario.id === id) ?? listeningScenarios[0];
}
