import { type Href, useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { ActionRow, InfoCard, lessonText, SectionLabel } from '@/components/lesson-ui';
import { AppScreen, HeaderBack } from '@/components/voka-ui';
import { useCoachingStore } from '@/features/coaching/store';

export default function ExamPracticeScreen() {
  const router = useRouter();
  const goal = useCoachingStore((state) => state.preferences.EN.studyGoal);
  const academic = goal !== 'ielts-general';
  const open = (href: string) => router.push(href as Href);
  return (
    <AppScreen showNav={false}>
      <View style={styles.header}>
        <HeaderBack />
      </View>
      <View style={styles.body}>
        <Text style={lessonText.meta}>Optional exam support</Text>
        <Text accessibilityRole="header" style={lessonText.title}>
          IELTS {academic ? 'Academic' : 'General Training'} practice guide
        </Text>
        <Text style={lessonText.lead}>
          Practise all four skills. Vokeno is independent of IELTS and does not award band scores.
        </Text>
        <ActionRow
          icon="swap-horizontal"
          title="Change Academic or General Training goal"
          onPress={() => open('/learning-plan')}
        />

        <SectionLabel>Listening and reading</SectionLabel>
        <View style={styles.group}>
          <ActionRow
            icon="headphones"
            title="Listen for detail"
            subtitle="Numbers, spelling and corrected details, then real-life dialogues"
            onPress={() => open('/listening?track=EN')}
          />
          <ActionRow
            icon="book-open-variant"
            title="Read and justify"
            subtitle="Main idea, detail and True / False / Not Given"
            onPress={() => open('/reading')}
          />
        </View>

        <SectionLabel>Writing</SectionLabel>
        <View style={styles.group}>
          <ActionRow
            icon="chart-bar"
            title={academic ? 'Task 1: describe a chart' : 'Task 1: write a letter'}
            subtitle="Timed exam mode (20 min, 150 words) and AI feedback"
            onPress={() =>
              open(academic ? '/activity/write?task=chart' : '/activity/write?task=letter')
            }
          />
          <ActionRow
            icon="text-box-edit-outline"
            title="Task 2: support an opinion"
            subtitle="Timed exam mode (40 min, 250 words) and AI feedback"
            onPress={() => open('/activity/write?task=opinion')}
          />
        </View>

        <SectionLabel>Speaking</SectionLabel>
        <View style={styles.group}>
          <ActionRow
            icon="card-text-outline"
            title="Speaking mock: Parts 2 and 3"
            subtitle="Task card, one minute to prepare, then a live examiner"
            onPress={() => open('/speaking-mock?track=EN')}
          />
          <ActionRow
            icon="school-outline"
            title="Skills lessons for every paper"
            subtitle="Short guided lessons from listening traps to Part 3 discussion"
            onPress={() => open('/sprint?track=EN')}
          />
        </View>

        <ActionRow
          icon="open-in-new"
          title="Official IELTS preparation resources"
          onPress={() =>
            void Linking.openURL('https://ielts.org/take-a-test/preparation-resources')
          }
        />
        <InfoCard icon="information-outline" title="About scores">
          Short practice and AI feedback describe your work; they do not predict an exam result.
        </InfoCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  body: { gap: 14, paddingBottom: 40, paddingHorizontal: 20, paddingTop: 8 },
  group: { gap: 8 },
});
