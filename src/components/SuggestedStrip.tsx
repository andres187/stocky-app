import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { fetchSugeridos } from '../lib/products';
import type { Product } from '../lib/types';
import { colors, fontSizes, spacing } from '../theme/tokens';
import ProductCard from './ProductCard';

type Props = {
  refs?: Array<Product['id']>;
  categoria?: string;
  limit?: number;
  titulo?: string;
};

// Franja "También te puede gustar" / "Completa tu look": reutiliza ProductCard
// tal cual dentro de un ScrollView horizontal, tope de 6 (misma tolerancia que
// Hero, que ya mapea dentro de un ScrollView por estar acotado). Sin candidatos,
// no renderiza nada.
export default function SuggestedStrip({ refs = [], categoria, limit = 6, titulo = 'También te puede gustar' }: Props) {
  const { addItem } = useCart();
  const { products } = useProducts();
  const [items, setItems] = useState<Product[]>([]);

  const refsKey = refs.join(',');

  useEffect(() => {
    let cancelled = false;
    fetchSugeridos({ refs, categoria, limit })
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refsKey, categoria, limit, products]);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{titulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((p) => (
          <View style={styles.item} key={p.id}>
            <ProductCard product={p} onAdd={addItem} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.lg,
  },
  heading: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.navy,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  item: {
    width: 200,
  },
});
