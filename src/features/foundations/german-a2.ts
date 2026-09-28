import { defineLessons } from './types';

// Original A2 lessons. Level labels describe task difficulty, not a certified level.
export const germanA2Lessons = defineLessons('DE', [
  {
    id: 'weekend-smalltalk',
    level: 'A2',
    title: 'What did you do at the weekend?',
    outcome: 'Ask about someone’s weekend and answer naturally with past forms.',
    phrases: [
      [
        'Wie war dein Wochenende?',
        'How was your weekend?',
        'The Monday-morning classic at work and university.',
      ],
      [
        'Ganz gut, und deins?',
        'Pretty good, and yours?',
        'Ganz gut means quite good or pretty good.',
      ],
      [
        'Ich war mit Freunden am See.',
        'I was at the lake with friends.',
        'People say war (was), not bin gewesen, in everyday speech.',
      ],
      [
        'Nichts Besonderes, ich habe viel geschlafen.',
        'Nothing special, I slept a lot.',
        'A perfectly normal answer.',
      ],
      [
        'Echt? Klingt super!',
        'Really? Sounds great!',
        'Show interest so the conversation keeps going.',
      ],
    ],
    notice:
      'In speech, Germans use the Perfekt for most verbs (ich habe gegessen) but the simple past for sein, haben and the modal verbs: ich war, ich hatte, ich musste. Ich bin gewesen is correct but sounds heavier, especially in the north.',
    pronunciation:
      'War has a long a: “vaar”. In ganz gut, both words are short and the stress falls on gut.',
    checks: [
      {
        prompt: 'What do most Germans say for “I was at home”?',
        options: ['Ich war zu Hause.', 'Ich hatte zu Hause.', 'Ich habe zu Hause gewesen.'],
        answer: 0,
        explanation: 'Ich war zu Hause. Sein uses war in everyday speech.',
      },
      {
        prompt: 'Your colleague says: Nichts Besonderes. What does it mean?',
        options: ['Nothing special', 'Something terrible', 'A special party'],
        answer: 0,
        explanation: 'Nichts Besonderes means nothing special: a quiet weekend.',
      },
      {
        prompt: 'Listen. How did the speaker feel on Sunday?',
        audio: 'Am Samstag hatte ich Besuch von meinen Eltern und am Sonntag war ich total kaputt.',
        options: ['Very tired', 'Ill', 'Excited'],
        answer: 0,
        explanation:
          'You heard “am Sonntag war ich total kaputt”. Said of people, kaputt means exhausted. Besuch haben means to have visitors.',
      },
    ],
    writing: {
      prompt: 'Ask a friend “How was your weekend?”',
      accepted: [
        'Wie war dein Wochenende',
        'Wie war dein Wochenende so',
        'Na wie war dein Wochenende',
        'Und wie war dein Wochenende',
      ],
      hint: 'Wie + war + dein Wochenende.',
      explanation: 'War is the past of ist. Dein Wochenende is informal; Ihr Wochenende is polite.',
    },
    speaking:
      'Answer “Wie war dein Wochenende?”: say two things with war or hatte and one with habe + participle. Then ask back.',
  },
  {
    id: 'past-day',
    level: 'A2',
    title: 'Talk about what happened yesterday',
    outcome: 'Use common past-tense patterns to explain a day or a delay.',
    phrases: [
      [
        'Ich habe gestern gearbeitet.',
        'I worked yesterday.',
        'Habe and gearbeitet form the conversational past here.',
      ],
      [
        'Ich bin mit dem Bus gefahren.',
        'I went by bus.',
        'Many verbs of movement use sein in this past tense.',
      ],
      [
        'Der Bus hatte Verspätung.',
        'The bus was late.',
        'Verspätung haben is the everyday way to say delayed.',
      ],
      [
        'Deshalb habe ich den Zug verpasst.',
        'That is why I missed the train.',
        'After deshalb, the verb comes before ich.',
      ],
    ],
    notice:
      'The Perfekt usually has two parts: habe … gearbeitet or bin … gefahren. The participle goes at the end of a simple clause. Verbs of movement or change (fahren, gehen, kommen, aufstehen) use sein; learn the helping verb with each new verb.',
    pronunciation:
      'Participles stress the verb stem, not ge-: geARbeitet, geFAHren. The ge- is short and light.',
    reading: [
      'Gestern hat Lea bis fünf Uhr gearbeitet. Danach ist sie mit dem Bus gefahren. Der Bus hatte Verspätung. Deshalb hat sie den Zug verpasst.',
      'Yesterday Lea worked until five. Afterwards she took the bus. The bus was late, so she missed the train.',
    ],
    checks: [
      {
        prompt: 'Which helping verb fits? Ich ___ gestern gearbeitet.',
        options: ['bin', 'habe', 'ist'],
        answer: 1,
        explanation: 'Arbeiten uses haben: ich habe gearbeitet.',
      },
      {
        prompt: 'Which helping verb fits? Ich ___ nach Hause gegangen.',
        options: ['bin', 'habe', 'hat'],
        answer: 0,
        explanation: 'Gehen is movement, so it uses sein: ich bin gegangen.',
      },
      {
        prompt: 'Why did Lea miss the train?',
        options: ['Her bus was late', 'She forgot her ticket', 'She worked until midnight'],
        answer: 0,
        explanation:
          'The delay is explicitly linked with deshalb. Do not add reasons that are not in the text.',
      },
    ],
    writing: {
      prompt: 'Write “I worked yesterday” starting with Ich.',
      accepted: ['Ich habe gestern gearbeitet'],
      hint: 'Use habe as the helping verb and put gearbeitet last.',
      explanation: 'Ich habe gestern gearbeitet uses the Perfekt with haben.',
    },
    speaking:
      'Describe yesterday using one sentence with habe and one with bin. Explain a delay with deshalb.',
  },
  {
    id: 'appointments',
    level: 'A2',
    title: 'Arrange and change an appointment',
    outcome: 'Request an appointment and explain that a proposed time does not work.',
    phrases: [
      [
        'Ich möchte einen Termin vereinbaren.',
        'I would like to make an appointment.',
        'Möchte is a polite way to express a wish.',
      ],
      ['Am Dienstag habe ich Zeit.', 'I have time on Tuesday.', 'Am is used with days.'],
      [
        'Könnten wir den Termin verschieben?',
        'Could we move the appointment?',
        'Könnten makes the request polite.',
      ],
      [
        'Halb zehn passt mir gut.',
        'Half past nine suits me well.',
        'German halb zehn is halfway to ten: 9:30.',
      ],
    ],
    notice:
      'With a time phrase first, the verb still takes position two: Am Dienstag habe ich Zeit. Watch halb: halb zehn is 9:30, not 10:30.',
    pronunciation: 'Termin stresses the second syllable: ter-MEEN.',
    reading: [
      'Der erste Termin ist am Montag um neun Uhr. Amir arbeitet am Montag. Die Praxis bietet ihm einen Termin am Dienstag um halb zehn an. Er sagt zu.',
      'The first appointment is on Monday at nine. Amir works on Monday. The practice offers him an appointment on Tuesday at half past nine. He accepts.',
    ],
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
      {
        prompt: 'Listen. What is the receptionist asking?',
        audio: 'Passt Ihnen Donnerstag um drei?',
        options: [
          'Whether Thursday at three suits you',
          'Whether you are free on Tuesday',
          'Your phone number',
        ],
        answer: 0,
        explanation:
          'You heard “Passt Ihnen Donnerstag um drei?”: does Thursday at three suit you?',
      },
    ],
    writing: {
      prompt: 'Write “I have time on Tuesday”, starting with Am Dienstag.',
      accepted: ['Am Dienstag habe ich Zeit'],
      hint: 'The verb habe comes before ich after the opening time phrase.',
      explanation: 'Am Dienstag habe ich Zeit keeps the verb in second position.',
    },
    speaking:
      'Request an appointment, decline Monday with a reason, and offer Tuesday at 9:30. Repeat the agreed time clearly.',
  },
  {
    id: 'housing',
    level: 'A2',
    title: 'Ask about a flat and report a problem',
    outcome: 'Ask what the rent includes and describe a simple household problem.',
    phrases: [
      [
        'Wie hoch ist die Warmmiete?',
        'How much is the rent including heating and service charges?',
        'Ask exactly what is included; electricity is usually separate.',
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
        'Seit + present tense for something that is still going on.',
      ],
    ],
    notice:
      'Kaltmiete is the basic rent; Warmmiete adds heating and service charges (Nebenkosten). Learn nouns with their articles: die Wohnung, die Heizung, die Miete. This is a language exercise, not advice about rental rights.',
    pronunciation: 'Heizung: ei like “eye”, z like ts: HEI-tsung.',
    reading: [
      'Die Wohnung hat zwei Zimmer. Die Warmmiete beträgt 800 Euro. Strom kostet extra. Eine Besichtigung ist am Freitag möglich.',
      'The flat has two rooms. The rent including heating and service charges is €800. Electricity costs extra. A viewing is possible on Friday.',
    ],
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
        explanation: 'Strom kostet extra says electricity is extra.',
      },
      {
        prompt: 'Listen. What does the landlord say?',
        audio: 'Die Nebenkosten kommen noch dazu, ungefähr zweihundert Euro im Monat.',
        options: [
          'Service charges of about €200 a month are extra',
          'The rent is only €200',
          'Everything is included',
        ],
        answer: 0,
        explanation:
          'You heard “Die Nebenkosten kommen noch dazu”: service charges come on top, about €200 a month.',
      },
    ],
    writing: {
      prompt: 'Write “The heating does not work” in German.',
      accepted: ['Die Heizung funktioniert nicht', 'Die Heizung geht nicht'],
      hint: 'Die Heizung + funktioniert + nicht.',
      explanation:
        'Nicht comes after the verb here. In speech, Die Heizung geht nicht is also common.',
    },
    speaking:
      'Ask whether the flat is available and what costs are included. Then report broken heating and say since when.',
  },
  {
    id: 'where-things-are',
    level: 'A2',
    title: 'Where is it? in, auf, neben',
    outcome: 'Describe where things are and where you put them.',
    phrases: [
      [
        'Der Schlüssel liegt auf dem Tisch.',
        'The key is on the table.',
        'Location (Wo?) uses the dative: auf dem Tisch.',
      ],
      [
        'Ich lege den Schlüssel auf den Tisch.',
        'I put the key on the table.',
        'Movement to a place (Wohin?) uses the accusative: auf den Tisch.',
      ],
      [
        'Das Handy ist in der Tasche.',
        'The phone is in the bag.',
        'die becomes der in the dative.',
      ],
      [
        'Die Apotheke ist neben der Bank.',
        'The pharmacy is next to the bank.',
        'Neben means next to.',
      ],
      [
        'Stell die Flaschen bitte in den Kühlschrank.',
        'Please put the bottles in the fridge.',
        'Stellen means put upright; legen means lay flat.',
      ],
    ],
    notice:
      'Nine prepositions (in, an, auf, neben, hinter, vor, über, unter, zwischen) take the dative for location (Wo?) and the accusative for movement (Wohin?). Dative articles: dem for der/das, der for die, den + -n for plural. Short forms are normal: im = in dem, am = an dem, ins = in das.',
    pronunciation:
      'Dem and den differ only in the last sound. Close your lips for m; keep them open for n.',
    checks: [
      {
        prompt: 'Wo ist das Buch? Es liegt auf ___ Tisch.',
        options: ['den', 'dem', 'der'],
        answer: 1,
        explanation: 'Location (Wo?) takes the dative: auf dem Tisch.',
      },
      {
        prompt: 'Wohin legst du das Buch? Auf ___ Tisch.',
        options: ['den', 'dem', 'des'],
        answer: 0,
        explanation: 'Movement (Wohin?) takes the accusative: auf den Tisch.',
      },
      {
        prompt: 'Listen. Where are the glasses?',
        audio: 'Deine Brille liegt im Bad neben dem Waschbecken.',
        options: ['In the bathroom next to the sink', 'In the kitchen', 'On the bed'],
        answer: 0,
        explanation: 'You heard “im Bad neben dem Waschbecken”: in the bathroom next to the sink.',
      },
    ],
    writing: {
      prompt: 'Write “The phone is in the bag” in German.',
      accepted: ['Das Handy ist in der Tasche', 'Das Handy liegt in der Tasche'],
      hint: 'Die Tasche becomes in der Tasche for a location.',
      explanation: 'Location takes the dative: in der Tasche.',
    },
    speaking:
      'Describe three things in your room and where they are. Then say where you put your keys when you come home.',
  },
  {
    id: 'health',
    level: 'A2',
    title: 'Describe symptoms and ask for clarification',
    outcome: 'Explain a simple symptom, ask for a sick note and check instructions.',
    phrases: [
      [
        'Ich habe Halsschmerzen.',
        'I have a sore throat.',
        'Use a short description rather than trying to diagnose yourself.',
      ],
      ['Seit zwei Tagen.', 'For two days.', 'Answers a question about how long.'],
      [
        'Ich brauche eine Krankschreibung.',
        'I need a sick note.',
        'Employers in Germany often need one from the doctor after a few days of illness.',
      ],
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
      'This is language practice, not medical advice. Ask a qualified professional about symptoms or medicine. Seit can describe a situation that started earlier and continues now.',
    pronunciation:
      'Halsschmerzen is Hals + Schmerzen: say both parts clearly, with the stress on Hals.',
    reading: [
      'Noah hat seit zwei Tagen Halsschmerzen. Er ruft in der Praxis an. Die Mitarbeiterin bietet ihm einen Termin am Nachmittag an. Noah bittet sie, langsam zu sprechen.',
      'Noah has had a sore throat for two days. He calls the practice. The staff member offers an afternoon appointment. Noah asks her to speak slowly.',
    ],
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
      {
        prompt: 'Listen. How should the tablets be taken?',
        audio: 'Nehmen Sie die Tabletten zweimal täglich nach dem Essen.',
        options: ['Twice a day after meals', 'Once a day before breakfast', 'Only at night'],
        answer: 0,
        explanation: 'You heard “zweimal täglich nach dem Essen”: twice daily after eating.',
      },
    ],
    writing: {
      prompt: 'Write “I have a sore throat” in German.',
      accepted: ['Ich habe Halsschmerzen', 'Ich hab Halsschmerzen'],
      hint: 'Ich habe + Halsschmerzen. The noun begins with a capital H.',
      explanation: 'Ich habe Halsschmerzen is a common symptom description.',
    },
    speaking:
      'Describe the example symptom, say how long it has lasted, ask for a sick note and ask for the instructions to be written down. Do not use your own sensitive health details.',
  },
  {
    id: 'authorities',
    level: 'A2',
    title: 'Handle an appointment at a public office',
    outcome: 'Register an address, ask which documents you need and follow instructions.',
    phrases: [
      [
        'Ich möchte mich anmelden.',
        'I would like to register my address.',
        'After moving in Germany you must register (Anmeldung). Ummelden means change address.',
      ],
      [
        'Welche Unterlagen brauche ich?',
        'Which documents do I need?',
        'Unterlagen means documents or paperwork.',
      ],
      [
        'Ich habe einen Termin um zehn.',
        'I have an appointment at ten.',
        'Many offices only work with booked appointments.',
      ],
      [
        'Füllen Sie bitte dieses Formular aus.',
        'Please fill in this form.',
        'Ausfüllen is separable.',
      ],
      [
        'Hier unterschreiben, bitte.',
        'Sign here, please.',
        'Short instruction-style German is normal at offices, not rude.',
      ],
      [
        'Könnten Sie mir das bitte zeigen?',
        'Could you show me, please?',
        'Ask to be shown where to sign or what to fill in.',
      ],
    ],
    notice:
      'Official German often uses the infinitive as an instruction: Hier unterschreiben. Nicht rauchen. For an Anmeldung you usually need your passport and a Wohnungsgeberbestätigung (landlord’s confirmation), but requirements vary by city; check the office’s website. This lesson is language practice, not legal advice.',
    pronunciation:
      'Say long words in chunks: Woh-nungs-ge-ber-be-stä-ti-gung. Unterlagen stresses UN-.',
    checks: [
      {
        prompt: 'The officer says: Hier unterschreiben, bitte. What should you do?',
        options: ['Sign here', 'Wait here', 'Pay here'],
        answer: 0,
        explanation: 'Unterschreiben means to sign.',
      },
      {
        prompt: 'Which question asks which documents you need?',
        options: [
          'Welche Unterlagen brauche ich?',
          'Wo ist die Toilette?',
          'Wie lange dauert das?',
        ],
        answer: 0,
        explanation: 'Unterlagen are documents.',
      },
      {
        prompt: 'Listen. What is missing?',
        audio:
          'Sie brauchen noch die Bestätigung von Ihrem Vermieter. Ohne die geht es leider nicht.',
        options: ['The confirmation from your landlord', 'A passport photo', 'The fee'],
        answer: 0,
        explanation:
          'You heard “die Bestätigung von Ihrem Vermieter”: your landlord’s confirmation. Without it, it is not possible.',
      },
    ],
    writing: {
      prompt: 'Write “Which documents do I need?” in German.',
      accepted: ['Welche Unterlagen brauche ich', 'Welche Dokumente brauche ich'],
      hint: 'Welche + Unterlagen + brauche + ich.',
      explanation: 'The question word welche comes first and the verb second.',
    },
    speaking:
      'Role-play: say you have an appointment and want to register your address, ask which documents you need and ask the officer to show you where to sign.',
  },
  {
    id: 'restaurant',
    level: 'A2',
    title: 'Eat out with friends',
    outcome: 'Get a table, order, comment on the food and pay the German way.',
    phrases: [
      [
        'Wir hätten gern einen Tisch für vier Personen.',
        'We would like a table for four.',
        'To book ahead: Ich möchte einen Tisch reservieren.',
      ],
      [
        'Was können Sie empfehlen?',
        'What can you recommend?',
        'A great way to hear natural German.',
      ],
      [
        'Für mich die Pasta, bitte.',
        'The pasta for me, please.',
        'A short, natural ordering pattern.',
      ],
      ['Schmeckt’s?', 'Is everything OK? / Enjoying it?', 'Answer: Ja, sehr lecker!'],
      [
        'Zusammen oder getrennt?',
        'Together or separately?',
        'Staff often ask this. Splitting the bill is completely normal.',
      ],
      [
        'Stimmt so.',
        'Keep the change.',
        'Say it when handing over money to include the tip. Around 5–10 % is usual.',
      ],
    ],
    notice:
      'You usually tell the server the total you want to pay including the tip (Machen Sie 25, bitte) rather than leaving money on the table. In some regions colleagues greet each other at lunchtime with Mahlzeit!',
    pronunciation: 'Lecker has a short e and a relaxed ending: LEK-kuh.',
    checks: [
      {
        prompt: 'The server asks: Zusammen oder getrennt? What does she want to know?',
        options: [
          'If you pay together or separately',
          'If you want to sit together',
          'If you want dessert',
        ],
        answer: 0,
        explanation: 'Getrennt zahlen means each person pays for their own food.',
      },
      {
        prompt: 'The bill is €23. You hand over €30 and want €5 back. What do you say?',
        options: ['Stimmt so.', 'Machen Sie 25, bitte.', 'Zusammen, bitte.'],
        answer: 1,
        explanation:
          'Machen Sie 25 means “make it 25”, a €2 tip. Stimmt so would mean keep all the change.',
      },
      {
        prompt: 'Listen. What is the dish of the day?',
        audio: 'Heute haben wir als Tagesgericht Linsensuppe, und die ist vegan.',
        options: ['Vegan lentil soup', 'Chicken soup', 'Vegan pasta'],
        answer: 0,
        explanation: 'You heard “Linsensuppe, und die ist vegan”: lentil soup, which is vegan.',
      },
    ],
    writing: {
      prompt: 'Tell the server you want to pay separately: “Separately, please.”',
      accepted: ['Getrennt bitte', 'Bitte getrennt'],
      hint: 'Use the word getrennt.',
      explanation: 'Getrennt, bitte asks for separate bills.',
    },
    speaking:
      'Order for yourself, ask for a recommendation, comment on the food and tell the server how you want to pay, including a tip.',
  },
  {
    id: 'shopping-compare',
    level: 'A2',
    title: 'Compare and choose',
    outcome: 'Compare two options, try things on and ask for another size.',
    phrases: [
      [
        'Die blaue Jacke ist billiger als die schwarze.',
        'The blue jacket is cheaper than the black one.',
        'Comparative + als.',
      ],
      [
        'Die ist genauso teuer wie die andere.',
        'This one is just as expensive as the other one.',
        'Genauso … wie means as … as. In speech, die often means this one.',
      ],
      ['Kann ich das anprobieren?', 'Can I try this on?', 'Umkleide is the changing room.'],
      [
        'Haben Sie das eine Nummer größer?',
        'Do you have this one size bigger?',
        'Or: eine Nummer kleiner.',
      ],
      ['Die gefällt mir am besten.', 'I like this one best.', 'gut → besser → am besten.'],
    ],
    notice:
      'Add -er to compare and am …-sten for the top: billig, billiger, am billigsten. Many short adjectives add an umlaut: groß → größer, alt → älter. Irregular: gut → besser, gern → lieber, viel → mehr.',
    pronunciation: 'Größer has a long ö and a sharp ß. Keep your lips rounded throughout.',
    checks: [
      {
        prompt: 'Complete: Der Zug ist schneller ___ der Bus.',
        options: ['wie', 'als', 'dann'],
        answer: 1,
        explanation:
          'Comparatives use als. You may hear wie in casual speech, but als is standard.',
      },
      {
        prompt: 'Complete: Das Hemd ist genauso teuer ___ die Hose.',
        options: ['als', 'wie', 'so'],
        answer: 1,
        explanation: 'Equal comparisons use genauso … wie.',
      },
      {
        prompt: 'Listen. Which sizes are left?',
        audio: 'Die Jacke gibt es leider nur noch in S und in XL.',
        options: ['Only S and XL', 'Only M', 'All sizes'],
        answer: 0,
        explanation: 'You heard “nur noch in S und in XL”: only S and XL are left.',
      },
    ],
    writing: {
      prompt: 'Write “Can I try this on?” in German.',
      accepted: [
        'Kann ich das anprobieren',
        'Kann ich das mal anprobieren',
        'Darf ich das anprobieren',
      ],
      hint: 'Kann ich + das + anprobieren.',
      explanation: 'Anprobieren stays together as an infinitive at the end.',
    },
    speaking:
      'Compare two things you might buy. Say which is cheaper, which is better and which you would choose.',
  },
  {
    id: 'reasons-conditions',
    level: 'A2',
    title: 'Because, that and if: weil, dass, wenn',
    outcome: 'Give reasons, report thoughts and set conditions in connected sentences.',
    phrases: [
      [
        'Ich komme später, weil mein Zug Verspätung hat.',
        'I will be late because my train is delayed.',
        'Weil sends the verb to the end.',
      ],
      [
        'Ich glaube, dass das eine gute Idee ist.',
        'I think that is a good idea.',
        'Dass also sends the verb to the end. In speech, many people drop dass: Ich glaube, das ist eine gute Idee.',
      ],
      [
        'Wenn du Zeit hast, ruf mich an.',
        'If you have time, call me.',
        'When the wenn clause comes first, the next clause starts with the verb.',
      ],
      [
        'Ich kann nicht kommen, denn ich bin krank.',
        'I cannot come because I am ill.',
        'Denn keeps normal word order.',
      ],
      [
        'Deshalb bleibe ich heute zu Hause.',
        'That is why I am staying at home today.',
        'Deshalb is followed directly by the verb.',
      ],
    ],
    notice:
      'Weil, dass, wenn, ob and obwohl send the conjugated verb to the end of their clause. Denn, aber, und and oder do not change word order. In fast speech you may hear weil with normal word order after a pause; understand it, but write the verb at the end.',
    pronunciation:
      'Pause briefly at the comma. Your voice stays up at the end of the first clause and falls at the end of the sentence.',
    checks: [
      {
        prompt: 'Which is correct in writing?',
        options: [
          '…, weil ich habe keine Zeit.',
          '…, weil ich keine Zeit habe.',
          '…, weil habe ich keine Zeit.',
        ],
        answer: 1,
        explanation: 'After weil, the conjugated verb habe goes to the end.',
      },
      {
        prompt: 'Choose the right word: ___ es regnet, nehmen wir den Bus.',
        options: ['Wenn', 'Denn', 'Dass'],
        answer: 0,
        explanation: 'Wenn sets a condition: if it rains.',
      },
      {
        prompt: 'Listen. What does the speaker think?',
        audio: 'Ich glaube, dass der Laden am Sonntag zu ist.',
        options: [
          'The shop is closed on Sunday',
          'The shop opens on Sunday',
          'The shop has closed for good',
        ],
        answer: 0,
        explanation:
          'You heard “dass der Laden am Sonntag zu ist”. Zu means closed. Most shops close on Sundays.',
      },
    ],
    writing: {
      prompt: 'Write “I am staying at home because I am ill.”',
      accepted: [
        'Ich bleibe zu Hause weil ich krank bin',
        'Ich bleibe zuhause weil ich krank bin',
        'Ich bleibe daheim weil ich krank bin',
      ],
      hint: 'Ich bleibe zu Hause, weil ich krank … (verb last).',
      explanation: 'The main clause has normal word order; the weil clause ends with bin.',
    },
    speaking:
      'Explain why you are late, say what you think about a plan using dass, and set a condition with wenn.',
  },
  {
    id: 'feelings',
    level: 'A2',
    title: 'Talk about feelings and react',
    outcome: 'Express feelings, look forward to things and react to news like a native speaker.',
    phrases: [
      [
        'Ich freue mich auf das Wochenende.',
        'I am looking forward to the weekend.',
        'Sich freuen auf: look forward to something in the future.',
      ],
      [
        'Ich freue mich über das Geschenk.',
        'I am happy about the present.',
        'Sich freuen über: be happy about something that has happened.',
      ],
      [
        'Ich ärgere mich über den Lärm.',
        'The noise annoys me.',
        'Sich ärgern über: be annoyed about.',
      ],
      [
        'Ich habe mich erkältet.',
        'I have caught a cold.',
        'Reflexive verbs keep the pronoun in the past.',
      ],
      [
        'Echt? Wie cool! / Oh nein, das tut mir leid.',
        'Really? How cool! / Oh no, I am sorry.',
        'Quick reactions keep a conversation human.',
      ],
      [
        'Das ist ja krass!',
        'That is crazy! / Wow!',
        'A very common casual reaction to surprising news, good or bad. Avoid it in formal settings.',
      ],
    ],
    notice:
      'Reflexive verbs need a pronoun: ich freue mich, du freust dich, er/sie freut sich, wir freuen uns, Sie freuen sich. Many take a fixed preposition: sich freuen auf (future), sich freuen über (now or past), sich interessieren für.',
    pronunciation:
      'In ärgern, ä is open, like the “ai” in “air”. Echt? rises sharply; it sounds interested, not doubtful.',
    checks: [
      {
        prompt: 'Your holiday starts next week. Which sentence fits?',
        options: [
          'Ich freue mich über den Urlaub.',
          'Ich freue mich auf den Urlaub.',
          'Ich freue auf den Urlaub.',
        ],
        answer: 1,
        explanation: 'For something in the future, use sich freuen auf.',
      },
      {
        prompt: 'A friend says: Ich habe den Job bekommen! What is the best reaction?',
        options: ['Echt? Wie cool, Glückwunsch!', 'Das tut mir leid.', 'Ich ärgere mich.'],
        answer: 0,
        explanation: 'Glückwunsch means congratulations.',
      },
      {
        prompt: 'Listen. Why is the speaker annoyed?',
        audio: 'Ich ärgere mich total, weil mein Paket schon wieder nicht angekommen ist.',
        options: [
          'The parcel has not arrived again',
          'The parcel was damaged',
          'The parcel was expensive',
        ],
        answer: 0,
        explanation: 'You heard “schon wieder nicht angekommen”: again it has not arrived.',
      },
    ],
    writing: {
      prompt: 'Write “I am looking forward to the weekend.”',
      accepted: [
        'Ich freue mich auf das Wochenende',
        'Ich freue mich aufs Wochenende',
        'Ich freu mich aufs Wochenende',
        'Ich freu mich auf das Wochenende',
      ],
      hint: 'Ich freue mich + auf + das Wochenende.',
      explanation: 'Aufs is the everyday short form of auf das.',
    },
    speaking:
      'Tell a friend what you are looking forward to and what annoys you at the moment. Then react to their good news and their bad news.',
  },
  {
    id: 'particles',
    level: 'A2',
    title: 'Sound natural: doch, mal, ja, halt',
    outcome: 'Understand and use the small words that make German sound friendly and natural.',
    phrases: [
      [
        'Komm doch mit!',
        'Why don’t you come along?',
        'Doch in a suggestion adds friendly encouragement.',
      ],
      [
        'Kannst du mal kurz schauen?',
        'Could you have a quick look?',
        'Mal softens requests and makes them casual.',
      ],
      ['Das ist ja super!', 'Oh, that’s great!', 'Ja adds pleasant surprise or shared knowledge.'],
      [
        'Das ist halt so.',
        'That’s just how it is.',
        'Halt accepts something that cannot be changed. More common in the south; eben in the north.',
      ],
      ['Doch!', 'Yes, it is! / Yes, I do!', 'Contradicts a negative: Du kommst nicht mit? – Doch!'],
      ['Genau.', 'Exactly. / Right.', 'The most common agreement word in spoken German.'],
    ],
    notice:
      'Modal particles (doch, mal, ja, halt, eben, schon) do not translate word for word; they change the tone. Without mal, Kannst du helfen? can sound abrupt. German without them sounds stiff, but one particle per sentence is plenty.',
    pronunciation:
      'Particles are quick and unstressed: Komm doch MIT. Stressing DOCH changes the meaning to a strong contradiction.',
    checks: [
      {
        prompt: 'Du hast keinen Hunger? ___, ich habe großen Hunger!',
        options: ['Ja', 'Doch', 'Nein'],
        answer: 1,
        explanation: 'To contradict a negative question, answer Doch.',
      },
      {
        prompt: 'Which request sounds the most friendly and natural?',
        options: ['Hilf mir.', 'Kannst du mir mal helfen?', 'Du hilfst mir.'],
        answer: 1,
        explanation: 'Kannst du … mal …? is a soft, casual request.',
      },
      {
        prompt: 'Listen. What is the speaker’s attitude?',
        audio: 'Ist halt so, da kann man nichts machen.',
        options: ['Accepting something that cannot be changed', 'Very angry', 'Excited'],
        answer: 0,
        explanation: 'You heard “Ist halt so, da kann man nichts machen”: it is what it is.',
      },
      {
        prompt: 'What does mal do in Schau mal!?',
        options: [
          'It makes the instruction casual and friendly',
          'It means one time only',
          'It makes it past tense',
        ],
        answer: 0,
        explanation: 'Mal softens an instruction. Schau mal! means “Have a look!”',
      },
    ],
    writing: {
      prompt: 'Write the friendly suggestion “Why don’t you come along?” with doch.',
      accepted: ['Komm doch mit', 'Kommt doch mit', 'Kommen Sie doch mit'],
      hint: 'Komm + doch + mit.',
      explanation: 'Mitkommen is separable, so mit goes last. Doch sits in the middle.',
    },
    speaking:
      'Invite a friend with doch, ask for help with mal, and answer a negative question with Doch!',
  },
  {
    id: 'fast-german',
    level: 'A2',
    title: 'Understand fast, everyday German',
    outcome: 'Recognise the shortened forms people really use in speech and voice messages.',
    phrases: [
      [
        'Haste mal ne Minute?',
        'Hast du mal eine Minute? – Have you got a minute?',
        'Du merges with the verb (haste, kannste); eine becomes ne.',
      ],
      [
        'Ich hab keine Ahnung.',
        'Ich habe keine Ahnung. – I have no idea.',
        'The -e of ich habe is almost always dropped in speech.',
      ],
      ['Was gibt’s?', 'Was gibt es? – What’s up?', 'Es shrinks to ’s: gibt’s, geht’s, war’s.'],
      [
        'Ich geh mal kurz raus.',
        'Ich gehe mal kurz hinaus. – I’m just popping out.',
        'Raus and rein replace hinaus and herein in speech.',
      ],
      [
        'Nee, is schon okay.',
        'Nein, das ist schon okay. – No, it’s fine.',
        'Nee means nein; das is often dropped at the start; ist can sound like is.',
      ],
      [
        'Weiß ich nicht.',
        'Das weiß ich nicht. – Dunno.',
        'Dropping the first word is very common.',
      ],
    ],
    notice:
      'These forms are normal spoken German, not mistakes. You will hear them in shops, offices and every WhatsApp voice note. Use them in casual speech if you like, but write the full forms in emails and exams.',
    pronunciation:
      'Fast speech drops unstressed sounds: ich habe es gesehen becomes “ich hab’s gesehn”. Keep the stressed syllables clear and the rest will sound natural.',
    checks: [
      {
        prompt: 'Listen. What does the person ask?',
        audio: 'Haste mal ne Minute?',
        options: ['If you have a minute', 'If you have a pen', 'If you are hungry'],
        answer: 0,
        explanation: 'You heard “Haste mal ne Minute?” = Hast du mal eine Minute?',
      },
      {
        prompt: 'Listen. What does the person mean?',
        audio: 'Keine Ahnung, frag mal Tobi.',
        options: ['They do not know; ask Tobi', 'Tobi has no idea', 'They will ask Tobi later'],
        answer: 0,
        explanation: 'You heard “Keine Ahnung, frag mal Tobi”: no idea, ask Tobi.',
      },
      {
        prompt: 'What is the full form of Wie geht’s?',
        options: ['Wie geht es?', 'Wie gehst du?', 'Wie gehen Sie?'],
        answer: 0,
        explanation: '’s stands for es: Wie geht es (dir/Ihnen)?',
      },
    ],
    writing: {
      prompt: 'Write the full form of “Ich hab’s vergessen” (I forgot it).',
      accepted: ['Ich habe es vergessen'],
      hint: 'hab → habe, ’s → es.',
      explanation: 'Ich hab’s vergessen is the spoken form of Ich habe es vergessen.',
    },
    speaking:
      'Read each phrase at normal speed, then in its full form. Notice which syllables disappear and which stay stressed.',
  },
  {
    id: 'train-problems',
    level: 'A2',
    title: 'When the train is cancelled',
    outcome: 'Understand disruption announcements and ask staff for alternatives.',
    phrases: [
      ['Der Zug fällt aus.', 'The train is cancelled.', 'Ausfallen means to be cancelled.'],
      [
        'Ich habe meinen Anschluss verpasst.',
        'I have missed my connection.',
        'Anschluss is a connecting train.',
      ],
      [
        'Wo fährt der Ersatzverkehr ab?',
        'Where does the replacement service leave from?',
        'Ersatzverkehr (SEV) means replacement buses.',
      ],
      [
        'Gilt mein Ticket auch für den ICE?',
        'Is my ticket also valid for the ICE?',
        'Gelten means to be valid.',
      ],
      [
        'Welcher Zug fährt als Nächstes nach Hamburg?',
        'Which is the next train to Hamburg?',
        'Ask staff at the DB service point.',
      ],
    ],
    notice:
      'Announcements use fixed formal phrases: Wir bitten um Entschuldigung (we apologise), Grund dafür ist … (the reason is …), Bitte beachten Sie … (please note …). Check the app too, but ask a person when it matters. Passenger rights depend on the situation; this lesson practises language only.',
    pronunciation:
      'Listen for three key words in announcements: Gleis (platform), Verspätung (delay) and fällt aus (cancelled).',
    reading: [
      'Information zu ICE 578 nach Hamburg: Dieser Zug fällt heute aus. Grund dafür ist eine Streckensperrung. Reisende nach Hamburg nutzen bitte den Ersatzverkehr mit Bussen ab dem Bahnhofsvorplatz.',
      'Information about ICE 578 to Hamburg: this train is cancelled today because the line is closed. Passengers to Hamburg, please use the replacement buses from the square in front of the station.',
    ],
    checks: [
      {
        prompt: 'What does Der Zug fällt aus mean?',
        options: ['The train is cancelled', 'The train is late', 'The train is full'],
        answer: 0,
        explanation: 'Ausfallen means to be cancelled.',
      },
      {
        prompt: 'Read the notice. Where do the replacement buses leave from?',
        options: ['Platform 5', 'In front of the station', 'The airport'],
        answer: 1,
        explanation: 'Bahnhofsvorplatz is the square in front of the station.',
      },
      {
        prompt: 'Listen. What is happening?',
        audio:
          'Der ICE nach München hat heute etwa zwanzig Minuten Verspätung. Wir bitten um Entschuldigung.',
        options: [
          'The ICE to Munich is about 20 minutes late',
          'The ICE to Munich is cancelled',
          'The ICE leaves 20 minutes early',
        ],
        answer: 0,
        explanation: 'You heard “etwa zwanzig Minuten Verspätung”: about twenty minutes late.',
      },
    ],
    writing: {
      prompt: 'Write “The train is cancelled.”',
      accepted: ['Der Zug fällt aus', 'Der Zug fällt heute aus'],
      hint: 'Der Zug + fällt + aus.',
      explanation: 'Ausfallen is separable: fällt … aus.',
    },
    speaking:
      'At the service point: say your train was cancelled and you missed your connection, then ask which train you can take and whether your ticket is valid.',
  },
]);
