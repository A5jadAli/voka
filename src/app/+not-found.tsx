import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionBar, lessonText, PrimaryButton } from '@/components/lesson-ui';
import { AppScreen } from '@/components/voka-ui';
import { Palette } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <AppScreen
      showNav={false}
      footer={
        <ActionBar>
          <PrimaryButton title="Go to Home" onPress={() => router.replace('/' as Href)} />
        </ActionBar>
      }
    >
      <View style={styles.body}>
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="map-marker-question-outline"
            size={40}
            color={Palette.ink}
          />
        </View>
        <Text accessibilityRole="header" style={[lessonText.title, styles.center]}>
          This page isn’t here
        </Text>
        <Text style={[lessonText.lead, styles.center]}>
          The link may be old or mistyped. Your progress is safe.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 28 },
  center: { textAlign: 'center' },
  badge: {
    alignItems: 'center',
    backgroundColor: Palette.yellow,
    borderRadius: 99,
    height: 88,
    justifyContent: 'center',
    marginBottom: 8,
    width: 88,
  },
});
