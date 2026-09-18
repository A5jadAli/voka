import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { TestDatePicker } from '@/components/test-date-picker';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useCoachingStore } from '@/features/coaching/store';
import { formatTestDate, parseDateOnly, toDateOnly } from '@/features/profile/test-date';

function initialDate(saved: string | null) {
  const parsed = parseDateOnly(saved);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed && parsed >= today) return parsed;
  const nextMonth = new Date();
  nextMonth.setHours(12, 0, 0, 0);
  nextMonth.setDate(nextMonth.getDate() + 30);
  return nextMonth;
}

export default function TestDateScreen() {
  const router = useRouter();
  const savedDate = useCoachingStore((state) => state.testDate);
  const setTestDate = useCoachingStore((state) => state.setTestDate);
  const [draft, setDraft] = useState(() => initialDate(savedDate));
  const [pickerVisible, setPickerVisible] = useState(Platform.OS !== 'android');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const save = () => {
    setTestDate(toDateOnly(draft));
    router.back();
  };

  return (
    <AppScreen backgroundColor={Palette.ink} dark showNav={false}>
      <View style={styles.header}>
        <HeaderBack dark />
        <Text style={styles.headerTitle}>Test date</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <View style={styles.icon}>
          <MaterialCommunityIcons color={Palette.ink} name="calendar-check" size={32} />
        </View>
        <Eyebrow color={Palette.orange}>Your target</Eyebrow>
        <Text style={styles.title}>When is your language test?</Text>
        <Text style={styles.copy}>
          Voka uses this date to keep your practice plan focused. You can change or remove it any
          time.
        </Text>

        {Platform.OS === 'android' ? (
          <Pressable
            accessibilityLabel="Choose test date"
            accessibilityRole="button"
            onPress={() => setPickerVisible(true)}
            style={styles.dateButton}
          >
            <MaterialCommunityIcons color={Palette.orange} name="calendar-month" size={23} />
            <Text style={styles.dateButtonText}>{formatTestDate(toDateOnly(draft))}</Text>
            <MaterialCommunityIcons color={Palette.cream} name="chevron-down" size={21} />
          </Pressable>
        ) : null}
        {pickerVisible ? (
          <View style={styles.pickerCard}>
            <TestDatePicker
              minimumDate={today}
              onChange={(value, dismissed) => {
                if (!dismissed) setDraft(value);
                if (Platform.OS === 'android') setPickerVisible(false);
              }}
              value={draft}
            />
          </View>
        ) : null}

        <Pressable accessibilityRole="button" onPress={save} style={styles.saveButton}>
          <Text style={styles.saveText}>Save test date</Text>
        </Pressable>
        {savedDate ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setTestDate(null);
              router.back();
            }}
          >
            <Text style={styles.removeText}>Remove test date</Text>
          </Pressable>
        ) : null}
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
  headerTitle: { color: Palette.cream, fontFamily: VokaFonts.displayBold, fontSize: 20 },
  spacer: { width: 40 },
  body: { padding: 24, paddingTop: 30 },
  icon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 20,
    width: 64,
  },
  title: {
    color: Palette.cream,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 36,
    letterSpacing: -1.1,
    lineHeight: 41,
    marginTop: 9,
  },
  copy: {
    color: 'rgba(241,237,227,.63)',
    fontFamily: VokaFonts.body,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 11,
  },
  dateButton: {
    alignItems: 'center',
    backgroundColor: '#282623',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 11,
    marginTop: 25,
    minHeight: 60,
    paddingHorizontal: 16,
  },
  dateButtonText: { color: Palette.cream, flex: 1, fontFamily: VokaFonts.bodyBold, fontSize: 15 },
  pickerCard: {
    backgroundColor: '#282623',
    borderRadius: 20,
    marginTop: 24,
    overflow: 'hidden',
    padding: 14,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 25,
    minHeight: 58,
  },
  saveText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 17 },
  removeText: {
    color: '#FFB49E',
    fontFamily: VokaFonts.bodyBold,
    fontSize: 13,
    paddingVertical: 18,
    textAlign: 'center',
  },
});
