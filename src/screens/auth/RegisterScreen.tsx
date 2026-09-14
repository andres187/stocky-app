import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const DEFAULT_REGION = '+57';

type Form = { nombre: string; apellido: string; email: string; telefono: string };

function validateForm(form: Form) {
  const next: Partial<Record<keyof Form, string>> = {};
  if (!form.nombre.trim()) next.nombre = 'Ingresa tu nombre.';
  if (!form.apellido.trim()) next.apellido = 'Ingresa tu apellido.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Ingresa un correo válido.';
  if (!/^\d{7,15}$/.test(form.telefono.replace(/\s/g, ''))) next.telefono = 'Ingresa un celular válido.';
  return next;
}

// Registro con celular Y correo (igual que etniapp-core): se piden los dos datos
// primero y luego se elige por cuál canal llega el código de verificación.
export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { requestCode } = useAuth();
  const [form, setForm] = useState<Form>({ nombre: '', apellido: '', email: '', telefono: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSendCode(channel: 'sms' | 'email') {
    const next = validateForm(form);
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    const email = form.email.trim().toLowerCase();
    const phone = form.telefono.replace(/\s/g, '');

    setSending(true);
    const result = await requestCode(
      channel === 'email'
        ? { channel, email }
        : { channel, regionCode: DEFAULT_REGION, phone },
      false
    );
    setSending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    navigation.navigate('VerifyCode', {
      mode: 'register',
      channel,
      email,
      regionCode: DEFAULT_REGION,
      phone,
      fullName: form.nombre.trim(),
      lastName: form.apellido.trim(),
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>Crear cuenta</Text>
      <Text style={styles.sub}>Necesitamos tu celular y tu correo para verificar tu identidad.</Text>

      <Field label="Nombre" value={form.nombre} onChangeText={(v) => update('nombre', v)} error={errors.nombre} />
      <Field label="Apellido" value={form.apellido} onChangeText={(v) => update('apellido', v)} error={errors.apellido} />
      <Field
        label="Correo electrónico"
        value={form.email}
        onChangeText={(v) => update('email', v)}
        error={errors.email}
        keyboardType="email-address"
      />
      <View style={styles.field}>
        <Text style={styles.label}>Celular</Text>
        <View style={styles.phoneRow}>
          <View style={styles.regionBox}>
            <Text style={styles.regionText}>{DEFAULT_REGION}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={form.telefono}
            onChangeText={(v) => update('telefono', v)}
            placeholder="300 123 4567"
            keyboardType="phone-pad"
          />
        </View>
        {errors.telefono && <Text style={styles.fieldError}>{errors.telefono}</Text>}
      </View>

      {formError && <Text style={styles.error}>{formError}</Text>}

      <Text style={styles.formH}>¿Por dónde te enviamos el código?</Text>
      <Pressable
        style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
        onPress={() => handleSendCode('sms')}
        disabled={sending}
      >
        <Text style={styles.submitBtnText}>{sending ? 'Enviando…' : 'Por celular'}</Text>
      </Pressable>
      <Pressable
        style={[styles.submitBtnSecondary, sending && styles.submitBtnDisabled]}
        onPress={() => handleSendCode('email')}
        disabled={sending}
      >
        <Text style={styles.submitBtnSecondaryText}>{sending ? 'Enviando…' : 'Por correo'}</Text>
      </Pressable>

      <Pressable style={styles.loginLink} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
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
  formH: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
  fieldError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
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
    marginBottom: spacing.sm,
  },
  submitBtnSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  submitBtnSecondaryText: {
    color: colors.navy,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: fontSizes.sm,
    color: colors.roseDeepHover,
    fontWeight: '600',
  },
});
