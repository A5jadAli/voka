import { defineLessons } from './types';

// Original English lessons: modern everyday communication first, then optional IELTS skills.
// Level labels describe task difficulty; IELTS lessons are preparatory, not band-score predictions.
export const englishLessons = defineLessons('EN', [
  {
    id: 'en-sounds',
    level: 'A2',
    title: 'English sounds that change meaning',
    outcome:
      'Hear and produce the sound and stress contrasts that matter most for being understood.',
    phrases: [
      [
        'ship – sheep',
        'short /ɪ/ vs long /iː/',
        'Relax your tongue for ship; smile and hold longer for sheep. Also: live – leave, fit – feet.',
      ],
      [
        'very – worry, vest – west',
        '/v/ vs /w/',
        'For v, touch your top teeth to your lower lip. For w, round your lips with no teeth.',
      ],
      [
        'think – sink',
        '/θ/ vs /s/',
        'Tongue lightly between the teeth, then blow. Getting this slightly wrong is less of a problem than vowel length or stress.',
      ],
      [
        'PHOtograph – phoTOgraphy – photoGRAPHic',
        'word stress moves',
        'Wrong stress confuses listeners more than an accent does.',
      ],
      [
        'walked (1) – played (1) – wanted (2)',
        'the -ed ending',
        'Only add a syllable after t or d: want-ed, need-ed. Walked is one syllable: “walkt”.',
      ],
      [
        'I didn’t say SHE took it.',
        'sentence stress changes meaning',
        'Stressing a different word changes what you mean.',
      ],
    ],
    notice:
      'Research on English as a global language shows that people understand each other mostly through vowel length, consonant clusters and stress, not through a British or American accent. Aim to be easy to understand, not to sound like someone else.',
    pronunciation:
      'Unstressed syllables shrink to a quick “uh” (schwa): baNAna sounds like buh-NAH-nuh. Mastering schwa makes your rhythm sound natural quickly.',
    checks: [
      {
        prompt: 'Listen. Which word did you hear?',
        audio: 'sheep',
        options: ['ship', 'sheep', 'cheap'],
        answer: 1,
        explanation: 'You heard sheep, with a long /iː/.',
      },
      {
        prompt: 'Listen. Which syllable of “photographer” is stressed?',
        audio: 'We need a photographer for the event.',
        options: ['PHO-to-gra-pher', 'pho-TO-gra-pher', 'pho-to-GRA-pher'],
        answer: 1,
        explanation: 'Photographer and photography stress the second syllable: pho-TO-gra-pher.',
      },
      {
        prompt: 'How many syllables does “walked” have?',
        options: ['One', 'Two', 'Three'],
        answer: 0,
        explanation: 'Walked is one syllable, “walkt”. Only verbs ending in t or d add a syllable.',
      },
      {
        prompt: 'I didn’t say SHE took it. What does the stress suggest?',
        options: ['Someone else took it', 'She borrowed it', 'I wrote it rather than said it'],
        answer: 0,
        explanation: 'Stress on she contrasts her with another person.',
      },
    ],
    writing: {
      prompt:
        'Which of these has an extra “-id” syllable: walked, played or wanted? Write the word.',
      accepted: ['wanted'],
      hint: 'Look for the verb whose base ends in t or d.',
      explanation: 'Want ends in t, so wanted is want-id: two syllables.',
    },
    speaking:
      'Read aloud: “I think the sheep on the ship wanted to leave.” Then say photograph, photography, photographic and feel the stress move. Record yourself if you can.',
  },
  {
    id: 'en-small-talk',
    level: 'A2',
    title: 'Small talk that keeps going',
    outcome: 'Start, keep up and politely end a friendly conversation.',
    phrases: [
      [
        'How’s your week been?',
        'How has your week been?',
        'More natural than “How are you?” with people you know a little.',
      ],
      [
        'Not bad, actually. Pretty busy.',
        'Fine, quite busy.',
        'Short and honest, and it invites a follow-up.',
      ],
      [
        'Got anything nice planned for the weekend?',
        'Do you have plans for the weekend?',
        'The classic Friday question.',
      ],
      [
        'Oh nice! Where did you go?',
        'A follow-up question',
        'Follow-up questions show interest, and they are what keeps small talk alive.',
      ],
      [
        'Anyway, I’d better get going.',
        'I need to leave now.',
        'A polite, natural way to end a conversation.',
      ],
      [
        'Good to see you! Catch you later.',
        'Nice to see you; see you later.',
        'A friendly goodbye.',
      ],
    ],
    notice:
      'Small talk is like a rally: answer briefly, add one detail, then pass the ball back with a question (“How about you?”). One-word answers stop it; long monologues do too. “How are you?” is mostly a greeting: answer briefly and ask back.',
    pronunciation:
      '“How’s your week been?” links together: how-zyer-WEEK-bin. The stress falls on week.',
    checks: [
      {
        prompt:
          'A colleague passes you in the corridor and asks: How are you? What is the most natural answer?',
        options: [
          'Good, thanks! How are you?',
          'Yes.',
          'My back hurts and I had a terrible morning.',
        ],
        answer: 0,
        explanation: 'A short positive answer plus a question back is the expected pattern.',
      },
      {
        prompt: 'Your friend says she went to Scotland at the weekend. What is the best response?',
        options: ['Oh nice! How was it?', 'OK.', 'I went to Spain last year. It was much better.'],
        answer: 0,
        explanation: 'A follow-up question keeps the focus on her and the conversation going.',
      },
      {
        prompt: 'Listen. What is the speaker doing?',
        audio: 'Anyway, I’d better get going. I’ve got a meeting at two.',
        options: [
          'Politely ending the conversation',
          'Starting a meeting',
          'Asking for directions',
        ],
        answer: 0,
        explanation:
          'You heard “I’d better get going”: a polite signal that the conversation is ending.',
      },
    ],
    writing: {
      prompt: 'Ask a colleague about their weekend plans in one short, natural question.',
      accepted: [
        'Got anything nice planned for the weekend',
        'Have you got anything nice planned for the weekend',
        'Do you have anything nice planned for the weekend',
        'Got any plans for the weekend',
        'Have you got any plans for the weekend',
        'Do you have any plans for the weekend',
        'Any plans for the weekend',
        'Anything nice planned for the weekend',
        'What are you up to this weekend',
        'What are you doing this weekend',
        'What are you up to at the weekend',
      ],
      hint: 'Try: Got anything nice … for the weekend? or Any plans for the weekend?',
      explanation: 'Short questions with “planned” or “up to” sound friendly and natural.',
    },
    speaking:
      'Have a two-minute Monday-morning chat with the live coach. Answer briefly, add one detail and ask a follow-up question each time.',
  },
  {
    id: 'en-reactions',
    level: 'A2',
    title: 'React like a native speaker',
    outcome: 'Show interest, sympathy and agreement with short natural reactions.',
    phrases: [
      ['No way!', 'That’s surprising!', 'Positive or negative surprise. It is not a refusal here.'],
      ['Fair enough.', 'OK, that’s reasonable.', 'Accept someone’s reason or decision.'],
      [
        'Tell me about it.',
        'I completely agree; I have had the same experience.',
        'Not a request for more information!',
      ],
      ['That makes sense.', 'I understand the logic.', 'Shows that you are following.'],
      ['I know, right?', 'I totally agree.', 'Casual; very common with younger speakers.'],
      ['Oh, that’s a shame.', 'That’s disappointing.', 'Sympathy for small disappointments.'],
      ['Fingers crossed!', 'Let’s hope it goes well.', 'Before an interview, exam or result.'],
    ],
    notice:
      'Backchannelling, the short reactions people make while someone else speaks (“mm”, “yeah”, “really?”), shows you are listening. Silence can feel cold in English conversation, even when you are paying close attention.',
    pronunciation:
      'Reactions carry meaning through intonation. “Really?” with a big rise sounds interested; a flat “really” sounds bored or sarcastic.',
    checks: [
      {
        prompt:
          'Your friend says: The trains were cancelled again! You reply: Tell me about it. What do you mean?',
        options: [
          'I agree; it happens to me too',
          'Please give me more details',
          'I don’t believe you',
        ],
        answer: 0,
        explanation: '“Tell me about it” is agreement from shared experience.',
      },
      {
        prompt:
          'A colleague can’t come to lunch because her child is ill. What is the best reaction?',
        options: ['Fair enough. Hope they feel better soon.', 'No way!', 'I know, right?'],
        answer: 0,
        explanation: 'Accept the reason and add a kind wish.',
      },
      {
        prompt: 'Listen. How does the second speaker feel?',
        audio: 'I got the job! — No way! That’s amazing!',
        options: ['Surprised and happy', 'Angry', 'Disappointed'],
        answer: 0,
        explanation: 'You heard “No way! That’s amazing!”: happy surprise.',
      },
    ],
    writing: {
      prompt: 'Write the two-word reaction that means “OK, that’s reasonable”.',
      accepted: ['Fair enough'],
      hint: 'It starts with F.',
      explanation: '“Fair enough” accepts someone’s reason without arguing.',
    },
    speaking:
      'Ask the live coach to tell you about their week, and react at least five times with different phrases from this lesson.',
  },
  {
    id: 'en-softening',
    level: 'B1',
    title: 'Ask and suggest politely',
    outcome: 'Make requests and suggestions that sound polite rather than bossy.',
    phrases: [
      ['I was wondering if you could …', 'Could you …? (very polite)', 'Past forms sound softer.'],
      [
        'Would you mind sending it again?',
        'Please send it again.',
        'The answer “Not at all” means yes, I will.',
      ],
      ['Just a quick one: …', 'I have a short question.', 'A casual workplace opener.'],
      ['Sorry to bother you, but …', 'Excuse me for interrupting.', 'Before asking a favour.'],
      [
        'It might be worth checking the figures.',
        'You should check the figures.',
        'Softened advice.',
      ],
      ['Could we push it back a bit?', 'Can we postpone it?', 'Push back means postpone.'],
    ],
    notice:
      '“Would you mind …?” is answered with “No, not at all” when you agree, because it means “I don’t mind”. English uses past forms (I was wondering), modals (might, could) and small words (just, a bit) to sound polite. Bare imperatives (“Send me the file.”) can sound rude in British and many international workplaces.',
    pronunciation:
      'Polite requests start fairly high and fall gently. A flat, low voice can make even polite words sound annoyed.',
    checks: [
      {
        prompt: 'A colleague asks: Would you mind closing the window? You are happy to. You say:',
        options: ['Yes, I mind.', 'No, not at all.', 'Yes, of course I mind.'],
        answer: 1,
        explanation: '“Not at all” means you don’t mind, so you will do it.',
      },
      {
        prompt: 'Which is the softest request to a manager?',
        options: [
          'Give me Friday off.',
          'I want Friday off.',
          'I was wondering if I could take Friday off.',
        ],
        answer: 2,
        explanation: '“I was wondering if …” is indirect and polite.',
      },
      {
        prompt: 'Listen. What is the speaker really saying?',
        audio: 'It might be worth double-checking the dates before we send it.',
        options: ['Please check the dates', 'The dates are perfect', 'Send it immediately'],
        answer: 0,
        explanation: '“It might be worth …” is polite advice: please check.',
      },
    ],
    writing: {
      prompt: 'Make this polite: “Send me the report.” Start with “Could you”.',
      accepted: [
        'Could you send me the report',
        'Could you send me the report please',
        'Could you please send me the report',
        'Could you send the report to me',
        'Could you send me the report when you get a chance',
      ],
      hint: 'Could you + send me the report (+ please)?',
      explanation: 'A question with could turns an order into a request.',
    },
    speaking:
      'Ask the live coach three favours at work: to move a meeting, to review your document and to resend a file. Use a different polite pattern each time.',
  },
  {
    id: 'en-real-meaning',
    level: 'B1',
    title: 'What British English really means',
    outcome: 'Understand understatement, polite criticism and everyday British expressions.',
    phrases: [
      ['Not bad at all.', 'Very good.', 'Understatement: “not bad” is often real praise.'],
      [
        'It’s quite good.',
        'Often: it’s OK, but not great.',
        'In British English, quite can weaken praise; tone matters.',
      ],
      ['I’ll bear it in mind.', 'Often: I probably won’t do it.', 'Polite non-commitment.'],
      [
        'With all due respect, …',
        'I strongly disagree.',
        'Very polite words, very strong disagreement.',
      ],
      [
        'That’s an interesting idea.',
        'Sometimes: I am not convinced.',
        'Listen to the tone and what comes next.',
      ],
      ['Cheers!', 'Thanks! (also: bye, or a toast)', 'Everyday British thanks.'],
      ['No worries.', 'You’re welcome. / It’s fine.', 'A reply to thanks or an apology.'],
    ],
    notice:
      'British speakers often soften criticism and understate praise. To understand what someone means, listen to the intonation and to what comes next (“That’s an interesting idea … but have we thought about the cost?”). You don’t have to copy this style, but understanding it prevents misunderstandings at work.',
    pronunciation:
      'QUITE good (stress on quite, falling) sounds lukewarm; quite GOOD (stress on good) sounds more positive.',
    checks: [
      {
        prompt:
          'Your manager says your idea is “quite interesting — I’ll bear it in mind.” What is most likely?',
        options: [
          'They are not very convinced',
          'They will implement it tomorrow',
          'They want a longer presentation',
        ],
        answer: 0,
        explanation: 'Both phrases are polite ways of not committing.',
      },
      {
        prompt: 'A British friend tastes your cooking and says: Not bad at all!',
        options: ['They like it', 'They dislike it', 'They are unsure'],
        answer: 0,
        explanation: 'This understatement is genuine praise.',
      },
      {
        prompt: 'Listen. What is the speaker doing?',
        audio: 'With all due respect, I don’t think the numbers support that.',
        options: ['Disagreeing strongly but politely', 'Agreeing completely', 'Apologising'],
        answer: 0,
        explanation: '“With all due respect” introduces strong disagreement.',
      },
    ],
    writing: {
      prompt:
        'Someone says “Thanks for your help!” Write the relaxed two-word British reply meaning “it’s fine”.',
      accepted: ['No worries', 'No problem'],
      hint: 'No + …',
      explanation: '“No worries” and “No problem” are both relaxed replies to thanks.',
    },
    speaking:
      'Tell the live coach about a film you thought was just OK, using British understatement. Then say plainly what you really think.',
  },
  {
    id: 'en-repair',
    level: 'B1',
    title: 'Buy time and fix misunderstandings',
    outcome: 'Keep talking while you think, ask for repetition and explain a missing word.',
    phrases: [
      [
        'That’s a good question. Let me think …',
        'I need a moment.',
        'A natural filler instead of silence.',
      ],
      ['Sorry, I didn’t catch that.', 'I didn’t hear or understand.', 'Much better than “What?”.'],
      [
        'Could you run that by me again?',
        'Could you explain that again?',
        'Informal and work-friendly.',
      ],
      ['What I mean is …', 'Let me rephrase.', 'Clarify what you said.'],
      ['So, if I understand correctly, …', 'Checking understanding.', 'Summarise to confirm.'],
      [
        'It’s a kind of … You use it to …',
        'Paraphrasing a missing word.',
        'Describe category and function.',
      ],
    ],
    notice:
      'Fluent speakers are not people who never pause; they fill pauses naturally and repair smoothly. In IELTS Speaking, long silences hurt Fluency and Coherence, while a natural filler or paraphrase does not.',
    pronunciation:
      '“Let me think …” with a level, lengthened “think” sounds thoughtful rather than stuck.',
    checks: [
      {
        prompt: 'You didn’t hear a question in a meeting. What is the best response?',
        options: ['What?', 'Sorry, I didn’t catch that. Could you repeat it?', 'Hmm.'],
        answer: 1,
        explanation: 'It is polite, clear and keeps you in the conversation.',
      },
      {
        prompt: 'You forget the word “stapler”. What is the best strategy?',
        options: [
          'Stay silent',
          'It’s a small office tool you use to fix papers together.',
          'Switch to your first language',
        ],
        answer: 1,
        explanation:
          'Describe the category and function; the listener will usually supply the word.',
      },
      {
        prompt: 'Listen. What is the speaker doing?',
        audio: 'So, if I understand correctly, you want the report by Thursday, not Friday?',
        options: ['Checking understanding', 'Refusing the task', 'Complaining'],
        answer: 0,
        explanation: '“If I understand correctly” introduces a check.',
      },
    ],
    writing: {
      prompt:
        'Write a polite phrase for “I didn’t hear what you said”, starting “Sorry, I didn’t …”.',
      accepted: [
        'Sorry, I didn’t catch that',
        'Sorry, I didn’t hear that',
        'Sorry, I didn’t catch what you said',
        'Sorry, I didn’t hear what you said',
      ],
      hint: 'Sorry, I didn’t catch …',
      explanation: '“Catch” here means hear or understand.',
    },
    speaking:
      'Ask the live coach some difficult questions to answer and practise buying time, rephrasing and checking understanding.',
  },
  {
    id: 'en-connected',
    level: 'B1',
    title: 'Understand fast, connected English',
    outcome: 'Recognise reductions and linking in natural speech.',
    phrases: [
      [
        'gonna / wanna / gotta',
        'going to / want to / got to',
        'Understand them everywhere; use them in speech, not formal writing.',
      ],
      ['Whaddya want?', 'What do you want?', 'Words blend at normal speed.'],
      [
        'D’you know what I mean?',
        'Do you know what I mean?',
        '“Do you” shrinks to “d’you” or “dya”.',
      ],
      ['Lemme see.', 'Let me see.', 'Very common in speech.'],
      ['I’d’ve gone.', 'I would have gone.', 'Double contractions are normal in speech.'],
      ['an apple → a-napple', 'Linking', 'A final consonant links to the next vowel.'],
    ],
    notice:
      'Native speakers are not speaking “badly”; they reduce unstressed words while keeping key words clear. Train your ear on the stressed words first and the small words become predictable. You may also hear “innit” (isn’t it) in London; understand it, but use it only if it feels natural to you.',
    pronunciation:
      'Weak forms: to → tuh, for → fuh, and → n, can → kn. “I can go” uses a weak “kn”; “I CAN’T go” keeps the full vowel. That is how you tell can from can’t.',
    checks: [
      {
        prompt: 'Listen. What does the speaker offer?',
        audio: 'I’m gonna grab a coffee. D’you want one?',
        options: ['A coffee', 'A lift', 'Lunch'],
        answer: 0,
        explanation: 'You heard “I’m gonna grab a coffee. D’you want one?”',
      },
      {
        prompt: 'Listen. When can the speaker come?',
        audio: 'I can come on Friday, but I can’t do Saturday.',
        options: ['Friday only', 'Saturday only', 'Both days'],
        answer: 0,
        explanation: 'The weak “kn” is can; the full, stressed vowel is can’t.',
      },
      {
        prompt: 'What is the full form of “I’d’ve”?',
        options: ['I would have', 'I had have', 'I did have'],
        answer: 0,
        explanation: 'I’d’ve = I would have.',
      },
    ],
    writing: {
      prompt: 'Write “I’ve gotta go” in its full form.',
      accepted: ['I’ve got to go', 'I have got to go', 'I have to go'],
      hint: 'Gotta = got to.',
      explanation: 'Gotta is the spoken form of (have) got to.',
    },
    speaking:
      'Read the phrases in their full form, then in natural reduced form. Record both and notice that the stressed words stay the same.',
  },
  {
    id: 'en-phrasal',
    level: 'B1',
    title: 'Phrasal verbs people actually use',
    outcome: 'Use high-frequency phrasal verbs naturally in conversation.',
    phrases: [
      ['sort out', 'solve / organise', 'Can you sort out the booking?'],
      ['figure out', 'understand after thinking', 'I can’t figure out this form.'],
      ['run out of', 'have none left', 'We’ve run out of milk.'],
      ['come up with', 'think of (an idea)', 'She came up with a great plan.'],
      ['put off', 'postpone / delay', 'Stop putting off your homework.'],
      ['catch up (with)', 'meet and exchange news', 'Let’s catch up next week.'],
      ['turn down', 'refuse (an offer)', 'He turned down the job.'],
    ],
    notice:
      'In conversation, phrasal verbs are more natural than formal verbs: “sort out” rather than “resolve”, “put off” rather than “postpone”. In IELTS Speaking they show natural vocabulary; in formal essays, prefer the single-word verb.',
    pronunciation: 'The particle is usually stressed: sort OUT, put OFF, catch UP.',
    checks: [
      {
        prompt: 'We have no milk left. We’ve ___ milk.',
        options: ['run out of', 'put off', 'sorted out'],
        answer: 0,
        explanation: 'Run out of means have none left.',
      },
      {
        prompt: 'She refused the job offer. She ___ it.',
        options: ['turned down', 'came up with', 'caught up'],
        answer: 0,
        explanation: 'Turn down means refuse.',
      },
      {
        prompt: 'Listen. What does the speaker keep doing?',
        audio: 'I keep putting off my dentist appointment.',
        options: ['Delaying the appointment', 'Going to the dentist', 'Cancelling work'],
        answer: 0,
        explanation: 'Putting off means delaying.',
      },
    ],
    writing: {
      prompt: 'Write the three-word phrasal verb that means “think of an idea”.',
      accepted: ['come up with'],
      hint: 'come … …',
      explanation: 'Come up with: She came up with a solution.',
    },
    speaking:
      'Tell the live coach about a problem you sorted out recently, something you keep putting off and an idea you came up with.',
  },
  {
    id: 'en-mistakes',
    level: 'B1',
    title: 'Fix the mistakes people notice',
    outcome: 'Eliminate high-frequency errors that examiners and colleagues notice.',
    phrases: [
      [
        'We discussed the plan.',
        'Not: discussed about',
        'Discuss takes a direct object. But: talk about, a discussion about.',
      ],
      ['I agree.', 'Not: I am agree', 'Agree is a verb. Negative: I don’t agree / I disagree.'],
      [
        'some information, some advice',
        'Not: informations, advices',
        'Uncountable nouns: a piece of advice.',
      ],
      [
        'I’ve lived here for three years.',
        'Not: since three years',
        'For + a period; since + a starting point (since 2022).',
      ],
      ['Can you explain it to me?', 'Not: explain me', 'Explain something to someone.'],
      ['It depends on the price.', 'Not: depends of', 'Prepositions are fixed chunks.'],
      ['I’m looking forward to meeting you.', 'Not: to meet you', 'Look forward to + -ing.'],
    ],
    notice:
      'These are among the most frequent learner errors. Fixing a few high-frequency mistakes improves accuracy faster than learning rare vocabulary, and accuracy is a quarter of the IELTS Speaking and Writing criteria.',
    pronunciation: '“I’ve lived here for three years”: weak “for” (fuh) and stress on THREE YEARS.',
    checks: [
      {
        prompt: 'Which is correct?',
        options: [
          'We discussed about the plan.',
          'We discussed the plan.',
          'We discussed on the plan.',
        ],
        answer: 1,
        explanation: 'Discuss takes a direct object.',
      },
      {
        prompt: 'Which is correct?',
        options: [
          'I have worked here since five years.',
          'I have worked here for five years.',
          'I work here since five years.',
        ],
        answer: 1,
        explanation: 'For + a period of time, with the present perfect.',
      },
      {
        prompt: 'Which is correct?',
        options: [
          'Can you give me some advices?',
          'Can you give me some advice?',
          'Can you give me an advice?',
        ],
        answer: 1,
        explanation: 'Advice is uncountable.',
      },
      {
        prompt: 'Listen. Which form follows “looking forward to”?',
        audio: 'I’m really looking forward to meeting the team.',
        options: ['meeting', 'meet', 'to meet'],
        answer: 0,
        explanation: 'You heard “looking forward to meeting”: to + -ing.',
      },
    ],
    writing: {
      prompt: 'Correct this sentence: “I am agree with you.”',
      accepted: ['I agree with you'],
      hint: 'Agree is already a verb.',
      explanation: 'I agree with you.',
    },
    speaking:
      'Talk for one minute about how long you have lived in your city, something you are looking forward to and some advice you received. Then check your sentences against this lesson.',
  },
  {
    id: 'en-disagree',
    level: 'B2',
    title: 'Disagree without sounding rude',
    outcome: 'Disagree, take the floor and close a debate diplomatically.',
    phrases: [
      [
        'I see what you mean, but …',
        'I understand, but I disagree.',
        'Acknowledge, then disagree.',
      ],
      ['I’m not sure I agree with that.', 'I disagree.', 'Soft but clear.'],
      ['That’s a fair point, although …', 'Partly true, but …', 'Concede, then contrast.'],
      [
        'I’d look at it slightly differently.',
        'My view is different.',
        'Professional disagreement.',
      ],
      ['Can I just come in here?', 'May I interrupt?', 'Taking the floor in meetings.'],
      ['Let’s agree to disagree.', 'We won’t agree; let’s move on.', 'End a disagreement kindly.'],
    ],
    notice:
      'The pattern “acknowledge + but + reason” keeps discussions friendly. “You’re wrong” sounds aggressive in most English-speaking workplaces; “I’m not sure that’s right” says the same thing more safely.',
    pronunciation:
      'Stress the contrast: I see what you MEAN, but I think the COST is the real problem.',
    checks: [
      {
        prompt: 'Which is the most diplomatic?',
        options: [
          'You’re wrong.',
          'That’s a fair point, although the costs are higher than expected.',
          'No.',
        ],
        answer: 1,
        explanation: 'It concedes a point before disagreeing.',
      },
      {
        prompt: 'You want to speak in a meeting. What do you say?',
        options: ['Can I just come in here?', 'Stop talking.', 'Excuse me, what?'],
        answer: 0,
        explanation: '“Can I just come in here?” is the standard polite interruption.',
      },
      {
        prompt: 'Listen. What is the speaker’s position?',
        audio: 'I see where you’re coming from, but I don’t think we can afford it this year.',
        options: [
          'They understand but disagree because of cost',
          'They agree completely',
          'They want to buy it this year',
        ],
        answer: 0,
        explanation:
          '“I see where you’re coming from” acknowledges; “but” introduces the disagreement.',
      },
    ],
    writing: {
      prompt: 'Complete the diplomatic disagreement with one word: “I see what you ___, but …”',
      accepted: ['mean'],
      hint: 'What do you ___ ?',
      explanation: 'I see what you mean, but …',
    },
    speaking:
      'Topic: “Everyone should work from home.” Ask the live coach to argue for it, and disagree politely three times with different phrases.',
  },
  {
    id: 'en-workplace',
    level: 'B1',
    title: 'Messages at work: email, Slack and Teams',
    outcome: 'Write clear, friendly workplace messages with the right tone.',
    phrases: [
      ['Hope you’re well.', 'A friendly opener', 'Common at the start of work emails.'],
      [
        'Just a heads-up: the meeting has moved to 3 pm.',
        'An early warning',
        'Heads-up means advance information.',
      ],
      [
        'Could you take a look when you get a chance?',
        'Please review this; it isn’t urgent.',
        'A polite, low-pressure request.',
      ],
      [
        'Just following up on my email from Monday.',
        'A polite reminder',
        'Use it when someone has not replied.',
      ],
      ['Happy to help!', 'I’m glad to help.', 'A warm reply.'],
      ['Let me know if you have any questions.', 'A standard closing', 'Invites a response.'],
      [
        'Best, / Thanks, / Kind regards,',
        'Sign-offs',
        'Best and Thanks for colleagues; Kind regards for clients or formal emails.',
      ],
    ],
    notice:
      'Chat messages (Slack, Teams) are short and informal: skip “Dear”, and keep messages to one topic. Emails to clients stay polite and clear. Avoid ALL CAPS and strings of exclamation marks.',
    pronunciation:
      'Read your message aloud before sending. If it sounds abrupt when spoken, add “Could you …” or “when you get a chance”.',
    checks: [
      {
        prompt: 'Which is best for reminding a client politely?',
        options: [
          'Why haven’t you answered?',
          'Just following up on my email from Monday. Do you have an update?',
          'ANSWER PLEASE',
        ],
        answer: 1,
        explanation: '“Just following up” is polite and professional.',
      },
      {
        prompt: 'Which sign-off suits a first email to a client?',
        options: ['Cheers mate', 'Kind regards,', 'xx'],
        answer: 1,
        explanation: 'Kind regards is polite and neutral.',
      },
      {
        prompt: 'A colleague writes: Just a heads-up, the client is running late. What is this?',
        options: ['An early warning', 'A complaint', 'A joke'],
        answer: 0,
        explanation: 'A heads-up is advance information.',
      },
      {
        prompt: 'Listen. What time is the call now?',
        audio: 'Just a quick heads-up: the client call has moved to half past three.',
        options: ['3:30', '3:00', '2:30'],
        answer: 0,
        explanation: 'You heard “half past three”: 3:30.',
      },
    ],
    writing: {
      prompt:
        'Write a polite, low-pressure request to review a document, ending with “when you get a chance”.',
      accepted: [
        'Could you take a look when you get a chance',
        'Could you have a look when you get a chance',
        'Could you take a look at it when you get a chance',
        'Could you have a look at it when you get a chance',
        'Could you review it when you get a chance',
      ],
      hint: 'Could you take a look … ?',
      explanation: '“When you get a chance” signals that it is not urgent.',
    },
    speaking:
      'Give the live coach a stand-up update: what you did yesterday, what you are doing today and one blocker.',
  },
  {
    id: 'en-register',
    level: 'B1',
    title: 'Formal or informal? Choose the right tone',
    outcome: 'Match your tone to the reader, as in IELTS General Training letters and real emails.',
    phrases: [
      [
        'I am writing to enquire about … / Just wanted to ask about …',
        'formal / informal',
        'Opening a letter or message.',
      ],
      [
        'I would be grateful if you could … / Could you …?',
        'formal / neutral request',
        'The formal version is ideal for complaints and requests.',
      ],
      [
        'I apologise for the inconvenience. / Sorry about that!',
        'formal / informal apology',
        'Match the reader.',
      ],
      ['Please find attached … / I’ve attached …', 'formal / neutral', 'Attachments.'],
      [
        'Yours faithfully / Yours sincerely / Best wishes',
        'closings',
        'Faithfully after “Dear Sir or Madam”; sincerely after a name; best wishes for friends.',
      ],
    ],
    notice:
      'IELTS General Training Task 1 letters can be formal, semi-formal or informal; the task tells you who the reader is, and tone is part of the task score. Avoid contractions and slang in formal letters; use them freely with friends.',
    checks: [
      {
        prompt: 'Which closing matches “Dear Sir or Madam”?',
        options: ['Yours faithfully', 'Yours sincerely', 'Love'],
        answer: 0,
        explanation: 'Unknown name → Yours faithfully (British convention).',
      },
      {
        prompt: 'Which opening suits a letter to a friend?',
        options: [
          'I am writing to enquire about your wellbeing.',
          'Hi Sam, just wanted to say thanks for last weekend!',
          'Dear Sir, I would be grateful if …',
        ],
        answer: 1,
        explanation: 'Informal reader, informal tone.',
      },
      {
        prompt: 'Which request is the most formal?',
        options: [
          'Can you send it?',
          'I would be grateful if you could send it.',
          'Send it, yeah?',
        ],
        answer: 1,
        explanation: '“I would be grateful if you could …” is the classic formal request.',
      },
      {
        prompt: 'Listen. What kind of message is this?',
        audio: 'I am writing to enquire about the availability of rooms in March.',
        options: [
          'A formal enquiry about rooms',
          'An informal chat with a friend',
          'A complaint about noise',
        ],
        answer: 0,
        explanation: '“I am writing to enquire about …” is a formal enquiry.',
      },
    ],
    writing: {
      prompt: 'Make “Can you help me?” formal, starting “I would be grateful if you could …”.',
      accepted: [
        'I would be grateful if you could help me',
        'I would be grateful if you could assist me',
        'I’d be grateful if you could help me',
      ],
      hint: 'I would be grateful if you could + verb + me.',
      explanation: 'This structure is polite, formal and useful in any complaint or request.',
    },
    speaking:
      'Explain the same problem twice to the live coach: first to a friend, then to a hotel manager. Notice what changes.',
  },
  {
    id: 'en-ielts-listening',
    level: 'B1',
    title: 'IELTS Listening: numbers, spelling and traps',
    outcome: 'Catch numbers, spellings and corrected details, as in Listening Part 1.',
    phrases: [
      ['fifTEEN – FIFty', '15 vs 50', 'Teen numbers stress the end; tens stress the start.'],
      ['double L, double O', 'spelling', 'Repeated letters are spelled with “double”.'],
      ['oh / zero', 'saying 0', 'British phone numbers usually use “oh”.'],
      [
        'Actually, no, make that Thursday.',
        'a self-correction',
        'The final answer often comes after a correction.',
      ],
      [
        'the fourteenth of March',
        'dates',
        'British English usually says the day before the month.',
      ],
    ],
    notice:
      'IELTS Listening has four parts and 40 questions, and you hear each recording once. Part 1 is often a booking or form with names, numbers and dates. Speakers change their minds, so the first detail you hear can be a distractor. Check spelling and word limits such as “NO MORE THAN TWO WORDS”.',
    pronunciation:
      'Say 13–19 and 30–90 in pairs: thirTEEN – THIRty. Getting this right helps people understand you too.',
    checks: [
      {
        prompt: 'Listen. How much is one session?',
        audio: 'The course costs fifteen pounds per session.',
        options: ['£15', '£50', '£5'],
        answer: 0,
        explanation: 'You heard fifTEEN, with stress at the end.',
      },
      {
        prompt: 'Listen. How is the surname spelled?',
        audio: 'My surname is Kowalski. That’s K, O, W, A, L, S, K, I.',
        options: ['Kovalski', 'Kowalski', 'Kowalsky'],
        answer: 1,
        explanation: 'K-O-W-A-L-S-K-I.',
      },
      {
        prompt: 'Listen. When is the meeting?',
        audio:
          'We’ll meet on Tuesday. Oh, sorry, no, Wednesday, because the room is booked on Tuesday.',
        options: ['Tuesday', 'Wednesday', 'Thursday'],
        answer: 1,
        explanation: 'Tuesday is the distractor; the speaker corrects it to Wednesday.',
      },
    ],
    writing: {
      prompt: 'Write the word British speakers usually say for 0 in a phone number.',
      accepted: ['oh', 'zero'],
      hint: 'It sounds like the letter O.',
      explanation: 'British speakers usually say “oh”; “zero” is also understood.',
    },
    speaking:
      'Spell your full name, then say your phone number and date of birth aloud, as in Listening Part 1. Then do it faster and ask the coach to dictate one back to you.',
  },
  {
    id: 'en-ielts-reading',
    level: 'B1',
    title: 'IELTS Reading: True, False or Not Given',
    outcome: 'Decide whether a statement matches, contradicts or is not covered by a text.',
    phrases: [
      [
        'True',
        'The text says the same thing, often in different words.',
        'Look for paraphrase, not identical words.',
      ],
      ['False', 'The text says the opposite.', 'A direct contradiction.'],
      [
        'Not Given',
        'The text does not say.',
        'No information either way. Do not use your own knowledge.',
      ],
      ['roughly / approximately / around', 'Paraphrase signals', 'Numbers are often paraphrased.'],
      [
        'all / some / most / never / always',
        'Qualifiers',
        'One word like “all” can turn True into False.',
      ],
    ],
    notice:
      'IELTS Reading has 40 questions in 60 minutes. True/False/Not Given tests facts; Yes/No/Not Given tests the writer’s views. Answers follow the order of the text. Do not choose False just because a statement sounds unlikely.',
    reading: [
      'Urban beekeeping has grown rapidly in Europe over the past decade. In London, the number of registered hives roughly doubled between 2008 and 2013. However, some researchers warn that too many honeybee hives may reduce the food available to wild bees, which pollinate many native plants.',
      'Key points: urban beekeeping has grown; London hives about doubled from 2008 to 2013; some researchers warn of competition with wild bees.',
    ],
    checks: [
      {
        prompt: 'The number of hives in London approximately doubled between 2008 and 2013.',
        options: ['True', 'False', 'Not Given'],
        answer: 0,
        explanation: '“Roughly doubled” is paraphrased as “approximately doubled”.',
      },
      {
        prompt: 'All researchers support urban beekeeping.',
        options: ['True', 'False', 'Not Given'],
        answer: 1,
        explanation:
          'Some researchers warn against too many hives, which contradicts “all support it”.',
      },
      {
        prompt: 'Urban honey is more expensive than rural honey.',
        options: ['True', 'False', 'Not Given'],
        answer: 2,
        explanation: 'The text says nothing about price.',
      },
    ],
    writing: {
      prompt: 'Write the answer you give when the text contains no information either way.',
      accepted: ['Not Given'],
      hint: 'Two words.',
      explanation: 'Not Given: the text neither confirms nor contradicts the statement.',
    },
    speaking:
      'Summarise the passage aloud in two sentences in your own words. That is paraphrase practice for every IELTS paper.',
  },
  {
    id: 'en-ielts-writing-1',
    level: 'B1',
    title: 'IELTS Writing Task 1: describe trends',
    outcome: 'Write a clear overview and describe changes in data accurately.',
    phrases: [
      [
        'Overall, …',
        'The overview',
        'Summarise the main trends without numbers. It is essential for a good score.',
      ],
      ['rose steadily / increased sharply', 'Upward trends', 'rose from 20% to 45%'],
      ['fell slightly / dropped dramatically', 'Downward trends', 'fell to a low of …'],
      [
        'peaked at … / reached a peak of …',
        'The highest point',
        'Visitor numbers peaked at 45,000.',
      ],
      ['remained stable / levelled off', 'No change', 'Sales remained stable at around 200.'],
      ['accounted for a quarter of …', 'Proportions', 'Useful for pie charts.'],
      ['whereas / in contrast', 'Comparison', 'Compare figures; don’t just list them.'],
    ],
    notice:
      'Academic Task 1 needs at least 150 words in about 20 minutes. Structure: paraphrase the question, write an overview of the main trends, then two paragraphs with key figures and comparisons. Describe only what the data shows; do not give reasons or opinions. General Training Task 1 is a letter instead.',
    reading: [
      'The graph shows the number of visitors to a city museum between 2015 and 2023. Visitors rose steadily from 20,000 to 45,000 until 2019, fell sharply to 8,000 in 2020, and then recovered to 40,000 by 2023.',
      'Key figures: a steady rise from 2015 to 2019, a sharp fall in 2020, and a recovery by 2023 to slightly below the 2019 peak.',
    ],
    checks: [
      {
        prompt: 'Which is the best overview for this data?',
        options: [
          'Overall, visitor numbers increased over the period despite a sharp drop in 2020.',
          'In 2016 there were 25,000 visitors.',
          'I think museums are important.',
        ],
        answer: 0,
        explanation: 'An overview states the main trend without detailed figures or opinions.',
      },
      {
        prompt: 'Which verb phrase describes 2020?',
        options: ['fell sharply', 'levelled off', 'peaked'],
        answer: 0,
        explanation: 'From 45,000 to 8,000 is a sharp fall.',
      },
      {
        prompt: 'Should you explain why visitor numbers fell in 2020?',
        options: [
          'Yes, always give reasons',
          'No, describe only what the data shows',
          'Only if you are sure',
        ],
        answer: 1,
        explanation:
          'Task 1 reports data. Speculating about causes is not required and can lose marks.',
      },
      {
        prompt: 'Listen. What happened after May?',
        audio: 'Sales rose steadily, peaked at two hundred in May and then levelled off.',
        options: ['They stayed about the same', 'They fell sharply', 'They doubled'],
        answer: 0,
        explanation: '“Levelled off” means stopped changing and stayed stable.',
      },
    ],
    writing: {
      prompt:
        'Write the two words that mean “reached its highest point of” before a number: Visitor numbers ___ ___ 45,000.',
      accepted: ['peaked at'],
      hint: 'p… at',
      explanation: 'Visitor numbers peaked at 45,000 in 2019.',
    },
    speaking:
      'Describe the museum data aloud in under a minute: overview first, then the key figures. Then try the chart task in Writing practice.',
  },
  {
    id: 'en-paraphrase',
    level: 'B2',
    title: 'Paraphrase: say it another way',
    outcome: 'Rephrase ideas with synonyms and word-form changes, accurately.',
    phrases: [
      [
        'a significant increase → rose considerably',
        'Change the word class',
        'Noun ↔ verb, adjective ↔ adverb.',
      ],
      [
        'people who live in cities → urban residents',
        'A synonym phrase',
        'Keep the exact meaning.',
      ],
      [
        'important → crucial / essential / key',
        'Synonyms by strength',
        'Choose the one that fits the collocation.',
      ],
      [
        'economy / economic / economical',
        'Word families',
        'Economic growth, but an economical car.',
      ],
      ['In other words, …', 'Rephrasing in speech', 'Useful when you clarify.'],
    ],
    notice:
      'Paraphrase is tested throughout IELTS: Reading and Listening questions paraphrase the source, and Writing and Speaking reward using your own words rather than copying the question. Accuracy matters more than rarity; a wrong “impressive” word costs more than a correct simple one.',
    checks: [
      {
        prompt: 'Which is the best paraphrase of “The number of tourists increased significantly”?',
        options: [
          'There was a significant rise in tourist numbers.',
          'Tourists are significant.',
          'The number of tourist increase.',
        ],
        answer: 0,
        explanation: 'The verb “increased” becomes the noun “rise”, with the same meaning.',
      },
      {
        prompt: 'Complete: The government wants to boost ___ growth.',
        options: ['economical', 'economic', 'economy'],
        answer: 1,
        explanation: 'Economic relates to the economy; economical means saving money.',
      },
      {
        prompt: 'Paraphrase “children who are younger than five”.',
        options: ['under-fives', 'over-fives', 'fifth children'],
        answer: 0,
        explanation: '“Under-fives” is a common, precise noun phrase.',
      },
      {
        prompt: 'Listen. How successful was the scheme?',
        audio: 'In other words, the scheme has been a qualified success.',
        options: ['Partly successful', 'A total failure', 'Not started yet'],
        answer: 0,
        explanation: 'A “qualified” success is successful with some limits.',
      },
    ],
    writing: {
      prompt:
        'Complete the paraphrase: “Many people live in cities.” → “Many people are urban ___.”',
      accepted: ['residents', 'dwellers', 'inhabitants'],
      hint: 'A noun for people who live somewhere.',
      explanation: 'Urban residents, dwellers or inhabitants all work.',
    },
    speaking:
      'Take any exam-style question and restate it in your own words before answering. Make this a habit.',
  },
  {
    id: 'en-ielts-writing-2',
    level: 'B2',
    title: 'IELTS Writing Task 2: a clear position',
    outcome: 'Identify the question type and build a clear, well-supported essay.',
    phrases: [
      [
        'While some argue that …, I believe …',
        'A thesis statement',
        'State your position in the introduction.',
      ],
      [
        'This is largely because …',
        'The main reason',
        'Develop one idea fully rather than listing many.',
      ],
      ['For instance, …', 'An example', 'Specific and realistic.'],
      ['Admittedly, … However, …', 'Concede and rebut', 'Shows balanced thinking.'],
      ['As a result, …', 'A consequence', 'Link cause and effect.'],
      [
        'In conclusion, although …, I firmly believe …',
        'The conclusion',
        'Restate your view; add no new ideas.',
      ],
    ],
    notice:
      'Task 2 needs at least 250 words in about 40 minutes and counts for twice as much as Task 1. Identify the question type (opinion, discuss both views, advantages and disadvantages, problem and solution, two-part question) and answer every part. Four paragraphs is a reliable structure. Starting every sentence with Moreover or Furthermore lowers your Coherence and Cohesion score.',
    checks: [
      {
        prompt:
          'The question says: “Discuss both views and give your own opinion.” What must you do?',
        options: [
          'Only give your opinion',
          'Discuss both views and give your opinion',
          'Describe a chart',
        ],
        answer: 1,
        explanation: 'Answer every part of the question.',
      },
      {
        prompt: 'Which is the better supporting example?',
        options: [
          'For instance, in Singapore, high car taxes have reduced traffic in the city centre.',
          'For example, many things are good.',
          'Examples are important.',
        ],
        answer: 0,
        explanation: 'A specific, relevant example supports the argument.',
      },
      {
        prompt: 'Which paragraph opening shows good cohesion?',
        options: [
          'Moreover, furthermore, also, …',
          'Another reason why remote work helps families is that …',
          'Firstly secondly thirdly.',
        ],
        answer: 1,
        explanation: 'It links back to the topic naturally without piling up linking words.',
      },
    ],
    writing: {
      prompt:
        'Write the one word that introduces a concession before you disagree (it is followed by a comma).',
      accepted: ['Admittedly'],
      hint: 'A… , it is true that …',
      explanation: 'Admittedly, online courses are cheaper. However, …',
    },
    speaking:
      'Plan an essay aloud with the live coach: “Should public transport be free?” State your position, two reasons with examples and one concession. Then write it in Writing practice.',
  },
  {
    id: 'en-ielts-speaking-1',
    level: 'B1',
    title: 'IELTS Speaking Part 1: answer and extend',
    outcome: 'Answer everyday questions directly and extend them naturally.',
    phrases: [
      [
        'Yeah, I do, actually. Mainly because …',
        'Answer + reason',
        'Answer directly, then add a reason.',
      ],
      [
        'To be honest, not really. I’d rather …',
        'An honest negative answer',
        'Negative answers are fine if you extend them.',
      ],
      [
        'It depends. On weekdays …, but at weekends …',
        'A contrast',
        'Shows range and keeps you talking naturally.',
      ],
      [
        'For example, last weekend I …',
        'An example',
        'A short past example adds grammatical range.',
      ],
      ['I used to …, but these days …', 'Past vs present', 'Great for questions about change.'],
    ],
    notice:
      'Part 1 lasts 4–5 minutes, with questions about familiar topics such as home, work, study and hobbies. Aim for two or three sentences: an answer plus a reason or example. Memorised speeches are easy to spot; natural, extended answers work better.',
    pronunciation:
      'Start answering quickly. A short natural opener such as “Yeah, I do, actually” sounds fluent; a long silence does not.',
    checks: [
      {
        prompt: 'Examiner: Do you like cooking? Which is the best answer?',
        options: [
          'Yes.',
          'Yeah, I do, actually. I find it relaxing after work, and I usually cook for friends at weekends.',
          'Cooking is an activity that many people around the world enjoy for various reasons, such as …',
        ],
        answer: 1,
        explanation:
          'A direct answer with a reason and a personal detail. The third sounds memorised and general.',
      },
      {
        prompt: 'Which answer best shows change over time?',
        options: [
          'I used to play football a lot, but these days I mostly go running.',
          'I play football.',
          'Football is popular.',
        ],
        answer: 0,
        explanation: '“Used to … but these days …” contrasts past and present.',
      },
      {
        prompt: 'Listen. What does the examiner want?',
        audio: 'Let’s talk about your hometown. What do you like most about it?',
        options: [
          'What you like most about your hometown',
          'Where you live now',
          'Your plans for the future',
        ],
        answer: 0,
        explanation: 'Answer the exact question: what you like most, with a reason.',
      },
    ],
    writing: {
      prompt: 'Complete with one word: “I used to walk to work, but these ___ I cycle.”',
      accepted: ['days'],
      hint: 'these …',
      explanation: '“These days” means nowadays.',
    },
    speaking:
      'Ask the live coach to run IELTS Speaking Part 1: four topics with three questions each. Answer every question with a reason or an example.',
  },
  {
    id: 'en-ielts-speaking-2',
    level: 'B2',
    title: 'IELTS Speaking Part 2: the long turn',
    outcome: 'Plan in one minute and speak for up to two minutes, covering every point.',
    phrases: [
      [
        'I’m going to talk about …',
        'Introduce the topic',
        'Paraphrase the card rather than reading it.',
      ],
      ['It was back in 2021, when I …', 'Set the scene', 'When, where, who.'],
      [
        'What made it so memorable was …',
        'Focus',
        'A cleft sentence adds emphasis and grammatical range.',
      ],
      ['Looking back, I realise …', 'Reflect', 'Adds depth to your final point.'],
      ['Anyway, that’s why …', 'Wrap up', 'A natural signal that you are finishing.'],
    ],
    notice:
      'You get a task card and one minute to make notes, then speak for up to two minutes. Use the minute to note 4–5 keywords, not sentences. Cover every bullet, and use the last one (“explain why …”) for your longest part.',
    pronunciation:
      'Vary your pace: slightly slower for key moments, normal for background. A flat monotone is harder to follow.',
    checks: [
      {
        prompt: 'What is the best use of the one-minute preparation?',
        options: [
          'Write the full answer word for word',
          'Note 4–5 keywords for the bullet points',
          'Sit quietly and relax',
        ],
        answer: 1,
        explanation: 'Keywords keep you on track without making you read aloud.',
      },
      {
        prompt: 'Which opening is best?',
        options: [
          'I’m going to talk about a trip to the coast I took with my brother a couple of years ago.',
          'Describe a trip you took.',
          'Um … trip … I don’t know.',
        ],
        answer: 0,
        explanation: 'It introduces the topic in your own words with a little context.',
      },
      {
        prompt: 'Which sentence uses a cleft structure for emphasis?',
        options: [
          'It was a nice day.',
          'What made it special was the people I met.',
          'The people were nice.',
        ],
        answer: 1,
        explanation: '“What made it special was …” focuses the listener on the key point.',
      },
      {
        prompt: 'Listen. What made the trip memorable?',
        audio: 'What made the trip so memorable was the people we met along the way.',
        options: ['The people', 'The weather', 'The food'],
        answer: 0,
        explanation: 'The cleft sentence puts the focus on “the people we met”.',
      },
    ],
    writing: {
      prompt:
        'Complete: “What made it so ___ was the atmosphere.” (a word meaning “easy to remember”)',
      accepted: ['memorable'],
      hint: 'memor…',
      explanation: 'What made it so memorable was …',
    },
    speaking:
      'Task card: Describe a skill you learned outside school. Say what it was, how you learned it, how difficult it was, and explain why it is useful. Take one minute to prepare, then speak for two minutes with the live coach.',
  },
  {
    id: 'en-ielts-speaking-3',
    level: 'B2',
    title: 'IELTS Speaking Part 3: discuss ideas',
    outcome: 'Discuss abstract questions with reasons, comparisons and speculation.',
    phrases: [
      ['I’d say it’s largely because …', 'Give a cause', 'Hedged but clear.'],
      ['Compared with a generation ago, …', 'Compare over time', 'Common for social trends.'],
      ['On the one hand …; on the other …', 'Balance', 'Two sides.'],
      ['It’s likely that … / I doubt that …', 'Speculate', 'Predict the future.'],
      ['Take my country, for instance: …', 'A specific example', 'Ground an abstract point.'],
      [
        'That’s not something I’ve thought about much, but …',
        'Buy time honestly',
        'Natural and fluent.',
      ],
    ],
    notice:
      'Part 3 questions are abstract: society, trends and the future. Give opinions supported by reasons, comparisons and speculation, usually in four to six sentences. Talk about people in general, not only about yourself.',
    pronunciation:
      'Chunk long answers: pause briefly between ideas, never in the middle of a phrase.',
    checks: [
      {
        prompt: 'Examiner: Why do young people move to cities? Which is the best start?',
        options: [
          'I’d say it’s largely because of job opportunities, although housing is often a problem.',
          'Yes.',
          'My cousin moved to London.',
        ],
        answer: 0,
        explanation: 'It gives a general reason and a nuance; you can then add an example.',
      },
      {
        prompt: 'Which phrase speculates about the future?',
        options: [
          'It’s likely that more people will work remotely.',
          'I went to work yesterday.',
          'Compared with my brother, I am taller.',
        ],
        answer: 0,
        explanation: '“It’s likely that … will …” is a prediction.',
      },
      {
        prompt: 'Listen. What kind of answer is needed?',
        audio: 'Do you think technology has made people less sociable?',
        options: [
          'An opinion about society with reasons',
          'A description of your phone',
          'Your daily routine',
        ],
        answer: 0,
        explanation: 'Part 3 asks for a reasoned opinion about people in general.',
      },
    ],
    writing: {
      prompt: 'Complete with one word: “Compared ___ a generation ago, people travel more.”',
      accepted: ['with', 'to'],
      hint: 'A short preposition.',
      explanation: 'Both “compared with” and “compared to” are acceptable.',
    },
    speaking:
      'Ask the live coach for three Part 3 questions about education. Answer each with an opinion, a reason, an example and a brief look at the other side.',
  },
]);
