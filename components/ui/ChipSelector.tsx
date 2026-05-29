import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}

export function ChipSelector({ options, value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
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
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  chip: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
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
