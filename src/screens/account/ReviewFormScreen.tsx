import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { createReview, updateReview } from '../../lib/reviews';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export default function ReviewFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ReviewForm'>>();
  const { productId, productName, reviewId, rating: initialRating, body: initialBody } = route.params;

  const [rating, setRating] = useState(initialRating ?? 5);
  const [body, setBody] = useState(initialBody ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      if (reviewId) {
        await updateReview(reviewId, { rating, body: body.trim() || undefined });
      } else {
        await createReview({ productId, rating, body: body.trim() || undefined });
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar tu comentario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.productName}>{productName}</Text>

      <Text style={styles.label}>Calificación</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setRating(value)} hitSlop={8}>
            <Text style={[styles.star, value <= rating && styles.starActive]}>★</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Comentario (opcional)</Text>
      <TextInput
        style={styles.textarea}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={4}
        maxLength={1000}
        placeholder="Cuéntanos qué te pareció..."
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submitBtn, saving && styles.submitBtnDisabled]} disabled={saving} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>{saving ? 'Guardando…' : reviewId ? 'Guardar cambios' : 'Publicar comentario'}</Text>
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
  productName: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  star: {
    fontSize: 32,
    color: colors.line,
  },
  starActive: {
    color: colors.gold,
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
