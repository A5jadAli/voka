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
        ? 'Summarise the main features and compare figures. Build towards a full 150-word response.'
        : 'Cover every bullet point and choose the right tone for the reader. Build towards 150 words.',
      academic ? '/activity/write?task=chart' : '/activity/write?task=letter',
    ],
    [
      'Writing: support an opinion',
      'Discuss both views and give your own position. This short planning activity prepares for a full 250-word essay.',
      '/activity/write?task=opinion',
    ],
    [
      'Speaking: extend your answer',
      'Use the live coach for follow-up questions. Practise explaining a place you enjoy: where it is, what you do there and why you like it. The conversation is adaptive practice, not a timed mock exam.',
      '/conversation?track=EN',
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
