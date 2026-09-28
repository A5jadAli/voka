import { type Href, useRouter } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
export default function ExamPracticeScreen() {
  const router = useRouter();
  const goal = useCoachingStore((state) => state.preferences.EN.studyGoal);
  const academic = goal !== 'ielts-general';
  const tasks = [
    [
      'Listen for detail',
      'Use the listening library. Answer before reading captions, then replay and identify the evidence. These short lessons are not full-length exam recordings.',
      '/listening?track=EN',
    ],
    [
      'Read and justify',
      'Practise main ideas, detail and information that is not given. Explain why the other options are unsupported.',
      '/reading',
    ],
    [
      academic ? 'Academic writing: describe a chart' : 'General Training writing: write a letter',
      academic
        ? 'Summarise the main features and compare figures. Switch on timed exam mode for a full 150-word, 20-minute response, then get AI feedback.'
        : 'Cover every bullet point and choose the right tone for the reader. Build towards 150 words.',
      academic ? '/activity/write?task=chart' : '/activity/write?task=letter',
    ],
    [
      'Writing: support an opinion',
      'Discuss both views and give your own position. Use timed exam mode for a full 250-word, 40-minute essay, then get AI feedback.',
      '/activity/write?task=opinion',
    ],
    [
      'Speaking mock: Parts 2 and 3',
      'Get a task card, prepare for one minute with notes, then speak for two minutes while the live examiner listens, followed by discussion and feedback on all four criteria. No band score is given.',
      '/speaking-mock?track=EN',
    ],
    [
      'Skills lessons for every paper',
      'Short guided lessons on Listening traps, True/False/Not Given, Task 1 trends, Task 2 structure, paraphrase and all three speaking parts.',
      '/sprint?track=EN',
    ],
  ];
  return (
    <AppScreen showNav={false}>
      <View style={{ padding: 20, gap: 18 }}>
        <HeaderBack />
        <Eyebrow>Optional exam support</Eyebrow>
        <Text style={{ fontSize: 28, fontFamily: VokaFonts.displayBold }}>
          IELTS {academic ? 'Academic' : 'General Training'} practice guide
        </Text>
        <Text>
          Use all four skills. Voka is independent of IELTS and does not award band scores. Short
          practice and transcript estimates do not predict your exam result.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/learning-plan' as Href)}
          style={{ minHeight: 44 }}
        >
          <Text style={{ textDecorationLine: 'underline' }}>
            Change Academic or General Training goal
          </Text>
        </Pressable>
        {tasks.map(([title, copy, href]) => (
          <Pressable
            key={title}
            accessibilityRole="button"
            onPress={() => router.push(href as Href)}
            style={{ padding: 18, gap: 10, borderRadius: 18, backgroundColor: Palette.white }}
          >
            <Text style={{ fontSize: 19, fontFamily: VokaFonts.bodySemiBold }}>{title}</Text>
            <Text style={{ lineHeight: 23 }}>{copy}</Text>
            <Text style={{ textDecorationLine: 'underline' }}>Open practice</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL('https://ielts.org/take-a-test/preparation-resources')
          }
          style={{ minHeight: 48 }}
        >
          <Text style={{ textDecorationLine: 'underline' }}>
            Official IELTS preparation resources
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}
