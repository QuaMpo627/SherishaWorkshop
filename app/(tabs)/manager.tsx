// Powered by OnSpace.AI
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useOrders } from '@/hooks/useOrders';
import { useExecutionFiles } from '@/hooks/useExecutionFiles';
import { useAlert } from '@/template';
import { ManagerOrderRow } from '@/components/feature/ManagerOrderRow';
import { RolePill } from '@/components/ui/RolePill';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';
import { Order, OrderStatus, UserRole } from '@/services/types';
import { totalPieces } from '@/services/nestingService';

type FilterKey = 'all' | 'pending' | 'done';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'In Queue' },
  { key: 'done', label: 'Done' },
];

export default function ManagerScreen() {
  const { user, setUser, currentWeekOrders, bulkUpdateStatus } = useOrders();
  const { pickAndAttach, remove } = useExecutionFiles();
  const { showAlert } = useAlert();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Locked view for non-managers
  if (user.role !== 'manager') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.locked}>
          <View style={styles.lockBadge}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={36}
              color={colors.primary}
            />
          </View>
          <Text style={styles.lockedTitle}>Manager access only</Text>
          <Text style={styles.lockedSubtitle}>
            Switch to the Manager seat to triage all worker orders, override sheet
            counts, and attach execution files.
          </Text>
          <Button
            label="Switch to Manager seat"
            onPress={() => {
              setUser('u_manager');
              showAlert('Role switched', 'You are now signed in as Manager.');
            }}
            iconLeft={
              <MaterialCommunityIcons
                name="account-hard-hat"
                size={18}
                color="#fff"
              />
            }
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return currentWeekOrders;
    return currentWeekOrders.filter((o) => o.status === filter);
  }, [currentWeekOrders, filter]);

  const sections = useMemo(() => {
    const map = new Map<
      string,
      {
        userId: string;
        name: string;
        role: UserRole;
        orders: Order[];
      }
    >();
    filteredOrders.forEach((o) => {
      if (!map.has(o.userId)) {
        map.set(o.userId, {
          userId: o.userId,
          name: o.userName,
          role: o.userRole,
          orders: [],
        });
      }
      map.get(o.userId)!.orders.push(o);
    });
    return Array.from(map.values())
      .map((g) => ({
        ...g,
        title: g.name,
        data: g.orders.slice().sort((a, b) => a.createdAt - b.createdAt),
      }))
      .sort((a, b) => {
        const aPending = a.data.filter((o) => o.status === 'pending').length;
        const bPending = b.data.filter((o) => o.status === 'pending').length;
        if (aPending !== bPending) return bPending - aPending;
        return a.name.localeCompare(b.name);
      });
  }, [filteredOrders]);

  const stats = useMemo(() => {
    const pending = currentWeekOrders.filter((o) => o.status === 'pending').length;
    const done = currentWeekOrders.filter((o) => o.status === 'done').length;
    const totalPlates = currentWeekOrders.reduce(
      (s, o) => s + (o.actualSheets ?? o.estimatedSheets ?? 0),
      0,
    );
    const workers = new Set(currentWeekOrders.map((o) => o.userId)).size;
    const totalFiles = currentWeekOrders.reduce(
      (s, o) => s + (o.executionFiles?.length ?? 0),
      0,
    );
    return { pending, done, totalPlates, workers, totalFiles };
  }, [currentWeekOrders]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulk = (status: OrderStatus) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    bulkUpdateStatus(ids, status);
    showAlert(
      'Bulk update applied',
      `${ids.length} order${ids.length === 1 ? '' : 's'} marked as ${status === 'done' ? 'Done' : 'In Queue'}.`,
    );
    clearSelection();
  };

  const allFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selected.has(o.id));

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredOrders.forEach((o) => next.delete(o.id));
      } else {
        filteredOrders.forEach((o) => next.add(o.id));
      }
      return next;
    });
  };

  const toggleWorkerSelection = (orders: Order[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = orders.every((o) => next.has(o.id));
      orders.forEach((o) => {
        if (allOn) next.delete(o.id);
        else next.add(o.id);
      });
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <WorkerHeader
            name={section.name}
            role={section.role}
            orders={section.data}
            allSelected={section.data.every((o) => selected.has(o.id))}
            onSelectAll={() => toggleWorkerSelection(section.data)}
          />
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <ManagerOrderRow
              order={item}
              selected={selected.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onAddFile={() => pickAndAttach(item.id, item.name)}
              onRemoveFile={(fileId) => {
                const file = item.executionFiles?.find((f) => f.id === fileId);
                remove(item.id, fileId, file?.name);
              }}
            />
          </View>
        )}
        SectionSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Manager Console</Text>
                <Text style={styles.title}>Triage</Text>
                <Text style={styles.subtitle}>
                  All worker orders for this Friday-Thursday cycle, grouped by
                  submitter.
                </Text>
              </View>
              <View style={styles.managerBadge}>
                <MaterialCommunityIcons
                  name="account-hard-hat"
                  size={22}
                  color={colors.primary}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                label="In queue"
                value={stats.pending}
                icon="progress-clock"
                tint={colors.warning}
              />
              <StatCard
                label="Completed"
                value={stats.done}
                icon="check-circle-outline"
                tint={colors.success}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                label="Total plates"
                value={stats.totalPlates}
                unit="sheets"
                icon="layers-triple-outline"
                tint={colors.primary}
              />
              <StatCard
                label="Workers active"
                value={stats.workers}
                icon="account-group-outline"
                tint={colors.accent}
              />
            </View>

            {stats.totalFiles > 0 ? (
              <View style={styles.filesBanner}>
                <MaterialCommunityIcons
                  name="folder-multiple-outline"
                  size={16}
                  color={colors.accent}
                />
                <Text style={styles.filesBannerText}>
                  {stats.totalFiles} execution file
                  {stats.totalFiles === 1 ? '' : 's'} attached this week
                </Text>
              </View>
            ) : null}

            <View style={styles.filterRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: 'row',
                  gap: spacing.sm,
                  alignItems: 'center',
                }}
              >
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setFilter(f.key)}
                      style={({ pressed }) => [
                        styles.chip,
                        active ? styles.chipActive : styles.chipDefault,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? '#fff' : colors.textSecondary },
                        ]}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {filteredOrders.length > 0 ? (
                <Pressable
                  onPress={toggleSelectAllVisible}
                  hitSlop={8}
                  style={styles.selectAllBtn}
                >
                  <MaterialCommunityIcons
                    name={
                      allFilteredSelected
                        ? 'checkbox-multiple-marked-outline'
                        : 'checkbox-multiple-blank-outline'
                    }
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.selectAllText}>
                    {allFilteredSelected ? 'Deselect' : 'Select all'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Queue is empty"
            subtitle="No orders match this filter for the active cycle."
            imageSource={require('@/assets/images/empty-orders.png')}
          />
        }
      />

      {selected.size > 0 ? (
        <View style={styles.actionBar}>
          <View style={styles.actionBarLeft}>
            <Text style={styles.actionCount}>{selected.size}</Text>
            <Text style={styles.actionLabel}>
              {selected.size === 1 ? 'order' : 'orders'} selected
            </Text>
          </View>
          <View style={styles.actionBtns}>
            <Pressable
              onPress={() => handleBulk('done')}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnPrimary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color="#fff"
              />
              <Text style={styles.actionBtnText}>Mark Done</Text>
            </Pressable>
            <Pressable
              onPress={() => handleBulk('pending')}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnSecondary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <MaterialCommunityIcons
                name="restore"
                size={16}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.actionBtnText, { color: colors.textPrimary }]}
              >
                In Queue
              </Text>
            </Pressable>
            <Pressable
              onPress={clearSelection}
              hitSlop={8}
              style={styles.actionClose}
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function WorkerHeader({
  name,
  role,
  orders,
  allSelected,
  onSelectAll,
}: {
  name: string;
  role: UserRole;
  orders: Order[];
  allSelected: boolean;
  onSelectAll: () => void;
}) {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const done = orders.filter((o) => o.status === 'done').length;
  const plates = orders.reduce(
    (s, o) => s + (o.actualSheets ?? o.estimatedSheets ?? 0),
    0,
  );
  const pieces = orders.reduce((s, o) => s + totalPieces(o.shapes), 0);

  return (
    <View style={styles.workerHeader}>
      <View style={styles.workerAvatar}>
        <Text style={styles.workerAvatarText}>
          {name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.workerNameRow}>
          <Text style={styles.workerName} numberOfLines={1}>
            {name}
          </Text>
          <RolePill role={role} />
        </View>
        <Text style={styles.workerMeta}>
          {orders.length} orders · {pending} pending · {done} done · {plates}{' '}
          sheets · {pieces} pcs
        </Text>
      </View>
      <Pressable
        onPress={onSelectAll}
        hitSlop={8}
        style={styles.workerSelectAll}
      >
        <MaterialCommunityIcons
          name={
            allSelected
              ? 'checkbox-multiple-marked'
              : 'checkbox-multiple-blank-outline'
          }
          size={22}
          color={allSelected ? colors.primary : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 130,
  },
  itemWrap: {
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  kicker: {
    ...typography.micro,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  managerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filesBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  // Worker section header
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerAvatarText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  workerName: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  workerMeta: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 11,
  },
  workerSelectAll: {
    padding: 4,
  },

  // Locked view
  locked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  lockBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  lockedTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  lockedSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },

  // Floating bulk action bar
  actionBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
    gap: spacing.sm,
  },
  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  actionCount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    ...typography.bodyStrong,
    color: '#fff',
    fontSize: 13,
  },
  actionClose: {
    padding: spacing.sm,
  },
});
