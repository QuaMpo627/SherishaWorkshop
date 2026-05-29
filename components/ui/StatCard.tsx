import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  value: string | number;
  delta?: number;
  unit?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  tint?: string;
}

export function StatCard({ label, value, delta, unit, icon, tint = colors.primary }: Props) {
  const showDelta = typeof delta === 'number';
  const positive = (delta ?? 0) >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: tint + '22' }]}>
            <MaterialCommunityIcons name={icon} size={18} color={tint} />
          </View>
        ) : null}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {showDelta ? (
        <View style={styles.deltaRow}>
          <MaterialCommunityIcons
            name={positive ? 'arrow-up-bold' : 'arrow-down-bold'}
            size={14}
            color={positive ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.deltaText,
              { color: positive ? colors.success : colors.danger },
            ]}
          >
            {positive ? '+' : ''}
            {delta} vs last week
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  deltaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
