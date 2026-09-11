import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme/tokens';

const BENEFITS = [
  { lbl: 'Envío', val: 'Gratis desde $250.000' },
  { lbl: 'Cambios', val: '30 días' },
  { lbl: 'Producción', val: 'Local, Colombia' },
];

export default function BenefitsStrip() {
  return (
    <View style={styles.strip}>
      {BENEFITS.map((b) => (
        <View style={styles.item} key={b.lbl}>
          <Text style={styles.lbl}>{b.lbl}</Text>
          <Text style={styles.val}>{b.val}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  lbl: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
