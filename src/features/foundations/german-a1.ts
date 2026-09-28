import { defineLessons } from './types';

// Original A1 lessons. Level labels describe task difficulty, not a certified level.
export const germanA1Lessons = defineLessons('DE', [
  {
    id: 'greetings',
    level: 'A1',
    title: 'Hello, please and thank you',
    outcome: 'Greet people, thank them and say goodbye in formal and casual situations.',
    phrases: [
      ['Hallo!', 'Hello!', 'Works almost everywhere: with friends, colleagues and in most shops.'],
      [
        'Guten Tag!',
        'Hello! / Good day!',
        'A polite daytime greeting at a reception desk, office or shop. Many people shorten it to Tag!',
      ],
      ['Guten Morgen!', 'Good morning!', 'Until late morning. You will often hear just Morgen!'],
      [
        'Bitte.',
        'Please. / You are welcome.',
        'With a request it means please. After Danke it means you are welcome; Gern geschehen and Gerne are also common.',
      ],
      [
        'Danke.',
        'Thank you.',
        'Use it whenever someone helps you. Danke schön is warm; Vielen Dank is a little stronger.',
      ],
      ['Tschüss!', 'Bye!', 'The everyday goodbye with friends, colleagues and in most shops.'],
      [
        'Auf Wiedersehen!',
        'Goodbye!',
        'More formal: offices, doctors and older strangers. On the phone, say Auf Wiederhören.',
      ],
    ],
    notice:
      'German nouns start with a capital letter: Tag means day. Regional greetings are normal and friendly: Moin in the north, Servus in the south and Austria, Grüß Gott in Bavaria and Austria. You can simply answer with the same greeting.',
    pronunciation:
      'Tag ends with a k sound: at the end of a word, g sounds like k and d like t. Danke ends with a short, relaxed “uh”; the final e is never silent.',
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
        options: ['Bitte.', 'Tschüss!', 'Hallo!'],
        answer: 0,
        explanation:
          'Bitte can mean you are welcome when it answers Danke. Its meaning depends on the situation.',
      },
      {
        prompt: 'Listen. What is the person doing?',
        audio: 'Tschüss, bis morgen!',
        options: ['Saying goodbye until tomorrow', 'Ordering something', 'Asking for help'],
        answer: 0,
        explanation:
          'You heard “Tschüss, bis morgen!” Tschüss is an informal goodbye; bis morgen means see you tomorrow.',
      },
    ],
    writing: {
      prompt: 'Write the German word for “Thank you”.',
      accepted: ['Danke', 'Danke schön', 'Dankeschön', 'Vielen Dank', 'Danke sehr'],
      hint: 'It begins with D. Look back at the polite expressions if you need help.',
      explanation: 'Danke is the short everyday expression. Vielen Dank means thank you very much.',
    },
    speaking:
      'Imagine entering a shop. Say Guten Tag. Someone helps you, so say Danke. When you leave, say Tschüss or Auf Wiedersehen.',
  },
  {
    id: 'introductions',
    level: 'A1',
    title: 'Say your name',
    outcome: 'Introduce yourself naturally and ask someone’s name in the right register.',
    phrases: [
      [
        'Ich bin Sara.',
        'I am Sara.',
        'The most common way to say your name in everyday conversation. Replace Sara with your name.',
      ],
      [
        'Ich heiße Sara.',
        'My name is Sara.',
        'Literally “I am called Sara”. Very common in classes, forms and first meetings.',
      ],
      [
        'Wie heißen Sie?',
        'What is your name? (polite)',
        'Use Sie with adults you do not know, at appointments and at work until someone offers du.',
      ],
      [
        'Wie heißt du?',
        'What is your name? (informal)',
        'Use du with friends, family, children and most younger people in casual settings.',
      ],
      ['Freut mich.', 'Nice to meet you.', 'A short friendly response after an introduction.'],
      ['Und du? / Und Sie?', 'And you?', 'Turn the question back to keep the conversation going.'],
    ],
    notice:
      'Sie is the polite form of you and keeps its capital S. Du is informal. Students, start-ups and sports clubs often use du immediately; when unsure, start with Sie and let the other person offer du. If your keyboard has no ß, type ss in these exercises.',
    pronunciation:
      'In heiße, ei sounds like English “eye” and ß like a sharp s: HEI-se. In Sie, ie is a long “ee”.',
    checks: [
      {
        prompt: 'At an appointment, someone asks Wie heißen Sie? What do they want to know?',
        options: ['Your address', 'Your name', 'The time'],
        answer: 1,
        explanation:
          'Wie heißen Sie? asks your name politely. You can answer Ich heiße … or Ich bin …',
      },
      {
        prompt: 'Which question uses the familiar form of you?',
        options: ['Wie heißen Sie?', 'Freut mich.', 'Wie heißt du?'],
        answer: 2,
        explanation:
          'Du is the familiar form of you. Sie is the polite form. Freut mich means nice to meet you.',
      },
      {
        prompt: 'Listen. What does Jonas want you to do?',
        audio: 'Hallo, ich bin Jonas. Und du?',
        options: ['Tell him your name', 'Tell him the time', 'Say goodbye'],
        answer: 0,
        explanation:
          'You heard “Hallo, ich bin Jonas. Und du?” He introduces himself and asks for your name.',
      },
    ],
    writing: {
      prompt:
        'Introduce the example person Sara. Write “My name is Sara” or “I am Sara” in German.',
      accepted: ['Ich heiße Sara', 'Mein Name ist Sara', 'Ich bin Sara'],
      hint: 'Use Ich + heiße + Sara, or Ich + bin + Sara. You can type heisse if ß is unavailable.',
      explanation:
        'Ich heiße Sara and Ich bin Sara are both natural. Mein Name ist Sara sounds a little more formal.',
    },
    speaking:
      'Say Hallo, ich bin followed by your own name. Then say Freut mich and ask back: Und du? Finally, practise the polite Wie heißen Sie?',
  },
  {
    id: 'ask-for-help',
    level: 'A1',
    title: 'Ask someone to slow down',
    outcome:
      'Say that you do not understand, ask for repetition and keep the conversation in German.',
    phrases: [
      ['Entschuldigung!', 'Excuse me! / Sorry!', 'Politely get someone’s attention, or apologise.'],
      [
        'Wie bitte?',
        'Pardon? / Sorry?',
        'The most common way to ask someone to repeat. Say it with a rising voice.',
      ],
      [
        'Ich verstehe das nicht.',
        'I do not understand (that).',
        'A useful complete sentence when you cannot follow what someone says.',
      ],
      [
        'Können Sie bitte langsamer sprechen?',
        'Could you speak more slowly, please?',
        'Langsamer means more slowly. It sounds more natural than langsam here.',
      ],
      [
        'Noch mal, bitte.',
        'Once more, please.',
        'Noch einmal is the full form; noch mal is what most people say.',
      ],
      [
        'Was heißt … auf Deutsch?',
        'What is … in German?',
        'Ask for a word you are missing. Use auf Englisch to ask the other way round.',
      ],
      [
        'Ich lerne Deutsch. Bitte auf Deutsch.',
        'I am learning German. In German, please.',
        'Many Germans switch to English to be helpful. This politely keeps the conversation in German.',
      ],
    ],
    notice:
      'Nicht makes a statement negative: Ich verstehe means I understand; Ich verstehe das nicht means I do not understand. Wie bitte? is not rude; it is the normal way to ask for repetition. A bare Was? sounds blunt with strangers.',
    pronunciation:
      'In Entschuldigung, stress the second part: ent-SCHUL-di-gung. The ending -ung sounds like the “ng” in “sing”, with no hard g.',
    checks: [
      {
        prompt: 'Someone is speaking too quickly. Which phrase asks them to slow down?',
        options: ['Freut mich.', 'Können Sie bitte langsamer sprechen?', 'Tschüss!'],
        answer: 1,
        explanation:
          'Langsamer means more slowly. Können Sie bitte langsamer sprechen? is a polite request.',
      },
      {
        prompt: 'You did not catch what the cashier said. What is the quickest natural reaction?',
        options: ['Wie bitte?', 'Guten Tag!', 'Danke schön.'],
        answer: 0,
        explanation: 'Wie bitte? asks for a repetition politely and instantly.',
      },
      {
        prompt: 'Listen. What does the speaker ask for?',
        audio: 'Ich lerne Deutsch. Können Sie das bitte noch mal sagen?',
        options: ['A repetition', 'A discount', 'Directions'],
        answer: 0,
        explanation:
          'You heard “Können Sie das bitte noch mal sagen?” Noch mal sagen means say again.',
      },
    ],
    writing: {
      prompt: 'Write the short phrase “Once again, please” in German.',
      accepted: [
        'Noch einmal bitte',
        'Bitte noch einmal',
        'Noch mal bitte',
        'Nochmal bitte',
        'Bitte noch mal',
      ],
      hint: 'Start with Noch mal or Noch einmal and add bitte. Punctuation is optional here.',
      explanation:
        'Noch einmal, bitte asks for a repetition. In everyday speech you mostly hear Noch mal, bitte.',
    },
    speaking:
      'Imagine a receptionist speaks too quickly. Say Entschuldigung. Ich verstehe das nicht. Können Sie bitte langsamer sprechen? Then practise Wie bitte? with a rising voice.',
  },
  {
    id: 'de-sounds',
    level: 'A1',
    title: 'The German sounds that matter most',
    outcome: 'Recognise the sounds that change meaning and make your German easy to understand.',
    phrases: [
      [
        'schön – schon',
        'beautiful – already',
        'ö: say “ay” with rounded lips. Without the dots it is a plain o, and the meaning changes.',
      ],
      ['Tür – Tier', 'door – animal', 'ü: say “ee” and round your lips as if whistling.'],
      [
        'ich – ach',
        'I – oh',
        'After i, e, ä, ö, ü and consonants, ch is a soft hiss. After a, o, u it is scraped at the back, like Scottish “loch”.',
      ],
      [
        'Wein – Wien',
        'wine – Vienna',
        'ei sounds like “eye”; ie sounds like “ee”. Read the second letter.',
      ],
      [
        'Wasser, Zeit, vier',
        'water, time, four',
        'German w sounds like English v; z is ts; v is usually f.',
      ],
      [
        'Straße, Sport, Spiel',
        'street, sport, game',
        'At the start of a word or word part, st and sp sound like “sht” and “shp”.',
      ],
      [
        'Lehrer, besser, Wetter',
        'teacher, better, weather',
        'Final -er is a relaxed “uh”, not a hard r.',
      ],
    ],
    notice:
      'You do not need a perfect accent. These sounds matter because they change meaning (schön/schon, Tür/Tier) or because missing them makes words hard to recognise. Stress is usually on the first syllable: ARbeit, WOHnung. Words beginning with be-, ver- or ge- stress the next syllable: beZAHlen, verSTEhen.',
    pronunciation:
      'Practise in pairs: say schon, then schön; Tier, then Tür. Keep your tongue still and change only your lips.',
    checks: [
      {
        prompt: 'Listen. Which word did you hear?',
        audio: 'schön',
        options: ['schon', 'schön', 'Schein'],
        answer: 1,
        explanation: 'You heard schön (beautiful), with rounded lips.',
      },
      {
        prompt: 'Listen. Which word did you hear?',
        audio: 'Tür',
        options: ['Tier', 'Tür', 'Tor'],
        answer: 1,
        explanation: 'You heard Tür (door). Tier (animal) has spread lips.',
      },
      {
        prompt: 'How does German w sound in Wasser?',
        options: ['Like the w in “water”', 'Like the v in “van”', 'It is silent'],
        answer: 1,
        explanation: 'German w sounds like English v: Wasser = “VAS-suh”.',
      },
      {
        prompt: 'Which word has the soft ich-sound, not the scraped ach-sound?',
        options: ['Buch', 'nicht', 'acht'],
        answer: 1,
        explanation: 'After i, ch is soft: nicht. After u and a it is scraped: Buch, acht.',
      },
    ],
    writing: {
      prompt: 'Write the German word for “beautiful”. Type oe if you have no ö.',
      accepted: ['schön'],
      hint: 'It is one of the pairs above: schon or schön? Only one means beautiful.',
      explanation: 'Schön has an umlaut. Without it, schon means already.',
    },
    speaking:
      'Read each pair slowly, then quickly: schon – schön, Tier – Tür, ich – ach, Wein – Wien. If you can, record yourself on your phone and compare with the audio.',
  },
  {
    id: 'origin',
    level: 'A1',
    title: 'Where you are from and what you speak',
    outcome: 'Say where you come from, where you live and which languages you speak.',
    phrases: [
      ['Woher kommst du?', 'Where are you from? (informal)', 'Polite form: Woher kommen Sie?'],
      [
        'Ich komme aus Indien.',
        'I am from India.',
        'aus + country. Some countries take an article: aus der Türkei, aus den USA, aus dem Iran.',
      ],
      ['Ich wohne in Hamburg.', 'I live in Hamburg.', 'in + city or country.'],
      [
        'Ich spreche Englisch und ein bisschen Deutsch.',
        'I speak English and a little German.',
        'Ein bisschen means a little. Useful and honest.',
      ],
      [
        'Und was machst du beruflich?',
        'And what do you do for work?',
        'A classic follow-up question after where someone is from.',
      ],
    ],
    notice:
      'Verb endings follow the person: ich komme, du kommst, er/sie kommt, wir/Sie kommen. Most verbs work the same way: wohnen → ich wohne, du wohnst. In a question with a question word, the verb comes second: Woher kommst du?',
    pronunciation:
      'In woher, stress the second part: wo-HER. Questions with a question word usually fall at the end rather than rise.',
    checks: [
      {
        prompt: 'Which verb form fits? Ich ___ aus Brasilien.',
        options: ['kommst', 'komme', 'kommen'],
        answer: 1,
        explanation: 'With ich, the verb ends in -e: ich komme.',
      },
      {
        prompt: 'Which verb form fits? Woher ___ du?',
        options: ['kommst', 'komme', 'kommt'],
        answer: 0,
        explanation: 'With du, the verb ends in -st: du kommst.',
      },
      {
        prompt: 'Listen. Where does the speaker live now?',
        audio: 'Ich komme aus Syrien, aber ich wohne seit zwei Jahren in Köln.',
        options: ['In Syria', 'In Cologne', 'In Berlin'],
        answer: 1,
        explanation:
          'You heard “ich wohne seit zwei Jahren in Köln”. Köln is Cologne; seit zwei Jahren means for two years.',
      },
    ],
    writing: {
      prompt: 'Write “I live in Berlin” in German.',
      accepted: ['Ich wohne in Berlin', 'Ich lebe in Berlin'],
      hint: 'Ich + wohne + in + Berlin.',
      explanation: 'Ich wohne in Berlin is the everyday way to say where you live.',
    },
    speaking:
      'Say where you come from, where you live and which languages you speak. Then ask back: Und du? Woher kommst du?',
  },
  {
    id: 'numbers',
    level: 'A1',
    title: 'Numbers and prices',
    outcome: 'Understand prices at the till and ask what something costs.',
    phrases: [
      ['eins, zwei, drei, vier, fünf', 'one, two, three, four, five', 'Count items slowly.'],
      [
        'sechs, sieben, acht, neun, zehn',
        'six, seven, eight, nine, ten',
        'Try counting without the English words.',
      ],
      [
        'zwanzig, einundzwanzig, dreißig',
        'twenty, twenty-one, thirty',
        'From 21, German says the ones first: einundzwanzig is “one-and-twenty”.',
      ],
      ['Was kostet das?', 'How much does that cost?', 'Point to the item when needed.'],
      [
        'Das macht zwölf Euro fünfzig.',
        'That comes to twelve euros fifty.',
        'What cashiers say at the till. Das macht … means the total is …',
      ],
    ],
    notice:
      'German uses a decimal comma: 3,50 € means three euros fifty; you will hear drei Euro fünfzig. Numbers like 47 are said backwards: siebenundvierzig (seven-and-forty). When you hear one, write the last digit first.',
    pronunciation:
      'On the phone and in announcements you will often hear zwo instead of zwei, so it is not confused with drei. The z in zwei and zehn sounds like ts.',
    reading: [
      'Tee: 2 €. Kaffee: 3 €. Wasser: 1 €. Ein Kaffee und ein Wasser kosten zusammen vier Euro.',
      'Tea: €2. Coffee: €3. Water: €1. A coffee and a water cost four euros altogether.',
    ],
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
        explanation: 'Water costs one euro and tea two euros.',
      },
      {
        prompt: 'Listen. How much do you pay?',
        audio: 'Das macht sieben Euro zwanzig.',
        options: ['€7.20', '€27.00', '€2.70'],
        answer: 0,
        explanation: 'You heard “sieben Euro zwanzig”: seven euros twenty cents.',
      },
      {
        prompt: 'How do you say 45 in German?',
        options: ['vierzigfünf', 'fünfundvierzig', 'vierundfünfzig'],
        answer: 1,
        explanation: 'Ones first, then tens: fünfundvierzig is “five-and-forty”.',
      },
    ],
    writing: {
      prompt: 'Write “That costs three euros” in German.',
      accepted: ['Das kostet drei Euro', 'Das kostet 3 Euro'],
      hint: 'Use Das + kostet + the number + Euro.',
      explanation:
        'Das kostet drei Euro is a complete price statement. Euro stays singular after a number.',
    },
    speaking:
      'Read the prices aloud. Ask Was kostet das? and answer with each price. Then say your phone number digit by digit, using zwo for 2.',
  },
  {
    id: 'cafe',
    level: 'A1',
    title: 'Order and pay in a café',
    outcome:
      'Order politely, answer the “for here or to go” question and ask about paying by card.',
    phrases: [
      [
        'Ich hätte gern einen Kaffee.',
        'I would like a coffee.',
        'The standard polite order. Ich nehme … (I’ll take …) is also very common.',
      ],
      [
        'Für hier oder zum Mitnehmen?',
        'For here or to take away?',
        'You will hear this at almost every counter.',
      ],
      ['Zum Mitnehmen, bitte.', 'To take away, please.', 'Or: Für hier, bitte.'],
      [
        'Kann ich mit Karte zahlen?',
        'Can I pay by card?',
        'Ask before ordering; some smaller cafés and bakeries still take cash only.',
      ],
      ['Die Rechnung, bitte.', 'The bill, please.', 'At a table. Zahlen, bitte! is also common.'],
    ],
    notice:
      'Der Kaffee becomes einen Kaffee after Ich hätte gern. German articles change with the sentence role. For now, learn the whole request and replace the item only when you know its form.',
    pronunciation:
      'In hätte, ä sounds like the e in “bed”. Gern has a soft r: say it gently rather than rolling it hard.',
    reading: [
      'Mira bestellt einen Kaffee zum Mitnehmen. Sie fragt: „Kann ich mit Karte zahlen?“ Der Verkäufer sagt: „Heute leider nur bar.“',
      'Mira orders a takeaway coffee. She asks whether she can pay by card. The seller says: “Unfortunately, cash only today.”',
    ],
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
      {
        prompt: 'Listen. What is the barista asking?',
        audio: 'Für hier oder zum Mitnehmen?',
        options: [
          'Whether you will stay or take it away',
          'Whether you want milk',
          'How you want to pay',
        ],
        answer: 0,
        explanation: 'You heard “Für hier oder zum Mitnehmen?”: for here or to take away?',
      },
    ],
    writing: {
      prompt: 'Ask “Can I pay by card?” in German.',
      accepted: [
        'Kann ich mit Karte zahlen',
        'Kann ich mit Karte bezahlen',
        'Kann ich hier mit Karte zahlen',
      ],
      hint: 'Start with Kann ich and include mit Karte.',
      explanation: 'In this yes/no question, Kann comes first and zahlen comes last.',
    },
    speaking:
      'Order a coffee, answer Für hier oder zum Mitnehmen?, and ask about paying by card. If the answer is nur bar, repeat it to check you understood.',
  },
  {
    id: 'family',
    level: 'A1',
    title: 'Talk about family and friends',
    outcome: 'Introduce people close to you and say who you live with.',
    phrases: [
      [
        'Das ist mein Bruder.',
        'This is my brother.',
        'mein with der and das words: mein Bruder, mein Kind.',
      ],
      [
        'Das ist meine Freundin Lena.',
        'This is my girlfriend Lena.',
        'Careful: meine Freundin usually means girlfriend. For a friend, say eine Freundin von mir.',
      ],
      [
        'Hast du Geschwister?',
        'Do you have brothers or sisters?',
        'Geschwister means siblings. Germans use this word all the time.',
      ],
      [
        'Ich habe keine Kinder.',
        'I do not have any children.',
        'kein/keine negates a noun: keine Kinder, kein Auto.',
      ],
      [
        'Ich wohne mit zwei Freunden in einer WG.',
        'I live with two friends in a shared flat.',
        'WG (Wohngemeinschaft) is a flat share, very common in German cities.',
      ],
    ],
    notice:
      'Use nicht to negate verbs and adjectives, but kein to negate nouns: Ich habe kein Auto, not Ich habe nicht ein Auto. mein/meine follows the noun: mein Vater, meine Mutter, meine Eltern.',
    pronunciation:
      'Geschwister: stress on -schwis-. sch sounds like “sh” and w like v: ge-SHVIS-tuh.',
    checks: [
      {
        prompt: 'Which sentence is correct?',
        options: ['Ich habe nicht Kinder.', 'Ich habe keine Kinder.', 'Ich habe kein Kinder.'],
        answer: 1,
        explanation: 'Kinder is plural, so the negative article is keine.',
      },
      {
        prompt: 'Tom says: Das ist meine Freundin Anna. What does he most likely mean?',
        options: ['Anna is his girlfriend', 'Anna is his sister', 'Anna is his teacher'],
        answer: 0,
        explanation:
          'In everyday German, meine Freundin usually means girlfriend. For a friend, people say eine Freundin von mir or eine gute Freundin.',
      },
      {
        prompt: 'Listen. Which siblings does the speaker have?',
        audio: 'Ich habe zwei Schwestern, aber keinen Bruder.',
        options: ['Two sisters and no brother', 'Two brothers', 'One sister and one brother'],
        answer: 0,
        explanation:
          'You heard “zwei Schwestern, aber keinen Bruder”: two sisters, but no brother.',
      },
    ],
    writing: {
      prompt: 'Write “I do not have a car” in German.',
      accepted: ['Ich habe kein Auto'],
      hint: 'Ich habe + kein + Auto.',
      explanation: 'Kein negates the noun Auto. Das Auto is neuter, so kein has no ending here.',
    },
    speaking:
      'Describe your family or the people you live with in three sentences. Use mein/meine once and kein/keine once.',
  },
  {
    id: 'time-routine',
    level: 'A1',
    title: 'Tell the time and describe your day',
    outcome: 'Ask and tell the time and describe a simple daily routine.',
    phrases: [
      ['Wie spät ist es?', 'What time is it?', 'Also: Wie viel Uhr ist es?'],
      ['Es ist Viertel nach acht.', 'It is quarter past eight.', 'Viertel vor neun is 8:45.'],
      [
        'Um wie viel Uhr fängt das an?',
        'What time does it start?',
        'anfangen splits: das fängt … an.',
      ],
      [
        'Ich stehe um sieben Uhr auf.',
        'I get up at seven.',
        'aufstehen is separable: the prefix auf goes to the end.',
      ],
      [
        'Ich habe um fünf Feierabend.',
        'I finish work at five.',
        'Feierabend is the end of the working day and the free time after it.',
      ],
    ],
    notice:
      'Separable verbs split in a main clause: aufstehen → Ich stehe um sieben auf; einkaufen → Ich kaufe heute ein. Remember halb: halb acht is 7:30. Timetables use the 24-hour clock: 19:30 is neunzehn Uhr dreißig.',
    pronunciation: 'In separable verbs, stress the prefix: AUFstehen, EINkaufen, ANfangen.',
    checks: [
      {
        prompt: 'What time is Viertel vor neun?',
        options: ['9:15', '8:45', '9:45'],
        answer: 1,
        explanation: 'Viertel vor neun is a quarter before nine: 8:45.',
      },
      {
        prompt: 'Which sentence is correct?',
        options: ['Ich aufstehe um sieben.', 'Ich stehe um sieben auf.', 'Ich stehe um sieben.'],
        answer: 1,
        explanation: 'The verb stehe is second and the prefix auf goes to the end.',
      },
      {
        prompt: 'Listen. When does the film start?',
        audio: 'Der Film fängt um halb neun an.',
        options: ['9:30', '8:30', '8:00'],
        answer: 1,
        explanation: 'You heard “um halb neun”: halfway to nine, so 8:30.',
      },
    ],
    writing: {
      prompt: 'Write “I get up at seven” in German.',
      accepted: [
        'Ich stehe um sieben auf',
        'Ich stehe um sieben Uhr auf',
        'Ich stehe um 7 auf',
        'Ich stehe um 7 Uhr auf',
      ],
      hint: 'Ich stehe … auf. Put um sieben between the two parts.',
      explanation: 'Stehe is in second position and auf closes the sentence.',
    },
    speaking:
      'Describe your weekday: when you get up, start work or class, have Feierabend and go to bed. Use at least two separable verbs.',
  },
  {
    id: 'supermarket',
    level: 'A1',
    title: 'Shop for food and everyday things',
    outcome: 'Ask where things are, say what you need and handle the checkout.',
    phrases: [
      [
        'Entschuldigung, wo finde ich Milch?',
        'Excuse me, where can I find milk?',
        'Wo finde ich …? works in any shop.',
      ],
      [
        'Ich brauche einen Apfel, eine Banane und ein Brot.',
        'I need an apple, a banana and a loaf of bread.',
        'After brauche, der-words change: einen Apfel. Eine and ein stay the same.',
      ],
      ['Haben Sie auch Hafermilch?', 'Do you also have oat milk?', 'Auch means also.'],
      [
        'Brauchen Sie eine Tüte?',
        'Do you need a bag?',
        'Bags usually cost extra. Answer: Nein, danke, ich habe eine.',
      ],
      [
        'Möchten Sie den Kassenbon?',
        'Would you like the receipt?',
        'A common checkout question. Nein, danke is fine.',
      ],
    ],
    notice:
      'The object of brauchen, haben and möchten is in the accusative. Only masculine articles change: der Apfel → einen Apfel. Many bottles and cans have a deposit (Pfand); return them to the machine in the shop for money back.',
    pronunciation:
      'In Milch, ch after l is the soft ich-sound. Brot has a long o; Tüte has a long ü.',
    checks: [
      {
        prompt: 'Choose the correct form: Ich brauche ___ Apfel.',
        options: ['ein', 'einen', 'eine'],
        answer: 1,
        explanation: 'Der Apfel is masculine, so it becomes einen Apfel after brauchen.',
      },
      {
        prompt: 'The cashier asks: Brauchen Sie eine Tüte? What is she offering?',
        options: ['A bag', 'A receipt', 'A discount'],
        answer: 0,
        explanation: 'Eine Tüte is a bag.',
      },
      {
        prompt: 'Listen. What is the situation?',
        audio: 'Die Hafermilch ist leider aus. Morgen kommt neue.',
        options: [
          'Oat milk is sold out until tomorrow',
          'Oat milk is on special offer',
          'Oat milk is in aisle two',
        ],
        answer: 0,
        explanation:
          'You heard “ist leider aus”: unfortunately it has run out. Neue arrives tomorrow.',
      },
    ],
    writing: {
      prompt: 'Write “I need a banana” in German.',
      accepted: ['Ich brauche eine Banane'],
      hint: 'Die Banane is feminine: eine Banane.',
      explanation: 'Ich brauche eine Banane. Feminine eine does not change in the accusative.',
    },
    speaking:
      'You are shopping. Ask where two things are, say what you need, and answer the checkout questions about a bag and the receipt.',
  },
  {
    id: 'directions',
    level: 'A1',
    title: 'Find your way and take a train',
    outcome: 'Ask the way, understand left, right and straight ahead, and buy a ticket.',
    phrases: [
      [
        'Wie komme ich zum Bahnhof?',
        'How do I get to the railway station?',
        'The most natural way to ask for directions. Wo ist der Bahnhof? also works.',
      ],
      [
        'Gehen Sie geradeaus.',
        'Go straight ahead.',
        'A polite direction to one adult or several people.',
      ],
      ['An der Ampel links.', 'Left at the traffic lights.', 'Rechts means right.'],
      [
        'Die zweite Straße rechts.',
        'The second street on the right.',
        'Count the streets as you walk.',
      ],
      [
        'Eine Fahrkarte nach Berlin, bitte.',
        'A ticket to Berlin, please.',
        'Many people now just say Ticket. Use nach before most city names.',
      ],
    ],
    notice:
      'Listen for the action and the direction. You can ask Noch mal, bitte when you miss one step. Bahnhof is a railway station; Haltestelle is a bus or tram stop; Gleis is a platform.',
    pronunciation:
      'In Bahnhof, the h after a is silent and makes the vowel long: BAAN-hof. Straße starts with “shtr”.',
    reading: [
      'Zum Bahnhof gehen Sie geradeaus und dann rechts. Der Zug nach Berlin fährt um zehn Uhr von Gleis zwei.',
      'To reach the station, go straight ahead and then right. The train to Berlin leaves at ten o’clock from platform two.',
    ],
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
      {
        prompt: 'Listen. Where should you turn?',
        audio: 'Gehen Sie hier geradeaus und dann die zweite Straße rechts.',
        options: [
          'The second street on the right',
          'The first street on the left',
          'At the station',
        ],
        answer: 0,
        explanation: 'You heard “die zweite Straße rechts”: the second street on the right.',
      },
    ],
    writing: {
      prompt: 'Ask “Where is the railway station?” in German.',
      accepted: ['Wo ist der Bahnhof', 'Wie komme ich zum Bahnhof'],
      hint: 'Wo + ist + der Bahnhof.',
      explanation: 'Wo ist …? asks where a place is. Wie komme ich zum …? asks for the way.',
    },
    speaking:
      'Ask for the station. Say the two directions in the text. Read back the departure time and platform to check them.',
  },
  {
    id: 'free-time',
    level: 'A1',
    title: 'Say what you like doing',
    outcome: 'Talk about hobbies and make, accept or decline a suggestion.',
    phrases: [
      [
        'Was machst du gern in deiner Freizeit?',
        'What do you like doing in your free time?',
        'Gern after the verb means like doing.',
      ],
      [
        'Ich koche gern und ich gehe gern joggen.',
        'I like cooking and I like going jogging.',
        'Verb + gern.',
      ],
      [
        'Am liebsten spiele ich Fußball.',
        'Most of all, I like playing football.',
        'gern → lieber → am liebsten.',
      ],
      [
        'Hast du Lust, ins Kino zu gehen?',
        'Do you feel like going to the cinema?',
        'The most natural way to suggest something to a friend.',
      ],
      [
        'Klar, gerne! / Heute leider nicht.',
        'Sure! / Not today, unfortunately.',
        'Accept or decline kindly.',
      ],
    ],
    notice:
      'To say you like doing something, add gern after the verb: Ich lese gern. Use mögen with nouns: Ich mag Pizza. Hast du Lust auf … + noun: Hast du Lust auf Pizza?',
    pronunciation:
      'Lust has a short u, as in “put”. Klar, gerne! with a bright falling tone sounds enthusiastic.',
    checks: [
      {
        prompt: 'Which sentence means “I like reading”?',
        options: ['Ich lese gern.', 'Ich gern lese.', 'Ich mag gern.'],
        answer: 0,
        explanation: 'The verb comes second and gern follows it: Ich lese gern.',
      },
      {
        prompt: 'A friend asks: Hast du Lust auf Pizza? What are they doing?',
        options: [
          'Suggesting you get pizza',
          'Asking about allergies',
          'Saying pizza is expensive',
        ],
        answer: 0,
        explanation: 'Hast du Lust auf …? means do you feel like …?',
      },
      {
        prompt: 'Listen. What does your friend say?',
        audio: 'Heute kann ich leider nicht, aber wie wär’s mit Samstag?',
        options: [
          'Not today, but how about Saturday',
          'Yes, today is perfect',
          'Never on Saturdays',
        ],
        answer: 0,
        explanation: 'You heard “wie wär’s mit Samstag?”: how about Saturday?',
      },
    ],
    writing: {
      prompt: 'Write “I like cooking” in German.',
      accepted: ['Ich koche gern', 'Ich koche gerne'],
      hint: 'Ich + koche + gern.',
      explanation: 'Gern and gerne mean the same. Both are natural.',
    },
    speaking:
      'Tell a friend two things you like doing and what you like doing most. Then suggest an activity with Hast du Lust …?',
  },
  {
    id: 'modal-verbs',
    level: 'A1',
    title: 'Can, must, want: getting things done',
    outcome: 'Use modal verbs to ask for help, ask permission and explain obligations.',
    phrases: [
      [
        'Kannst du mir kurz helfen?',
        'Can you help me for a moment?',
        'Kurz softens the request: just briefly.',
      ],
      ['Ich muss heute lange arbeiten.', 'I have to work late today.', 'Müssen means have to.'],
      ['Darf ich hier parken?', 'Am I allowed to park here?', 'Dürfen means be allowed to.'],
      [
        'Ich will nächstes Jahr in Deutschland studieren.',
        'I want to study in Germany next year.',
        'Wollen is a firm want or plan. For polite wishes, use möchte.',
      ],
      [
        'Du musst nicht kommen.',
        'You do not have to come.',
        'Careful: nicht müssen means not have to. It does not mean must not.',
      ],
    ],
    notice:
      'The modal verb takes position two and the infinitive goes to the end: Ich muss heute arbeiten. Ich and er/sie forms have no ending: ich kann, sie kann. “Must not” is nicht dürfen: Hier darf man nicht rauchen.',
    pronunciation:
      'Muss has a short u; müssen has a short ü. In fast speech, kannst du often becomes “kannste”.',
    checks: [
      {
        prompt: 'Which sentence has the correct word order?',
        options: [
          'Ich muss arbeiten heute.',
          'Ich muss heute arbeiten.',
          'Ich heute muss arbeiten.',
        ],
        answer: 1,
        explanation: 'Muss is in position two; the infinitive arbeiten goes last.',
      },
      {
        prompt: 'Du musst nicht kommen means:',
        options: ['You must not come.', 'You do not have to come.', 'You cannot come.'],
        answer: 1,
        explanation: 'Nicht müssen means there is no obligation. Must not is nicht dürfen.',
      },
      {
        prompt: 'Listen. What is the person telling you?',
        audio: 'Hier dürfen Sie leider nicht parken.',
        options: ['You are not allowed to park here', 'Parking here is free', 'You must park here'],
        answer: 0,
        explanation: 'You heard “Hier dürfen Sie leider nicht parken”: you may not park here.',
      },
    ],
    writing: {
      prompt: 'Ask a friend “Can you help me?” using du.',
      accepted: ['Kannst du mir helfen', 'Kannst du mir kurz helfen', 'Kannst du mir bitte helfen'],
      hint: 'Kannst du + mir + helfen.',
      explanation: 'Kannst comes first in a yes/no question and helfen goes last.',
    },
    speaking:
      'Ask a friend for help, say one thing you must do today and one thing you want to do this year.',
  },
  {
    id: 'texting',
    level: 'A1',
    title: 'Message a friend like a German',
    outcome: 'Write and understand short, natural chat messages to arrange a meeting.',
    phrases: [
      [
        'Hast du heute Abend Zeit?',
        'Are you free this evening?',
        'The standard way to ask if someone is available.',
      ],
      [
        'Treffen wir uns um sieben am Bahnhof?',
        'Shall we meet at seven at the station?',
        'Verb first turns this into a suggestion.',
      ],
      [
        'Klingt gut! Bis später!',
        'Sounds good! See you later!',
        'Also: bis gleich (see you soon), bis morgen.',
      ],
      [
        'Ich bin in fünf Minuten da.',
        'I will be there in five minutes.',
        'German often uses the present tense for the near future.',
      ],
      [
        'Sorry, ich bin ein bisschen spät dran.',
        'Sorry, I am running a bit late.',
        'Sorry is common in casual German; Tut mir leid is more serious.',
      ],
      [
        'LG / VG',
        'Liebe Grüße / Viele Grüße: love / best wishes',
        'LG for friends and family; VG for colleagues and acquaintances.',
      ],
    ],
    notice:
      'In casual chats people often drop the subject and write in lowercase: bin gleich da means ich bin gleich da. You will also see kk (okay) and hdl (hab dich lieb, for close friends and family). Do not use these in emails to offices or employers.',
    pronunciation: 'Voice messages are common. Stress the key word: Klingt GUT! Bis SPÄter!',
    checks: [
      {
        prompt: 'Which ending suits a message to a colleague you do not know well?',
        options: ['hdl', 'VG', 'kk'],
        answer: 1,
        explanation: 'VG (Viele Grüße) is friendly but neutral. hdl is for loved ones.',
      },
      {
        prompt: 'Your friend writes: bin gleich da. What does it mean?',
        options: ['I will be there soon', 'I am at home already', 'I cannot come'],
        answer: 0,
        explanation: 'Gleich means very soon; the ich is dropped in chats.',
      },
      {
        prompt: 'Listen to the voice message. What is the problem?',
        audio: 'Sorry, ich schaff’s erst um halb acht.',
        options: [
          'Your friend can only make it at 7:30',
          'Your friend is cancelling',
          'Your friend is already there',
        ],
        answer: 0,
        explanation:
          'You heard “ich schaff’s erst um halb acht”: I can only make it at 7:30. Erst means not until.',
      },
    ],
    writing: {
      prompt: 'Ask a friend “Are you free today?” starting with Hast du …',
      accepted: ['Hast du heute Zeit', 'Hast du heute Abend Zeit'],
      hint: 'Hast du + heute + Zeit.',
      explanation: 'Zeit haben means to be free or available.',
    },
    speaking:
      'Record a short voice message for a friend: suggest a time and place, and say you will be a little late.',
  },
]);
