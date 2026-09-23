import type { StartingAbility, StudyGoal } from './store';
export function learningRecommendation(
  track: 'DE' | 'EN',
  ability: StartingAbility = 'new',
  goal: StudyGoal = 'everyday',
) {
  if (track === 'DE') {
    if (ability === 'new')
      return {
        title: 'Start with your first German words',
        why: 'Build confidence with English explanations before a live conversation.',
        href: '/foundation/greetings',
      };
    if (ability === 'basics')
      return goal === 'work-study'
        ? {
            title: 'Arrange an appointment',
            why: 'Practise polite requests and times for work or study.',
            href: '/foundation/appointments',
          }
        : {
            title: 'Order and pay',
            why: 'Use the basics in an everyday exchange in Germany.',
            href: '/foundation/cafe',
          };
    return goal === 'work-study'
      ? {
          title: 'Explain a problem at work',
          why: 'Practise reasons, polite solutions and connected sentences.',
          href: '/foundation/work-problem',
        }
      : {
          title: 'Explain and compare your options',
          why: 'Build a longer answer with reasons and a clear preference.',
          href: '/foundation/opinions',
        };
  }
  if (ability === 'new')
    return {
      title: 'Start with a short listening task',
      why: 'Hear one sentence, read its transcript and check the meaning.',
      href: '/activity/listen',
    };
  if (goal === 'ielts-academic')
    return {
      title: ability === 'basics' ? 'Describe a chart' : 'Develop a supported opinion',
      why: 'Practise exam-relevant writing with a saved draft and a revision checklist.',
      href: ability === 'basics' ? '/activity/write?task=chart' : '/activity/write?task=opinion',
    };
  if (goal === 'ielts-general' || goal === 'work-study')
    return {
      title: 'Write a practical request',
      why: 'Cover each point and choose a suitable tone for the reader.',
      href: '/activity/write?task=letter',
    };
  return {
    title: 'Read for the main idea and detail',
    why: 'Read a short real-world text, then explain the evidence for your answer.',
    href: '/reading',
  };
}
