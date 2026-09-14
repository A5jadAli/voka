import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Eyebrow, HeaderBack } from '@/components/voka-ui';
import { Palette, VokaFonts } from '@/constants/theme';
import { isSupabaseConfigured, supabase } from '@/features/auth/supabase';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!supabase) {
      setMessage('Authentication will activate when the secure Supabase project is connected.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
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
      setMessage(
        'Account created. If confirmation is enabled, check your email before signing in.',
      );
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
        <Eyebrow color={Palette.orange}>Your learning memory</Eyebrow>
        <Text style={styles.title}>{mode === 'sign-in' ? 'Welcome back' : 'Start speaking'}</Text>
        <Text style={styles.subtitle}>
          Save difficult phrases, conversation feedback and progress across devices.
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
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Palette.muted}
            style={styles.input}
            value={email}
          />
          <Text style={styles.label}>Password</Text>
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
          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.message}>
              {message}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => void submit()}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            {loading ? <ActivityIndicator color={Palette.ink} /> : null}
            <Text style={styles.primaryText}>
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMessage('');
            setMode((value) => (value === 'sign-in' ? 'sign-up' : 'sign-in'));
          }}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {mode === 'sign-in' ? 'New here? Create an account' : 'Already registered? Sign in'}
          </Text>
        </Pressable>
        {!isSupabaseConfigured ? (
          <Text style={styles.demoNote}>Demo mode · account data stays on this device for now</Text>
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
  primaryText: { color: Palette.ink, fontFamily: VokaFonts.displayBold, fontSize: 18 },
  switchButton: { alignItems: 'center', minHeight: 50, paddingTop: 18 },
  switchText: { color: Palette.ink, fontFamily: VokaFonts.bodySemiBold, fontSize: 12 },
  demoNote: {
    color: Palette.muted,
    fontFamily: VokaFonts.mono,
    fontSize: 9,
    marginTop: 12,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
