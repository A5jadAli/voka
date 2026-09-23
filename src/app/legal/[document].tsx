import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';

const documents = {
  privacy: {
    intro: 'Effective 18 September 2026',
    sections: [
      [
        'What Voka processes',
        'Account details, learning progress, preferences, assessment results, and live-session transcripts needed to provide the service.',
      ],
      [
        'Live voice and assessments',
        'Supabase authorises live sessions. Microphone audio travels directly to OpenAI over an encrypted WebRTC connection during live practice. Assessment transcripts are processed by xAI, or OpenAI when xAI is unavailable, to produce a non-certified language estimate.',
      ],
      [
        'Storage',
        'Signed-in learning state is kept separately for each account on the device and synced to Supabase when connected. Guest progress stays separate on the device. Signing out does not delete unsynced account progress. Deleting your account removes its synced data and local learning data on this device. Voka does not offer profile photos.',
      ],
      [
        'Purchases',
        'App stores and RevenueCat process subscription and entitlement information. Voka never receives your full payment-card details.',
      ],
      [
        'Your choices',
        'You can stop microphone access in device settings, restore or manage store purchases, sign out, or permanently delete your account and synced learning data from Profile.',
      ],
    ],
    title: 'Privacy policy',
  },
  terms: {
    intro: 'Effective 18 September 2026',
    sections: [
      [
        'Learning service',
        'Voka provides authored language lessons and AI-assisted live practice. Captions and AI feedback can contain mistakes and should not be treated as professional advice.',
      ],
      [
        'Assessments',
        'Spoken levels are broad, transcript-based estimates. They are not certified CEFR examinations and do not measure pronunciation from text.',
      ],
      [
        'Subscriptions',
        'The store shows the price, billing period, renewal terms, and any trial before purchase. Subscriptions renew automatically unless cancelled through the store before the current period ends.',
      ],
      [
        'Acceptable use',
        'Do not misuse the service, attempt to access another person’s account, disrupt the service, or submit unlawful content.',
      ],
      [
        'Availability',
        'Internet access is required for authentication, cloud sync, purchases, updates, and live voice. Authored lessons can remain available without a live connection.',
      ],
    ],
    title: 'Terms of use',
  },
} as const;

export default function LegalScreen() {
  const { document } = useLocalSearchParams<{ document?: string }>();
  const page = document === 'terms' ? documents.terms : documents.privacy;
  return (
    <AppScreen showNav={false}>
      <View style={styles.header}>
        <HeaderBack />
        <Eyebrow color={Palette.orange}>VOKA</Eyebrow>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.date}>{page.intro}</Text>
        {page.sections.map(([heading, copy]) => (
          <View key={heading} style={styles.section}>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.copy}>{copy}</Text>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  spacer: { width: 40 },
  body: { paddingBottom: 36, paddingHorizontal: 22 },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 38,
    letterSpacing: -1.2,
  },
  date: { color: Palette.muted, fontFamily: VokaFonts.mono, fontSize: 10, marginTop: 7 },
  section: { borderTopColor: Palette.line, borderTopWidth: 1, marginTop: 22, paddingTop: 18 },
  heading: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 19 },
  copy: {
    color: Palette.secondary,
    fontFamily: VokaFonts.body,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 7,
  },
});
