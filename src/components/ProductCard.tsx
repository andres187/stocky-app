import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { variantStockFor } from '../context/CartContext';
import { fmt } from '../lib/format';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import type { AddItemResult, Product } from '../lib/types';
import WhatsAppButton from './WhatsAppButton';

const BADGE_LABEL: Record<string, string> = { new: 'Nuevo', low: 'Pocas unidades' };

type Props = {
  product: Product;
  onAdd: (productId: Product['id'], color: string, size: string) => AddItemResult;
};

export default function ProductCard({ product, onAdd }: Props) {
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const fullySoldOut = useMemo(() => {
    if (!product.variantStock || product.variantStock.length === 0) return false;
    return product.colors.every((c) =>
      product.sizes.every((s) => variantStockFor(product, c.name, s) === 0)
    );
  }, [product]);

  const selectedLimit = color && size ? variantStockFor(product, color, size) : null;
  const selectedSoldOut = selectedLimit === 0;

  function handleAdd() {
    if (fullySoldOut) return;
    if (!color || !size) {
      setWarn('Elige color y talla para continuar.');
      return;
    }
    const result = onAdd(product.id, color, size);
    if (!result.ok) {
      setWarn(result.message ?? null);
      return;
    }
    setWarn(null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <View style={styles.card}>
      <View style={styles.photoWrap}>
        <Image source={{ uri: product.img }} style={styles.photo} resizeMode="cover" />
        {fullySoldOut ? (
          <View style={[styles.badge, styles.badgeSoldOut]}>
            <Text style={styles.badgeText}>Agotado</Text>
          </View>
        ) : product.badge ? (
          <View style={[styles.badge, styles.badgeDefault]}>
            <Text style={styles.badgeText}>{BADGE_LABEL[product.badge]}</Text>
          </View>
        ) : null}
        {product.oldPrice ? (
          <View style={[styles.badge, styles.badgeSale]}>
            <Text style={styles.badgeText}>Oferta</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {product.desc}
        </Text>

        <View style={styles.pickerRow}>
          <Text style={styles.pickerLbl}>Color</Text>
          <View style={styles.swatches}>
            {product.colors.map((c) => (
              <Pressable
                key={c.name}
                disabled={fullySoldOut}
                onPress={() => {
                  setColor(c.name);
                  setWarn(null);
                }}
                accessibilityLabel={c.name}
                style={[
                  styles.swatch,
                  { backgroundColor: c.hex },
                  color === c.name && styles.swatchSelected,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.pickerRow}>
          <Text style={styles.pickerLbl}>Talla</Text>
          <View style={styles.sizeChips}>
            {product.sizes.map((s) => (
              <Pressable
                key={s}
                disabled={fullySoldOut}
                onPress={() => {
                  setSize(s);
                  setWarn(null);
                }}
                style={[styles.sizeChip, size === s && styles.sizeChipSelected]}
              >
                <Text style={[styles.sizeChipText, size === s && styles.sizeChipTextSelected]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {selectedSoldOut && <Text style={styles.warn}>Esa combinación de color y talla está agotada.</Text>}
        {warn && <Text style={styles.warn}>{warn}</Text>}

        <View style={styles.footRow}>
          <View>
            <Text style={styles.price}>{fmt.format(product.price)}</Text>
            {product.oldPrice ? <Text style={styles.priceOld}>{fmt.format(product.oldPrice)}</Text> : null}
          </View>
          <View style={styles.actions}>
            <WhatsAppButton product={product} />
            <Pressable
              style={[styles.addBtn, (fullySoldOut || selectedSoldOut) && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={fullySoldOut || selectedSoldOut}
            >
              <Text style={styles.addBtnText}>
                {fullySoldOut ? 'Agotado' : justAdded ? 'Añadido ✓' : 'Añadir'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  photoWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.rose,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  badgeDefault: { backgroundColor: colors.gold },
  badgeSale: { backgroundColor: colors.sage, left: undefined, right: spacing.sm },
  badgeSoldOut: { backgroundColor: colors.inkDim },
  badgeText: { fontSize: fontSizes.xs, color: colors.white, fontWeight: '600' },
  info: {
    padding: spacing.md,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
  },
  desc: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    marginBottom: spacing.xs,
  },
  pickerLbl: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginBottom: spacing.xs,
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  swatchSelected: {
    borderWidth: 2,
    borderColor: colors.navy,
  },
  sizeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sizeChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sizeChipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  sizeChipText: {
    fontSize: fontSizes.xs,
    color: colors.ink,
  },
  sizeChipTextSelected: {
    color: colors.white,
  },
  warn: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  footRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
  priceOld: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: colors.navy,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
