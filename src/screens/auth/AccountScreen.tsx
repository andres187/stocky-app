import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSizes, radii, spacing } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export default function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Home', params: { categoria: 'todo' } }] });
  }

  if (!customer) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>Mi cuenta</Text>

      <View style={styles.card}>
        <Row label="Nombre" value={`${customer.fullName} ${customer.lastName ?? ''}`.trim()} />
        <Row label="Correo" value={customer.email} />
        {customer.phone && <Row label="Celular" value={`${customer.regionCode ?? ''} ${customer.phone}`} />}
      </View>

      <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.linkRowText}>Mis compras</Text>
        <Text style={styles.linkRowChevron}>›</Text>
      </Pressable>
      <Pressable style={styles.linkRow} onPress={() => navigation.navigate('MyReviews')}>
        <Text style={styles.linkRowText}>Mis comentarios</Text>
        <Text style={styles.linkRowChevron}>›</Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  h2: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  row: {
    marginBottom: spacing.md,
  },
  rowLabel: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  linkRowText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
  },
  linkRowChevron: {
    fontSize: fontSizes.lg,
    color: colors.inkDim,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
