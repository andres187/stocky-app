import type { ReactElement } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { spacing } from '../theme/tokens';
import type { Product } from '../lib/types';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  ListHeaderComponent?: ReactElement;
  ListFooterComponent?: ReactElement;
};

export default function ProductGrid({ products, ListHeaderComponent, ListFooterComponent }: Props) {
  const { addItem } = useCart();

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => String(p.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <ProductCard product={item} onAdd={addItem} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    gap: spacing.md,
  },
  cell: {
    flex: 1,
  },
});
