import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, VokaFonts } from '@/constants/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const navItems: { href: Href; icon: IconName; label: string; key: string }[] = [
  { key: 'home', href: '/', icon: 'home-variant', label: 'Home' },
  { key: 'plan', href: '/sprint', icon: 'calendar-blank-outline', label: 'Learning path' },
  {
    key: 'speak',
    href: '/conversation?track=EN',
    icon: 'microphone-outline',
    label: 'Live speaking coach',
  },
  { key: 'progress', href: '/progress', icon: 'cards-outline', label: 'Progress' },
  { key: 'profile', href: '/profile', icon: 'account-outline', label: 'Profile' },
];

type AppScreenProps = PropsWithChildren<{
  activeNav?: string;
  backgroundColor?: string;
  dark?: boolean;
  footer?: ReactNode;
  scroll?: boolean;
  showNav?: boolean;
}>;

export function AppScreen({
  activeNav,
  backgroundColor = Palette.cream,
  children,
  dark = false,
  footer,
  scroll = true,
  showNav = true,
}: AppScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.fixedContent}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={showNav ? ['top', 'left', 'right'] : ['top', 'right', 'bottom', 'left']}
      style={[styles.screen, { backgroundColor }]}
    >
      {content}
      {footer}
      {showNav ? <BottomNav active={activeNav} dark={dark} /> : null}
    </SafeAreaView>
  );
}

export function BottomNav({ active, dark = false }: { active?: string; dark?: boolean }) {
  const router = useRouter();
  const foreground = dark ? Palette.cream : Palette.ink;
  const muted = dark ? 'rgba(241, 237, 227, 0.42)' : 'rgba(19, 18, 17, 0.35)';

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.navSafeArea,
        {
          backgroundColor: dark ? Palette.ink : Palette.cream,
          borderTopColor: dark ? '#302E2B' : Palette.line,
        },
      ]}
    >
      <View style={styles.navRow}>
        {navItems.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              key={item.key}
              onPress={() => router.navigate(item.href)}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <View style={[styles.navIconWrap, selected && { backgroundColor: foreground }]}>
                <MaterialCommunityIcons
                  color={selected ? (dark ? Palette.ink : Palette.cream) : muted}
                  name={item.icon}
                  size={21}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function Eyebrow({
  children,
  color = Palette.muted,
}: PropsWithChildren<{ color?: string }>) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function RoundIcon({
  backgroundColor,
  color,
  name,
  size = 52,
}: {
  backgroundColor: string;
  color: string;
  name: IconName;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.roundIcon,
        { backgroundColor, borderRadius: size / 3.25, height: size, width: size },
      ]}
    >
      <MaterialCommunityIcons color={color} name={name} size={size * 0.46} />
    </View>
  );
}

export function HeaderBack({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.navigate('/');
      }}
      style={({ pressed }) => [
        styles.back,
        { backgroundColor: dark ? 'rgba(241, 237, 227, 0.1)' : Palette.soft },
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons
        color={dark ? Palette.cream : Palette.ink}
        name="chevron-left"
        size={25}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  fixedContent: { flex: 1 },
  navSafeArea: { borderTopWidth: StyleSheet.hairlineWidth },
  navRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 66,
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
  navButton: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 48 },
  navIconWrap: {
    alignItems: 'center',
    borderRadius: 99,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  roundIcon: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.66, transform: [{ scale: 0.97 }] },
  eyebrow: {
    fontFamily: VokaFonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  back: {
    alignItems: 'center',
    borderRadius: 99,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
