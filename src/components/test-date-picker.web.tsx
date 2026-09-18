import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, VokaFonts } from '@/constants/theme';

export function TestDatePicker({
  minimumDate,
  onChange,
  value,
}: {
  minimumDate: Date;
  onChange: (date: Date, dismissed: boolean) => void;
  value: Date;
}) {
  const move = (days: number) => {
    const next = new Date(value);
    next.setDate(next.getDate() + days);
    if (next >= minimumDate) onChange(next, false);
  };
  return (
    <View style={styles.row}>
      <Pressable accessibilityLabel="Previous day" onPress={() => move(-1)} style={styles.button}>
        <MaterialCommunityIcons color={Palette.cream} name="chevron-left" size={24} />
      </Pressable>
      <Text style={styles.date}>
        {new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(value)}
      </Text>
      <Pressable accessibilityLabel="Next day" onPress={() => move(1)} style={styles.button}>
        <MaterialCommunityIcons color={Palette.cream} name="chevron-right" size={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center' },
  button: {
    alignItems: 'center',
    borderColor: 'rgba(241,237,227,.25)',
    borderRadius: 99,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  date: {
    color: Palette.cream,
    fontFamily: VokaFonts.bodyBold,
    fontSize: 14,
    minWidth: 170,
    textAlign: 'center',
  },
});
