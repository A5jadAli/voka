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
  level: 'A1' | 'A2' | 'B1' | 'B2';
  duration: string;
  accent: string;
  icon:
    | 'account-group-outline'
    | 'basket-outline'
    | 'book-open-variant'
    | 'school-outline'
    | 'coffee-outline'
    | 'food-croissant'
    | 'home-city-outline'
    | 'office-building-outline'
    | 'phone-outline'
    | 'podcast'
    | 'stethoscope'
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
        text: 'Fair enough. We’d better head in. The stand-up’s about to start.',
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
    id: 'ielts-booking',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'Booking a course by phone',
    context: 'Form-filling with a corrected detail, as in IELTS Listening Part 1',
    level: 'B1',
    duration: '45 sec',
    accent: 'British phone call',
    icon: 'phone-outline',
    lines: [
      {
        speaker: 'Receptionist',
        text: 'Good morning, Riverside Language Centre. How can I help?',
        translation: 'A standard phone greeting from a business.',
      },
      {
        speaker: 'Caller',
        text: 'Hi, I’d like to book the evening conversation course, please.',
        translation: 'I want to book the evening course.',
      },
      {
        speaker: 'Receptionist',
        text: 'Lovely. Can I take your surname?',
        translation: 'Great. What is your family name?',
      },
      {
        speaker: 'Caller',
        text: 'It’s Okafor. O, K, A, F, O, R.',
        translation: 'My surname is Okafor, spelled O-K-A-F-O-R.',
      },
      {
        speaker: 'Receptionist',
        text: 'Thanks. The course starts on the fourteenth. Sorry, no, the sixteenth of October, and it’s forty pounds.',
        translation: 'The course starts on 16 October and costs £40.',
      },
    ],
    phrases: [
      {
        heard: 'Can I take your surname?',
        full: 'What is your surname?',
        meaning: 'A polite service phrase for asking for details.',
      },
      {
        heard: 'Sorry, no, the sixteenth',
        full: 'a self-correction',
        meaning: 'The corrected detail is the answer; the first one is a distractor.',
      },
      {
        heard: 'forty',
        full: '40, not 14',
        meaning: 'Tens stress the first syllable (FORty); teens stress the end (fourTEEN).',
      },
    ],
    question: {
      prompt: 'When does the course start?',
      options: ['14 October', '16 October', '6 October'],
      correctIndex: 1,
    },
  },
  {
    id: 'flatmates-en',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'Sorting out the bills',
    context: 'Flatmates split the energy bill',
    level: 'B1',
    duration: '35 sec',
    accent: 'Casual British speech',
    icon: 'home-city-outline',
    lines: [
      {
        speaker: 'Priya',
        text: 'Hey, have you got a sec? The energy bill’s come in.',
        translation: 'Do you have a moment? The energy bill has arrived.',
      },
      { speaker: 'Tom', text: 'Go on, how bad is it?', translation: 'Tell me, is it expensive?' },
      {
        speaker: 'Priya',
        text: 'Not as bad as I thought, to be fair. About sixty quid each.',
        translation: 'Honestly, it is less than I expected: about £60 each.',
      },
      {
        speaker: 'Tom',
        text: 'Fair enough. I’ll sort it out tonight, if that’s all right.',
        translation: 'OK. I will pay it tonight, if that is OK.',
      },
    ],
    phrases: [
      {
        heard: 'have you got a sec?',
        full: 'do you have a second?',
        meaning: 'A casual way to ask for a moment of someone’s time.',
      },
      { heard: 'quid', full: 'pounds', meaning: 'Informal British word for pounds (£).' },
      {
        heard: 'to be fair',
        full: 'honestly / in fairness',
        meaning: 'Softens or balances what you are saying.',
      },
    ],
    question: {
      prompt: 'How much does each person pay?',
      options: ['About £16', 'About £60', 'About £600'],
      correctIndex: 1,
    },
  },
  {
    id: 'podcast-opinion',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'A podcast debate',
    context: 'Two hosts discuss the four-day working week',
    level: 'B2',
    duration: '45 sec',
    accent: 'Contemporary podcast English',
    icon: 'podcast',
    lines: [
      {
        speaker: 'Host A',
        text: 'So, the four-day week. Game changer or overhyped?',
        translation: 'Is the four-day week transformative, or exaggerated?',
      },
      {
        speaker: 'Host B',
        text: 'Honestly? It’s a game changer for some industries, but I wouldn’t go so far as to say it works everywhere.',
        translation: 'It is transformative for some industries, but not for all.',
      },
      {
        speaker: 'Host A',
        text: 'Right, like hospitals can’t just close on Fridays.',
        translation: 'For example, hospitals cannot simply close one day a week.',
      },
      {
        speaker: 'Host B',
        text: 'Exactly. Having said that, the trials we’ve seen so far are pretty promising.',
        translation: 'However, the results of the trials so far look good.',
      },
    ],
    phrases: [
      {
        heard: 'game changer',
        full: 'something that transforms a situation',
        meaning: 'A modern, widely used idiom.',
      },
      {
        heard: 'overhyped',
        full: 'praised more than it deserves',
        meaning: 'Common in tech and media conversation.',
      },
      {
        heard: 'I wouldn’t go so far as to say …',
        full: 'I don’t fully agree that …',
        meaning: 'Politely limits an extreme claim.',
      },
    ],
    question: {
      prompt: 'What is Host B’s view?',
      options: [
        'Useful in some industries, not everywhere',
        'It works for every job',
        'A complete failure',
      ],
      correctIndex: 0,
    },
  },
  {
    id: 'doctor-en',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'At the GP',
    context: 'Checking in for an appointment',
    level: 'A2',
    duration: '30 sec',
    accent: 'Everyday British English',
    icon: 'stethoscope',
    lines: [
      {
        speaker: 'Receptionist',
        text: 'Morning! Have you got an appointment?',
        translation: 'Good morning. Do you have an appointment?',
      },
      {
        speaker: 'Patient',
        text: 'Yes, at ten past nine. It’s under Ahmed.',
        translation: 'Yes, at 9:10, booked in the name Ahmed.',
      },
      {
        speaker: 'Receptionist',
        text: 'Lovely, take a seat. The doctor’s running about ten minutes behind.',
        translation: 'Great, please sit down. The doctor is about ten minutes late.',
      },
      {
        speaker: 'Patient',
        text: 'No worries. Is there any water?',
        translation: 'That’s fine. Is there any water?',
      },
      {
        speaker: 'Receptionist',
        text: 'There’s a machine just by the door.',
        translation: 'There is a water machine next to the door.',
      },
    ],
    phrases: [
      {
        heard: 'It’s under Ahmed',
        full: 'It is booked in the name Ahmed',
        meaning: 'A common way to give the name on a booking.',
      },
      { heard: 'running … behind', full: 'late', meaning: 'Behind schedule.' },
      { heard: 'take a seat', full: 'please sit down', meaning: 'A polite instruction.' },
    ],
    question: {
      prompt: 'How late is the doctor?',
      options: ['About 10 minutes', 'About 30 minutes', 'On time'],
      correctIndex: 0,
    },
  },
  {
    id: 'job-chat-en',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'How’s the new job?',
    context: 'Two friends catch up about work',
    level: 'B1',
    duration: '35 sec',
    accent: 'Casual British speech',
    icon: 'office-building-outline',
    lines: [
      { speaker: 'Leah', text: 'So how’s the new job going?', translation: 'How is the new job?' },
      {
        speaker: 'Ravi',
        text: 'Honestly? It’s a bit full-on, but I’m enjoying it.',
        translation: 'It is very intense, but I like it.',
      },
      { speaker: 'Leah', text: 'Full-on how?', translation: 'In what way is it intense?' },
      {
        speaker: 'Ravi',
        text: 'Loads of meetings, and I’m still getting my head round all the systems.',
        translation: 'There are many meetings, and I am still learning how the systems work.',
      },
      {
        speaker: 'Leah',
        text: 'That’s normal. Give it a couple of months and it’ll all click.',
        translation: 'That is normal. In a few months you will understand everything.',
      },
    ],
    phrases: [
      { heard: 'full-on', full: 'intense, very busy', meaning: 'Informal and very common.' },
      {
        heard: 'get my head round',
        full: 'understand something complicated',
        meaning: 'Informal British English.',
      },
      {
        heard: 'it’ll click',
        full: 'you will suddenly understand',
        meaning: 'Something becomes clear.',
      },
    ],
    question: {
      prompt: 'How does Ravi feel about the job?',
      options: ['Busy but enjoying it', 'Bored', 'He wants to leave'],
      correctIndex: 0,
    },
  },
  {
    id: 'ielts-lecture',
    track: 'EN',
    language: 'en-GB',
    languageName: 'English',
    title: 'A short lecture',
    context: 'Green roofs, in the style of IELTS Listening Part 4',
    level: 'B2',
    duration: '50 sec',
    accent: 'Academic lecture',
    icon: 'school-outline',
    lines: [
      {
        speaker: 'Lecturer',
        text: 'Today I’d like to look at why some cities are putting plants and trees on rooftops.',
        translation: 'The topic is green roofs in cities.',
      },
      {
        speaker: 'Lecturer',
        text: 'The first reason is temperature. Green roofs can make buildings noticeably cooler in summer.',
        translation: 'Reason one: they keep buildings cooler.',
      },
      {
        speaker: 'Lecturer',
        text: 'Secondly, they absorb rainwater, which reduces pressure on drains during heavy storms.',
        translation: 'Reason two: they reduce the load on drains.',
      },
      {
        speaker: 'Lecturer',
        text: 'However, they’re not cheap. The roof has to be strong enough to carry the extra weight.',
        translation: 'A disadvantage: they are expensive, and the roof must be strong.',
      },
      {
        speaker: 'Lecturer',
        text: 'So for the rest of the session, we’ll compare two cities that have tried this approach.',
        translation: 'Next, two cities will be compared.',
      },
    ],
    phrases: [
      {
        heard: 'The first reason … Secondly …',
        full: 'signposting',
        meaning:
          'Lecturers signal their structure; use it to follow the argument and the questions.',
      },
      { heard: 'noticeably cooler', full: 'clearly cooler', meaning: 'A careful but clear claim.' },
      {
        heard: 'However, …',
        full: 'a contrast is coming',
        meaning: 'Exam answers often follow a contrast word.',
      },
    ],
    question: {
      prompt: 'Which disadvantage does the lecturer mention?',
      options: [
        'They are expensive and need strong roofs',
        'They make buildings hotter',
        'They increase flooding',
      ],
      correctIndex: 0,
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
  {
    id: 'arzt-termin',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'Calling the doctor',
    context: 'Getting an appointment at a busy practice',
    level: 'A2',
    duration: '45 sec',
    accent: 'Phone speech',
    icon: 'stethoscope',
    lines: [
      {
        speaker: 'Praxis',
        text: 'Praxis Doktor Yilmaz, Schneider am Apparat, guten Tag.',
        translation: 'Dr Yilmaz’s practice, Schneider speaking, hello.',
      },
      {
        speaker: 'Patient',
        text: 'Hallo, hier ist Amir Rahimi. Ich bräuchte einen Termin, ich hab seit Montag Fieber.',
        translation:
          'Hello, this is Amir Rahimi. I need an appointment; I’ve had a fever since Monday.',
      },
      {
        speaker: 'Praxis',
        text: 'Heute ist leider alles voll. Morgen um Viertel nach acht ginge noch.',
        translation:
          'Unfortunately today is fully booked. Tomorrow at quarter past eight is still free.',
      },
      {
        speaker: 'Patient',
        text: 'Viertel nach acht, das passt. Soll ich was mitbringen?',
        translation: 'Quarter past eight works. Should I bring anything?',
      },
      {
        speaker: 'Praxis',
        text: 'Ja, Ihre Versichertenkarte, bitte.',
        translation: 'Yes, your health insurance card, please.',
      },
    ],
    phrases: [
      { heard: 'am Apparat', full: 'am Telefon', meaning: '“Speaking”, when answering the phone.' },
      {
        heard: 'Ich bräuchte …',
        full: 'Ich brauche …',
        meaning: 'The Konjunktiv II form makes a need sound polite.',
      },
      { heard: 'ginge noch', full: 'wäre noch möglich', meaning: 'Would still be possible.' },
    ],
    question: {
      prompt: 'When is the appointment?',
      options: ['Today at 8:15', 'Tomorrow at 8:15', 'Tomorrow at 7:45'],
      correctIndex: 1,
    },
  },
  {
    id: 'wg-kueche',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'Flatmates in the kitchen',
    context: 'A casual chat full of particles and short forms',
    level: 'B1',
    duration: '40 sec',
    accent: 'Casual young speech',
    icon: 'account-group-outline',
    lines: [
      {
        speaker: 'Lena',
        text: 'Na, haste Hunger? Ich mach grad Nudeln.',
        translation: 'Hey, are you hungry? I’m just making pasta.',
      },
      {
        speaker: 'Jonas',
        text: 'Oh, echt? Da sag ich nicht nein. Soll ich was helfen?',
        translation: 'Oh, really? I won’t say no. Can I help with something?',
      },
      {
        speaker: 'Lena',
        text: 'Kannste mal die Zwiebeln schneiden? Die liegen da hinten.',
        translation: 'Could you chop the onions? They’re over there.',
      },
      {
        speaker: 'Jonas',
        text: 'Klar. Ach, und denk dran, morgen ist Mülltag.',
        translation: 'Sure. Oh, and remember, tomorrow is bin day.',
      },
      {
        speaker: 'Lena',
        text: 'Ja, ja, ich weiß. Ich bring ihn nachher raus.',
        translation: 'Yes, yes, I know. I’ll take it out later.',
      },
    ],
    phrases: [
      { heard: 'haste, kannste', full: 'hast du, kannst du', meaning: 'Du merges into the verb.' },
      {
        heard: 'Ich mach grad …',
        full: 'Ich mache gerade …',
        meaning: 'I’m just in the middle of …',
      },
      {
        heard: 'Da sag ich nicht nein.',
        full: 'Das nehme ich gern an.',
        meaning: 'A warm, casual yes.',
      },
    ],
    question: {
      prompt: 'What does Jonas remind Lena about?',
      options: ['Tomorrow is bin day', 'Buying onions', 'Paying the rent'],
      correctIndex: 0,
    },
  },
  {
    id: 'feierabend-chat',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'After-work plans',
    context: 'Colleagues chat as they leave the office',
    level: 'B1',
    duration: '35 sec',
    accent: 'Workplace small talk',
    icon: 'office-building-outline',
    lines: [
      {
        speaker: 'Aylin',
        text: 'So, Feierabend! Hast du heute noch was vor?',
        translation: 'Right, work’s over! Any plans for tonight?',
      },
      {
        speaker: 'Tim',
        text: 'Nicht wirklich. Vielleicht geh ich noch kurz zum Sport. Und du?',
        translation: 'Not really. Maybe I’ll go to the gym for a bit. And you?',
      },
      {
        speaker: 'Aylin',
        text: 'Ein paar Leute treffen sich im Biergarten. Komm doch mit!',
        translation: 'A few people are meeting at the beer garden. Why don’t you come along?',
      },
      {
        speaker: 'Tim',
        text: 'Hm, eigentlich wollte ich früh ins Bett. Na gut, auf ein Bier.',
        translation: 'Hmm, I actually wanted an early night. Oh, all right, for one beer.',
      },
    ],
    phrases: [
      {
        heard: 'Hast du noch was vor?',
        full: 'Hast du noch etwas geplant?',
        meaning: 'Do you have any plans for later?',
      },
      {
        heard: 'Komm doch mit!',
        full: 'Komm bitte mit!',
        meaning: 'Doch makes it a friendly nudge.',
      },
      { heard: 'Na gut', full: 'Also gut', meaning: 'Reluctant agreement: oh, all right.' },
    ],
    question: {
      prompt: 'What does Tim decide?',
      options: ['To join for one drink', 'To go to the gym', 'To go straight to bed'],
      correctIndex: 0,
    },
  },
  {
    id: 'erster-tag',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'My first day at the course',
    context: 'A slow, simple story',
    level: 'A1',
    duration: '40 sec',
    accent: 'Clear, slow German',
    icon: 'book-open-variant',
    lines: [
      {
        speaker: 'Maria',
        text: 'Hallo! Ich heiße Maria und ich komme aus Brasilien.',
        translation: 'Hello! My name is Maria and I come from Brazil.',
      },
      {
        speaker: 'Maria',
        text: 'Ich wohne jetzt in Leipzig.',
        translation: 'I live in Leipzig now.',
      },
      {
        speaker: 'Maria',
        text: 'Heute ist mein erster Tag im Deutschkurs.',
        translation: 'Today is my first day in the German course.',
      },
      {
        speaker: 'Maria',
        text: 'Der Kurs beginnt um neun Uhr.',
        translation: 'The course starts at nine o’clock.',
      },
      {
        speaker: 'Maria',
        text: 'Im Kurs sind zwölf Leute. Die Lehrerin heißt Frau Schulz.',
        translation: 'There are twelve people in the course. The teacher is called Frau Schulz.',
      },
      {
        speaker: 'Maria',
        text: 'Sie spricht langsam und ist sehr nett.',
        translation: 'She speaks slowly and is very nice.',
      },
    ],
    phrases: [
      { heard: 'Ich wohne jetzt in …', full: 'I live in … now', meaning: 'Jetzt means now.' },
      { heard: 'beginnt um neun Uhr', full: 'fängt um neun Uhr an', meaning: 'Starts at nine.' },
      {
        heard: 'Die Lehrerin heißt …',
        full: 'Der Name der Lehrerin ist …',
        meaning: 'The teacher is called …',
      },
    ],
    question: {
      prompt: 'How many people are in the course?',
      options: ['Nine', 'Twelve', 'Two'],
      correctIndex: 1,
    },
  },
  {
    id: 'markt',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'At the market',
    context: 'Buying fruit and vegetables',
    level: 'A1',
    duration: '35 sec',
    accent: 'Everyday German',
    icon: 'basket-outline',
    lines: [
      {
        speaker: 'Verkäufer',
        text: 'Guten Tag! Was möchten Sie?',
        translation: 'Hello! What would you like?',
      },
      {
        speaker: 'Kundin',
        text: 'Ich hätte gern ein Kilo Tomaten, bitte.',
        translation: 'I would like a kilo of tomatoes, please.',
      },
      {
        speaker: 'Verkäufer',
        text: 'Gern. Sonst noch etwas?',
        translation: 'Sure. Anything else?',
      },
      {
        speaker: 'Kundin',
        text: 'Ja, drei Äpfel. Was kostet das zusammen?',
        translation: 'Yes, three apples. How much is that altogether?',
      },
      {
        speaker: 'Verkäufer',
        text: 'Das macht vier Euro zwanzig.',
        translation: 'That comes to four euros twenty.',
      },
      {
        speaker: 'Kundin',
        text: 'Hier, bitte. Danke und tschüss!',
        translation: 'Here you are. Thanks, bye!',
      },
    ],
    phrases: [
      { heard: 'Sonst noch etwas?', full: 'Möchten Sie noch etwas?', meaning: 'Anything else?' },
      {
        heard: 'Was kostet das zusammen?',
        full: 'Wie viel kostet alles?',
        meaning: 'How much is it altogether?',
      },
      { heard: 'Das macht …', full: 'Das kostet …', meaning: 'That comes to …' },
    ],
    question: {
      prompt: 'How much does the customer pay?',
      options: ['€4.20', '€2.40', '€14.20'],
      correctIndex: 0,
    },
  },
  {
    id: 'wochenende-tom',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'Tom’s weekend',
    context: 'A short story about a weekend routine',
    level: 'A1',
    duration: '40 sec',
    accent: 'Clear, slow German',
    icon: 'home-city-outline',
    lines: [
      {
        speaker: 'Tom',
        text: 'Am Samstag schlafe ich lange.',
        translation: 'On Saturday I sleep in.',
      },
      {
        speaker: 'Tom',
        text: 'Dann frühstücke ich mit meiner Freundin.',
        translation: 'Then I have breakfast with my girlfriend.',
      },
      {
        speaker: 'Tom',
        text: 'Am Nachmittag spielen wir Tennis.',
        translation: 'In the afternoon we play tennis.',
      },
      {
        speaker: 'Tom',
        text: 'Am Sonntag besuche ich meine Eltern. Sie wohnen in Hamburg.',
        translation: 'On Sunday I visit my parents. They live in Hamburg.',
      },
      {
        speaker: 'Tom',
        text: 'Am Abend koche ich und lese ein Buch.',
        translation: 'In the evening I cook and read a book.',
      },
    ],
    phrases: [
      {
        heard: 'Am Samstag schlafe ich …',
        full: 'Samstags schlafe ich …',
        meaning: 'Time first, then the verb.',
      },
      {
        heard: 'mit meiner Freundin',
        full: 'with my girlfriend',
        meaning: 'Meine Freundin usually means girlfriend.',
      },
      {
        heard: 'Sie wohnen in …',
        full: 'They live in …',
        meaning: 'Sie with a plural verb means they.',
      },
    ],
    question: {
      prompt: 'What does Tom do on Sunday?',
      options: ['He plays tennis', 'He visits his parents', 'He sleeps in'],
      correctIndex: 1,
    },
  },
  {
    id: 'arbeitsweg',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'A chaotic morning',
    context: 'Someone explains why they were late',
    level: 'A2',
    duration: '40 sec',
    accent: 'Everyday German',
    icon: 'train',
    lines: [
      {
        speaker: 'Sara',
        text: 'Heute Morgen war alles chaotisch.',
        translation: 'This morning everything was chaotic.',
      },
      {
        speaker: 'Sara',
        text: 'Mein Wecker hat nicht geklingelt, und ich bin zu spät aufgestanden.',
        translation: 'My alarm didn’t go off, and I got up too late.',
      },
      {
        speaker: 'Sara',
        text: 'Dann ist auch noch die S-Bahn ausgefallen.',
        translation: 'Then the S-Bahn was cancelled as well.',
      },
      {
        speaker: 'Sara',
        text: 'Ich habe meinem Chef geschrieben, dass ich später komme.',
        translation: 'I messaged my boss that I would be late.',
      },
      {
        speaker: 'Sara',
        text: 'Zum Glück hat er gesagt: „Kein Problem, das passiert.“',
        translation: 'Luckily he said: “No problem, it happens.”',
      },
    ],
    phrases: [
      { heard: 'ist ausgefallen', full: 'fuhr nicht', meaning: 'Was cancelled.' },
      { heard: 'auch noch', full: 'zusätzlich', meaning: 'On top of that.' },
      { heard: 'Zum Glück', full: 'Glücklicherweise', meaning: 'Luckily.' },
    ],
    question: {
      prompt: 'What happened to the S-Bahn?',
      options: ['It was cancelled', 'It was early', 'It was full'],
      correctIndex: 0,
    },
  },
  {
    id: 'nachbarin',
    track: 'DE',
    language: 'de-DE',
    languageName: 'German',
    title: 'A neighbour at the door',
    context: 'A polite complaint about noise',
    level: 'B1',
    duration: '45 sec',
    accent: 'Polite everyday German',
    icon: 'home-city-outline',
    lines: [
      {
        speaker: 'Nachbarin',
        text: 'Entschuldigen Sie die Störung. Ich wohne direkt unter Ihnen.',
        translation: 'Sorry to bother you. I live right below you.',
      },
      {
        speaker: 'Mieter',
        text: 'Ah, hallo! Ist etwas passiert?',
        translation: 'Oh, hello! Has something happened?',
      },
      {
        speaker: 'Nachbarin',
        text: 'Es ist nur so, dass es abends oft ziemlich laut ist. Ich muss morgens sehr früh aufstehen.',
        translation:
          'It’s just that it is often quite loud in the evenings. I have to get up very early.',
      },
      {
        speaker: 'Mieter',
        text: 'Oh, das tut mir leid, das war mir nicht bewusst. Wir achten ab jetzt darauf.',
        translation: 'Oh, I’m sorry, I wasn’t aware. We’ll be careful from now on.',
      },
      {
        speaker: 'Nachbarin',
        text: 'Das wäre sehr nett. Vielen Dank für Ihr Verständnis!',
        translation: 'That would be very kind. Thank you for understanding!',
      },
    ],
    phrases: [
      {
        heard: 'Entschuldigen Sie die Störung.',
        full: 'Sorry, dass ich störe.',
        meaning: 'Sorry to bother you.',
      },
      {
        heard: 'Es ist nur so, dass …',
        full: 'Das Problem ist, dass …',
        meaning: 'A soft way to start a complaint.',
      },
      {
        heard: 'das war mir nicht bewusst',
        full: 'das wusste ich nicht',
        meaning: 'I wasn’t aware of that.',
      },
    ],
    question: {
      prompt: 'Why is the neighbour at the door?',
      options: ['It is often loud in the evenings', 'She needs a parcel', 'She is moving out'],
      correctIndex: 0,
    },
  },
];

const levelOrder = ['A1', 'A2', 'B1', 'B2'];

export function getScenarios(track: LanguageTrack) {
  return listeningScenarios
    .filter((scenario) => scenario.track === track)
    .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
}

export function getScenario(id?: string) {
  return listeningScenarios.find((scenario) => scenario.id === id) ?? listeningScenarios[0];
}
