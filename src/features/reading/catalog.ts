export const readingLessons = [
  {
    id: 'notice',
    title: 'Read a practical notice',
    kind: 'Everyday reading',
    text: 'The Riverside Library will close at 4 pm this Friday for electrical repairs. The online catalogue will remain available. Books due on Friday may be returned on Monday without a late fee. The children’s reading club has moved to the community hall at its usual time of 3 pm.',
    questions: [
      {
        prompt: 'What is the main purpose of the notice?',
        options: [
          'To explain temporary service changes',
          'To announce a permanent closure',
          'To advertise a new website',
        ],
        answer: 0,
        explanation:
          'The notice gives temporary changes for Friday, including closing, returns and the club location.',
      },
      {
        prompt: 'Must a reader pay a late fee for returning a Friday-due book on Monday?',
        options: ['Yes', 'No', 'The notice does not say'],
        answer: 1,
        explanation: 'The notice explicitly says without a late fee.',
      },
      {
        prompt: 'What changes for the reading club?',
        options: ['The time only', 'The location only', 'Both time and location'],
        answer: 1,
        explanation: 'It moves to the community hall but keeps its usual time, 3 pm.',
      },
    ],
  },
  {
    id: 'study',
    title: 'Separate a finding from a claim',
    kind: 'Academic-style reading',
    text: 'A small study followed 60 adult language learners for six weeks. Half practised vocabulary in short daily sessions; the others used one longer weekly session with the same total study time. The daily group recalled more words in a test one week later. However, participants chose their own group, and motivation was not measured. The researchers said the result was promising but did not prove that the schedule alone caused the difference. They recommended a larger study with random assignment.',
    questions: [
      {
        prompt: 'What was kept the same between the study groups?',
        options: ['Their motivation', 'Their total study time', 'Their preferred schedule'],
        answer: 1,
        explanation: 'The passage explicitly states the same total study time.',
      },
      {
        prompt: 'The schedule alone definitely caused the better result. Is this supported?',
        options: ['Yes', 'No, the passage rejects that certainty', 'The passage gives no result'],
        answer: 1,
        explanation:
          'Self-selection and unmeasured motivation limit the conclusion. Association does not establish the claimed cause.',
      },
      {
        prompt: 'Were all participants university students?',
        options: ['Yes', 'No', 'Not given'],
        answer: 2,
        explanation:
          'Adult language learners does not tell us their educational status. Do not infer information the text does not provide.',
      },
    ],
  },
  {
    id: 'workshop',
    title: 'Read instructions and conditions',
    kind: 'Work and General Training-style reading',
    text: 'Employees may book one communication workshop each term. Registration closes on 10 October, but places are allocated in the order requests are received. A manager must approve attendance before registration. Cancellations made at least 48 hours before a workshop carry no charge. Later cancellations are charged to the department unless the employee is ill. Materials are emailed the day before the workshop; printed copies are not supplied.',
    questions: [
      {
        prompt: 'What must happen before registration?',
        options: [
          'The employee prints the materials',
          'A manager approves attendance',
          'The department pays a cancellation fee',
        ],
        answer: 1,
        explanation: 'The required prior step is manager approval.',
      },
      {
        prompt:
          'An employee cancels 24 hours before because of illness. Is a charge required by this notice?',
        options: ['Yes, always', 'No, illness is an exception', 'Only on 10 October'],
        answer: 1,
        explanation:
          'Unless the employee is ill creates an exception to the late-cancellation charge.',
      },
      {
        prompt: 'Does registering by the deadline guarantee a place?',
        options: [
          'Yes',
          'No, requests are allocated in order',
          'Only if printed materials are requested',
        ],
        answer: 1,
        explanation:
          'A closing date is not a guarantee when places are allocated in request order.',
      },
    ],
  },
  {
    id: 'sleep-tfng',
    title: 'True, False or Not Given',
    kind: 'Academic-style reading · IELTS question type',
    text: 'Teenagers’ body clocks shift during puberty, so many feel sleepy later at night than younger children do. Several school districts in the United States moved their start times from around 7:30 to 8:30 am. In most of these districts, students slept longer on school nights, and attendance improved slightly. Some parents, however, reported that later finishing times made after-school jobs harder to keep. Researchers noted that the effects on exam results varied between schools.',
    questions: [
      {
        prompt: 'Statement: After the change, students in most districts slept for longer.',
        options: ['True', 'False', 'Not Given'],
        answer: 0,
        explanation: '“In most of these districts, students slept longer” matches the statement.',
      },
      {
        prompt: 'Statement: Exam results improved in every school that changed its start time.',
        options: ['True', 'False', 'Not Given'],
        answer: 1,
        explanation: 'The effects “varied between schools”, which contradicts “every school”.',
      },
      {
        prompt: 'Statement: Most parents supported the later start time.',
        options: ['True', 'False', 'Not Given'],
        answer: 2,
        explanation:
          'Only some parents’ concerns are mentioned. The text gives no information about what most parents thought.',
      },
    ],
  },
];
