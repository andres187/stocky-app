import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSizes, spacing } from '../theme/tokens';

export default function ShippingReturnsScreen() {
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
      <Text style={styles.li}>
        Cuando te llegue el pedido, confírmalo con "Ya lo recibí" en Mis compras. Si no lo confirmas, lo damos
        por recibido automáticamente a los 7 días de entregado.
      </Text>
      <Text style={styles.li}>Desde que confirmas que lo recibiste, tienes 15 días calendario para solicitar una devolución.</Text>
      <Text style={styles.li}>La prenda debe estar sin uso, con etiquetas originales.</Text>
      <Text style={styles.li}>
        Para iniciar una devolución, entra a tu pedido en Mis compras y usa "Solicitar devolución". Revisamos cada
        solicitud y te avisamos por correo.
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
});
