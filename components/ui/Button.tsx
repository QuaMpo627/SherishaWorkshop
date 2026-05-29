import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth,
  iconLeft,
  iconRight,
  style,
}: Props) {
  const palette = getPalette(variant);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {iconLeft}
          <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
            {label}
          </Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

function getPalette(v: Variant) {
  switch (v) {
    case 'primary':
      return { bg: colors.primary, border: colors.primary, text: '#fff' };
    case 'secondary':
      return { bg: colors.surfaceElevated, border: colors.border, text: colors.textPrimary };
    case 'ghost':
      return { bg: 'transparent', border: 'transparent', text: colors.primary };
    case 'danger':
      return { bg: colors.danger, border: colors.danger, text: '#fff' };
  }
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
  },
});
