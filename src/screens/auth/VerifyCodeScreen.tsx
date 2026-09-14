import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const RESEND_SECONDS = 60;

// Último paso de login o registro: el usuario ingresa el código de 6 dígitos que
// le llegó por SMS (Twilio Verify) o correo (Resend).
export default function VerifyCodeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'VerifyCode'>>();
  const { mode, channel, email, regionCode, phone, fullName, lastName } = route.params;
  const { loginWithCode, register, requestCode } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const destination = channel === 'email' ? email : `${regionCode} ${phone}`;

  async function handleVerify() {
    if (!/^\d{6}$/.test(code)) {
      setError('El código tiene 6 dígitos.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const identifier = channel === 'email' ? { channel, email } : { channel, regionCode, phone };
    const result =
      mode === 'login'
        ? await loginWithCode(identifier, code)
        : await register(identifier, fullName ?? '', lastName ?? '', code);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'Home', params: { categoria: 'todo' } }] });
  }

  async function handleResend() {
    setError(null);
    const identifier = channel === 'email' ? { channel, email } : { channel, regionCode, phone };
    const result = await requestCode(identifier, mode === 'login');
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>Verifica tu código</Text>
      <Text style={styles.sub}>Te enviamos un código de 6 dígitos a {destination}.</Text>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        placeholder="000000"
        maxLength={6}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleVerify} disabled={submitting}>
        <Text style={styles.submitBtnText}>{submitting ? 'Verificando…' : 'Verificar'}</Text>
      </Pressable>

      <Pressable style={styles.resendLink} onPress={handleResend} disabled={secondsLeft > 0}>
        <Text style={[styles.resendLinkText, secondsLeft > 0 && styles.resendLinkTextDisabled]}>
          {secondsLeft > 0 ? `Reenviar código en ${secondsLeft}s` : 'Reenviar código'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  h2: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.ink,
  },
  sub: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  codeInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    fontSize: fontSizes.display,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  resendLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  resendLinkText: {
    fontSize: fontSizes.sm,
    color: colors.roseDeepHover,
    fontWeight: '600',
  },
  resendLinkTextDisabled: {
    color: colors.inkDim,
  },
});
