import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Tactile } from '@/components/motion';
import { Palette, VokaFonts } from '@/constants/theme';
import { haptic } from '@/features/feedback/haptics';

const looks = {
  idle: {
    face: Palette.white,
    border: 'rgba(19,18,17,0.12)',
    lip: 'rgba(19,18,17,0.14)',
    ink: Palette.ink,
  },
  selected: { face: '#FFF4CC', border: Palette.yellow, lip: '#C99600', ink: Palette.ink },
  correct: { face: '#E3F2E5', border: '#2F7A47', lip: '#1F5A33', ink: '#1F5A33' },
  incorrect: { face: '#FFE9E1', border: '#B44931', lip: '#8E2D1B', ink: '#8E2D1B' },
} as const;

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
  const look = looks[result ?? (selected ? 'selected' : 'idle')];
  const shake = useSharedValue(0);
  const pop = useSharedValue(1);
  const previous = useRef(result);
  useEffect(() => {
    if (result === previous.current) return;
    previous.current = result;
    if (result === 'incorrect') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 70 }),
        withTiming(-5, { duration: 60 }),
        withTiming(5, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      );
      haptic.wrong();
    }
    if (result === 'correct') {
      pop.value = withSequence(withSpring(1.035, { stiffness: 500 }), withSpring(1));
      haptic.correct();
    }
  }, [pop, result, shake]);
  const popStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: pop.value }],
  }));
  return (
    <Animated.View style={popStyle}>
      <Tactile
        accessibilityRole="radio"
        accessibilityLabel={label}
        accessibilityHint={
          result === 'correct'
            ? 'Correct answer'
            : result === 'incorrect'
              ? 'Not quite. Try another answer.'
              : undefined
        }
        accessibilityState={{ checked: selected }}
        ariaChecked={selected}
        disabled={disabled}
        face={look.face}
        lip={look.lip}
        borderColor={look.border}
        borderWidth={2}
        radius={18}
        onPress={() => {
          if (!selected) haptic.select();
          onPress();
        }}
      >
        <View style={styles.row}>
          <Text style={[styles.label, { color: look.ink }]}>{label}</Text>
          {result ? (
            <MaterialCommunityIcons
              name={result === 'correct' ? 'check-circle' : 'close-circle'}
              size={24}
              color={look.ink}
            />
          ) : null}
        </View>
      </Tactile>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: { flex: 1, fontFamily: VokaFonts.bodySemiBold, fontSize: 16, lineHeight: 23 },
});
