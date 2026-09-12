import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { AuthChannel } from '../../lib/types';
import type { RootStackParamList } from '../../navigation/types';

const DEFAULT_REGION = '+57';

// Entrar con celular o correo, sin contraseña: se pide un código de un solo uso
// y se verifica en VerifyCodeScreen — mismo patrón que etniapp-core.
export default function SignInScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { requestCode } = useAuth();
  const [channel, setChannel] = useState<AuthChannel>('sms');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSendCode() {
    setError(null);

    if (channel === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Ingresa un correo válido.');
        return;
      }
    } else if (!/^\d{7,15}$/.test(phone.replace(/\s/g, ''))) {
      setError('Ingresa un número de celular válido.');
      return;
    }

    setSending(true);
    const result = await requestCode(
      channel === 'email'
        ? { channel, email: email.trim().toLowerCase() }
        : { channel, regionCode: DEFAULT_REGION, phone: phone.replace(/\s/g, '') },
      true
    );
    setSending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigation.navigate('VerifyCode', {
      mode: 'login',
      channel,
      email: channel === 'email' ? email.trim().toLowerCase() : undefined,
      regionCode: channel === 'sms' ? DEFAULT_REGION : undefined,
      phone: channel === 'sms' ? phone.replace(/\s/g, '') : undefined,
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>Iniciar sesión</Text>
      <Text style={styles.sub}>Te enviamos un código de acceso, sin contraseña.</Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, channel === 'sms' && styles.tabActive]}
          onPress={() => setChannel('sms')}
        >
          <Text style={[styles.tabText, channel === 'sms' && styles.tabTextActive]}>Celular</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, channel === 'email' && styles.tabActive]}
          onPress={() => setChannel('email')}
        >
          <Text style={[styles.tabText, channel === 'email' && styles.tabTextActive]}>Correo</Text>
        </Pressable>
      </View>

      {channel === 'sms' ? (
        <View style={styles.field}>
          <Text style={styles.label}>Celular</Text>
          <View style={styles.phoneRow}>
            <View style={styles.regionBox}>
              <Text style={styles.regionText}>{DEFAULT_REGION}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="300 123 4567"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submitBtn, sending && styles.submitBtnDisabled]} onPress={handleSendCode} disabled={sending}>
        <Text style={styles.submitBtnText}>{sending ? 'Enviando…' : 'Enviar código'}</Text>
      </Pressable>

      <Pressable style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLinkText}>¿No tienes cuenta? Regístrate</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
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
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: colors.navy,
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.white,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  regionBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  regionText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: fontSizes.sm,
    color: colors.roseDeepHover,
    fontWeight: '600',
  },
});
