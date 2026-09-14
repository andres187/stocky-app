import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { checkout, listPseBanks } from '../lib/orders';
import { fmt } from '../lib/format';
import { newIdempotencyKey } from '../lib/ids';
import { tokenizeCard } from '../lib/wompi';
import { shippingFor } from '../lib/shipping';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';
import type { PseBank } from '../lib/types';

const LEGAL_ID_TYPES = ['CC', 'CE', 'NIT', 'PP', 'TI'];

type Form = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  notas: string;
  pago: 'tarjeta' | 'pse';
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  cardHolder: string;
  pseUserType: 'natural' | 'juridica';
  pseLegalIdType: string;
  pseLegalId: string;
  pseBankCode: string;
};

function validateForm(form: Form) {
  const next: Partial<Record<keyof Form, string>> = {};
  if (!form.nombre.trim()) next.nombre = 'Ingresa tu nombre completo.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Ingresa un correo válido.';
  if (!/^\d{7,}$/.test(form.telefono.replace(/\s/g, ''))) next.telefono = 'Ingresa un teléfono válido.';
  if (!form.direccion.trim()) next.direccion = 'Ingresa tu dirección de envío.';
  if (!form.ciudad.trim()) next.ciudad = 'Ingresa tu ciudad.';

  if (form.pago === 'tarjeta') {
    if (!/^\d{13,19}$/.test(form.cardNumber.replace(/\s/g, ''))) next.cardNumber = 'Ingresa un número de tarjeta válido.';
    if (!/^\d{1,2}$/.test(form.cardExpMonth)) next.cardExpMonth = 'Mes inválido.';
    if (!/^\d{2}$/.test(form.cardExpYear)) next.cardExpYear = 'Año inválido (AA).';
    if (!/^\d{3,4}$/.test(form.cardCvc)) next.cardCvc = 'CVC inválido.';
    if (!form.cardHolder.trim()) next.cardHolder = 'Ingresa el nombre del titular.';
  } else {
    if (!form.pseBankCode) next.pseBankCode = 'Selecciona tu banco.';
    if (!form.pseLegalId.trim()) next.pseLegalId = 'Ingresa tu número de documento.';
  }
  return next;
}

export default function CheckoutScreen() {
  const { items, subtotal, clearCart } = useCart();
  const { customer } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [form, setForm] = useState<Form>({
    nombre: customer ? `${customer.fullName} ${customer.lastName ?? ''}`.trim() : '',
    email: customer?.email ?? '',
    telefono: customer?.phone ?? '',
    direccion: '',
    ciudad: '',
    notas: '',
    pago: 'tarjeta',
    cardNumber: '',
    cardExpMonth: '',
    cardExpYear: '',
    cardCvc: '',
    cardHolder: '',
    pseUserType: 'natural',
    pseLegalIdType: 'CC',
    pseLegalId: '',
    pseBankCode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pseBanks, setPseBanks] = useState<PseBank[]>([]);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState<string | null>(null);
  const [idempotencyKey] = useState(newIdempotencyKey);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  useEffect(() => {
    if (!customer) {
      navigation.replace('SignIn');
    }
  }, [customer, navigation]);

  useEffect(() => {
    if (items.length === 0 && !pendingRedirectUrl) {
      navigation.replace('Home', { categoria: 'todo' });
    }
  }, [items.length, navigation, pendingRedirectUrl]);

  useEffect(() => {
    if (form.pago !== 'pse' || pseBanks.length > 0) return;
    listPseBanks()
      .then(setPseBanks)
      .catch(() => setSubmitError('No se pudo cargar la lista de bancos PSE. Intenta de nuevo.'));
  }, [form.pago, pseBanks.length]);

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const next = validateForm(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      const paymentMethod =
        form.pago === 'tarjeta'
          ? {
              type: 'CARD' as const,
              token: await tokenizeCard({
                number: form.cardNumber,
                expMonth: form.cardExpMonth.padStart(2, '0'),
                expYear: form.cardExpYear,
                cvc: form.cardCvc,
                cardHolder: form.cardHolder,
              }),
              installments: 1,
            }
          : {
              type: 'PSE' as const,
              user_type: (form.pseUserType === 'natural' ? 0 : 1) as 0 | 1,
              user_legal_id_type: form.pseLegalIdType,
              user_legal_id: form.pseLegalId,
              financial_institution_code: form.pseBankCode,
              payment_description: `Pedido Stocky`,
            };

      const order = await checkout({
        customer: {
          fullName: form.nombre,
          email: form.email,
          phone: form.telefono,
          address: form.direccion,
          city: form.ciudad,
          notes: form.notas || undefined,
        },
        lines: items.map((line) => ({
          productId: line.productId,
          color: line.color,
          size: line.size,
          quantity: line.qty,
        })),
        amountInCents: Math.round(total * 100),
        paymentMethod,
        idempotencyKey,
      });

      clearCart();

      if (order.redirectUrl) {
        setPendingRedirectUrl(order.redirectUrl);
        Linking.openURL(order.redirectUrl).catch(() => {});
        return;
      }

      navigation.replace('OrderDetail', { orderId: order.id });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo procesar tu pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingRedirectUrl) {
    return (
      <View style={styles.confirmation}>
        <Text style={styles.eyebrow}>Pago en proceso</Text>
        <Text style={styles.confirmTitle}>Termina tu pago en el banco</Text>
        <Text style={styles.confirmText}>
          Te enviamos a tu banco para confirmar el pago PSE. Si no se abrió automáticamente, usa el siguiente enlace.
        </Text>
        <Pressable style={styles.ctaBtn} onPress={() => Linking.openURL(pendingRedirectUrl).catch(() => {})}>
          <Text style={styles.ctaBtnText}>Abrir enlace de pago →</Text>
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
      <View style={styles.paymentOption}>
        <Pressable style={styles.radioRow} onPress={() => update('pago', 'tarjeta')}>
          <View style={[styles.radio, form.pago === 'tarjeta' && styles.radioSelected]} />
          <Text style={styles.paymentLabel}>Tarjeta de crédito o débito</Text>
        </Pressable>
      </View>
      <View style={styles.paymentOption}>
        <Pressable style={styles.radioRow} onPress={() => update('pago', 'pse')}>
          <View style={[styles.radio, form.pago === 'pse' && styles.radioSelected]} />
          <Text style={styles.paymentLabel}>PSE / Transferencia</Text>
        </Pressable>
      </View>

      {form.pago === 'tarjeta' && (
        <View style={styles.subForm}>
          <Field
            label="Número de tarjeta"
            value={form.cardNumber}
            onChangeText={(v) => update('cardNumber', v)}
            error={errors.cardNumber}
            keyboardType="number-pad"
            placeholder="4242 4242 4242 4242"
          />
          <View style={styles.row3}>
            <View style={styles.row3Item}>
              <Field label="Mes (MM)" value={form.cardExpMonth} onChangeText={(v) => update('cardExpMonth', v)} error={errors.cardExpMonth} keyboardType="number-pad" />
            </View>
            <View style={styles.row3Item}>
              <Field label="Año (AA)" value={form.cardExpYear} onChangeText={(v) => update('cardExpYear', v)} error={errors.cardExpYear} keyboardType="number-pad" />
            </View>
            <View style={styles.row3Item}>
              <Field label="CVC" value={form.cardCvc} onChangeText={(v) => update('cardCvc', v)} error={errors.cardCvc} keyboardType="number-pad" />
            </View>
          </View>
          <Field label="Nombre del titular" value={form.cardHolder} onChangeText={(v) => update('cardHolder', v)} error={errors.cardHolder} />
        </View>
      )}

      {form.pago === 'pse' && (
        <View style={styles.subForm}>
          <Text style={styles.label}>Banco</Text>
          <View style={styles.bankGrid}>
            {pseBanks.map((bank) => (
              <Pressable
                key={bank.code}
                style={[styles.bankChip, form.pseBankCode === bank.code && styles.bankChipSelected]}
                onPress={() => update('pseBankCode', bank.code)}
              >
                <Text style={[styles.bankChipText, form.pseBankCode === bank.code && styles.bankChipTextSelected]}>{bank.name}</Text>
              </Pressable>
            ))}
          </View>
          {errors.pseBankCode && <Text style={styles.fieldError}>{errors.pseBankCode}</Text>}

          <Text style={styles.label}>Tipo de persona</Text>
          <View style={styles.paymentOption}>
            <Pressable style={styles.radioRow} onPress={() => update('pseUserType', 'natural')}>
              <View style={[styles.radio, form.pseUserType === 'natural' && styles.radioSelected]} />
              <Text style={styles.paymentLabel}>Persona natural</Text>
            </Pressable>
          </View>
          <View style={styles.paymentOption}>
            <Pressable style={styles.radioRow} onPress={() => update('pseUserType', 'juridica')}>
              <View style={[styles.radio, form.pseUserType === 'juridica' && styles.radioSelected]} />
              <Text style={styles.paymentLabel}>Persona jurídica</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Tipo de documento</Text>
          <View style={styles.bankGrid}>
            {LEGAL_ID_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[styles.bankChip, form.pseLegalIdType === type && styles.bankChipSelected]}
                onPress={() => update('pseLegalIdType', type)}
              >
                <Text style={[styles.bankChipText, form.pseLegalIdType === type && styles.bankChipTextSelected]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="Número de documento"
            value={form.pseLegalId}
            onChangeText={(v) => update('pseLegalId', v)}
            error={errors.pseLegalId}
            keyboardType="number-pad"
          />
        </View>
      )}

      {submitError && <Text style={styles.fieldError}>{submitError}</Text>}

      <Pressable style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} disabled={submitting} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>
          {submitting ? 'Procesando…' : `Confirmar pedido — ${fmt.format(total)}`}
        </Text>
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
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
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
    marginBottom: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  subForm: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  row3: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  row3Item: {
    flex: 1,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bankChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  bankChipSelected: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  bankChipText: {
    fontSize: fontSizes.xs,
    color: colors.ink,
  },
  bankChipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitBtnDisabled: {
    opacity: 0.5,
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
