import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface Props {
  steps: { key: string; label: string }[];
  current: number;
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <View style={styles.row}>
      {steps.map((s, i) => {
        const active = i === current;
        const completed = i < current;
        return (
          <View key={s.key} style={styles.segment}>
            <View
              style={[
                styles.bar,
                completed && { backgroundColor: colors.primary },
                active && { backgroundColor: colors.primary },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
  },
});
