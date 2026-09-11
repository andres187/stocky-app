import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import type { Product } from '../lib/types';

const WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '';

export default function WhatsAppButton({ product }: { product: Product }) {
  const message = `Hola, tengo una pregunta sobre "${product.name}"`;
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  function handlePress() {
    Linking.openURL(href).catch(() => {});
  }

  return (
    <Pressable
      style={styles.btn}
      onPress={handlePress}
      accessibilityLabel={`Preguntar por WhatsApp sobre ${product.name}`}
    >
      <Text style={styles.icon}>💬</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: spacing.xs,
  },
  icon: {
    fontSize: 15,
  },
});
