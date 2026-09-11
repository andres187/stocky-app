import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { fmt } from '../lib/format';
import { shippingFor } from '../lib/shipping';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

const PAYMENT_METHODS = [
  { key: 'tarjeta', label: 'Tarjeta de crédito o débito' },
  { key: 'pse', label: 'PSE / Transferencia' },
  { key: 'contraentrega', label: 'Pago contraentrega' },
];

type Form = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  notas: string;
  pago: string;
};

function validateForm(form: Form) {
  const next: Partial<Record<keyof Form, string>> = {};
  if (!form.nombre.trim()) next.nombre = 'Ingresa tu nombre completo.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Ingresa un correo válido.';
  if (!/^\d{7,}$/.test(form.telefono.replace(/\s/g, ''))) next.telefono = 'Ingresa un teléfono válido.';
  if (!form.direccion.trim()) next.direccion = 'Ingresa tu dirección de envío.';
  if (!form.ciudad.trim()) next.ciudad = 'Ingresa tu ciudad.';
  return next;
}

function genOrderNumber() {
  return 'LV-' + Math.floor(100000 + Math.random() * 900000);
}

export default function CheckoutScreen() {
  const { items, subtotal, clearCart } = useCart();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [form, setForm] = useState<Form>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    notas: '',
    pago: 'tarjeta',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [order, setOrder] = useState<{ number: string; total: number; email: string } | null>(null);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  useEffect(() => {
    if (!order && items.length === 0) {
      navigation.replace('Home', { categoria: 'todo' });
    }
  }, [order, items.length, navigation]);

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    const next = validateForm(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setOrder({ number: genOrderNumber(), total, email: form.email });
    clearCart();
  }

  if (order) {
    return (
      <View style={styles.confirmation}>
        <Text style={styles.eyebrow}>Pedido recibido</Text>
        <Text style={styles.confirmTitle}>Gracias por tu compra</Text>
        <Text style={styles.confirmText}>
          Tu pedido <Text style={styles.mono}>{order.number}</Text> fue confirmado por{' '}
          <Text style={styles.bold}>{fmt.format(order.total)}</Text>. Te enviamos los detalles a{' '}
          <Text style={styles.bold}>{order.email}</Text>.
        </Text>
        <Pressable style={styles.ctaBtn} onPress={() => navigation.navigate('Home', { categoria: 'todo' })}>
          <Text style={styles.ctaBtnText}>Volver a la tienda →</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>Finalizar compra</Text>
      <Text style={styles.sub}>Revisa tu pedido y completa tus datos de envío.</Text>

      <Text style={styles.formH}>Tu pedido</Text>
      {items.map((line) => (
        <View style={styles.summaryItem} key={line.key}>
          <Text style={styles.summaryName}>{line.product.name}</Text>
          <Text style={styles.summaryVariant}>
            {line.color} · Talla {line.size} · x{line.qty}
          </Text>
          <Text style={styles.summaryPrice}>{fmt.format(line.product.price * line.qty)}</Text>
        </View>
      ))}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{fmt.format(subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Envío</Text>
          <Text style={styles.totalValue}>{shipping === 0 ? 'Gratis' : fmt.format(shipping)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabelBold}>Total</Text>
          <Text style={styles.totalValueBold}>{fmt.format(total)}</Text>
        </View>
      </View>

      <Text style={styles.formH}>Datos de envío</Text>
      <Field label="Nombre completo" value={form.nombre} onChangeText={(v) => update('nombre', v)} error={errors.nombre} />
      <Field
        label="Correo electrónico"
        value={form.email}
        onChangeText={(v) => update('email', v)}
        error={errors.email}
        keyboardType="email-address"
      />
      <Field
        label="Teléfono"
        value={form.telefono}
        onChangeText={(v) => update('telefono', v)}
        error={errors.telefono}
        placeholder="300 123 4567"
        keyboardType="phone-pad"
      />
      <Field label="Dirección" value={form.direccion} onChangeText={(v) => update('direccion', v)} error={errors.direccion} />
      <Field label="Ciudad" value={form.ciudad} onChangeText={(v) => update('ciudad', v)} error={errors.ciudad} />
      <View style={styles.field}>
        <Text style={styles.label}>Notas de entrega (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={form.notas}
          onChangeText={(v) => update('notas', v)}
          multiline
          numberOfLines={2}
        />
      </View>

      <Text style={styles.formH}>Método de pago</Text>
      {PAYMENT_METHODS.map((m) => (
        <Pressable key={m.key} style={styles.paymentOption} onPress={() => update('pago', m.key)}>
          <View style={[styles.radio, form.pago === m.key && styles.radioSelected]} />
          <Text style={styles.paymentLabel}>{m.label}</Text>
        </Pressable>
      ))}

      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Confirmar pedido — {fmt.format(total)}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize="none"
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  summaryItem: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  summaryName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  summaryVariant: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
  },
  summaryPrice: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginTop: 2,
  },
  totals: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
  },
  totalValue: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  totalLabelBold: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
  totalValueBold: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: spacing.sm,
  },
  radioSelected: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  paymentLabel: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  confirmation: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confirmTitle: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    color: colors.ink,
    marginVertical: spacing.md,
  },
  confirmText: {
    fontSize: fontSizes.md,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  mono: {
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  bold: {
    fontWeight: '700',
  },
  ctaBtn: {
    backgroundColor: colors.navy,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
  },
  ctaBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
