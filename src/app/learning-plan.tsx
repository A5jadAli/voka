import { type Href, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { useSelectedLanguage } from '@/features/language/selection';
import { useCoachingStore, type StartingAbility, type StudyGoal } from '@/features/coaching/store';
import { learningRecommendation } from '@/features/coaching/recommendation';

export default function LearningPlanScreen() {
  const router = useRouter();
  const [track, setTrack] = useSelectedLanguage();
  const preferences = useCoachingStore((state) => state.preferences[track]);
  const setChoices = useCoachingStore((state) => state.setLearningChoices);
  const ability = preferences.ability ?? 'new';
  const goal = preferences.studyGoal ?? 'everyday';
  const next = learningRecommendation(track, ability, goal);
  const chooseAbility = (value: StartingAbility) => setChoices(track, value, goal);
  const chooseGoal = (value: StudyGoal) => setChoices(track, ability, value);
  return (
    <AppScreen showNav={false}>
      <View style={{ padding: 20, gap: 18 }}>
        <HeaderBack />
        <Eyebrow>Your learning plan</Eyebrow>
        <Text style={{ fontFamily: VokaFonts.displayBold, fontSize: 30, color: Palette.ink }}>
          A useful place to start
        </Text>
        <Text>
          Choose what fits today. This is not a placement test, and you can change it any time from
          Home.
        </Text>
        <View style={{ gap: 8 }}>
          {(['DE', 'EN'] as const).map((value) => (
            <Choice
              key={value}
              label={value === 'DE' ? 'German' : 'English'}
              selected={track === value}
              onPress={() => setTrack(value)}
            />
          ))}
        </View>
        <Eyebrow>How much do you know?</Eyebrow>
        <View style={{ gap: 8 }}>
          {(
            [
              ['new', 'I am starting from zero'],
              ['basics', 'I know some words and short phrases'],
              ['conversational', 'I can already have a simple conversation'],
            ] as const
          ).map(([value, label]) => (
            <Choice
              key={value}
              label={label}
              selected={ability === value}
              onPress={() => chooseAbility(value)}
            />
          ))}
        </View>
        <Eyebrow>What would you like to use it for?</Eyebrow>
        <View style={{ gap: 8 }}>
          {(
            [
              ['everyday', 'Everyday life'],
              ['work-study', 'Work and study'],
              ...(track === 'EN'
                ? [
                    ['ielts-academic', 'IELTS Academic'],
                    ['ielts-general', 'IELTS General Training'],
                  ]
                : []),
            ] as [StudyGoal, string][]
          ).map(([value, label]) => (
            <Choice
              key={value}
              label={label}
              selected={goal === value}
              onPress={() => chooseGoal(value)}
            />
          ))}
        </View>
        <Text style={{ fontFamily: VokaFonts.bodyBold }}>{next.title}</Text>
        <Text>{next.why}</Text>
        <Choice
          label="Start recommended practice"
          selected
          onPress={() => router.replace(next.href as Href)}
        />
        <Text style={{ color: Palette.secondary }}>
          Practice supports learning, not a certified CEFR level or IELTS result. IELTS goals
          include a four-skill practice guide in Learn.
        </Text>
      </View>
    </AppScreen>
  );
}
function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 16,
        minHeight: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Palette.line,
        backgroundColor: selected ? Palette.yellow : Palette.white,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontFamily: VokaFonts.bodySemiBold, color: Palette.ink }}>{label}</Text>
    </Pressable>
  );
}
