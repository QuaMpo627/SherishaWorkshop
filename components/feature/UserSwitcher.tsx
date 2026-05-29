import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { MOCK_USERS } from '@/constants/config';
import { useOrders } from '@/hooks/useOrders';
import { RolePill } from '@/components/ui/RolePill';

export function UserSwitcher() {
  const { user, setUser } = useOrders();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Signed in as</Text>
          <Text style={styles.name}>{user.name}</Text>
        </View>
        <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Switch role</Text>
            <Text style={styles.sheetSubtitle}>Invite-only demo · choose a workspace seat</Text>

            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {MOCK_USERS.map((u) => {
                const active = u.id === user.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => {
                      setUser(u.id);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      active && { borderColor: colors.primary },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.smallAvatar}>
                      <Text style={styles.avatarText}>{u.name.slice(0, 1)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{u.name}</Text>
                      <View style={{ marginTop: 4 }}>
                        <RolePill role={u.role} />
                      </View>
                    </View>
                    {active ? (
                      <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  greeting: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  name: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
