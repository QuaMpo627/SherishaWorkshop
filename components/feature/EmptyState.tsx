import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  imageSource?: any;
}

export function EmptyState({ title, subtitle, imageSource }: Props) {
  return (
    <View style={styles.wrap}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  image: {
    width: 180,
    height: 140,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
});
