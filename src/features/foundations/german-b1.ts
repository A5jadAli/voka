import { defineLessons } from './types';

// Original B1 lessons. Level labels describe task difficulty, not a certified level.
export const germanB1Lessons = defineLessons('DE', [
  {
    id: 'opinions',
    level: 'B1',
    title: 'Give an opinion with a reason',
    outcome: 'Compare options and support a preference using weil and obwohl.',
    phrases: [
      [
        'Ich finde öffentliche Verkehrsmittel praktisch.',
        'I find public transport practical.',
        'State a view clearly before explaining it.',
      ],
      [
        'Ich fahre mit dem Zug, weil es bequem ist.',
        'I travel by train because it is comfortable.',
        'In the weil clause, ist goes at the end.',
      ],
      [
        'Obwohl es regnet, gehe ich zu Fuß.',
        'Although it is raining, I am walking.',
        'The contrast is introduced by obwohl.',
      ],
      [
        'Andererseits ist das Auto manchmal schneller.',
        'On the other hand, the car is sometimes faster.',
        'Add another side to your argument.',
      ],
      [
        'Das lohnt sich nicht.',
        'It is not worth it.',
        'Very common in everyday discussions about time and money.',
      ],
    ],
    notice:
      'Weil introduces a reason and obwohl a contrast. In these clauses the conjugated verb goes last. After an opening subordinate clause, the main clause begins with its verb: Obwohl es regnet, gehe ich …',
    pronunciation:
      'Put the main stress on your opinion word: Ich finde das PRAKtisch. A falling end sounds sure of yourself.',
    reading: [
      'Jana fährt meistens mit dem Zug, weil sie unterwegs lesen kann. Ihr Kollege nimmt das Auto, obwohl Parkplätze teuer sind. Jana findet den Zug entspannter, aber bei einem Streik fährt sie mit dem Bus.',
      'Jana usually takes the train because she can read on the way. Her colleague drives although parking is expensive. Jana finds the train more relaxing, but during a strike she takes the bus.',
    ],
    checks: [
      {
        prompt: 'Which ending correctly completes: weil es bequem ___?',
        options: ['ist', 'es', 'bequem'],
        answer: 0,
        explanation: 'The conjugated verb ist belongs at the end of this weil clause.',
      },
      {
        prompt: 'What is Jana’s stated reason for usually taking the train?',
        options: ['Free parking', 'She can read on the way', 'There are never strikes'],
        answer: 1,
        explanation:
          'The text says weil sie unterwegs lesen kann. It does not say the train is always reliable.',
      },
      {
        prompt: 'Listen. What does the speaker think?',
        audio: 'Ehrlich gesagt lohnt sich das Auto in der Stadt nicht, obwohl es bequem ist.',
        options: [
          'A car in the city is not worth it, although it is comfortable',
          'A car is essential in the city',
          'Public transport is uncomfortable',
        ],
        answer: 0,
        explanation:
          'You heard “lohnt sich … nicht, obwohl es bequem ist”: not worth it, although comfortable.',
      },
    ],
    writing: {
      prompt: 'Write in German: “I travel by train because it is comfortable.”',
      accepted: [
        'Ich fahre mit dem Zug weil es bequem ist',
        'Ich fahre mit dem Zug weil das bequem ist',
        'Ich fahre Zug weil es bequem ist',
        'Ich fahre Zug weil das bequem ist',
      ],
      hint: 'Start with Ich fahre mit dem Zug, weil … and put ist last.',
      explanation: 'The main clause has normal word order; the weil clause ends with ist.',
    },
    speaking:
      'Compare two ways of travelling. Give your preference, one reason and one disadvantage. Use one weil clause and one sentence with andererseits.',
  },
  {
    id: 'discussion',
    level: 'B1',
    title: 'Agree, disagree and get a word in',
    outcome: 'Join a discussion, agree partly, disagree politely and take your turn.',
    phrases: [
      [
        'Da hast du recht.',
        'You are right about that.',
        'Full agreement. Polite form: Da haben Sie recht.',
      ],
      ['Stimmt, aber …', 'True, but …', 'Partial agreement, the most natural way to disagree.'],
      [
        'Das sehe ich ein bisschen anders.',
        'I see that a bit differently.',
        'Polite disagreement.',
      ],
      [
        'Darf ich kurz was dazu sagen?',
        'May I say something about that?',
        'Take your turn politely. Was means etwas in speech.',
      ],
      [
        'Einerseits …, andererseits …',
        'On the one hand …, on the other hand …',
        'Weigh both sides.',
      ],
      [
        'Wie meinst du das genau?',
        'What exactly do you mean?',
        'Ask for clarification instead of guessing.',
      ],
    ],
    notice:
      'German discussions can feel direct: Das stimmt nicht is often just disagreement about facts, not rudeness. You can be equally direct, but eigentlich, ein bisschen or ich finde keep it friendly. A short Darf ich kurz …? is an accepted way to interrupt.',
    pronunciation: 'Stress the contrast word: Das sehe ICH anders. STIMMT, aber …',
    checks: [
      {
        prompt: 'Which phrase agrees only partly?',
        options: ['Da hast du recht.', 'Stimmt, aber …', 'Genau.'],
        answer: 1,
        explanation: 'Stimmt, aber … accepts one point and then adds a different view.',
      },
      {
        prompt: 'You want to join a lively discussion. What do you say?',
        options: ['Darf ich kurz was dazu sagen?', 'Sei still!', 'Wie bitte?'],
        answer: 0,
        explanation: 'Darf ich kurz was dazu sagen? is polite and normal.',
      },
      {
        prompt: 'Listen. What is the downside of the flat?',
        audio:
          'Einerseits ist die Wohnung günstig, andererseits ist sie ziemlich weit weg vom Zentrum.',
        options: ['It is far from the centre', 'It is expensive', 'It is small'],
        answer: 0,
        explanation:
          'You heard “ziemlich weit weg vom Zentrum”: quite far from the centre. Günstig means cheap.',
      },
    ],
    writing: {
      prompt: 'Write “I see that differently.” in German.',
      accepted: [
        'Ich sehe das anders',
        'Das sehe ich anders',
        'Das sehe ich ein bisschen anders',
        'Ich sehe das ein bisschen anders',
        'Das sehe ich etwas anders',
        'Ich sehe das etwas anders',
      ],
      hint: 'Das sehe ich … anders, or Ich sehe das … anders.',
      explanation: 'Both word orders are natural. Adding ein bisschen or etwas softens it.',
    },
    speaking:
      'Topic: should cities ban cars from the centre? Agree partly, disagree politely and give one argument on each side with einerseits … andererseits.',
  },
  {
    id: 'work-problem',
    level: 'B1',
    title: 'Explain a problem and suggest a solution',
    outcome: 'Tell a colleague about a delay and propose a realistic next step politely.',
    phrases: [
      [
        'Leider schaffe ich es heute nicht.',
        'Unfortunately, I cannot manage it today.',
        'Be clear about the problem without blaming anyone.',
      ],
      [
        'Könnten wir die Frist verlängern?',
        'Could we extend the deadline?',
        'A polite proposal rather than a demand.',
      ],
      [
        'Ich schlage vor, dass wir morgen sprechen.',
        'I suggest that we talk tomorrow.',
        'After dass, the verb comes last.',
      ],
      [
        'Bis Freitag kann ich den Bericht fertigstellen.',
        'I can finish the report by Friday.',
        'Bis gives a deadline.',
      ],
      [
        'Ich halte euch auf dem Laufenden.',
        'I will keep you posted.',
        'A natural, professional closing line.',
      ],
    ],
    notice:
      'Useful workplace explanations have three parts: the problem, its effect and a next step. After a modal verb such as kann, the infinitive goes to the end: kann … fertigstellen.',
    pronunciation: 'Keep deadlines clear: stress the day and slow down a little: bis FREItag.',
    reading: [
      'Der Bericht ist noch nicht fertig, weil wichtige Zahlen fehlen. Sami informiert sein Team frühzeitig. Er schlägt vor, die fertigen Abschnitte heute zu schicken und den Rest bis Freitag nachzureichen.',
      'The report is unfinished because important figures are missing. Sami informs the team early. He suggests sending the completed sections today and the rest by Friday.',
    ],
    checks: [
      {
        prompt: 'Which request is a polite proposal?',
        options: ['Könnten wir die Frist verlängern?', 'Die Zahlen fehlen.', 'Heute ist Freitag.'],
        answer: 0,
        explanation: 'Könnten wir …? invites a solution politely.',
      },
      {
        prompt: 'What will Sami send today?',
        options: ['Nothing', 'The completed sections', 'Only the missing figures'],
        answer: 1,
        explanation: 'Die fertigen Abschnitte means the completed sections. The rest comes later.',
      },
      {
        prompt: 'Listen. What does the manager say?',
        audio: 'Kein Problem, schick mir einfach bis Freitag den Rest.',
        options: ['Send the rest by Friday', 'Send everything today', 'The deadline cannot change'],
        answer: 0,
        explanation:
          'You heard “schick mir einfach bis Freitag den Rest”: just send me the rest by Friday.',
      },
    ],
    writing: {
      prompt: 'Write “Could we extend the deadline?” in German.',
      accepted: ['Könnten wir die Frist verlängern', 'Können wir die Frist verlängern'],
      hint: 'Könnten wir + die Frist + verlängern.',
      explanation: 'Könnten is polite; verlängern is the final infinitive.',
    },
    speaking:
      'Explain the missing figures without blaming a colleague. Offer what you can send today, name a new deadline and ask if the plan works.',
  },
  {
    id: 'job-talk',
    level: 'B1',
    title: 'Talk about your job and experience',
    outcome: 'Describe your job, responsibilities and experience, for example in an interview.',
    phrases: [
      [
        'Ich arbeite als Krankenpfleger.',
        'I work as a nurse.',
        'No article after als: Ich bin Ingenieurin.',
      ],
      [
        'Ich bin seit drei Jahren bei einer IT-Firma.',
        'I have been at an IT company for three years.',
        'Seit + present tense for things that are still true.',
      ],
      [
        'Zu meinen Aufgaben gehört die Kundenbetreuung.',
        'My responsibilities include customer support.',
        'A useful interview structure.',
      ],
      [
        'Ich habe Erfahrung mit Projektmanagement.',
        'I have experience in project management.',
        'Erfahrung mit / in.',
      ],
      [
        'Meine Stärke ist, dass ich gut im Team arbeite.',
        'My strength is that I work well in a team.',
        'Dass clause, verb last.',
      ],
      [
        'Wollen wir uns duzen?',
        'Shall we use du?',
        'At many workplaces people move to du quickly. The more senior person usually offers it.',
      ],
    ],
    notice:
      'English says “I have been working here for three years”; German uses the present: Ich arbeite seit drei Jahren hier. The Perfekt would suggest the job has ended. Many modern companies use du internally; banks, public offices and traditional firms often keep Sie.',
    pronunciation:
      'German compounds usually stress the first part: KUNdenbetreuung, ARbeitsplatz. Borrowed words often keep their own stress: ProJEKT, Marketing. Erfahrung stresses the middle: er-FAH-rung.',
    checks: [
      {
        prompt: 'Which sentence means “I have been living here for two years” (and still do)?',
        options: [
          'Ich habe zwei Jahre hier gewohnt.',
          'Ich wohne seit zwei Jahren hier.',
          'Ich wohnte zwei Jahre hier.',
        ],
        answer: 1,
        explanation: 'Seit + present tense: still true now.',
      },
      {
        prompt: 'Which is correct?',
        options: [
          'Ich arbeite als ein Lehrer.',
          'Ich arbeite als Lehrer.',
          'Ich arbeite wie Lehrer.',
        ],
        answer: 1,
        explanation: 'Jobs after als or sein take no article.',
      },
      {
        prompt: 'Listen. Where does the speaker work now?',
        audio: 'Vorher war ich im Vertrieb, aber seit letztem Jahr bin ich im Marketing.',
        options: ['In marketing', 'In sales', 'In HR'],
        answer: 0,
        explanation:
          'You heard “seit letztem Jahr bin ich im Marketing”. Vertrieb (sales) was before.',
      },
    ],
    writing: {
      prompt: 'Write “I have been working here for three years.”',
      accepted: [
        'Ich arbeite seit drei Jahren hier',
        'Ich arbeite hier seit drei Jahren',
        'Ich bin seit drei Jahren hier',
      ],
      hint: 'Ich arbeite + seit drei Jahren + hier (present tense).',
      explanation: 'German uses the present with seit for something still going on.',
    },
    speaking:
      'Introduce yourself as in a job interview: your current job, for how long, two responsibilities and one strength using dass.',
  },
  {
    id: 'phone-calls',
    level: 'B1',
    title: 'Make a phone call with confidence',
    outcome: 'Open, manage and close a practical phone call, including spelling and repair.',
    phrases: [
      [
        'Guten Tag, hier spricht Ali Khan.',
        'Hello, this is Ali Khan speaking.',
        'Say your full name first; Germans expect it.',
      ],
      ['Ich rufe wegen meiner Rechnung an.', 'I am calling about my bill.', 'Wegen + reason.'],
      [
        'Könnten Sie mich bitte mit Frau Weber verbinden?',
        'Could you put me through to Ms Weber, please?',
        'Verbinden means to connect.',
      ],
      [
        'Ich buchstabiere: K wie Kaufmann, H wie Heinrich.',
        'I will spell it: K as in Kaufmann, H as in Heinrich.',
        'The German spelling alphabet helps with names.',
      ],
      [
        'Könnten Sie mir das bitte per E-Mail schicken?',
        'Could you send me that by email?',
        'Get important details in writing.',
      ],
      ['Auf Wiederhören!', 'Goodbye! (on the phone)', 'The telephone version of Auf Wiedersehen.'],
    ],
    notice:
      'Germans often answer the phone with just their surname: Weber. You then say who you are and why you are calling. Spell names and repeat numbers back to check. Ich meld mich wegen … is a common spoken form of ich melde mich wegen …',
    pronunciation:
      'Slow down for names and numbers, and say zwo for 2. A falling tone at the end of a request sounds confident; a rise sounds unsure.',
    checks: [
      {
        prompt: 'Someone answers: Weber. What do you say next?',
        options: [
          'Guten Tag, hier spricht … Ich rufe wegen … an.',
          'Wer bist du?',
          'Hallo? Hallo?',
        ],
        answer: 0,
        explanation: 'Greet, give your name and state your reason.',
      },
      {
        prompt: 'How do you end a phone call politely?',
        options: ['Auf Wiedersehen!', 'Auf Wiederhören!', 'Bis gleich!'],
        answer: 1,
        explanation:
          'Auf Wiederhören is the phone form. Auf Wiedersehen is not wrong, just less typical.',
      },
      {
        prompt: 'Listen. What is the situation?',
        audio: 'Frau Weber ist gerade in einer Besprechung. Soll sie Sie zurückrufen?',
        options: [
          'Ms Weber is in a meeting and can call you back',
          'Ms Weber has left the company',
          'Ms Weber is on holiday',
        ],
        answer: 0,
        explanation:
          'You heard “in einer Besprechung” (in a meeting) and “zurückrufen” (call back).',
      },
    ],
    writing: {
      prompt: 'Write “I am calling about my bill.”',
      accepted: [
        'Ich rufe wegen meiner Rechnung an',
        'Ich rufe an wegen meiner Rechnung',
        'Ich rufe wegen der Rechnung an',
      ],
      hint: 'Ich rufe + wegen meiner Rechnung + an.',
      explanation: 'Anrufen is separable, so an goes to the end.',
    },
    speaking:
      'Call an internet provider: say who you are and why you are calling, spell your surname, ask for the details by email and close the call.',
  },
  {
    id: 'storytelling',
    level: 'B1',
    title: 'Tell a story from the past',
    outcome: 'Narrate a past experience with a clear sequence, using als and wenn correctly.',
    phrases: [
      [
        'Als ich nach Deutschland kam, konnte ich kein Wort Deutsch.',
        'When I came to Germany, I could not speak a word of German.',
        'Als: a single event in the past.',
      ],
      [
        'Wenn ich Oma besuchte, backten wir immer Kuchen.',
        'Whenever I visited Grandma, we always baked cake.',
        'Wenn: repeated events in the past.',
      ],
      [
        'Zuerst …, dann …, danach …, am Ende …',
        'First …, then …, after that …, in the end …',
        'Structure a story. Each is followed by the verb.',
      ],
      [
        'Plötzlich klingelte das Telefon.',
        'Suddenly the phone rang.',
        'The Präteritum is typical in written stories.',
      ],
      [
        'Und dann ist mir eingefallen, dass …',
        'And then I remembered that …',
        'In spoken stories, the Perfekt is normal.',
      ],
      ['Stell dir vor, …', 'Imagine …', 'A natural way to introduce a surprising part.'],
    ],
    notice:
      'Spoken stories mostly use the Perfekt (ich bin gefahren); written stories and the news mostly use the Präteritum (ich fuhr). Everyone uses war, hatte and the modals (konnte, musste) in both. Als means one time in the past; wenn means every time, or now and in the future.',
    pronunciation:
      'Slow down and stress the surprise: Und PLÖTZlich … A short pause before the key moment makes a story easy to follow.',
    checks: [
      {
        prompt: '___ ich klein war, wohnten wir in Hamburg.',
        options: ['Wenn', 'Als', 'Wann'],
        answer: 1,
        explanation: 'Childhood is one period in the past, so als.',
      },
      {
        prompt: '___ es regnete, spielten wir immer drinnen.',
        options: ['Als', 'Wenn', 'Wann'],
        answer: 1,
        explanation: 'Immer shows repetition: every time it rained, so wenn.',
      },
      {
        prompt: 'Listen. What did the speaker realise?',
        audio:
          'Stell dir vor, ich stand schon am Gleis, und dann ist mir eingefallen, dass mein Pass noch zu Hause lag.',
        options: ['The passport was still at home', 'The train had left', 'The platform was wrong'],
        answer: 0,
        explanation:
          'You heard “dass mein Pass noch zu Hause lag”: the passport was still at home.',
      },
    ],
    writing: {
      prompt: 'Write “When I was a child, I lived in Cairo.” Start with Als.',
      accepted: [
        'Als ich ein Kind war wohnte ich in Kairo',
        'Als ich ein Kind war habe ich in Kairo gewohnt',
        'Als ich ein Kind war lebte ich in Kairo',
        'Als ich klein war wohnte ich in Kairo',
        'Als ich klein war habe ich in Kairo gewohnt',
        'Als ich klein war lebte ich in Kairo',
      ],
      hint: 'Als ich ein Kind war, … then the verb comes straight after the comma.',
      explanation: 'The als clause ends with war; the main clause then starts with its verb.',
    },
    speaking:
      'Tell a two-minute story about your first days in a new place: set the scene with als, sequence events with zuerst, dann and danach, and end with how you felt.',
  },
  {
    id: 'complaint',
    level: 'B1',
    title: 'Make a calm, clear complaint',
    outcome: 'Describe an issue, give relevant evidence and request a solution.',
    phrases: [
      [
        'Ich habe gestern diese Lampe gekauft.',
        'I bought this lamp yesterday.',
        'Give the item and purchase time.',
      ],
      [
        'Leider funktioniert sie nicht.',
        'Unfortunately, it does not work.',
        'Sie refers back to die Lampe.',
      ],
      ['Ich möchte sie umtauschen.', 'I would like to exchange it.', 'State the outcome you want.'],
      ['Hier ist der Kassenbon.', 'Here is the receipt.', 'Offer relevant evidence.'],
      [
        'Was können Sie mir da anbieten?',
        'What can you offer me?',
        'A calm way to invite a solution.',
      ],
    ],
    notice:
      'A clear complaint stays factual and polite. Pronouns follow grammatical gender: die Lampe becomes sie, der Toaster becomes er. Refund rights and shop policies depend on the circumstances; this lesson practises language only.',
    pronunciation:
      'Keep your voice calm and low. A steady, falling tone sounds firmer than raising your voice.',
    reading: [
      'Eva hat online eine blaue Tasche bestellt, aber eine grüne erhalten. Sie schreibt dem Kundenservice, nennt ihre Bestellnummer und bittet um die richtige Farbe. Sie fragt auch, wie sie die falsche Tasche zurückschicken kann.',
      'Eva ordered a blue bag online but received a green one. She writes to customer service, gives the order number and asks for the correct colour. She also asks how to return the wrong bag.',
    ],
    checks: [
      {
        prompt: 'In Leider funktioniert sie nicht, what does sie refer to?',
        options: ['The receipt', 'The lamp', 'Yesterday'],
        answer: 1,
        explanation: 'Die Lampe is feminine, so the pronoun is sie.',
      },
      {
        prompt: 'What solution does Eva request?',
        options: ['The correct colour', 'Two bags for free', 'A different delivery address'],
        answer: 0,
        explanation: 'She asks for die richtige Farbe. The other requests are not in the text.',
      },
      {
        prompt: 'Listen. What does the shop assistant ask?',
        audio: 'Haben Sie den Kassenbon noch dabei?',
        options: [
          'Whether you still have the receipt with you',
          'Whether you want a bag',
          'Whether you paid by card',
        ],
        answer: 0,
        explanation:
          'You heard “Haben Sie den Kassenbon noch dabei?”: do you still have the receipt with you?',
      },
    ],
    writing: {
      prompt: 'Write “I would like to exchange it” using sie for the lamp.',
      accepted: [
        'Ich möchte sie umtauschen',
        'Ich würde sie gern umtauschen',
        'Ich würde sie gerne umtauschen',
      ],
      hint: 'Ich möchte + sie + umtauschen.',
      explanation: 'The infinitive umtauschen goes at the end after möchte.',
    },
    speaking:
      'Describe a fictional purchase problem, say when you bought it and ask for a solution. Keep your tone polite and avoid invented legal claims.',
  },
  {
    id: 'hypotheticals',
    level: 'B1',
    title: 'Wishes, advice and “if I were you”',
    outcome: 'Talk about unreal situations, give advice and make polite wishes.',
    phrases: [
      [
        'Wenn ich mehr Zeit hätte, würde ich mehr reisen.',
        'If I had more time, I would travel more.',
        'Hätte, wäre or würde + infinitive for unreal situations.',
      ],
      [
        'An deiner Stelle würde ich den Vermieter anrufen.',
        'If I were you, I would call the landlord.',
        'Advice without sounding bossy.',
      ],
      ['Du solltest mehr schlafen.', 'You should sleep more.', 'Sollte means should.'],
      [
        'Ich wäre gern Musikerin geworden.',
        'I would have liked to become a musician.',
        'A past wish: wäre or hätte + participle.',
      ],
      [
        'Könnten Sie mir vielleicht helfen?',
        'Could you possibly help me?',
        'The same forms make requests polite.',
      ],
      ['Das wäre super!', 'That would be great!', 'A very common reaction to an offer.'],
    ],
    notice:
      'Most verbs use würde + infinitive (ich würde fahren). Sein, haben and the modals have their own forms that everyone uses: wäre, hätte, könnte, müsste, sollte. Wenn clause first: Wenn ich Zeit hätte, würde ich kommen.',
    pronunciation:
      'Hätte (short ä, like “bed”) and hatte (short a) sound different, and that difference turns real into unreal.',
    checks: [
      {
        prompt: 'Which sentence describes an unreal situation?',
        options: [
          'Wenn ich Geld habe, kaufe ich ein Auto.',
          'Wenn ich Geld hätte, würde ich ein Auto kaufen.',
          'Als ich Geld hatte, kaufte ich ein Auto.',
        ],
        answer: 1,
        explanation: 'Hätte and würde show that it is not real now.',
      },
      {
        prompt: 'A friend has a problem with the landlord. Which phrase gives advice?',
        options: [
          'An deiner Stelle würde ich mit ihm sprechen.',
          'Du musst sofort umziehen!',
          'Das ist halt so.',
        ],
        answer: 0,
        explanation: 'An deiner Stelle würde ich … is friendly advice.',
      },
      {
        prompt: 'Listen. What is the speaker’s advice?',
        audio: 'Wenn ich du wäre, würde ich das Angebot annehmen.',
        options: ['Accept the offer', 'Refuse the offer', 'Wait a week'],
        answer: 0,
        explanation: 'You heard “würde ich das Angebot annehmen”: I would accept the offer.',
      },
    ],
    writing: {
      prompt: 'Write “If I had time, I would come.”',
      accepted: [
        'Wenn ich Zeit hätte würde ich kommen',
        'Wenn ich Zeit hätte käme ich',
        'Wenn ich Zeit hätte würde ich mitkommen',
      ],
      hint: 'Wenn ich Zeit hätte, würde ich …',
      explanation: 'The wenn clause ends with hätte; the main clause starts with würde.',
    },
    speaking:
      'Answer: what would you do if you did not have to work for a year? Then give a friend advice starting with An deiner Stelle …',
  },
  {
    id: 'describe-precisely',
    level: 'B1',
    title: 'Describe things when you lack the word',
    outcome:
      'Use relative clauses and paraphrase to explain anything, even without the exact word.',
    phrases: [
      [
        'Das ist die Kollegin, die mir geholfen hat.',
        'That is the colleague who helped me.',
        'The relative pronoun matches the noun; the verb goes last.',
      ],
      [
        'Das ist der Laden, in dem ich arbeite.',
        'That is the shop where I work.',
        'Preposition + relative pronoun.',
      ],
      [
        'Wie heißt noch mal das Ding, mit dem man Dosen öffnet?',
        'What’s the thing called that you open tins with?',
        'Paraphrase when you lack a word.',
      ],
      ['Das ist so eine Art …', 'It is a kind of …', 'Start with the category.'],
      ['Das benutzt man, um … zu …', 'You use it to …', 'Then describe the function.'],
    ],
    notice:
      'Relative pronouns look like der/die/das (dative plural: denen). Their case depends on their role inside the relative clause: der Mann, den ich kenne (accusative). Paraphrasing, by describing category, function or shape, is what fluent speakers do all the time. It is a skill, not a failure.',
    pronunciation:
      'A relative clause is one breath group. Do not pause after the pronoun: “die mir geholfen hat” flows together.',
    checks: [
      {
        prompt: 'Das ist der Mann, ___ ich gestern gesehen habe.',
        options: ['der', 'den', 'dem'],
        answer: 1,
        explanation: 'Ich habe den Mann gesehen: accusative, so den.',
      },
      {
        prompt: 'Das ist die Freundin, ___ ich das Buch gegeben habe.',
        options: ['die', 'der', 'den'],
        answer: 1,
        explanation: 'Geben takes a dative person: ich habe der Freundin … gegeben, so der.',
      },
      {
        prompt: 'Listen. What is the person looking for?',
        audio: 'Ich suche so ein Ding, mit dem man Knoblauch zerdrücken kann.',
        options: ['A garlic press', 'A knife sharpener', 'A bottle opener'],
        answer: 0,
        explanation:
          'You heard “mit dem man Knoblauch zerdrücken kann”: something to crush garlic with.',
      },
    ],
    writing: {
      prompt: 'Write “That is the shop where I work.” using in dem.',
      accepted: [
        'Das ist der Laden in dem ich arbeite',
        'Das ist das Geschäft in dem ich arbeite',
        'Das ist der Laden wo ich arbeite',
      ],
      hint: 'Das ist der Laden, in dem ich … (verb last).',
      explanation:
        'Der Laden → in dem (dative after in for a location). Wo is common in speech too.',
    },
    speaking:
      'Pick three objects at home without looking up their German names. Describe each: what kind of thing it is, what you use it for and where it is.',
  },
  {
    id: 'goals',
    level: 'B1',
    title: 'Plans, goals and purposes',
    outcome: 'Explain plans and purposes with um … zu, damit and werden.',
    phrases: [
      [
        'Ich lerne Deutsch, um in Deutschland zu arbeiten.',
        'I am learning German to work in Germany.',
        'Um … zu + infinitive when the subject stays the same.',
      ],
      [
        'Ich spreche langsam, damit mich alle verstehen.',
        'I speak slowly so that everyone understands me.',
        'Damit when the subject changes.',
      ],
      [
        'Ich habe vor, nächstes Jahr die B1-Prüfung zu machen.',
        'I plan to take the B1 exam next year.',
        'Vorhaben … zu + infinitive.',
      ],
      ['Ich werde mich bald bewerben.', 'I will apply soon.', 'Werden for plans and predictions.'],
      [
        'Mein Ziel ist es, fließend Deutsch zu sprechen.',
        'My goal is to speak German fluently.',
        'Ziel means goal.',
      ],
    ],
    notice:
      'Use um … zu when the person is the same in both parts, and damit when it changes. For the future, German often uses the present with a time expression (Morgen fahre ich nach Köln); werden adds intention or prediction.',
    pronunciation: 'In um … zu sentences, zu is unstressed and joins the verb: zu ARbeiten.',
    checks: [
      {
        prompt: 'Ich spare Geld, ___ ein Auto zu kaufen.',
        options: ['damit', 'um', 'weil'],
        answer: 1,
        explanation: 'Same person, infinitive with zu: um … zu.',
      },
      {
        prompt: 'Ich erkläre es noch mal, ___ du es verstehst.',
        options: ['um', 'damit', 'zu'],
        answer: 1,
        explanation: 'Different subjects (ich / du), so damit.',
      },
      {
        prompt: 'Listen. Why is the speaker taking the course?',
        audio: 'Ich mache den Kurs vor allem, damit ich bei der Arbeit sicherer telefonieren kann.',
        options: [
          'To feel more confident on the phone at work',
          'To get a new job',
          'To pass a driving test',
        ],
        answer: 0,
        explanation: 'You heard “damit ich bei der Arbeit sicherer telefonieren kann”.',
      },
    ],
    writing: {
      prompt: 'Write “I am learning German to work in Germany.”',
      accepted: ['Ich lerne Deutsch um in Deutschland zu arbeiten'],
      hint: 'Ich lerne Deutsch, um in Deutschland zu …',
      explanation: 'Um opens the phrase; zu arbeiten closes it.',
    },
    speaking:
      'Explain your language goals: why you are learning German (um … zu), what you do so that you improve (damit) and one plan for next year.',
  },
  {
    id: 'prep-verbs',
    level: 'B1',
    title: 'Waiting for, thinking about: verbs with prepositions',
    outcome: 'Use common verbs with fixed prepositions, and ask and answer with wo(r)- and da(r)-.',
    phrases: [
      ['Ich warte auf den Bus.', 'I am waiting for the bus.', 'Warten auf + accusative.'],
      ['Worauf wartest du?', 'What are you waiting for?', 'Wo(r) + preposition for things.'],
      [
        'Ich interessiere mich für Politik.',
        'I am interested in politics.',
        'Sich interessieren für.',
      ],
      ['Ich denke oft an meine Familie.', 'I often think about my family.', 'Denken an.'],
      [
        'Darauf habe ich keine Lust.',
        'I do not feel like that.',
        'Da(r) + preposition refers back to a thing.',
      ],
      [
        'Kümmerst du dich um die Getränke?',
        'Will you take care of the drinks?',
        'Sich kümmern um.',
      ],
    ],
    notice:
      'Learn these verbs as chunks with their preposition: warten auf, denken an, sich freuen auf/über, sich interessieren für, sich kümmern um, Angst haben vor. For things, use wo(r)- and da(r)-: Worüber sprecht ihr? – Darüber. For people, use preposition + pronoun: Auf wen wartest du? – Auf ihn.',
    pronunciation: 'In darauf and worauf, stress the preposition part: da-RAUF, wo-RAUF.',
    checks: [
      {
        prompt: 'Ich warte ___ meine Freundin.',
        options: ['für', 'auf', 'an'],
        answer: 1,
        explanation: 'Warten auf: wait for.',
      },
      {
        prompt: 'Ich interessiere mich ___ Kunst.',
        options: ['für', 'über', 'auf'],
        answer: 0,
        explanation: 'Sich interessieren für: be interested in.',
      },
      {
        prompt: 'Listen. What is your job?',
        audio: 'Um die Musik kümmere ich mich, und du kümmerst dich um das Essen, okay?',
        options: ['The food', 'The music', 'The invitations'],
        answer: 0,
        explanation: 'You heard “du kümmerst dich um das Essen”: you take care of the food.',
      },
    ],
    writing: {
      prompt: 'Write “I am waiting for the bus.”',
      accepted: ['Ich warte auf den Bus'],
      hint: 'Ich warte + auf + den Bus.',
      explanation: 'Warten auf takes the accusative: den Bus.',
    },
    speaking:
      'Talk about what you are waiting for, what you are interested in and what you often think about. Then ask: Worauf freust du dich?',
  },
  {
    id: 'indirect-questions',
    level: 'B1',
    title: 'Ask politely: Wissen Sie, ob …?',
    outcome: 'Ask polite indirect questions and say what you do not know.',
    phrases: [
      [
        'Wissen Sie, wo die Post ist?',
        'Do you know where the post office is?',
        'The verb goes to the end.',
      ],
      [
        'Können Sie mir sagen, wann der Kurs anfängt?',
        'Can you tell me when the course starts?',
        'Separable verbs rejoin at the end: anfängt.',
      ],
      [
        'Ich weiß nicht, ob ich morgen Zeit habe.',
        'I do not know whether I have time tomorrow.',
        'Ob means whether, for yes/no questions.',
      ],
      [
        'Darf ich fragen, wie viel das kostet?',
        'May I ask how much that costs?',
        'Softer than a direct question.',
      ],
      [
        'Ich wollte mal fragen, ob …',
        'I just wanted to ask whether …',
        'A very natural, soft opener in speech and emails.',
      ],
    ],
    notice:
      'Indirect questions sound more polite and are standard in service situations. Question words (wo, wann, wie, warum) stay; yes/no questions use ob. In both, the verb goes to the end.',
    pronunciation:
      'Indirect questions often end with a fall, because the question is carried by the opening: Wissen Sie, wo die Post ist?',
    checks: [
      {
        prompt: 'Which is correct?',
        options: [
          'Wissen Sie, wo ist der Bahnhof?',
          'Wissen Sie, wo der Bahnhof ist?',
          'Wissen Sie, ob wo der Bahnhof ist?',
        ],
        answer: 1,
        explanation: 'In an indirect question, the verb ist goes to the end.',
      },
      {
        prompt: 'Kommt er heute? → Ich weiß nicht, ___ er heute kommt.',
        options: ['dass', 'ob', 'wenn'],
        answer: 1,
        explanation: 'A yes/no question becomes an ob clause.',
      },
      {
        prompt: 'Listen. What does the caller want to know?',
        audio: 'Ich wollte mal fragen, ob die Wohnung noch frei ist.',
        options: [
          'Whether the flat is still available',
          'How much the flat costs',
          'Where the flat is',
        ],
        answer: 0,
        explanation:
          'You heard “ob die Wohnung noch frei ist”: whether the flat is still available.',
      },
    ],
    writing: {
      prompt: 'Write “Do you know when the train leaves?” starting with Wissen Sie.',
      accepted: [
        'Wissen Sie wann der Zug fährt',
        'Wissen Sie wann der Zug abfährt',
        'Wissen Sie wann der Zug losfährt',
      ],
      hint: 'Wissen Sie, wann der Zug … (verb last).',
      explanation: 'The verb fährt or abfährt goes to the end of the indirect question.',
    },
    speaking:
      'At a reception desk, ask three polite indirect questions: about a time, a place and whether something is possible.',
  },
  {
    id: 'official-letters',
    level: 'B1',
    title: 'Understand official letters and write emails',
    outcome: 'Understand passive and formal phrases in letters and open and close a formal email.',
    phrases: [
      [
        'Ihr Antrag wird bearbeitet.',
        'Your application is being processed.',
        'Passive: werden + participle. The focus is the action, not who does it.',
      ],
      [
        'Die Rechnung muss bis zum 15. Mai bezahlt werden.',
        'The bill must be paid by 15 May.',
        'Modal passive: muss … bezahlt werden.',
      ],
      [
        'Sehr geehrte Damen und Herren,',
        'Dear Sir or Madam,',
        'When you do not know the name. With a name: Sehr geehrte Frau Weber,',
      ],
      [
        'Ich schreibe Ihnen, weil …',
        'I am writing to you because …',
        'State the reason in the first sentence.',
      ],
      [
        'Ich bitte um eine kurze Rückmeldung.',
        'I would appreciate a short reply.',
        'Rückmeldung means response.',
      ],
      [
        'Mit freundlichen Grüßen',
        'Kind regards / Yours faithfully',
        'Standard formal closing, with no comma after it.',
      ],
    ],
    notice:
      'Letters from offices and companies use the passive and many nouns. Frist means deadline; fristgerecht means on time. After the greeting and comma, the email continues in lowercase: Sehr geehrte Frau Weber, ich schreibe Ihnen …',
    pronunciation:
      'Read formal phrases aloud in chunks: Sehr ge-EHR-te | DA-men und HER-ren. It helps on the phone too.',
    reading: [
      'Sehr geehrter Herr Novak, Ihr Antrag auf Wohngeld ist bei uns eingegangen. Er wird zurzeit bearbeitet. Bitte reichen Sie bis zum 30. Juni Ihre letzten drei Gehaltsabrechnungen nach. Mit freundlichen Grüßen, Ihre Wohngeldstelle',
      'Dear Mr Novak, we have received your housing benefit application. It is currently being processed. Please submit your last three payslips by 30 June. Kind regards, your housing benefit office',
    ],
    checks: [
      {
        prompt: 'Read the letter. What must Mr Novak do?',
        options: [
          'Send his last three payslips by 30 June',
          'Pay a fee by 30 June',
          'Call the office immediately',
        ],
        answer: 0,
        explanation: 'Gehaltsabrechnungen are payslips; nachreichen means to submit later.',
      },
      {
        prompt: 'Ihr Antrag wird bearbeitet means:',
        options: [
          'Your application is being processed',
          'Your application was rejected',
          'You must process your application',
        ],
        answer: 0,
        explanation: 'Wird + participle is the present passive: is being processed.',
      },
      {
        prompt: 'Which closing fits a formal email?',
        options: ['LG', 'Mit freundlichen Grüßen', 'Bis dann!'],
        answer: 1,
        explanation: 'Mit freundlichen Grüßen is the standard formal closing.',
      },
    ],
    writing: {
      prompt: 'Write the formal greeting you use when you do not know the recipient’s name.',
      accepted: ['Sehr geehrte Damen und Herren'],
      hint: 'Sehr geehrte … und …',
      explanation: 'Sehr geehrte Damen und Herren is the standard opening.',
    },
    speaking:
      'Explain the letter above to a friend in simple spoken German: who wrote it, what is happening and what Mr Novak must do by when.',
  },
  {
    id: 'plan-together',
    level: 'B1',
    title: 'Plan something together',
    outcome:
      'Make suggestions, react to a partner and agree on a plan, in real life and in the B1 speaking exam.',
    phrases: [
      [
        'Wie wäre es, wenn wir am Samstag grillen?',
        'How about having a barbecue on Saturday?',
        'A soft suggestion.',
      ],
      ['Was hältst du davon?', 'What do you think of that?', 'Ask for your partner’s view.'],
      [
        'Gute Idee! Und wer kümmert sich um die Getränke?',
        'Good idea! And who will take care of the drinks?',
        'Accept and move to the details.',
      ],
      [
        'Das passt mir leider nicht so gut. Wie wäre es mit Sonntag?',
        'That doesn’t really suit me. How about Sunday?',
        'Decline and offer an alternative.',
      ],
      ['Lass uns das so machen.', 'Let’s do it that way.', 'Close the decision.'],
      [
        'Also, fassen wir zusammen: …',
        'So, let’s summarise: …',
        'Check that you agree on everything.',
      ],
    ],
    notice:
      'In the Goethe-Zertifikat B1 speaking exam, Teil 1 is exactly this: you and a partner plan something together. Examiners reward reacting to your partner, not long monologues. The same skill works with flatmates and colleagues: suggest, react, decide who does what and summarise.',
    pronunciation:
      'Suggestions rise slightly at the end: Wie wäre es mit Sonntag? Decisions fall: Lass uns das so machen.',
    checks: [
      {
        prompt: 'Your partner suggests Friday but you work. What is the best reaction?',
        options: [
          'Nein.',
          'Freitag passt mir leider nicht. Wie wäre es mit Samstag?',
          'Ich weiß nicht.',
        ],
        answer: 1,
        explanation: 'Decline politely and offer an alternative so the planning continues.',
      },
      {
        prompt: 'Which phrase asks for your partner’s opinion?',
        options: ['Was hältst du davon?', 'Lass uns das so machen.', 'Ich kümmere mich darum.'],
        answer: 0,
        explanation: 'Was hältst du davon? means what do you think of that?',
      },
      {
        prompt: 'Listen. What is your task?',
        audio: 'Also, ich besorge den Kuchen, und du kümmerst dich um die Einladungen, oder?',
        options: ['The invitations', 'The cake', 'The music'],
        answer: 0,
        explanation:
          'You heard “du kümmerst dich um die Einladungen”: you take care of the invitations.',
      },
    ],
    writing: {
      prompt: 'Ask a friend “What do you think of that?”',
      accepted: [
        'Was hältst du davon',
        'Was denkst du darüber',
        'Was meinst du dazu',
        'Was sagst du dazu',
      ],
      hint: 'Was hältst du …?',
      explanation: 'Halten von means to think of. Davon refers back to the idea.',
    },
    speaking:
      'Plan a farewell party for a colleague with a partner or the live coach: date, place, food, gift, and who does what. Summarise at the end.',
  },
  {
    id: 'present-topic',
    level: 'B1',
    title: 'Present a topic and your opinion',
    outcome:
      'Give a short structured talk: introduce, share experience, weigh pros and cons, conclude.',
    phrases: [
      [
        'Ich möchte heute über das Thema Homeoffice sprechen.',
        'Today I would like to talk about working from home.',
        'Introduce the topic.',
      ],
      [
        'In meinem Heimatland ist das so: …',
        'In my home country, it is like this: …',
        'Give background.',
      ],
      [
        'Ich persönlich habe gute Erfahrungen damit gemacht.',
        'Personally, I have had good experiences with it.',
        'Share experience.',
      ],
      [
        'Ein Vorteil ist, dass …; ein Nachteil ist, dass …',
        'One advantage is that …; one disadvantage is that …',
        'Weigh both sides.',
      ],
      [
        'Meiner Meinung nach …',
        'In my opinion …',
        'Followed directly by the verb: Meiner Meinung nach ist das …',
      ],
      [
        'Zum Schluss möchte ich sagen, dass …',
        'To conclude, I would like to say that …',
        'Finish clearly, then: Vielen Dank fürs Zuhören.',
      ],
    ],
    notice:
      'In Goethe-Zertifikat B1 Sprechen Teil 2 you present a topic for about three minutes: introduce it, describe your experience, the situation in your home country, pros and cons with your opinion, and a conclusion. Afterwards you answer a question (Teil 3). A clear structure matters more than rare vocabulary.',
    pronunciation:
      'Signal structure with your voice: slightly slower and lower on signposts such as Zum Schluss …',
    checks: [
      {
        prompt: 'Which sentence has the right word order?',
        options: [
          'Meiner Meinung nach Homeoffice ist praktisch.',
          'Meiner Meinung nach ist Homeoffice praktisch.',
          'Meiner Meinung nach praktisch ist Homeoffice.',
        ],
        answer: 1,
        explanation: 'Meiner Meinung nach fills position one, so the verb ist comes next.',
      },
      {
        prompt: 'Which is a good way to end a presentation?',
        options: [
          'Zum Schluss möchte ich sagen, dass … Vielen Dank fürs Zuhören.',
          'Tschüss!',
          'Das war’s, danke.',
        ],
        answer: 0,
        explanation: 'Summarise with Zum Schluss and thank the listeners.',
      },
      {
        prompt: 'Listen. Which disadvantage is mentioned?',
        audio:
          'Ein großer Vorteil ist, dass man keine Zeit im Stau verliert. Ein Nachteil ist aber, dass man die Kollegen seltener sieht.',
        options: [
          'You see colleagues less often',
          'You lose time in traffic',
          'You need a bigger flat',
        ],
        answer: 0,
        explanation:
          'You heard “dass man die Kollegen seltener sieht”: you see colleagues less often.',
      },
    ],
    writing: {
      prompt: 'Write “In my opinion, that is a good idea.”',
      accepted: [
        'Meiner Meinung nach ist das eine gute Idee',
        'Meiner Meinung nach ist es eine gute Idee',
        'Ich finde das ist eine gute Idee',
        'Ich finde dass das eine gute Idee ist',
      ],
      hint: 'Meiner Meinung nach + ist + das + eine gute Idee.',
      explanation: 'After Meiner Meinung nach, the verb comes next.',
    },
    speaking:
      'Give a three-minute talk on “Handys in der Schule: ja oder nein?” using all five parts. Then ask the live coach for one follow-up question.',
  },
  {
    id: 'smalltalk-culture',
    level: 'B1',
    title: 'Small talk, humour and German habits',
    outcome:
      'Handle everyday small talk and understand the unwritten rules of German conversation.',
    phrases: [
      [
        'Na, alles klar?',
        'Hey, all good?',
        'A casual greeting. Answer Ja, und bei dir? It is not a real question about problems.',
      ],
      ['Schönen Feierabend!', 'Have a nice evening!', 'Said to colleagues when leaving work.'],
      ['Geht so.', 'So-so.', 'Germans often answer honestly; geht so is normal, not alarming.'],
      [
        'Mahlzeit!',
        'Enjoy your lunch! / Hi (around lunchtime)',
        'A workplace greeting around noon in many regions.',
      ],
      [
        'Na ja, man kann nicht alles haben.',
        'Oh well, you can’t have everything.',
        'Typical dry, understated humour.',
      ],
      ['Prost! / Zum Wohl!', 'Cheers!', 'Look people in the eye when you clink glasses.'],
    ],
    notice:
      'German small talk is often shorter and more direct than in English-speaking cultures, and Wie geht’s? can get an honest answer. Compliments and criticism are usually said plainly. Punctuality matters: if you will be more than a few minutes late, send a message. Weather, weekends, holidays and public transport are safe topics; salary usually is not.',
    pronunciation: 'Na is drawn out and rises: Naaa, alles klar? It sounds relaxed and friendly.',
    checks: [
      {
        prompt: 'A colleague says: Na, alles klar? What is a natural answer?',
        options: [
          'Ja, alles gut. Und bei dir?',
          'Nein, ich habe viele Probleme mit meinem Chef und meiner Wohnung …',
          'Auf Wiedersehen.',
        ],
        answer: 0,
        explanation: 'It is a greeting: answer briefly and ask back.',
      },
      {
        prompt: 'You leave the office at 5 pm. What do you say to colleagues?',
        options: ['Schönen Feierabend!', 'Mahlzeit!', 'Gute Nacht!'],
        answer: 0,
        explanation: 'Schönen Feierabend wishes a nice evening after work.',
      },
      {
        prompt: 'Listen. How was the holiday?',
        audio: 'Wie war der Urlaub? – Na ja, das Wetter war mies, aber das Essen war super.',
        options: [
          'Bad weather but great food',
          'Great weather and great food',
          'Bad food but good weather',
        ],
        answer: 0,
        explanation: 'You heard “das Wetter war mies, aber das Essen war super”. Mies means lousy.',
      },
    ],
    writing: {
      prompt: 'Write what you say to colleagues when leaving work: “Have a nice evening!”',
      accepted: ['Schönen Feierabend', 'Einen schönen Feierabend'],
      hint: 'Schönen + the word for end of the working day.',
      explanation: 'Feierabend is the time after work.',
    },
    speaking:
      'Have two minutes of small talk with the live coach at the coffee machine: the weekend, the weather and holiday plans. React with echt?, na ja and genau.',
  },
]);
