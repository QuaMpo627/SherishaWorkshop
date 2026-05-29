// Powered by OnSpace.AI
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useOrders } from '@/hooks/useOrders';
import { useWeeklyReport } from '@/hooks/useWeeklyReport';
import { OrderCard } from '@/components/feature/OrderCard';
import { StatCard } from '@/components/ui/StatCard';
import { UserSwitcher } from '@/components/feature/UserSwitcher';
import { EmptyState } from '@/components/feature/EmptyState';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'In Queue' },
  { key: 'done', label: 'Done' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user, currentWeekOrders, loading } = useOrders();
  const report = useWeeklyReport();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const base = [...currentWeekOrders].sort((a, b) => a.createdAt - b.createdAt);
    if (filter === 'all') return base;
    return base.filter((o) => o.status === filter);
  }, [currentWeekOrders, filter]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg }}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.kicker}>Sherisha Workshop</Text>
                <Text style={styles.title}>This Week</Text>
                <Text style={styles.weekLabel}>
                  {report.currentWeek.label}  ·  Fri → Thu cycle
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/new')}
                style={({ pressed }) => [styles.quickFab, pressed && { opacity: 0.85 }]}
              >
                <MaterialCommunityIcons name="plus" size={22} color="#fff" />
              </Pressable>
            </View>

            <UserSwitcher />

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard
                label="Plates this week"
                value={report.platesThisWeek}
                unit="sheets"
                delta={report.delta}
                icon="layers-triple-outline"
                tint={colors.primary}
              />
              <StatCard
                label="Orders"
                value={report.ordersThisWeek}
                icon="clipboard-list-outline"
                tint={colors.accent}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                label="Completed"
                value={report.completed}
                icon="check-circle-outline"
                tint={colors.success}
              />
              <StatCard
                label="In Queue"
                value={report.pending}
                icon="progress-clock"
                tint={colors.warning}
              />
            </View>

            {/* Filter chips */}
            <View style={styles.queueHeader}>
              <Text style={styles.sectionTitle}>Active Queue</Text>
              <Text style={styles.sectionMeta}>
                {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm }}
            >
              {FILTERS.map((f) => {
                const selected = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected ? styles.chipSelected : styles.chipDefault,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selected ? '#fff' : colors.textSecondary },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted }}>Loading workshop…</Text>
            </View>
          ) : (
            <View style={{ marginTop: spacing.lg }}>
              <EmptyState
                imageSource={require('@/assets/images/empty-orders.png')}
                title="No orders this week"
                subtitle={
                  user.role === 'external'
                    ? 'Submit your first request and the workshop will start cutting.'
                    : 'Cycle is fresh. Tap + to log the first order of the week.'
                }
              />
            </View>
          )
        }
        renderItem={({ item }) => <OrderCard order={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  weekLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  quickFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  sectionMeta: {
    ...typography.caption,
    color: colors.textMuted,
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
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
});
