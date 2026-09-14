import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { deleteReview, listMyReviews } from '../../lib/reviews';
import { formatDate } from '../../lib/format';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { Review } from '../../lib/types';
import type { RootStackParamList } from '../../navigation/types';

function Stars({ rating }: { rating: number }) {
  return (
    <Text style={styles.stars}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </Text>
  );
}

export default function MyReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listMyReviews()
      .then(setReviews)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar tus comentarios.'))
      .finally(() => setLoading(false));
  }, []);

  // Al volver de ReviewForm (crear/editar) hay que refrescar la lista.
  useFocusEffect(load);

  async function handleDelete(id: number) {
    try {
      await deleteReview(id);
      setReviews((prev) => prev?.filter((r) => r.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el comentario.');
    } finally {
      setConfirmingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Cargando tus comentarios…</Text>
      </View>
    );
  }

  if (error && !reviews) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Todavía no has dejado comentarios.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(r) => String(r.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            {item.productImage ? <Image source={{ uri: item.productImage }} style={styles.photo} /> : null}
            <View style={styles.cardInfo}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Stars rating={item.rating} />
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          {item.body ? <Text style={styles.body}>{item.body}</Text> : null}

          {confirmingId === item.id ? (
            <View style={styles.confirmRow}>
              <Text style={styles.confirmText}>¿Eliminar este comentario?</Text>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteConfirm}>Sí, eliminar</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmingId(null)}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionsRow}>
              <Pressable
                onPress={() =>
                  navigation.navigate('ReviewForm', {
                    productId: item.productId,
                    productName: item.productName,
                    reviewId: item.id,
                    rating: item.rating,
                    body: item.body,
                  })
                }
              >
                <Text style={styles.edit}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmingId(item.id)}>
                <Text style={styles.delete}>Eliminar</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  helper: {
    color: colors.inkDim,
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryBtnText: {
    color: colors.ink,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardHead: {
    flexDirection: 'row',
  },
  photo: {
    width: 48,
    height: 60,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  stars: {
    color: colors.gold,
    fontSize: fontSizes.md,
    marginTop: 2,
  },
  date: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginTop: 2,
  },
  body: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  edit: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.roseDeepHover,
  },
  delete: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.danger,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  confirmText: {
    fontSize: fontSizes.xs,
    color: colors.ink,
    flex: 1,
  },
  deleteConfirm: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.danger,
  },
  cancel: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
  },
});
