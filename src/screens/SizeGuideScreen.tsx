import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme/tokens';

const ROWS = [
  { talla: 'XS', busto: '78–82', cintura: '60–64', cadera: '86–90' },
  { talla: 'S', busto: '83–87', cintura: '65–69', cadera: '91–95' },
  { talla: 'M', busto: '88–93', cintura: '70–75', cadera: '96–101' },
  { talla: 'L', busto: '94–99', cintura: '76–81', cadera: '102–107' },
  { talla: 'XL', busto: '100–106', cintura: '82–88', cadera: '108–114' },
];

export default function SizeGuideScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h2}>Guía de tallas</Text>
      <Text style={styles.sub}>Medidas en centímetros, tomadas sobre el cuerpo sin prenda.</Text>

      <ScrollView horizontal style={styles.tableScroll}>
        <View>
          <View style={[styles.row, styles.headRow]}>
            <Text style={[styles.cell, styles.headCell]}>Talla</Text>
            <Text style={[styles.cell, styles.headCell]}>Busto</Text>
            <Text style={[styles.cell, styles.headCell]}>Cintura</Text>
            <Text style={[styles.cell, styles.headCell]}>Cadera</Text>
          </View>
          {ROWS.map((r) => (
            <View style={styles.row} key={r.talla}>
              <Text style={styles.cell}>{r.talla}</Text>
              <Text style={styles.cell}>{r.busto}</Text>
              <Text style={styles.cell}>{r.cintura}</Text>
              <Text style={styles.cell}>{r.cadera}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.formH}>Cómo medirte</Text>
      <Text style={styles.li}>
        <Text style={styles.bold}>Busto: </Text>rodea la parte más ancha del pecho, manteniendo la cinta paralela al piso.
      </Text>
      <Text style={styles.li}>
        <Text style={styles.bold}>Cintura: </Text>mide en la parte más angosta del torso, usualmente sobre el ombligo.
      </Text>
      <Text style={styles.li}>
        <Text style={styles.bold}>Cadera: </Text>rodea la parte más ancha de la cadera y glúteos.
      </Text>
      <Text style={styles.note}>
        ¿Estás entre dos tallas? Te recomendamos elegir la talla mayor para una caída más suelta.
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
  tableScroll: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headRow: {
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
  },
  cell: {
    width: 90,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.ink,
    fontFamily: 'Courier',
  },
  headCell: {
    fontWeight: '700',
    fontFamily: undefined,
  },
  formH: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  li: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  note: {
    fontSize: fontSizes.sm,
    color: colors.inkDim,
    marginTop: spacing.sm,
  },
});
