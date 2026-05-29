import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Order } from '@/services/types';
import { StatusPill } from '@/components/ui/StatusPill';
import { RolePill } from '@/components/ui/RolePill';
import { totalPieces } from '@/services/nestingService';
import { formatDateTime } from '@/services/weekService';

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  const router = useRouter();
  const sheets = order.actualSheets ?? order.estimatedSheets;
  const pieces = totalPieces(order.shapes);

  return (
    <Pressable
      onPress={() => router.push(`/order/${order.id}`)}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }], opacity: 0.95 }]}
    >
      <View style={styles.topRow}>
        <RolePill role={order.userRole} name={order.userName} />
        <StatusPill status={order.status} />
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {order.name}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="layers-triple" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{order.thickness}</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="shape" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{order.shapes.length} shape{order.shapes.length === 1 ? '' : 's'}</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="counter" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{pieces} pcs</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.sheets}>
          <Text style={styles.sheetsLabel}>
            {order.actualSheets != null ? 'Actual' : 'Est.'} sheets
          </Text>
          <Text style={styles.sheetsValue}>{sheets}</Text>
          <Text style={styles.sheetsHint}>120×240 cm</Text>
        </View>
        <View style={styles.timeWrap}>
          <Text style={styles.timeText}>{formatDateTime(order.createdAt)}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  sheets: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  sheetsLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  sheetsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  sheetsHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
