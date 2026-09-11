import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

type Form = { nombre: string; email: string; mensaje: string };

export default function ContactScreen() {
  const [form, setForm] = useState<Form>({ nombre: '', email: '', mensaje: '' });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next: Partial<Record<keyof Form, string>> = {};
    if (!form.nombre.trim()) next.nombre = 'Ingresa tu nombre.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Ingresa un correo válido.';
    if (!form.mensaje.trim()) next.mensaje = 'Escribe tu mensaje.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSent(true);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>Contacto</Text>
      <Text style={styles.sub}>¿Dudas sobre tu pedido, tallas o un cambio? Escríbenos.</Text>

      <Text style={styles.formH}>Otras formas de escribirnos</Text>
      <Text style={styles.li} onPress={() => Linking.openURL('mailto:info@stockycol.store')}>
        Correo: <Text style={styles.link}>info@stockycol.store</Text>
      </Text>
      <Text style={styles.li} onPress={() => Linking.openURL('https://wa.me/573024674693')}>
        WhatsApp: <Text style={styles.link}>+57 302 467 4693</Text>
      </Text>
      <Text style={styles.li}>Dirección: Carrera 46 #85-185, Local 12, Plaza 87, Barranquilla, Colombia</Text>
      <Text style={styles.li}>Horario de atención: lunes a viernes, 8:00am – 6:00pm</Text>

      {sent ? (
        <Text style={styles.sentText}>
          Gracias, {form.nombre.split(' ')[0]}. Recibimos tu mensaje y te responderemos a {form.email} en menos de 24
          horas.
        </Text>
      ) : (
        <View>
          <Text style={styles.formH}>Envíanos un mensaje</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={form.nombre} onChangeText={(v) => update('nombre', v)} />
            {errors.nombre && <Text style={styles.fieldError}>{errors.nombre}</Text>}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Mensaje</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.mensaje}
              onChangeText={(v) => update('mensaje', v)}
              multiline
              numberOfLines={4}
            />
            {errors.mensaje && <Text style={styles.fieldError}>{errors.mensaje}</Text>}
          </View>
          <Pressable style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Enviar mensaje</Text>
          </Pressable>
        </View>
      )}
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
  formH: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  li: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  link: {
    color: colors.roseDeepHover,
    textDecorationLine: 'underline',
  },
  sentText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginTop: spacing.md,
    lineHeight: 20,
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
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
