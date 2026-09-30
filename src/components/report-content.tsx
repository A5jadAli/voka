import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionRow, lessonText, PrimaryButton } from '@/components/lesson-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import {
  REPORT_REASONS,
  reportAiContent,
  type ReportReason,
  type ReportSurface,
} from '@/features/safety/report';

/** "Report" control for AI-generated content, opening a bottom sheet. */
export function ReportContent({
  surface,
  excerpt,
  track,
  dark = false,
}: {
  surface: ReportSurface;
  excerpt?: string;
  track?: 'EN' | 'DE';
  dark?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const close = () => {
    setOpen(false);
    setReason(null);
    setDetails('');
    setState('idle');
    setError('');
  };
  const send = async () => {
    if (!reason) return;
    setState('sending');
    setError('');
    try {
      await reportAiContent({ surface, reason, details, excerpt, track });
      setState('sent');
    } catch (reportError) {
      setState('idle');
      setError(
        reportError instanceof Error ? reportError.message : 'The report could not be sent.',
      );
    }
  };
  const ink = dark ? Palette.cream : Palette.secondary;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Report AI response"
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.6 }]}
      >
        <MaterialCommunityIcons name="flag-outline" size={16} color={ink} />
        <Text style={[styles.triggerText, { color: ink }]}>Report</Text>
      </Pressable>
      <Modal
        animationType="slide"
        transparent
        visible={open}
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable accessibilityLabel="Close report" style={styles.scrim} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.grabber} />
            {state === 'sent' ? (
              <View style={styles.sent}>
                <View style={styles.sentIcon}>
                  <MaterialCommunityIcons name="check-bold" size={32} color={Palette.ink} />
                </View>
                <Text style={lessonText.prompt}>Thanks for reporting</Text>
                <Text style={[lessonText.lead, { textAlign: 'center' }]}>
                  We review every report and use it to improve Vokeno’s AI coach.
                </Text>
                <View style={{ alignSelf: 'stretch' }}>
                  <PrimaryButton title="Done" onPress={close} />
                </View>
              </View>
            ) : (
              <>
                <Text accessibilityRole="header" style={lessonText.prompt}>
                  Report this AI response
                </Text>
                <Text style={lessonText.small}>
                  Tell us what went wrong. Your report goes to the Vokeno team.
                </Text>
                <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                  {REPORT_REASONS.map((item) => (
                    <ActionRow
                      key={item.key}
                      title={item.label}
                      selected={reason === item.key}
                      choice
                      onPress={() => setReason(item.key)}
                    />
                  ))}
                </View>
                <TextInput
                  accessibilityLabel="Report details"
                  multiline
                  maxLength={500}
                  placeholder="Add details (optional)"
                  placeholderTextColor={Palette.muted}
                  value={details}
                  onChangeText={setDetails}
                  style={styles.input}
                  textAlignVertical="top"
                />
                {error ? (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                ) : null}
                {state === 'sending' ? (
                  <ActivityIndicator color={Palette.ink} />
                ) : (
                  <PrimaryButton
                    title="Send report"
                    disabled={!reason}
                    onPress={() => void send()}
                  />
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { alignItems: 'center', flexDirection: 'row', gap: 4, minHeight: 32 },
  triggerText: { fontFamily: VokaFonts.bodySemiBold, fontSize: 13 },
  scrim: { backgroundColor: 'rgba(0,0,0,0.45)', flex: 1 },
  sheet: {
    backgroundColor: Palette.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 14,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: 'rgba(19,18,17,0.2)',
    borderRadius: 99,
    height: 5,
    marginBottom: 6,
    width: 40,
  },
  input: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 16,
    borderWidth: 2,
    color: Palette.ink,
    fontFamily: VokaFonts.body,
    fontSize: 15,
    minHeight: 80,
    padding: 12,
  },
  error: { color: '#8E2D1B', fontFamily: VokaFonts.bodyMedium, fontSize: 14 },
  sent: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  sentIcon: {
    alignItems: 'center',
    backgroundColor: '#BFE5C8',
    borderRadius: 99,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
});
