import { StyleSheet, Text, View } from 'react-native';
import type { Shipment } from '../lib/types';
import { STATUS_LABEL, TERMINAL_STATUSES, buildTimeline } from '../lib/shipmentStatus';
import { formatDate } from '../lib/format';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

// Componente presentacional puro: no importa nada de screens/, según la regla
// de arquitectura del proyecto (lib/components no dependen de la capa de
// pantallas). Línea vertical de pasos con punto lleno/vacío + fecha.
export default function ShipmentTracker({ shipment }: { shipment: Shipment | null }) {
  if (!shipment) return null;

  const steps = buildTimeline(shipment);
  const isTerminal = TERMINAL_STATUSES.includes(shipment.status);

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Seguimiento del envío: ${STATUS_LABEL[shipment.status]}`}
    >
      {steps.map((step, idx) => (
        <View key={`${step.key}-${idx}`} style={styles.row}>
          <View style={styles.dotColumn}>
            <View
              style={[
                styles.dot,
                step.state === 'done' && styles.dotDone,
                step.state === 'current' && (isTerminal ? styles.dotDanger : styles.dotCurrent),
              ]}
            />
            {idx < steps.length - 1 && <View style={[styles.line, step.state === 'done' && styles.lineDone]} />}
          </View>
          <View style={styles.textColumn}>
            <Text style={[styles.label, step.state === 'pending' && styles.labelPending]}>{step.label}</Text>
            {step.date && <Text style={styles.date}>{formatDate(step.date)}</Text>}
          </View>
        </View>
      ))}

      {(shipment.carrier || shipment.trackingNumber) && (
        <View style={styles.meta}>
          {shipment.carrier && <Text style={styles.metaText}>Transportadora: {shipment.carrier}</Text>}
          {shipment.trackingNumber && <Text style={styles.metaText}>Guía: {shipment.trackingNumber}</Text>}
        </View>
      )}
    </View>
  );
}

const DOT_SIZE = 14;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  dotColumn: {
    alignItems: 'center',
    width: DOT_SIZE + spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
    borderWidth: 2,
    borderColor: colors.line,
  },
  dotDone: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  dotCurrent: {
    backgroundColor: colors.card,
    borderColor: colors.roseDeepHover,
  },
  dotDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: spacing.lg,
    backgroundColor: colors.line,
  },
  lineDone: {
    backgroundColor: colors.sage,
  },
  textColumn: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  labelPending: {
    color: colors.inkDim,
    fontWeight: '400',
  },
  date: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
    marginTop: 2,
  },
  meta: {
    marginTop: spacing.xs,
    gap: 2,
  },
  metaText: {
    fontSize: fontSizes.xs,
    color: colors.inkDim,
  },
});
