import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

export default function AssessmentResultScreen() {
  const router = useRouter();

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <Eyebrow color="rgba(241,237,227,.55)">Assessment results</Eyebrow>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <View style={styles.icon}>
          <MaterialCommunityIcons color={Palette.ink} name="account-voice" size={38} />
        </View>
        <Eyebrow color={Palette.orange}>No result yet</Eyebrow>
        <Text style={styles.title}>Your first spoken check starts with a real conversation.</Text>
        <Text style={styles.copy}>
          VOKA will show an estimated level only after it has enough evidence. It will never create
          a score or improvement claim before you complete an assessment.
        </Text>
        <Pressable
          accessibilityLabel="Start spoken level check from results"
          accessibilityRole="button"
          onPress={() => router.replace('/level-check')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={Palette.ink} name="microphone" size={21} />
          <Text style={styles.buttonText}>Start spoken check</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  spacer: { width: 40 },
  body: { flex: 1, justifyContent: 'center', padding: 24 },
  icon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    marginBottom: 22,
    width: 72,
  },
  title: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 39,
    marginTop: 10,
  },
  copy: {
    color: 'rgba(241,237,227,.62)',
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.orange,
    borderRadius: 99,
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: { color: Palette.ink, fontFamily: VokaFonts.bodyBold, fontSize: 14 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
