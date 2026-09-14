import '@/global.css';

export const Palette = {
  cream: '#F1EDE3',
  canvas: '#E6E1D6',
  ink: '#131211',
  orange: '#FF4A17',
  yellow: '#F2B705',
  white: '#FFFFFF',
  muted: '#6A6663',
  secondary: '#5F5B58',
  line: 'rgba(19, 18, 17, 0.09)',
  soft: 'rgba(19, 18, 17, 0.08)',
} as const;

export const VokaFonts = {
  displayMedium: 'BricolageGrotesque_500Medium',
  displayBold: 'BricolageGrotesque_700Bold',
  displayExtraBold: 'BricolageGrotesque_800ExtraBold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;

// Compatibility tokens for the small reusable starter utilities.
export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.cream,
    backgroundElement: Palette.white,
    backgroundSelected: Palette.soft,
    textSecondary: Palette.secondary,
  },
  dark: {
    text: Palette.cream,
    background: Palette.ink,
    backgroundElement: '#242321',
    backgroundSelected: '#343230',
    textSecondary: '#B8B3AA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: VokaFonts.body,
  serif: VokaFonts.body,
  rounded: VokaFonts.displayBold,
  mono: VokaFonts.mono,
};

export const BottomTabInset = 76;
export const MaxContentWidth = 800;
