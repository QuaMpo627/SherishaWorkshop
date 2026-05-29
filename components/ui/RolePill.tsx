import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { UserRole } from '@/services/types';

const MAP: Record<UserRole, { label: string; bg: string; fg: string }> = {
  manager: { label: 'MANAGER', bg: colors.primarySoft, fg: colors.primary },
  internal: { label: 'INTERNAL', bg: colors.internalSoft, fg: colors.internal },
  external: { label: 'EXTERNAL', bg: colors.externalSoft, fg: colors.external },
};

export function RolePill({ role, name }: { role: UserRole; name?: string }) {
  const cfg = MAP[role];
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.fg }]}>{cfg.label}</Text>
      {name ? <Text style={[styles.name, { color: cfg.fg }]}>· {name}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    gap: 4,
  },
  label: {
    ...typography.micro,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
  },
});
