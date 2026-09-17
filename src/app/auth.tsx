import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { isSupabaseConfigured, supabase } from '@/features/auth/supabase';

type AuthMode = 'forgot' | 'reset' | 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(params.mode === 'forgot' ? 'forgot' : 'sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
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

      if (accessToken && refreshToken) {
        const result = await authClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (result.error) {
          setMessage('That reset link is invalid or expired. Request a new one.');
          return;
        }
      } else if (code) {
        const result = await authClient.auth.exchangeCodeForSession(code);
        if (result.error) {
          setMessage('That reset link is invalid or expired. Request a new one.');
          return;
        }
      }
      if (recovery || accessToken || code) setMode('reset');
    };

    void Linking.getInitialURL().then(handleRecoveryUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => void handleRecoveryUrl(url));
    return () => subscription.remove();
  }, []);

  const submit = async () => {
    if (!supabase) {
      setMessage('Authentication will activate when the secure Supabase project is connected.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (mode === 'forgot') {
      if (!cleanEmail) {
        setMessage('Enter the email address used for your VOKA account.');
        return;
      }
      setLoading(true);
      setMessage('');
      const result = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: 'voka://auth?mode=reset',
      });
      setLoading(false);
      setMessage(
        result.error
          ? result.error.message
          : 'Check your email. Open the reset link on this phone to choose a new password.',
      );
      return;
    }

    if (mode === 'reset') {
      if (password.length < 8) {
        setMessage('Enter a new password with at least 8 characters.');
        return;
      }
      setLoading(true);
      setMessage('');
      const result = await supabase.auth.updateUser({ password });
      setLoading(false);
      if (result.error) {
        setMessage(result.error.message);
        return;
      }
      setMode('sign-in');
      setPassword('');
      setMessage('Password updated. You can now sign in.');
      return;
    }

    if (!cleanEmail || password.length < 8 || (mode === 'sign-up' && !name.trim())) {
      setMessage(
        mode === 'sign-up'
          ? 'Enter your name, email and a password with at least 8 characters.'
          : 'Enter an email and a password with at least 8 characters.',
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
      result = await supabase.auth.updateUser({
        email: cleanEmail,
        password,
        data: { display_name: name.trim() },
      });
    } else {
      result = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { display_name: name.trim() } },
      });
    }
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === 'sign-up') {
      const nextSession = await supabase.auth.getSession();
      if (!nextSession.data.session) {
        setMode('sign-in');
        setMessage('Account created. Check your email to confirm it, then sign in.');
        return;
      }
    }
    router.replace('/profile');
  };

  return (
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
              ? 'Use at least 8 characters. Your previous password will stop working.'
              : 'Sign in securely for live sessions. Lesson progress stays on this device during the pilot.'}
        </Text>

        <View style={styles.form}>
          {mode === 'sign-up' ? (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Palette.muted}
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
                onChangeText={setEmail}
                onSubmitEditing={mode === 'forgot' ? () => void submit() : undefined}
                placeholder="you@example.com"
                placeholderTextColor={Palette.muted}
                style={styles.input}
                value={email}
              />
            </>
          ) : null}
          {mode !== 'forgot' ? (
            <>
              <Text style={styles.label}>{mode === 'reset' ? 'New password' : 'Password'}</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                onChangeText={setPassword}
                onSubmitEditing={() => void submit()}
                placeholder="At least 8 characters"
                placeholderTextColor={Palette.muted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
              {mode === 'sign-in' ? (
                <Pressable onPress={() => setMode('forgot')} style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.message}>
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
        </View>

        {mode !== 'reset' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMessage('');
              setMode((value) => (value === 'sign-in' ? 'sign-up' : 'sign-in'));
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {mode === 'sign-in'
                ? 'New here? Create an account'
                : mode === 'sign-up'
                  ? 'Already registered? Sign in'
                  : 'Back to sign in'}
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
  );
}

const styles = StyleSheet.create({
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
  message: { color: '#A4391B', fontFamily: VokaFonts.bodyMedium, fontSize: 11, lineHeight: 17 },
  forgotButton: { alignSelf: 'flex-end', paddingBottom: 2, paddingTop: 2 },
  forgotText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 11 },
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
  switchButton: { alignItems: 'center', minHeight: 50, paddingTop: 18 },
  switchText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  availabilityNote: {
    color: Palette.muted,
    fontFamily: VokaFonts.mono,
    fontSize: 9,
    marginTop: 12,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
