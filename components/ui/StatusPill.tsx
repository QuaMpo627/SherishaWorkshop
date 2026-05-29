import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { OrderStatus } from '@/services/types';

export function StatusPill({ status }: { status: OrderStatus }) {
  const isDone = status === 'done';
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: isDone ? colors.doneSoft : colors.pendingSoft },
      ]}
    >
      <MaterialCommunityIcons
        name={isDone ? 'check-circle' : 'progress-clock'}
        size={12}
        color={isDone ? colors.done : colors.pending}
      />
      <Text style={[styles.text, { color: isDone ? colors.done : colors.pending }]}>
        {isDone ? 'Done' : 'In Queue'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.micro,
    textTransform: 'uppercase',
  },
});
