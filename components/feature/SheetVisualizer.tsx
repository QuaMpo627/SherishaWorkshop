import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  estimatedSheets: number;
  totalPieces: number;
  totalAreaCm2: number;
}

export function SheetVisualizer({ estimatedSheets, totalPieces, totalAreaCm2 }: Props) {
  const sheetsToShow = Math.max(1, Math.min(estimatedSheets, 6));
  const sheetAreaM2 = ((1.2 * 2.4)).toFixed(2);
  const totalAreaM2 = (totalAreaCm2 / 10000).toFixed(2);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>Material estimation</Text>
        <Text style={styles.muted}>120×240 cm sheet</Text>
      </View>

      <View style={styles.bigRow}>
        <Text style={styles.bigValue}>{estimatedSheets}</Text>
        <Text style={styles.bigUnit}>sheets</Text>
      </View>

      <View style={styles.sheetsRow}>
        {Array.from({ length: sheetsToShow }).map((_, i) => (
          <View key={i} style={styles.sheet}>
            <View style={styles.sheetGrid} />
          </View>
        ))}
        {estimatedSheets > 6 ? (
          <View style={[styles.sheet, styles.sheetMore]}>
            <Text style={styles.moreText}>+{estimatedSheets - 6}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statsGrid}>
        <Stat label="Total pieces" value={`${totalPieces}`} />
        <Stat label="Cut area" value={`${totalAreaM2} m²`} />
        <Stat label="Sheet area" value={`${sheetAreaM2} m²`} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  muted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  bigValue: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -1,
  },
  bigUnit: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sheetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sheet: {
    width: 44,
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sheetGrid: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: colors.primary + '55',
    borderStyle: 'dashed',
    borderRadius: 2,
  },
  sheetMore: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  moreText: {
    ...typography.micro,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
