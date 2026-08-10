import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, useWindowDimensions,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';

// ─── Brand Panel (left side on desktop / top on mobile) ─────────────────────

function BrandPanel({ isDesktop }: { isDesktop: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const features = [
    { icon: 'package' as const,   label: 'Track your orders in real time' },
    { icon: 'file-text' as const, label: 'View quotes & production updates' },
    { icon: 'shield' as const,    label: 'Secure access to your account' },
  ];

  return (
    <View style={[
      bp.panel,
      { backgroundColor: colors.primary },
      isDesktop
        ? bp.panelDesktop
        : [bp.panelMobile, { paddingTop: (Platform.OS === 'web' ? 60 : insets.top) + 28 }],
    ]}>
      {/* Decorative circles */}
      <View style={[bp.circle, bp.circleLg, { borderColor: 'rgba(255,184,0,0.12)' }]} />
      <View style={[bp.circle, bp.circleMd, { borderColor: 'rgba(255,184,0,0.08)' }]} />

      <View style={[bp.content, isDesktop && bp.contentDesktop]}>
        {/* Logo */}
        <View style={[bp.logoBox, { backgroundColor: colors.accent }]}>
          <Text style={[bp.logoLetter, { color: colors.primary }]}>P</Text>
        </View>

        <Text style={bp.brand}>PRIME PACKAGING</Text>
        <Text style={bp.tagline}>Customer Portal</Text>

        {isDesktop && (
          <>
            <View style={bp.divider} />
            <Text style={bp.headline}>Your orders,{'\n'}at your fingertips.</Text>
            <View style={bp.featureList}>
              {features.map(f => (
                <View key={f.icon} style={bp.featureRow}>
                  <View style={bp.featureIcon}>
                    <Feather name={f.icon} size={14} color={colors.accent} />
                  </View>
                  <Text style={bp.featureText}>{f.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const bp = StyleSheet.create({
  panel: { overflow: 'hidden' },
  panelDesktop: { flex: 1, justifyContent: 'center', paddingHorizontal: 48 },
  panelMobile: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 36 },
  circle: {
    position: 'absolute', borderWidth: 1, borderRadius: 9999,
  },
  circleLg: { width: 500, height: 500, top: -120, right: -180 },
  circleMd: { width: 300, height: 300, bottom: -80, left: -100 },
  content: { alignItems: 'center', zIndex: 1 },
  contentDesktop: { alignItems: 'flex-start' },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  logoLetter: { fontSize: 36, fontWeight: '900', fontFamily: 'Inter_700Bold' },
  brand: {
    fontSize: 18, fontWeight: '800', color: '#ffffff',
    letterSpacing: 2, fontFamily: 'Inter_700Bold',
  },
  tagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4,
    letterSpacing: 1, fontFamily: 'Inter_400Regular',
  },
  divider: {
    width: 40, height: 2, backgroundColor: 'rgba(255,184,0,0.5)',
    marginVertical: 28, borderRadius: 2,
  },
  headline: {
    fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff',
    lineHeight: 40, marginBottom: 28,
  },
  featureList: { gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,184,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular' },
});

// ─── Sign In Form ─────────────────────────────────────────────────────────────

function SignInForm({ isDesktop }: { isDesktop: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await login(username.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? 'Login failed. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const wrapStyle = isDesktop
    ? [sf.wrapDesktop, { backgroundColor: colors.background }]
    : [sf.wrapMobile, { backgroundColor: colors.background }];

  // On web, wrap in a <form> so browsers recognise the password field
  const WebForm = Platform.OS === 'web'
    ? ({ children }: { children: React.ReactNode }) => (
        // @ts-ignore — form is valid HTML on web
        <form onSubmit={(e: any) => { e.preventDefault(); handleLogin(); }} style={{ display: 'contents' }}>
          {children}
        </form>
      )
    : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  const formContent = (
    <WebForm>
    <ScrollView
      contentContainerStyle={[
        sf.scroll,
        isDesktop ? sf.scrollDesktop : { paddingBottom: bottomPad + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={isDesktop ? sf.formCard : undefined}>
        <Text style={[sf.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[sf.sub, { color: colors.mutedForeground }]}>
          Sign in to your account to continue
        </Text>

        {!!error && (
          <View style={[sf.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[sf.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <Text style={[sf.label, { color: colors.foreground }]}>Username</Text>
        <View style={[sf.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="user" size={16} color={colors.mutedForeground} style={sf.inputIcon} />
          <TextInput
            style={[sf.input, { color: colors.foreground }]}
            placeholder="your-username"
            placeholderTextColor={colors.mutedForeground}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <Text style={[sf.label, sf.labelSpacing, { color: colors.foreground }]}>Password</Text>
        <View style={[sf.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="lock" size={16} color={colors.mutedForeground} style={sf.inputIcon} />
          <TextInput
            style={[sf.input, sf.inputFlex, { color: colors.foreground }]}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={sf.eyeBtn}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[sf.btn, { backgroundColor: colors.primary, shadowColor: colors.primary }, submitting && sf.btnDisabled]}
          onPress={handleLogin}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={sf.btnText}>Sign In</Text>
          }
        </TouchableOpacity>

        <Text style={[sf.help, { color: colors.mutedForeground }]}>
          Need access?{' '}
          <Text style={[sf.helpLink, { color: colors.primary }]}>
            Contact us at help@primepackagingboxes.com
          </Text>
        </Text>
      </View>
    </ScrollView>
    </WebForm>
  );

  if (isDesktop) {
    return <View style={wrapStyle}>{formContent}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={wrapStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {formContent}
    </KeyboardAvoidingView>
  );
}

const sf = StyleSheet.create({
  wrapDesktop: { flex: 1 },
  wrapMobile: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  scroll: { flexGrow: 1 },
  scrollDesktop: { flex: 1, justifyContent: 'center', paddingHorizontal: 40 },
  formCard: { maxWidth: 420, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800', fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 28 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, fontFamily: 'Inter_600SemiBold' },
  labelSpacing: { marginTop: 16 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: 4 },
  btn: {
    borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center',
    marginTop: 28,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  help: { fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  helpLink: { fontFamily: 'Inter_600SemiBold' },
});

// ─── Root ────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const colors = useColors();
  const { customer, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (isLoading) {
    return (
      <View style={[root.splash, { backgroundColor: colors.primary }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (customer) return <Redirect href="/(tabs)" />;

  if (isDesktop) {
    return (
      <View style={[root.row, { backgroundColor: colors.primary }]}>
        <BrandPanel isDesktop />
        <SignInForm isDesktop />
      </View>
    );
  }

  return (
    <View style={[root.col, { backgroundColor: colors.primary }]}>
      <BrandPanel isDesktop={false} />
      <SignInForm isDesktop={false} />
    </View>
  );
}

const root = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flex: 1, flexDirection: 'row' },
  col: { flex: 1 },
});
