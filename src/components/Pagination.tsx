import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, page <= 1 && styles.btnDisabled]}
        disabled={page <= 1}
        onPress={() => onChange(page - 1)}
      >
        <Text style={styles.btnText}>← Anterior</Text>
      </Pressable>
      <Text style={styles.status}>
        Página {page} de {totalPages}
      </Text>
      <Pressable
        style={[styles.btn, page >= totalPages && styles.btnDisabled]}
        disabled={page >= totalPages}
        onPress={() => onChange(page + 1)}
      >
        <Text style={styles.btnText}>Siguiente →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: colors.ink,
    fontSize: fontSizes.sm,
  },
  status: {
    color: colors.inkDim,
    fontSize: fontSizes.sm,
  },
});
