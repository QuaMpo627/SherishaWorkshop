import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface Props extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ children, padded = true, elevated, style, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        padded && { padding: spacing.lg },
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
