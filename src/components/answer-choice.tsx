import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Palette, VokaFonts } from '@/constants/theme';

export function AnswerChoice({
  label,
  selected,
  result,
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  result?: 'correct' | 'incorrect';
  disabled?: boolean;
  onPress: () => void;
}) {
  const color = result === 'correct' ? '#27623B' : result === 'incorrect' ? '#9B321F' : Palette.ink;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityHint={
        result === 'correct'
          ? 'Correct answer'
          : result === 'incorrect'
            ? 'Not quite. Try another answer.'
            : undefined
      }
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.selected,
        result === 'correct' && styles.correct,
        result === 'incorrect' && styles.incorrect,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons
        color={color}
        size={23}
        name={
          result === 'correct'
            ? 'check-circle'
            : result === 'incorrect'
              ? 'close-circle-outline'
              : selected
                ? 'radiobox-marked'
                : 'radiobox-blank'
        }
      />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  choice: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Palette.line,
    backgroundColor: Palette.white,
  },
  selected: { borderColor: Palette.yellow, backgroundColor: '#FFF1BC' },
  correct: { borderColor: '#3B754C', backgroundColor: '#E8F3E9' },
  incorrect: { borderColor: '#B44931', backgroundColor: '#FFF0EA' },
  pressed: { opacity: 0.8 },
  label: { flex: 1, fontFamily: VokaFonts.bodySemiBold, fontSize: 15, lineHeight: 23 },
});
