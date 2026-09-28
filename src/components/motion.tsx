import { useEffect, useState, type PropsWithChildren } from 'react';
import {
  Pressable,
  type AccessibilityState,
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type TactileProps = PropsWithChildren<{
  face: string;
  lip: string;
  radius?: number;
  depth?: number;
  borderColor?: string;
  borderWidth?: number;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: PressableProps['accessibilityRole'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  ariaChecked?: boolean;
}>;

/**
 * A pressable with a visible "lip" under its face. Pressing pushes the face down onto the lip,
 * and releasing springs it back, which reads as a physical button.
 */
export function Tactile({
  face,
  lip,
  radius = 16,
  depth = 4,
  borderColor,
  borderWidth = 0,
  disabled = false,
  onPress,
  style,
  faceStyle,
  children,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ariaChecked,
}: TactileProps) {
  const press = useSharedValue(0);
  const faceAnimation = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * depth }],
  }));
  const activeDepth = disabled ? 0 : depth;
  return (
    <View style={style}>
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, ...accessibilityState }}
        aria-checked={ariaChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          press.value = withTiming(1, { duration: 70 });
        }}
        onPressOut={() => {
          press.value = withSpring(0, { damping: 14, stiffness: 320 });
        }}
      >
        <View style={{ backgroundColor: lip, borderRadius: radius, paddingBottom: activeDepth }}>
          <Animated.View
            style={[
              {
                backgroundColor: face,
                borderRadius: radius,
                borderColor,
                borderWidth,
              },
              faceStyle,
              faceAnimation,
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

/** A thin progress bar whose fill springs to its new value. */
export function ProgressFill({
  value,
  color,
  track,
  height = 10,
}: {
  value: number;
  color: string;
  track: string;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withSpring(Math.max(0, Math.min(1, value)), { damping: 20, stiffness: 140 });
  }, [fill, value]);
  const style = useAnimatedStyle(() => ({ width: Math.max(height, fill.value * width) }));
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ backgroundColor: track, borderRadius: 99, flex: 1, height, overflow: 'hidden' }}
    >
      <Animated.View style={[{ backgroundColor: color, borderRadius: 99, height }, style]} />
    </View>
  );
}
