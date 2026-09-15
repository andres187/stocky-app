import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getOrder, confirmReceived } from '../../lib/orders';
import { listMyReviews } from '../../lib/reviews';
import { listMyReturns } from '../../lib/returns';
import { daysLeftToReturn } from '../../lib/dates';
import ShipmentTracker from '../../components/ShipmentTracker';
import { formatDate, fmt } from '../../lib/format';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { Order, ReturnRequest } from '../../lib/types';
import type { RootStackParamList } from '../../navigation/types';

const RETURN_STATUS_LABEL: Record<ReturnRequest['status'], string> = {
  pending: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
};

export default function OrderDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getOrder(orderId), listMyReviews().catch(() => []), listMyReturns().catch(() => [])])
      .then(([fetchedOrder, reviews, returns]) => {
        setOrder(fetchedOrder);
        setReviewedProductIds(new Set(reviews.map((r) => r.productId)));
        setReturnRequest(returns.find((r) => r.orderId === orderId) || null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el pedido.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  function handleConfirmReceived() {
    Alert.alert(
      '¿Ya lo recibiste?',
      'A partir de hoy tienes 15 días para pedir una devolución si algo no está bien.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setConfirming(true);
            setConfirmError(null);
            try {
              await confirmReceived(orderId);
              load();
            } catch (err) {
              setConfirmError(err instanceof Error ? err.message : 'No se pudo confirmar.');
            } finally {
              setConfirming(false);
            }
          },
        },
      ]
    );
  }

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Cargando pedido…</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Pedido no encontrado.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{formatDate(order.createdAt)}</Text>
      <Text style={styles.reference}>{order.reference}</Text>
      <Text style={styles.status}>{STATUS_LABEL[order.status]}</Text>

      <Text style={styles.sectionH}>Artículos</Text>
      {order.items.map((item, idx) => {
        const alreadyReviewed = reviewedProductIds.has(item.productId);
        return (
          <View style={styles.itemRow} key={`${item.productId}-${idx}`}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemVariant}>
                {item.color} · Talla {item.size} · x{item.quantity}
              </Text>
              <Text style={styles.itemPrice}>{fmt.format(item.unitPrice * item.quantity)}</Text>
            </View>
            {order.status === 'paid' && (
              <Pressable
                style={[styles.reviewBtn, alreadyReviewed && styles.reviewBtnDisabled]}
                disabled={alreadyReviewed}
                onPress={() =>
                  navigation.navigate('ReviewForm', { productId: item.productId, productName: item.productName })
                }
              >
                <Text style={[styles.reviewBtnText, alreadyReviewed && styles.reviewBtnTextDisabled]}>
                  {alreadyReviewed ? 'Ya comentaste' : 'Dejar comentario'}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <Text style={styles.sectionH}>Envío</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>{order.shippingContact.fullName}</Text>
        <Text style={styles.cardText}>{order.shippingContact.address}</Text>
        <Text style={styles.cardText}>{order.shippingContact.city}</Text>
        <Text style={styles.cardText}>{order.shippingContact.phone}</Text>
      </View>

      {order.status === 'paid' && order.shipment && (
        <>
          <Text style={styles.sectionH}>Seguimiento</Text>
          <View style={styles.card}>
            <ShipmentTracker shipment={order.shipment} />

            {order.shipment.status === 'delivered' && (
              <View style={styles.receiptBox}>
                <Pressable
                  style={[styles.confirmBtn, confirming && styles.confirmBtnDisabled]}
                  disabled={confirming}
                  onPress={handleConfirmReceived}
                >
                  <Text style={styles.confirmBtnText}>{confirming ? 'Confirmando…' : 'Ya lo recibí'}</Text>
                </Pressable>
                {confirmError && <Text style={styles.errorText}>{confirmError}</Text>}
              </View>
            )}

            {order.shipment.status === 'received' && (
              <View style={styles.receiptBox}>
                {returnRequest ? (
                  <Text style={styles.cardText}>
                    Solicitud de devolución: {RETURN_STATUS_LABEL[returnRequest.status]}
                  </Text>
                ) : (
                  (() => {
                    const daysLeft = daysLeftToReturn(order.shipment!.receivedAt);
                    if (daysLeft != null && daysLeft > 0) {
                      return (
                        <>
                          <Text style={styles.cardText}>
                            Tienes {daysLeft} {daysLeft === 1 ? 'día' : 'días'} más para pedir una devolución.
                          </Text>
                          <Pressable
                            style={styles.reviewBtn}
                            onPress={() => navigation.navigate('ReturnRequest', { orderId: order.id, reference: order.reference })}
                          >
                            <Text style={styles.reviewBtnText}>Solicitar devolución</Text>
                          </Pressable>
                        </>
                      );
                    }
                    return <Text style={styles.cardText}>El plazo para pedir una devolución ya venció.</Text>;
                  })()
                )}
              </View>
            )}
          </View>
        </>
      )}

      <Text style={styles.sectionH}>Total</Text>
      <View style={styles.totals}>
        <TotalRow label="Subtotal" value={order.subtotal} />
        <TotalRow label="Envío" value={order.shippingCost} />
        <TotalRow label="Total" value={order.total} bold />
      </View>
    </ScrollView>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.totalValue, bold && styles.bold]}>{fmt.format(value)}</Text>
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
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
  },
  reference: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  status: {
    fontSize: fontSizes.sm,
    color: colors.roseDeepHover,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  sectionH: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemRow: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  itemInfo: {
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  itemVariant: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  reviewBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.roseDeep,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  reviewBtnDisabled: {
    borderColor: colors.line,
  },
  reviewBtnText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.roseDeepHover,
  },
  reviewBtnTextDisabled: {
    color: colors.inkDim,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginBottom: 2,
  },
  receiptBox: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: spacing.sm,
  },
  confirmBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  totals: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
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
  bold: {
    fontWeight: '700',
    color: colors.ink,
    fontSize: fontSizes.md,
  },
});
