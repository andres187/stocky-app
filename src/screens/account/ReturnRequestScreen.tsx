import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createReturnRequest } from '../../lib/returns';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';
import type { ReturnReason } from '../../lib/types';

const REASONS: { key: ReturnReason; label: string }[] = [
  { key: 'no_llego', label: 'El pedido nunca llegó' },
  { key: 'danado', label: 'Llegó dañado o defectuoso' },
  { key: 'no_corresponde', label: 'No corresponde a lo que pedí' },
  { key: 'talla', label: 'La talla no me quedó' },
  { key: 'otro', label: 'Otro motivo' },
];

export default function ReturnRequestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ReturnRequest'>>();
  const { orderId, reference } = route.params;

  const [reason, setReason] = useState<ReturnReason | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!reason) {
      setError('Selecciona un motivo.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createReturnRequest({ orderId, reason, body: body.trim() || undefined });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.reference}>Pedido {reference}</Text>
      <Text style={styles.helper}>Tienes 15 días desde que confirmaste que recibiste el pedido para pedir una devolución.</Text>

      <Text style={styles.label}>Motivo</Text>
      <View style={styles.reasonList}>
        {REASONS.map((r) => (
          <Pressable
            key={r.key}
            style={[styles.reasonChip, reason === r.key && styles.reasonChipActive]}
            onPress={() => setReason(r.key)}
          >
            <Text style={[styles.reasonChipText, reason === r.key && styles.reasonChipTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Cuéntanos más (opcional)</Text>
      <TextInput
        style={styles.textarea}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={4}
        maxLength={1000}
        placeholder="Describe qué pasó..."
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submitBtn, saving && styles.submitBtnDisabled]} disabled={saving} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>{saving ? 'Enviando…' : 'Enviar solicitud'}</Text>
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
  reference: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  helper: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  reasonList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasonChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  reasonChipActive: {
    borderColor: colors.roseDeepHover,
    backgroundColor: colors.rose,
  },
  reasonChipText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  reasonChipTextActive: {
    fontWeight: '600',
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    color: colors.ink,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
