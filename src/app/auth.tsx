import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import {
  getPasswordChecks,
  isStrongPassword,
  PASSWORD_REQUIREMENTS,
} from '@/features/auth/password';
import { isSupabaseConfigured, supabase } from '@/features/auth/supabase';

type AuthMode = 'forgot' | 'reset' | 'sign-in' | 'sign-up';
type MessageTone = 'error' | 'success';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(
    params.mode === 'forgot' || params.mode === 'sign-up' ? params.mode : 'sign-in',
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<MessageTone>('error');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const authClient = supabase;

    const handleRecoveryUrl = async (url: string | null) => {
      if (!url) return;
      const parsed = new URL(url);
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      const code = parsed.searchParams.get('code');
      const recovery =
        hash.get('type') === 'recovery' ||
        parsed.searchParams.get('type') === 'recovery' ||
        parsed.searchParams.get('mode') === 'reset';
      const confirmation = parsed.searchParams.get('mode') === 'confirmed';

      if (accessToken && refreshToken) {
        const result = await authClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (result.error) {
          setMessageTone('error');
          setMessage('That reset link is invalid or expired. Request a new one.');
          return;
        }
      } else if (code) {
        const result = await authClient.auth.exchangeCodeForSession(code);
        if (result.error) {
          setMessageTone('error');
          setMessage('That reset link is invalid or expired. Request a new one.');
          return;
        }
      }
      if (recovery) {
        setMode('reset');
      } else if (confirmation) {
        setMessageTone('success');
        setMessage('Email confirmed. Your account is ready.');
        router.replace('/profile');
      }
    };

    void Linking.getInitialURL().then(handleRecoveryUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => void handleRecoveryUrl(url));
    return () => subscription.remove();
  }, [router]);

  const submit = async () => {
    if (!supabase) {
      setMessageTone('error');
      setMessage('Authentication will activate when the secure Supabase project is connected.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (mode === 'forgot') {
      if (!validEmail) {
        setMessageTone('error');
        setMessage('Enter a valid email address used for your VOKA account.');
        return;
      }
      setLoading(true);
      setMessage('');
      const result = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: 'voka://auth?mode=reset',
      });
      setLoading(false);
      setMessageTone(result.error ? 'error' : 'success');
      setMessage(
        result.error
          ? result.error.message
          : 'Check your email. Open the reset link on this phone to choose a new password.',
      );
      return;
    }

    if (mode === 'reset') {
      if (!isStrongPassword(password)) {
        setMessageTone('error');
        setMessage('Your new password must be at least 15 characters.');
        return;
      }
      setLoading(true);
      setMessage('');
      const result = await supabase.auth.updateUser({ password });
      setLoading(false);
      if (result.error) {
        setMessageTone('error');
        setMessage(result.error.message);
        return;
      }
      setMode('sign-in');
      setPassword('');
      setPasswordVisible(false);
      setMessageTone('success');
      setMessage('Password updated. You can now sign in.');
      return;
    }

    const hasFullName = cleanName.split(' ').filter(Boolean).length >= 2;
    const invalidSignUp = mode === 'sign-up' && (!hasFullName || !isStrongPassword(password));
    const invalidSignIn = mode === 'sign-in' && !password;
    if (!validEmail || invalidSignUp || invalidSignIn) {
      setMessageTone('error');
      setMessage(
        mode === 'sign-up'
          ? 'Enter your first and last name, a valid email, and a password with at least 15 characters.'
          : 'Enter a valid email address and your password.',
      );
      return;
    }

    setLoading(true);
    setMessage('');
    const current = await supabase.auth.getSession();
    let result;

    if (mode === 'sign-in') {
      result = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    } else if (current.data.session?.user.is_anonymous) {
      result = await supabase.auth.updateUser(
        {
          email: cleanEmail,
          password,
          data: { display_name: cleanName },
        },
        { emailRedirectTo: 'voka://auth?mode=confirmed' },
      );
    } else {
      result = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { display_name: cleanName },
          emailRedirectTo: 'voka://auth?mode=confirmed',
        },
      });
    }
    setLoading(false);

    if (result.error) {
      setMessageTone('error');
      setMessage(result.error.message);
      return;
    }

    if (mode === 'sign-up') {
      const nextSession = await supabase.auth.getSession();
      if (!nextSession.data.session) {
        setMode('sign-in');
        setMessageTone('success');
        setMessage('Account created. Check your email to confirm it, then sign in.');
        return;
      }
    }
    router.replace('/profile');
  };

  const passwordChecks = getPasswordChecks(password);
  const choosingPassword = mode === 'sign-up' || mode === 'reset';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoiding}
    >
      <AppScreen showNav={false}>
        <View style={styles.header}>
          <HeaderBack />
          <Text style={styles.logo}>VOKA</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.body}>
          <View style={styles.icon}>
            <MaterialCommunityIcons color={Palette.ink} name="account-voice" size={34} />
          </View>
          <Eyebrow color={Palette.orange}>Your VOKA account</Eyebrow>
          <Text style={styles.title}>
            {mode === 'sign-in'
              ? 'Welcome back'
              : mode === 'sign-up'
                ? 'Start speaking'
                : mode === 'forgot'
                  ? 'Reset your password'
                  : 'Choose a new password'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'forgot'
              ? 'We will email you a secure link that opens back in VOKA.'
              : mode === 'reset'
                ? 'Choose a strong password. Your previous password will stop working.'
                : 'Sign in securely to sync your learning progress across your devices.'}
          </Text>

          <View style={styles.form}>
            {mode === 'sign-up' ? (
              <>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  autoCapitalize="words"
                  autoComplete="name"
                  onChangeText={setName}
                  placeholder="First and last name"
                  placeholderTextColor={Palette.muted}
                  returnKeyType="next"
                  style={styles.input}
                  value={name}
                />
              </>
            ) : null}
            {mode !== 'reset' ? (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  autoCorrect={false}
                  onChangeText={setEmail}
                  onSubmitEditing={mode === 'forgot' ? () => void submit() : undefined}
                  placeholder="you@example.com"
                  placeholderTextColor={Palette.muted}
                  returnKeyType={mode === 'forgot' ? 'send' : 'next'}
                  style={styles.input}
                  value={email}
                />
              </>
            ) : null}
            {mode !== 'forgot' ? (
              <>
                <Text style={styles.label}>{mode === 'reset' ? 'New password' : 'Password'}</Text>
                <View style={styles.passwordField}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    autoCorrect={false}
                    onChangeText={setPassword}
                    onSubmitEditing={() => void submit()}
                    placeholder={choosingPassword ? 'Create a strong password' : 'Your password'}
                    placeholderTextColor={Palette.muted}
                    returnKeyType="done"
                    secureTextEntry={!passwordVisible}
                    style={styles.passwordInput}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    style={({ pressed }) => [styles.passwordToggle, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons
                      color={Palette.muted}
                      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                    />
                  </Pressable>
                </View>
                {choosingPassword ? (
                  <View accessibilityLabel="Password requirements" style={styles.requirements}>
                    {PASSWORD_REQUIREMENTS.map((requirement) => {
                      const met = passwordChecks[requirement.key];
                      return (
                        <View key={requirement.key} style={styles.requirementRow}>
                          <MaterialCommunityIcons
                            color={met ? '#237A45' : Palette.muted}
                            name={met ? 'check-circle' : 'circle-outline'}
                            size={15}
                          />
                          <Text style={[styles.requirementText, met && styles.requirementMet]}>
                            {requirement.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
                {mode === 'sign-in' ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setMode('forgot')}
                    style={({ pressed }) => [styles.forgotButton, pressed && styles.linkPressed]}
                  >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
            {message ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[
                  styles.message,
                  messageTone === 'success' ? styles.messageSuccess : styles.messageError,
                ]}
              >
                {message}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={loading || !isSupabaseConfigured}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.primary,
                (loading || !isSupabaseConfigured) && styles.primaryDisabled,
                pressed && styles.pressed,
              ]}
            >
              {loading ? <ActivityIndicator color={Palette.ink} /> : null}
              <Text style={styles.primaryText}>
                {mode === 'sign-in'
                  ? 'Sign in'
                  : mode === 'sign-up'
                    ? 'Create account'
                    : mode === 'forgot'
                      ? 'Send reset link'
                      : 'Save new password'}
              </Text>
            </Pressable>
            {mode === 'sign-up' ? (
              <Text style={styles.consentText}>
                By creating an account, you agree to the{' '}
                <Text
                  accessibilityRole="link"
                  onPress={() => router.push('/legal/terms' as Href)}
                  style={styles.inlineLink}
                >
                  Terms of use
                </Text>{' '}
                and acknowledge the{' '}
                <Text
                  accessibilityRole="link"
                  onPress={() => router.push('/legal/privacy' as Href)}
                  style={styles.inlineLink}
                >
                  Privacy policy
                </Text>
                .
              </Text>
            ) : null}
          </View>

          {mode !== 'reset' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMessage('');
                setPassword('');
                setPasswordVisible(false);
                setMode((value) => (value === 'sign-in' ? 'sign-up' : 'sign-in'));
              }}
              style={({ pressed }) => [styles.switchButton, pressed && styles.linkPressed]}
            >
              <Text style={styles.switchText}>
                {mode === 'sign-in' ? (
                  <>
                    New here? <Text style={styles.switchAction}>Create an account</Text>
                  </>
                ) : mode === 'sign-up' ? (
                  <>
                    Already registered? <Text style={styles.switchAction}>Sign in</Text>
                  </>
                ) : (
                  <Text style={styles.switchAction}>Back to sign in</Text>
                )}
              </Text>
            </Pressable>
          ) : null}
          {!isSupabaseConfigured ? (
            <Text style={styles.availabilityNote}>
              Sign-in is temporarily unavailable. You can continue without an account.
            </Text>
          ) : null}
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  spacer: { width: 40 },
  logo: { color: Palette.ink, fontFamily: VokaFonts.displayExtraBold, fontSize: 20 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 18 },
  icon: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 20,
    height: 60,
    justifyContent: 'center',
    marginBottom: 18,
    width: 60,
  },
  title: {
    color: Palette.ink,
    fontFamily: VokaFonts.displayExtraBold,
    fontSize: 37,
    letterSpacing: -1.2,
    marginTop: 8,
  },
  subtitle: {
    color: Palette.secondary,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  form: { gap: 7, marginTop: 20 },
  label: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 12, marginTop: 4 },
  input: {
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 16,
    borderWidth: 1,
    color: Palette.ink,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  passwordField: {
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderColor: Palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
  },
  passwordInput: {
    color: Palette.ink,
    flex: 1,
    fontFamily: VokaFonts.bodyMedium,
    fontSize: 14,
    minHeight: 52,
    paddingLeft: 16,
    paddingRight: 8,
  },
  passwordToggle: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 52,
  },
  requirements: { gap: 5, marginBottom: 3, marginTop: 3 },
  requirementRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  requirementText: { color: Palette.muted, fontFamily: VokaFonts.body, fontSize: 10 },
  requirementMet: { color: '#237A45' },
  message: { fontFamily: VokaFonts.bodyMedium, fontSize: 11, lineHeight: 17 },
  messageError: { color: '#A4391B' },
  messageSuccess: { color: '#237A45' },
  forgotButton: { alignSelf: 'flex-end', paddingBottom: 2, paddingTop: 2 },
  forgotText: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  primary: {
    alignItems: 'center',
    backgroundColor: Palette.orange,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 58,
  },
  primaryDisabled: { opacity: 0.55 },
  primaryText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 18 },
  consentText: {
    color: Palette.muted,
    fontFamily: VokaFonts.body,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
    textAlign: 'center',
  },
  inlineLink: {
    color: Palette.ink,
    fontFamily: VokaFonts.bodySemiBold,
    textDecorationLine: 'underline',
  },
  switchButton: { alignItems: 'center', minHeight: 50, paddingTop: 18 },
  switchText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  switchAction: { textDecorationLine: 'underline' },
  linkPressed: { opacity: 0.55 },
  availabilityNote: {
    color: Palette.muted,
    fontFamily: VokaFonts.mono,
    fontSize: 9,
    marginTop: 12,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
