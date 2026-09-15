import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { listOrders } from '../../lib/orders';
import { formatDate, fmt } from '../../lib/format';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { Order, ShipmentStatus } from '../../lib/types';
import type { RootStackParamList } from '../../navigation/types';
import { STATUS_LABEL as SHIPMENT_STATUS_LABEL } from '../../lib/shipmentStatus';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  pending: colors.gold,
  paid: colors.sage,
  failed: colors.danger,
};

const SHIPMENT_STATUS_COLOR: Record<ShipmentStatus, string> = {
  pending: colors.gold,
  preparing: colors.gold,
  shipped: colors.roseDeepHover,
  out_for_delivery: colors.roseDeepHover,
  delivered: colors.sage,
  cancelled: colors.danger,
  returned: colors.danger,
};

export default function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar tus compras.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Cargando tus compras…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Aún no tienes compras.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => String(o.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
          <View style={styles.cardHead}>
            <Text style={styles.reference}>{item.reference}</Text>
            <View style={styles.badgeGroup}>
              {item.status === 'paid' && item.shipment && (
                <View style={[styles.badge, { backgroundColor: SHIPMENT_STATUS_COLOR[item.shipment.status] }]}>
                  <Text style={styles.badgeText}>{SHIPMENT_STATUS_LABEL[item.shipment.status]}</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
                <Text style={styles.badgeText}>{STATUS_LABEL[item.status]}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <View style={styles.cardFoot}>
            <Text style={styles.items}>
              {item.items.length} {item.items.length === 1 ? 'artículo' : 'artículos'}
            </Text>
            <Text style={styles.total}>{fmt.format(item.total)}</Text>
          </View>
        </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reference: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.ink,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.navy,
  },
  date: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginTop: spacing.xs,
  },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  items: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
  },
  total: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
});
