// Powered by OnSpace.AI
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { StatusPill } from '@/components/ui/StatusPill';
import { RolePill } from '@/components/ui/RolePill';
import { SheetVisualizer } from '@/components/feature/SheetVisualizer';
import { Button } from '@/components/ui/Button';
import { totalAreaCm2, totalPieces } from '@/services/nestingService';
import { formatDateTime } from '@/services/weekService';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { orders, updateStatus, setActualSheets, deleteOrder, user } = useOrders();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const [actualInput, setActualInput] = useState(
    order?.actualSheets != null ? String(order.actualSheets) : '',
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Order not found</Text>
          <Text style={styles.notFoundText}>This order may have been deleted.</Text>
          <Button label="Back to Workshop" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const isManager = user.role === 'manager';
  const isOwner = user.id === order.userId;
  const canEdit = isManager || isOwner;

  const pieces = totalPieces(order.shapes);
  const area = totalAreaCm2(order.shapes);
  const sheetsToShow = order.actualSheets ?? order.estimatedSheets;

  const toggleStatus = () => {
    const next = order.status === 'done' ? 'pending' : 'done';
    updateStatus(order.id, next);
    showAlert(
      'Status updated',
      `Marked as ${next === 'done' ? 'Done' : 'In Queue'}.`,
    );
  };

  const saveActual = () => {
    const num = parseInt(actualInput, 10);
    if (isNaN(num) || num < 0) {
      showAlert('Invalid number', 'Enter a non-negative whole number of sheets.');
      return;
    }
    setActualSheets(order.id, num);
    showAlert('Manager override saved', `Actual plates set to ${num}.`);
  };

  const askDelete = () => {
    showAlert(
      'Delete order?',
      `${order.name} will be removed permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteOrder(order.id);
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topPills}>
            <RolePill role={order.userRole} name={order.userName} />
            <StatusPill status={order.status} />
          </View>

          <Text style={styles.title}>{order.name}</Text>
          <Text style={styles.subtitle}>
            Submitted {formatDateTime(order.createdAt)} · Cycle {order.weekKey}
          </Text>

          <View style={styles.metaGrid}>
            <MetaTile icon="layers-triple" label="Thickness" value={order.thickness} />
            <MetaTile icon="shape" label="Shapes" value={`${order.shapes.length}`} />
            <MetaTile icon="counter" label="Pieces" value={`${pieces}`} />
          </View>

          {order.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>Notes from {order.userName}</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          ) : null}

          <SheetVisualizer
            estimatedSheets={sheetsToShow}
            totalPieces={pieces}
            totalAreaCm2={area}
          />

          {/* Manager override */}
          {isManager ? (
            <View style={styles.managerCard}>
              <View style={styles.managerHeader}>
                <MaterialCommunityIcons name="account-hard-hat" size={18} color={colors.primary} />
                <Text style={styles.managerTitle}>Manager override</Text>
              </View>
              <Text style={styles.managerHint}>
                Set the actual number of plates used on the floor.
              </Text>
              <View style={styles.overrideRow}>
                <TextInput
                  value={actualInput}
                  onChangeText={setActualInput}
                  keyboardType="number-pad"
                  placeholder={`${order.estimatedSheets}`}
                  placeholderTextColor={colors.textMuted}
                  style={styles.overrideInput}
                />
                <Button label="Save" onPress={saveActual} style={{ flex: 1 }} />
              </View>
            </View>
          ) : null}

          {/* Shapes list */}
          <Text style={styles.sectionTitle}>Shapes & dimensions</Text>
          <View style={{ gap: spacing.md }}>
            {order.shapes.map((shape, i) => (
              <View key={shape.id} style={styles.shapeCard}>
                <View style={styles.shapeHeader}>
                  <View style={styles.shapeBadge}>
                    <Text style={styles.shapeBadgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.shapeTitle}>Shape {i + 1}</Text>
                  <Text style={styles.shapeMeta}>
                    {shape.dimensions.reduce((s, d) => s + d.quantity, 0)} pcs
                  </Text>
                </View>
                <View style={styles.dimList}>
                  {shape.dimensions.map((d, idx) => (
                    <View key={d.id} style={styles.dimChip}>
                      <Text style={styles.dimChipText}>
                        {d.width} × {d.height} cm
                      </Text>
                      <View style={styles.dimQty}>
                        <Text style={styles.dimQtyText}>×{d.quantity}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Actions */}
          {canEdit ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              <Button
                label={order.status === 'done' ? 'Move back to queue' : 'Mark as Done'}
                onPress={toggleStatus}
                variant={order.status === 'done' ? 'secondary' : 'primary'}
                fullWidth
                iconLeft={
                  <MaterialCommunityIcons
                    name={order.status === 'done' ? 'restore' : 'check-circle'}
                    size={18}
                    color={order.status === 'done' ? colors.textPrimary : '#fff'}
                  />
                }
              />
              <Pressable onPress={askDelete} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
                <Text style={styles.deleteText}>Delete order</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaTile}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
      <Text style={styles.metaTileLabel}>{label}</Text>
      <Text style={styles.metaTileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  metaTileLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metaTileValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: spacing.md,
  },
  notesLabel: {
    ...typography.micro,
    color: colors.accent,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  managerCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  managerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  managerTitle: {
    ...typography.heading,
    color: colors.primary,
  },
  managerHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  overrideRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  overrideInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  shapeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  shapeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shapeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeBadgeText: {
    ...typography.micro,
    color: colors.primary,
  },
  shapeTitle: {
    flex: 1,
    ...typography.heading,
    color: colors.textPrimary,
  },
  shapeMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dimList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dimChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dimChipText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  dimQty: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  dimQtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  deleteText: {
    ...typography.bodyStrong,
    color: colors.danger,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  notFoundTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
