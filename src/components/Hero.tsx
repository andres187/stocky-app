import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useProducts } from '../context/ProductsContext';
import { fmt } from '../lib/format';
import { fetchDestacados } from '../lib/products';
import type { Product } from '../lib/types';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

export default function Hero() {
  const { products } = useProducts();

  // Curaduría manual del admin, como respaldo mientras carga /products/destacados
  // o si la petición falla — así el Hero nunca queda vacío por un error de red.
  const fallbackSlides = useMemo(
    () =>
      products
        .filter((p) => p.bestsellerOrder != null)
        .sort((a, b) => (a.bestsellerOrder ?? 0) - (b.bestsellerOrder ?? 0))
        .slice(0, 3),
    [products]
  );

  const [destacados, setDestacados] = useState<Product[] | null>(null);

  // Se reconsulta cada vez que ProductsContext vuelve a traer el catálogo (carga
  // inicial, rotación horaria, o volver a primer plano), así "Más vendidos" rota
  // junto con el resto de la vitrina.
  useEffect(() => {
    let cancelled = false;
    fetchDestacados(3)
      .then((data) => { if (!cancelled) setDestacados(data); })
      .catch(() => { if (!cancelled) setDestacados(null); });
    return () => { cancelled = true; };
  }, [products]);

  const slides = destacados && destacados.length > 0 ? destacados : fallbackSlides;

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
