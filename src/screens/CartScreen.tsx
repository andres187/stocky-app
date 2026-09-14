import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCart } from '../context/CartContext';
import SuggestedStrip from '../components/SuggestedStrip';
import { fmt } from '../lib/format';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import type { CartLineWithProduct } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';

export default function CartScreen() {
  const { items, subtotal, incLine, decLine, removeLine } = useCart();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  function handleInc(key: string) {
    const result = incLine(key);
    if (!result.ok && result.message) setNotice(result.message);
  }

  function goToCheckout() {
    navigation.navigate('Checkout');
  }

  function renderItem({ item: line }: { item: CartLineWithProduct }) {
    return (
      <View style={styles.item}>
        <Image source={{ uri: line.product.img }} style={styles.photo} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{line.product.name}</Text>
          <Text style={styles.variantTag}>
            {line.color} · Talla {line.size}
          </Text>
          <Text style={styles.price}>{fmt.format(line.product.price)}</Text>
          <View style={styles.qtyRow}>
            <Pressable style={styles.qtyBtn} onPress={() => decLine(line.key)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{line.qty}</Text>
            <Pressable style={styles.qtyBtn} onPress={() => handleInc(line.key)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => removeLine(line.key)}>
          <Text style={styles.removeBtn}>Quitar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notice && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}
      {items.length === 0 ? (
        <Text style={styles.empty}>Tu bolsa está vacía. Explora la colección y añade tus piezas favoritas.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.key}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <SuggestedStrip refs={items.map((line) => line.product.id)} limit={4} titulo="Completa tu look" />
          }
        />
      )}
      <View style={styles.foot}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>{fmt.format(subtotal)}</Text>
        </View>
        <Pressable
          style={[styles.checkoutBtn, items.length === 0 && styles.checkoutBtnDisabled]}
          disabled={items.length === 0}
          onPress={goToCheckout}
        >
          <Text style={styles.checkoutBtnText}>Finalizar compra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  notice: {
    backgroundColor: colors.gold,
    padding: spacing.sm,
  },
  noticeText: {
    color: colors.navy,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    color: colors.inkDim,
    padding: spacing.xl,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  photo: {
    width: 64,
    height: 80,
    borderRadius: radii.sm,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  variantTag: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginTop: 2,
  },
  price: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  qtyValue: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    minWidth: 16,
    textAlign: 'center',
  },
  removeBtn: {
    fontSize: fontSizes.xs,
    color: colors.danger,
  },
  foot: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.card,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  subtotalLabel: {
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  subtotalValue: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  checkoutBtn: {
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.5,
  },
  checkoutBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
