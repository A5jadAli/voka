import type { FoundationLesson } from './catalog';

type LessonInput = {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  title: string;
  outcome: string;
  phrases: [string, string, string][];
  notice: string;
  reading: { german: string; english: string };
  checks: FoundationLesson['checks'];
  writing: FoundationLesson['writing'];
  speaking: string;
};
function lesson(input: LessonInput): FoundationLesson {
  return {
    ...input,
    phrases: input.phrases.map(([german, english, use]) => ({ german, english, use })),
  };
}

// Original scaffolded practice, not a complete CEFR syllabus or a placement test.
export const practicalGermanLessons: FoundationLesson[] = [
  lesson({
    id: 'numbers',
    level: 'A1',
    title: 'Numbers and prices',
    outcome: 'Recognise small prices and ask what something costs.',
    phrases: [
      ['eins, zwei, drei, vier, fünf', 'one, two, three, four, five', 'Count items slowly.'],
      [
        'sechs, sieben, acht, neun, zehn',
        'six, seven, eight, nine, ten',
        'Try counting without the English words.',
      ],
      ['Was kostet das?', 'How much does that cost?', 'Point to the item when needed.'],
      [
        'Das kostet drei Euro.',
        'That costs three euros.',
        'Euro usually stays unchanged after a number.',
      ],
    ],
    notice:
      'German uses a decimal comma: 3,50 € means three euros and fifty cents. You may hear drei Euro fünfzig. Learn numbers with a price, not only as a list.',
    reading: {
      german:
        'Tee: 2 €. Kaffee: 3 €. Wasser: 1 €. Ein Kaffee und ein Wasser kosten zusammen vier Euro.',
      english: 'Tea: €2. Coffee: €3. Water: €1. A coffee and a water cost four euros altogether.',
    },
    checks: [
      {
        prompt: 'What does Was kostet das? ask about?',
        options: ['The price', 'The opening time', 'The address'],
        answer: 0,
        explanation: 'Kostet means costs. Use the question to ask for a price.',
      },
      {
        prompt: 'Read the menu. What costs less than a tea?',
        options: ['A coffee', 'A water', 'Coffee and water together'],
        answer: 1,
        explanation: 'Water costs one euro, tea two euros. Less means a smaller price.',
      },
    ],
    writing: {
      prompt: 'Write “That costs three euros” in German.',
      accepted: ['Das kostet drei Euro', 'Das kostet 3 Euro'],
      hint: 'Use Das + kostet + the number + Euro.',
      explanation: 'Das kostet drei Euro is a complete price statement.',
    },
    speaking:
      'Read the prices aloud. Ask Was kostet das? and answer with each price. Then say the total for coffee and water.',
  }),
  lesson({
    id: 'cafe',
    level: 'A1',
    title: 'Order and pay in a café',
    outcome: 'Make a polite order and say whether you want to pay by card.',
    phrases: [
      [
        'Ich hätte gern einen Kaffee.',
        'I would like a coffee.',
        'A useful polite chunk. Learn einen Kaffee together.',
      ],
      ['Zum Mitnehmen, bitte.', 'To take away, please.', 'Use it when you will not stay.'],
      [
        'Kann ich mit Karte zahlen?',
        'Can I pay by card?',
        'Ask before paying; do not assume every shop takes cards.',
      ],
      ['Die Rechnung, bitte.', 'The bill, please.', 'Use this when you have finished at a table.'],
    ],
    notice:
      'Der Kaffee becomes einen Kaffee after Ich hätte gern. German articles change with the sentence role. For now, learn the whole request and replace the item only when you know its form.',
    reading: {
      german:
        'Mira bestellt einen Kaffee zum Mitnehmen. Sie fragt: „Kann ich mit Karte zahlen?“ Der Verkäufer sagt: „Heute leider nur bar.“',
      english:
        'Mira orders a takeaway coffee. She asks whether she can pay by card. The seller says: “Unfortunately, cash only today.”',
    },
    checks: [
      {
        prompt: 'Which phrase politely orders a coffee?',
        options: ['Die Rechnung, bitte.', 'Ich hätte gern einen Kaffee.', 'Zum Mitnehmen, bitte.'],
        answer: 1,
        explanation: 'Ich hätte gern introduces what you would like.',
      },
      {
        prompt: 'Can Mira pay by card today?',
        options: ['Yes', 'No, only cash', 'The text does not say'],
        answer: 1,
        explanation: 'Nur bar means cash only. Leider means unfortunately.',
      },
    ],
    writing: {
      prompt: 'Ask “Can I pay by card?” in German.',
      accepted: ['Kann ich mit Karte zahlen', 'Kann ich mit Karte bezahlen'],
      hint: 'Start with Kann ich and include mit Karte.',
      explanation: 'In this yes/no question, Kann comes first and zahlen comes last.',
    },
    speaking:
      'Order a coffee, ask to take it away, and ask about paying by card. If the answer is nur bar, repeat it to check you understood.',
  }),
  lesson({
    id: 'directions',
    level: 'A1',
    title: 'Find your way and take a train',
    outcome: 'Ask for a station and understand left, right and straight ahead.',
    phrases: [
      ['Wo ist der Bahnhof?', 'Where is the railway station?', 'Wo asks about location.'],
      [
        'Gehen Sie geradeaus.',
        'Go straight ahead.',
        'A polite direction to one adult or several people.',
      ],
      ['Dann links, bitte.', 'Then left, please.', 'Rechts means right.'],
      [
        'Ein Ticket nach Berlin, bitte.',
        'A ticket to Berlin, please.',
        'Use nach before most city names.',
      ],
    ],
    notice:
      'Listen for the action and the direction. You can ask Noch einmal, bitte when you miss one step. Bahnhof is a railway station; Haltestelle is a bus or tram stop.',
    reading: {
      german:
        'Zum Bahnhof gehen Sie geradeaus und dann rechts. Der Zug nach Berlin fährt um zehn Uhr von Gleis zwei.',
      english:
        'To reach the station, go straight ahead and then right. The train to Berlin leaves at ten o’clock from platform two.',
    },
    checks: [
      {
        prompt: 'Which word means straight ahead?',
        options: ['links', 'geradeaus', 'rechts'],
        answer: 1,
        explanation: 'Geradeaus is straight ahead. Links and rechts are left and right.',
      },
      {
        prompt: 'Which platform is mentioned in the short text?',
        options: ['Ten', 'One', 'Two'],
        answer: 2,
        explanation: 'Gleis zwei means platform two. Zehn Uhr is the time, not the platform.',
      },
    ],
    writing: {
      prompt: 'Ask “Where is the railway station?” in German.',
      accepted: ['Wo ist der Bahnhof'],
      hint: 'Wo + ist + der Bahnhof.',
      explanation: 'Wo ist ...? is useful for asking where a place is.',
    },
    speaking:
      'Ask for the station. Say the two directions in the text. Read back the departure time and platform to check them.',
  }),
  lesson({
    id: 'appointments',
    level: 'A2',
    title: 'Arrange and change an appointment',
    outcome: 'Request an appointment and explain that a proposed time does not work.',
    phrases: [
      [
        'Ich möchte einen Termin vereinbaren.',
        'I would like to arrange an appointment.',
        'Möchte is a polite way to express a wish.',
      ],
      ['Am Dienstag habe ich Zeit.', 'I have time on Tuesday.', 'Am is used with days.'],
      [
        'Könnten wir den Termin verschieben?',
        'Could we move the appointment?',
        'Könnten makes the request polite.',
      ],
      [
        'Um halb zehn passt es mir.',
        'Half past nine works for me.',
        'German halb zehn is halfway to ten: 9:30.',
      ],
    ],
    notice:
      'With a time phrase first, the verb still occupies the second position: Am Dienstag habe ich Zeit. Watch halb: halb zehn is 9:30, not 10:30.',
    reading: {
      german:
        'Der erste Termin ist am Montag um neun Uhr. Amir arbeitet am Montag. Die Praxis bietet ihm Dienstag um halb zehn an. Er sagt zu.',
      english:
        'The first appointment is on Monday at nine. Amir works on Monday. The practice offers Tuesday at half past nine. He accepts.',
    },
    checks: [
      {
        prompt: 'What time is halb zehn?',
        options: ['10:30', '9:30', '10:00'],
        answer: 1,
        explanation: 'Halb names the next hour, so halb zehn is 9:30.',
      },
      {
        prompt: 'Why does Amir need another appointment?',
        options: ['He works on Monday', 'The practice is closed on Tuesday', 'He is travelling'],
        answer: 0,
        explanation: 'The text states that Amir works on Monday. It gives no travel reason.',
      },
    ],
    writing: {
      prompt: 'Write “I have time on Tuesday”, starting with Am Dienstag.',
      accepted: ['Am Dienstag habe ich Zeit'],
      hint: 'The verb habe comes before ich after the opening time phrase.',
      explanation: 'Am Dienstag habe ich Zeit keeps the finite verb in second position.',
    },
    speaking:
      'Request an appointment, decline Monday with a reason, and offer Tuesday at 9:30. Repeat the agreed time clearly.',
  }),
  lesson({
    id: 'housing',
    level: 'A2',
    title: 'Ask about a flat and report a problem',
    outcome: 'Ask what rent includes and describe a simple household problem.',
    phrases: [
      [
        'Wie hoch ist die Warmmiete?',
        'How much is the rent including listed additional costs?',
        'Ask exactly which costs are included; electricity may be separate.',
      ],
      ['Ist die Wohnung noch frei?', 'Is the flat still available?', 'Frei here means available.'],
      [
        'Die Heizung funktioniert nicht.',
        'The heating does not work.',
        'A clear description of the problem.',
      ],
      [
        'Seit gestern ist es kalt.',
        'It has been cold since yesterday.',
        'Seit introduces a starting time.',
      ],
    ],
    notice:
      'Learn nouns with their articles: die Wohnung, die Heizung, die Miete. Nicht negates funktioniert. A language exercise is not advice about your rental rights.',
    reading: {
      german:
        'Die Wohnung hat zwei Zimmer. Die Warmmiete beträgt 800 Euro. Strom kostet extra. Eine Besichtigung ist am Freitag möglich.',
      english:
        'The flat has two rooms. The listed inclusive rent is €800. Electricity costs extra. A viewing is possible on Friday.',
    },
    checks: [
      {
        prompt: 'Which sentence reports broken heating?',
        options: [
          'Die Wohnung ist frei.',
          'Die Heizung funktioniert nicht.',
          'Die Miete ist hoch.',
        ],
        answer: 1,
        explanation: 'Heizung means heating and funktioniert nicht means does not work.',
      },
      {
        prompt: 'Does the listed rent include electricity?',
        options: ['Yes', 'The text does not say', 'No'],
        answer: 2,
        explanation: 'Strom kostet extra explicitly says electricity is extra.',
      },
    ],
    writing: {
      prompt: 'Write “The heating does not work” in German.',
      accepted: ['Die Heizung funktioniert nicht'],
      hint: 'Die Heizung + funktioniert + nicht.',
      explanation: 'Put nicht after the verb in this short statement.',
    },
    speaking:
      'Ask whether the flat is available and what costs are included. Then practise reporting broken heating and when the problem started.',
  }),
  lesson({
    id: 'past-day',
    level: 'A2',
    title: 'Talk about what happened yesterday',
    outcome: 'Use a few common past-tense patterns to explain a day or a delay.',
    phrases: [
      [
        'Ich habe gestern gearbeitet.',
        'I worked yesterday.',
        'Habe and gearbeitet form the conversational past here.',
      ],
      [
        'Ich bin mit dem Bus gefahren.',
        'I travelled by bus.',
        'Many movement verbs use sein in this past tense.',
      ],
      ['Der Bus ist zu spät gekommen.', 'The bus arrived late.', 'Zu spät means too late.'],
      [
        'Deshalb habe ich den Zug verpasst.',
        'That is why I missed the train.',
        'After deshalb, the finite verb comes before ich.',
      ],
    ],
    notice:
      'The Perfekt often has two parts: habe ... gearbeitet or bin ... gefahren. The participle goes at the end of a simple clause. Learn which helping verb each new verb uses.',
    reading: {
      german:
        'Gestern hat Lea bis fünf Uhr gearbeitet. Danach ist sie mit dem Bus gefahren. Der Bus ist zu spät gekommen. Deshalb hat sie den Zug verpasst.',
      english:
        'Yesterday Lea worked until five. Afterwards she took the bus. The bus arrived late, so she missed the train.',
    },
    checks: [
      {
        prompt: 'Which helping verb fits Ich ... gearbeitet?',
        options: ['bin', 'habe', 'ist'],
        answer: 1,
        explanation: 'Arbeiten uses haben: ich habe gearbeitet.',
      },
      {
        prompt: 'Why did Lea miss the train?',
        options: ['Her bus was late', 'She forgot her ticket', 'She worked until midnight'],
        answer: 0,
        explanation:
          'The delay is explicitly linked with deshalb. Do not add reasons absent from the text.',
      },
    ],
    writing: {
      prompt: 'Write “I worked yesterday” starting with Ich.',
      accepted: ['Ich habe gestern gearbeitet'],
      hint: 'Use habe as the helping verb and put gearbeitet last.',
      explanation: 'Ich habe gestern gearbeitet uses the Perfekt with haben.',
    },
    speaking:
      'Describe yesterday using one sentence with habe and one with bin. Explain a delay with deshalb, using the examples as a guide.',
  }),
  lesson({
    id: 'health',
    level: 'A2',
    title: 'Describe symptoms and ask for clarification',
    outcome: 'Explain a simple symptom and check instructions without guessing.',
    phrases: [
      [
        'Ich habe Halsschmerzen.',
        'I have a sore throat.',
        'Use a short description rather than trying to diagnose yourself.',
      ],
      ['Seit zwei Tagen.', 'For two days.', 'Answer a question about how long.'],
      [
        'Wie oft soll ich das nehmen?',
        'How often should I take this?',
        'Ask the professional to explain medicine instructions.',
      ],
      [
        'Können Sie das bitte aufschreiben?',
        'Could you write that down, please?',
        'Useful when spoken instructions are difficult.',
      ],
    ],
    notice:
      'This is language practice, not medical advice. Ask a qualified professional about symptoms or medicine. German seit can describe a situation that started earlier and continues now.',
    reading: {
      german:
        'Noah hat seit zwei Tagen Halsschmerzen. Er ruft in der Praxis an. Die Mitarbeiterin bietet ihm einen Termin am Nachmittag an. Noah bittet sie, langsam zu sprechen.',
      english:
        'Noah has had a sore throat for two days. He calls the practice. The staff member offers an afternoon appointment. Noah asks her to speak slowly.',
    },
    checks: [
      {
        prompt: 'What does Seit zwei Tagen answer?',
        options: ['Where?', 'How long?', 'How much?'],
        answer: 1,
        explanation: 'It describes the duration: for two days.',
      },
      {
        prompt: 'When is Noah offered an appointment?',
        options: ['In the morning', 'At night', 'In the afternoon'],
        answer: 2,
        explanation: 'Am Nachmittag means in the afternoon.',
      },
    ],
    writing: {
      prompt: 'Write “I have a sore throat” in German.',
      accepted: ['Ich habe Halsschmerzen'],
      hint: 'Ich habe + Halsschmerzen. The noun begins with a capital H.',
      explanation: 'Ich habe Halsschmerzen is a common symptom description.',
    },
    speaking:
      'Describe the example symptom, say how long it has lasted, and ask for the appointment time to be repeated. Do not use real sensitive health details.',
  }),
  lesson({
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
        'Although it is raining, I walk.',
        'The contrast is introduced by obwohl.',
      ],
      [
        'Andererseits ist das Auto manchmal schneller.',
        'On the other hand, the car is sometimes faster.',
        'Add another side to your argument.',
      ],
    ],
    notice:
      'Weil introduces a reason and obwohl a contrast. In these subordinate clauses the finite verb goes last. After an opening subordinate clause, the main clause begins with its verb: Obwohl es regnet, gehe ich ...',
    reading: {
      german:
        'Jana fährt meistens mit dem Zug, weil sie unterwegs lesen kann. Ihr Kollege nimmt das Auto, obwohl Parkplätze teuer sind. Jana findet den Zug entspannter, aber bei einem Streik fährt sie mit dem Bus.',
      english:
        'Jana usually takes the train because she can read on the way. Her colleague drives although parking is expensive. Jana finds the train more relaxing, but during a strike she takes the bus.',
    },
    checks: [
      {
        prompt: 'Which ending correctly completes weil es bequem ...?',
        options: ['ist', 'es', 'bequem'],
        answer: 0,
        explanation: 'The finite verb ist belongs at the end of this weil clause.',
      },
      {
        prompt: 'What is Jana’s stated reason for usually taking the train?',
        options: ['Free parking', 'She can read on the way', 'It never has strikes'],
        answer: 1,
        explanation:
          'The text says weil sie unterwegs lesen kann. It does not say the train is always reliable.',
      },
    ],
    writing: {
      prompt:
        'Complete this exact thought in German: “I travel by train because it is comfortable.”',
      accepted: ['Ich fahre mit dem Zug weil es bequem ist'],
      hint: 'Start Ich fahre mit dem Zug, weil ... and put ist last.',
      explanation: 'The main clause has normal word order; the weil clause ends with ist.',
    },
    speaking:
      'Compare two ways of travelling. Give your preference, one reason and one disadvantage. Try one weil clause and one sentence with andererseits.',
  }),
  lesson({
    id: 'work-problem',
    level: 'B1',
    title: 'Explain a problem and suggest a solution',
    outcome: 'Tell a colleague about a delay and propose a realistic next step politely.',
    phrases: [
      [
        'Leider schaffe ich es heute nicht.',
        'Unfortunately, I cannot manage it today.',
        'Be clear about the problem without blaming someone.',
      ],
      [
        'Könnten wir die Frist verlängern?',
        'Could we extend the deadline?',
        'A polite proposal rather than a demand.',
      ],
      [
        'Ich schlage vor, dass wir morgen sprechen.',
        'I suggest that we talk tomorrow.',
        'After dass, the finite verb comes last.',
      ],
      [
        'Bis Freitag kann ich den Bericht fertigstellen.',
        'I can finish the report by Friday.',
        'Bis gives a deadline.',
      ],
    ],
    notice:
      'Useful workplace explanations have three parts: the problem, its effect, and a next step. After a modal verb such as kann, the infinitive often goes at the end: kann ... fertigstellen.',
    reading: {
      german:
        'Der Bericht ist noch nicht fertig, weil wichtige Zahlen fehlen. Sami informiert sein Team frühzeitig. Er schlägt vor, die fertigen Abschnitte heute zu schicken und den Rest bis Freitag nachzureichen.',
      english:
        'The report is unfinished because important figures are missing. Sami informs the team early. He suggests sending the completed sections today and the rest by Friday.',
    },
    checks: [
      {
        prompt: 'Which request is a polite proposal?',
        options: ['Könnten wir die Frist verlängern?', 'Die Zahlen fehlen.', 'Heute ist Freitag.'],
        answer: 0,
        explanation: 'Könnten wir ...? invites a solution politely.',
      },
      {
        prompt: 'What will Sami send today?',
        options: ['Nothing', 'The completed sections', 'Only the missing figures'],
        answer: 1,
        explanation: 'Die fertigen Abschnitte means the completed sections. The rest comes later.',
      },
    ],
    writing: {
      prompt: 'Write “Could we extend the deadline?” in German.',
      accepted: ['Könnten wir die Frist verlängern', 'Koennten wir die Frist verlaengern'],
      hint: 'Könnten wir + die Frist + verlängern.',
      explanation: 'Könnten is polite; verlängern is the final infinitive.',
    },
    speaking:
      'Explain the missing figures without blaming a colleague. Offer what you can send today, name a new deadline, and ask if the plan works.',
  }),
  lesson({
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
    ],
    notice:
      'A clear complaint stays factual and polite. Pronouns refer to noun gender: die Lampe becomes sie. Actual refund rights and shop policies depend on the circumstances; this lesson practises language only.',
    reading: {
      german:
        'Eva hat online eine blaue Tasche bestellt, aber eine grüne erhalten. Sie schreibt dem Kundenservice, nennt ihre Bestellnummer und bittet um die richtige Farbe. Sie fragt auch, wie sie die falsche Tasche zurückschicken kann.',
      english:
        'Eva ordered a blue bag online but received a green one. She writes to customer service, gives the order number and asks for the correct colour. She also asks how to return the incorrect bag.',
    },
    checks: [
      {
        prompt: 'In Leider funktioniert sie nicht, what does sie refer to in the lamp example?',
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
    ],
    writing: {
      prompt: 'Write “I would like to exchange it” using sie for the lamp.',
      accepted: ['Ich möchte sie umtauschen', 'Ich moechte sie umtauschen'],
      hint: 'Ich möchte + sie + umtauschen.',
      explanation: 'The infinitive umtauschen goes at the end after möchte.',
    },
    speaking:
      'Describe a fictional purchase problem, say when you bought it, and ask for a solution. Keep your tone polite and avoid invented legal claims.',
  }),
];
