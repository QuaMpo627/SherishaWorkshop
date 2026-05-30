import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Order } from '@/services/types';
import { StatusPill } from '@/components/ui/StatusPill';
import { ExecutionFiles } from '@/components/feature/ExecutionFiles';
import { totalPieces } from '@/services/nestingService';

interface Props {
  order: Order;
  selected: boolean;
  onToggleSelect: () => void;
  onAddFile: () => void;
  onRemoveFile: (fileId: string) => void;
}

export function ManagerOrderRow({
  order,
  selected,
  onToggleSelect,
  onAddFile,
  onRemoveFile,
}: Props) {
  const router = useRouter();
  const sheets = order.actualSheets ?? order.estimatedSheets;
  const pieces = totalPieces(order.shapes);

  return (
    <Pressable
      onPress={onToggleSelect}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.checkbox, selected && styles.checkboxOn]}>
          {selected ? (
            <MaterialCommunityIcons name="check" size={14} color="#fff" />
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {order.name}
        </Text>
        <StatusPill status={order.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons
            name="layers-triple"
            size={13}
            color={colors.textMuted}
          />
          <Text style={styles.metaText}>{order.thickness}</Text>
        </View>
        <View style={styles.metaDot} />
        <Text style={styles.metaText}>{pieces} pcs</Text>
        <View style={styles.metaDot} />
        <View style={styles.sheetsBadge}>
          <Text style={styles.sheetsBadgeNum}>{sheets}</Text>
          <Text style={styles.sheetsBadgeLabel}>
            {order.actualSheets != null ? 'actual' : 'est'} sheets
          </Text>
        </View>
      </View>

      <ExecutionFiles
        files={order.executionFiles ?? []}
        canEdit
        onAdd={onAddFile}
        onRemove={onRemoveFile}
        compact
      />

      <Pressable
        onPress={() => router.push(`/order/${order.id}`)}
        hitSlop={8}
        style={({ pressed }) => [styles.viewLink, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.viewLinkText}>View order details</Text>
        <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  title: {
    flex: 1,
    ...typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  sheetsBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetsBadgeNum: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 14,
  },
  sheetsBadgeLabel: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 10,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  viewLinkText: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.primary,
  },
});
