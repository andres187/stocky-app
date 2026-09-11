import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSizes, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

export default function ShippingReturnsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>Envíos y cambios</Text>
      <Text style={styles.sub}>Todo lo que necesitas saber antes y después de tu compra.</Text>

      <Text style={styles.formH}>Envíos</Text>
      <Text style={styles.li}>Envío gratis en pedidos desde $250.000.</Text>
      <Text style={styles.li}>Pedidos menores: $15.000 a nivel nacional.</Text>
      <Text style={styles.li}>Tiempo de entrega: 2–4 días hábiles en ciudades principales, 4–7 en el resto del país.</Text>
      <Text style={styles.li}>Recibirás un correo con el número de guía apenas tu pedido salga de bodega.</Text>

      <Text style={styles.formH}>Cambios y devoluciones</Text>
      <Text style={styles.li}>Tienes 30 días calendario desde que recibes tu pedido para solicitar un cambio.</Text>
      <Text style={styles.li}>La prenda debe estar sin uso, con etiquetas originales.</Text>
      <Text style={styles.li}>Los cambios por talla no tienen costo adicional de envío.</Text>
      <Text style={styles.li}>
        Para iniciar un cambio, escríbenos desde{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Contact')}>
          contacto
        </Text>{' '}
        con tu número de pedido.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
  },
  h2: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.ink,
  },
  sub: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  formH: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  li: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  link: {
    color: colors.roseDeepHover,
    textDecorationLine: 'underline',
  },
});
