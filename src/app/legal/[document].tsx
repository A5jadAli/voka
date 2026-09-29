import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { documents } from '@/features/legal/documents';
import { Palette, VokaFonts } from '@/constants/theme';

export default function LegalScreen() {
  const { document } = useLocalSearchParams<{ document?: string }>();
  const page = document === 'terms' ? documents.terms : documents.privacy;
  return (
    <AppScreen showNav={false}>
      <View style={styles.header}>
        <HeaderBack />
        <Eyebrow color={Palette.orange}>VOKENO</Eyebrow>
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
