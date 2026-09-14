import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import BenefitsStrip from '../components/BenefitsStrip';
import Hero from '../components/Hero';
import Pagination from '../components/Pagination';
import ProductGrid from '../components/ProductGrid';
import SuggestedStrip from '../components/SuggestedStrip';
import { useProducts } from '../context/ProductsContext';
import { filterProducts } from '../data/products';
import { apiFetch } from '../lib/api';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import type { Category } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';

const PAGE_SIZE = 10;

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/stocky.baq' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@stocky_atelierco' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100085004706047' },
];

export default function HomeScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const categoria = route.params?.categoria || 'todo';
  const { products, loading, error } = useProducts();
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [activeChip, setActiveChip] = useState(categoria);

  useEffect(() => setActiveChip(categoria), [categoria]);

  useEffect(() => {
    apiFetch<{ key: string; label: string }[]>('/categories')
      .then((rows) => setCategories(rows.map((r) => ({ key: r.key, label: r.label }))))
      .catch(() => setCategories([]));
  }, []);

  const chips = useMemo(
    () => [{ key: 'todo', label: 'Todo' }, ...categories, { key: 'nuevo', label: 'Nuevo' }, { key: 'ofertas', label: 'Ofertas' }],
    [categories]
  );

  const filtered = useMemo(() => filterProducts(activeChip, products), [activeChip, products]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [activeChip]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const header = (
    <View>
      <Hero />
      <View style={styles.catalogHead}>
        <Text style={styles.h2}>La colección</Text>
        <Text style={styles.sub}>Envío gratis desde $250.000 · Cambios en 30 días</Text>
      </View>
      <View style={styles.filters}>
        {chips.map((c) => (
          <Pressable
            key={c.key}
            style={[styles.chip, activeChip === c.key && styles.chipActive]}
            onPress={() => setActiveChip(c.key)}
          >
            <Text style={[styles.chipText, activeChip === c.key && styles.chipTextActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <Text style={styles.empty}>Cargando colección…</Text>
      ) : error ? (
        <Text style={styles.empty}>No pudimos cargar la tienda. Intenta de nuevo en un momento.</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>No hay prendas en esta categoría todavía.</Text>
      ) : null}
    </View>
  );

  const footer = (
    <View>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      <SuggestedStrip categoria={activeChip} />
      <BenefitsStrip />
      <View style={styles.footLinks}>
        <Text style={styles.footHead}>Ayuda</Text>
        <Text style={styles.footLink} onPress={() => navigation.navigate('SizeGuide')}>
          Guía de tallas
        </Text>
        <Text style={styles.footLink} onPress={() => navigation.navigate('ShippingReturns')}>
          Envíos y cambios
        </Text>
        <Text style={styles.footLink} onPress={() => navigation.navigate('Contact')}>
          Contacto
        </Text>
        <Text style={[styles.footHead, styles.footHeadSpaced]}>Síguenos</Text>
        {SOCIAL_LINKS.map((s) => (
          <Text key={s.label} style={styles.footLink} onPress={() => Linking.openURL(s.href)}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  return <ProductGrid products={loading || error ? [] : pageItems} ListHeaderComponent={header} ListFooterComponent={footer} />;
}

const styles = StyleSheet.create({
  catalogHead: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  h2: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    color: colors.ink,
  },
  sub: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    marginTop: spacing.xs,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.white,
  },
  empty: {
    textAlign: 'center',
    color: colors.inkDim,
    paddingVertical: spacing.xl,
  },
  footLinks: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footHead: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  footHeadSpaced: {
    marginTop: spacing.md,
  },
  footLink: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    paddingVertical: spacing.xs,
  },
});
