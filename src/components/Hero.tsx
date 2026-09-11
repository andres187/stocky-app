import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useProducts } from '../context/ProductsContext';
import { fmt } from '../lib/format';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

export default function Hero() {
  const { products } = useProducts();

  const slides = useMemo(
    () =>
      products
        .filter((p) => p.bestsellerOrder != null)
        .sort((a, b) => (a.bestsellerOrder ?? 0) - (b.bestsellerOrder ?? 0))
        .slice(0, 3),
    [products]
  );

  return (
    <View style={styles.hero}>
      <Text style={styles.heading}>Más vendidos</Text>
      {slides.length === 0 ? null : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {slides.map((s) => (
            <View style={styles.card} key={s.id}>
              <Image source={{ uri: s.img }} style={styles.photo} resizeMode="cover" />
              <Text style={styles.name} numberOfLines={1}>
                {s.name}
              </Text>
              <Text style={styles.price}>{fmt.format(s.price)}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.heroBg,
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
  card: {
    width: 150,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  name: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.ink,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
