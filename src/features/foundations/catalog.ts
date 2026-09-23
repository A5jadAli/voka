import { practicalGermanLessons } from './practical-lessons';

export type FoundationLesson = {
  level?: 'A1' | 'A2' | 'B1';
  reading?: { german: string; english: string };
  id: string;
  title: string;
  outcome: string;
  phrases: { german: string; english: string; use: string }[];
  notice: string;
  checks: { prompt: string; options: string[]; answer: number; explanation: string }[];
  writing: { prompt: string; accepted: string[]; hint: string; explanation: string };
  speaking: string;
};

// Original short lessons. This introductory sequence is not a complete A1 course.
export const foundationLessons: FoundationLesson[] = [
  {
    id: 'greetings',
    title: 'Hello, please and thank you',
    outcome: 'Greet someone and use three everyday polite expressions.',
    phrases: [
      {
        german: 'Hallo!',
        english: 'Hello!',
        use: 'A common greeting with people you know and in many everyday situations.',
      },
      {
        german: 'Guten Tag!',
        english: 'Hello! / Good day!',
        use: 'A polite daytime greeting, useful at a reception desk or in a shop.',
      },
      {
        german: 'Bitte.',
        english: 'Please. / You are welcome.',
        use: 'With a request it means please. After someone thanks you, it can mean you are welcome.',
      },
      {
        german: 'Danke.',
        english: 'Thank you.',
        use: 'Use it when someone helps you or gives you something.',
      },
      {
        german: 'Auf Wiedersehen!',
        english: 'Goodbye!',
        use: 'A polite goodbye. Tschüss is a more informal goodbye.',
      },
    ],
    notice:
      'German nouns start with a capital letter: Tag means day. Listen to the whole phrase before repeating it. You do not need to know every grammar rule yet.',
    checks: [
      {
        prompt:
          'You arrive at a reception desk during the day. Which phrase greets the receptionist?',
        options: ['Auf Wiedersehen!', 'Guten Tag!', 'Danke.'],
        answer: 1,
        explanation:
          'Guten Tag greets someone. Auf Wiedersehen is for leaving, and Danke thanks someone.',
      },
      {
        prompt: 'Someone says Danke after you help them. What is a natural reply?',
        options: ['Bitte.', 'Guten Tag!', 'Hallo!'],
        answer: 0,
        explanation:
          'Bitte can mean you are welcome when it answers Danke. Its meaning depends on the situation.',
      },
    ],
    writing: {
      prompt: 'Write the single German word for “Thank you”.',
      accepted: ['Danke', 'Danke schön', 'Dankeschön', 'Vielen Dank'],
      hint: 'It begins with D. Look back at the polite expressions if you need help.',
      explanation: 'Danke is the short everyday expression. Vielen Dank means thank you very much.',
    },
    speaking:
      'Imagine entering a shop. Say Guten Tag. Someone helps you, so say Danke. When you leave, say Auf Wiedersehen.',
  },
  {
    id: 'introductions',
    title: 'Say your name',
    outcome: 'Introduce yourself and recognise a polite question about your name.',
    phrases: [
      {
        german: 'Ich heiße Sara.',
        english: 'My name is Sara.',
        use: 'Replace Sara with your own name. Ich means I; heiße means am called.',
      },
      {
        german: 'Wie heißen Sie?',
        english: 'What is your name? (polite)',
        use: 'Use this polite form with an adult you do not know, such as at an appointment.',
      },
      {
        german: 'Wie heißt du?',
        english: 'What is your name? (informal)',
        use: 'Use du with friends, children, or someone who has agreed to use this familiar form.',
      },
      {
        german: 'Freut mich.',
        english: 'Nice to meet you.',
        use: 'A short friendly response after an introduction.',
      },
    ],
    notice:
      'Sie is the polite form of you and keeps its capital S. Du is informal. The letter ß sounds like an s, not a b. If your keyboard has no ß, type ss in these exercises.',
    checks: [
      {
        prompt: 'At an appointment, someone asks Wie heißen Sie? What do they want to know?',
        options: ['Your address', 'Your name', 'The time'],
        answer: 1,
        explanation:
          'Wie heißen Sie? asks your name politely. You can answer Ich heiße followed by your name.',
      },
      {
        prompt: 'Which question uses the familiar form of you?',
        options: ['Wie heißen Sie?', 'Freut mich.', 'Wie heißt du?'],
        answer: 2,
        explanation:
          'Du is the familiar form of you. Sie is the polite form. Freut mich means nice to meet you.',
      },
    ],
    writing: {
      prompt: 'Introduce the example person Sara. Write “My name is Sara” in German.',
      accepted: ['Ich heiße Sara', 'Mein Name ist Sara'],
      hint: 'Use Ich + heiße + Sara. You can type heisse if ß is unavailable.',
      explanation:
        'Ich heiße Sara follows the pattern I + am called + name. Mein Name ist Sara is another correct introduction.',
    },
    speaking:
      'Say Hallo, ich heiße followed by your own name. Then say Freut mich. Finally, practise asking Wie heißen Sie?',
  },
  {
    id: 'ask-for-help',
    title: 'Ask someone to slow down',
    outcome: 'Say that you do not understand and ask for slower speech or repetition.',
    phrases: [
      {
        german: 'Entschuldigung.',
        english: 'Excuse me. / Sorry.',
        use: 'Politely get someone’s attention before asking for help.',
      },
      {
        german: 'Ich verstehe nicht.',
        english: 'I do not understand.',
        use: 'A useful complete sentence when you cannot follow what someone says.',
      },
      {
        german: 'Bitte sprechen Sie langsam.',
        english: 'Please speak slowly.',
        use: 'This is a polite request to an adult you do not know.',
      },
      {
        german: 'Noch einmal, bitte.',
        english: 'Once again, please.',
        use: 'Ask someone to repeat what they just said.',
      },
      {
        german: 'Sprechen Sie Englisch?',
        english: 'Do you speak English?',
        use: 'A possible backup when you need more help than your German allows.',
      },
    ],
    notice:
      'Nicht makes this statement negative: Ich verstehe means I understand; Ich verstehe nicht means I do not understand. Asking for repetition is a normal part of learning.',
    checks: [
      {
        prompt: 'Someone is speaking too quickly. Which phrase asks them to slow down?',
        options: ['Freut mich.', 'Bitte sprechen Sie langsam.', 'Auf Wiedersehen!'],
        answer: 1,
        explanation:
          'Langsam means slowly. Bitte sprechen Sie langsam asks for slower speech politely.',
      },
      {
        prompt: 'What does Ich verstehe nicht tell the other person?',
        options: ['I do not understand.', 'My name is Sara.', 'I speak English.'],
        answer: 0,
        explanation: 'Verstehe means understand here. Nicht makes the sentence negative.',
      },
    ],
    writing: {
      prompt: 'Write the short phrase “Once again, please” in German.',
      accepted: ['Noch einmal bitte', 'Bitte noch einmal', 'Noch mal bitte', 'Nochmal bitte'],
      hint: 'Start with Noch einmal and add bitte. Punctuation is optional in this exercise.',
      explanation:
        'Noch einmal, bitte asks for a repetition. You may also hear the shorter Noch mal, bitte.',
    },
    speaking:
      'Imagine a receptionist speaks too quickly. Say Entschuldigung. Ich verstehe nicht. Bitte sprechen Sie langsam. Then practise Noch einmal, bitte.',
  },
  ...practicalGermanLessons,
];

export function normaliseFoundationAnswer(value: string) {
  return value
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ß/g, 'ss')
    .replace(/[.,!?;:„“"]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkFoundationWriting(lesson: FoundationLesson, value: string) {
  const answer = normaliseFoundationAnswer(value);
  return lesson.writing.accepted.some((item) => normaliseFoundationAnswer(item) === answer);
}
