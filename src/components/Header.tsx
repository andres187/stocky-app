import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';
import Logo from './Logo';

const NAV_LINKS: { label: string; categoria?: string }[] = [
  { label: 'Colección', categoria: 'todo' },
  { label: 'Nuevo', categoria: 'nuevo' },
  { label: 'Ofertas', categoria: 'ofertas' },
];

export default function Header() {
  const { count } = useCart();
  const { customer } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={() => navigation.navigate('Home', { categoria: 'todo' })}>
        <Logo />
      </Pressable>
      <View style={styles.nav}>
        {NAV_LINKS.map((l) => (
          <Pressable key={l.label} onPress={() => navigation.navigate('Home', { categoria: l.categoria })}>
            <Text style={styles.navLink}>{l.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.accountBtn}
          onPress={() => navigation.navigate(customer ? 'Account' : 'SignIn')}
          accessibilityLabel={customer ? 'Mi cuenta' : 'Iniciar sesión'}
        >
          <Text style={styles.accountIcon}>👤</Text>
        </Pressable>
        <Pressable
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
          accessibilityLabel={`Ver bolsa, ${count} producto${count === 1 ? '' : 's'}`}
        >
          <Text style={styles.cartIcon}>👜</Text>
          {count > 0 && (
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{count}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navLink: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountBtn: {
    padding: spacing.xs,
  },
  accountIcon: {
    fontSize: 18,
  },
  cartBtn: {
    position: 'relative',
    padding: spacing.xs,
  },
  cartIcon: {
    fontSize: 18,
  },
  cartCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.roseDeepHover,
    borderRadius: radii.pill,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
