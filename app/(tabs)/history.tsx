// Powered by OnSpace.AI
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/feature/OrderCard';
import { EmptyState } from '@/components/feature/EmptyState';
import { weekKeyFromDate } from '@/services/weekService';

export default function HistoryScreen() {
  const { archivedOrders, loading } = useOrders();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof archivedOrders>();
    archivedOrders
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((order) => {
        const key = order.weekKey || weekKeyFromDate(new Date(order.createdAt));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(order);
      });
    return Array.from(map.entries());
  }, [archivedOrders]);

  const [openWeek, setOpenWeek] = useState<string | null>(grouped[0]?.[0] ?? null);

  const totalPlates = (orders: typeof archivedOrders) =>
    orders.reduce((s, o) => s + (o.actualSheets ?? o.estimatedSheets ?? 0), 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Archive</Text>
        <Text style={styles.title}>Past Cycles</Text>
        <Text style={styles.subtitle}>
          Auto-archived every Thursday at 23:59. Tap a week to expand its orders.
        </Text>

        {loading ? null : grouped.length === 0 ? (
          <View style={{ marginTop: spacing.xl }}>
            <EmptyState
              title="No archived weeks yet"
              subtitle="Once a Friday→Thursday cycle ends, completed work moves here."
              imageSource={require('@/assets/images/empty-orders.png')}
            />
          </View>
        ) : (
          <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
            {grouped.map(([key, orders]) => {
              const open = openWeek === key;
              const completed = orders.filter((o) => o.status === 'done').length;
              return (
                <View key={key} style={styles.weekCard}>
                  <Pressable
                    onPress={() => setOpenWeek(open ? null : key)}
                    style={styles.weekHeader}
                  >
                    <View style={styles.weekBadge}>
                      <MaterialCommunityIcons
                        name="calendar-week"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekKey}>{key}</Text>
                      <Text style={styles.weekMeta}>
                        {orders.length} orders · {completed} done · {totalPlates(orders)} plates
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>

                  {open ? (
                    <View style={styles.weekBody}>
                      {orders.map((o) => (
                        <OrderCard key={o.id} order={o} />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    marginTop: 6,
    lineHeight: 20,
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  weekBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekKey: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  weekMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weekBody: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
