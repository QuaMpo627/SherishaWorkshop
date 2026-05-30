import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { ExecutionFile } from '@/services/types';

interface Props {
  files: ExecutionFile[];
  canEdit: boolean;
  onAdd?: () => void;
  onRemove?: (fileId: string) => void;
  compact?: boolean;
}

export function ExecutionFiles({ files, canEdit, onAdd, onRemove, compact }: Props) {
  if (compact) {
    return (
      <View style={styles.compactRow}>
        {files.map((f) => (
          <CompactChip
            key={f.id}
            file={f}
            canRemove={canEdit && !!onRemove}
            onRemove={() => onRemove?.(f.id)}
          />
        ))}
        {canEdit && onAdd ? (
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [styles.addChip, pressed && { opacity: 0.85 }]}
          >
            <MaterialCommunityIcons
              name="paperclip-plus"
              size={13}
              color={colors.primary}
            />
            <Text style={styles.addChipText}>
              {files.length === 0 ? 'Attach file' : 'Add'}
            </Text>
          </Pressable>
        ) : files.length === 0 ? (
          <View style={styles.emptyChip}>
            <MaterialCommunityIcons
              name="paperclip-off"
              size={12}
              color={colors.textMuted}
            />
            <Text style={styles.emptyChipText}>No execution files</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="folder-open-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.cardTitle}>Execution files</Text>
        </View>
        <Text style={styles.cardCount}>
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </Text>
      </View>

      {files.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="file-document-multiple-outline"
            size={28}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>No files attached</Text>
          <Text style={styles.emptySubtitle}>
            {canEdit
              ? 'Attach DXF, PDF or images produced on the floor.'
              : 'The manager has not uploaded execution files yet.'}
          </Text>
        </View>
      ) : (
        <View style={styles.fileList}>
          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              canRemove={canEdit && !!onRemove}
              onRemove={() => onRemove?.(f.id)}
            />
          ))}
        </View>
      )}

      {canEdit && onAdd ? (
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.attachBtn, pressed && { opacity: 0.85 }]}
        >
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.attachBtnText}>Upload execution file</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CompactChip({
  file,
  canRemove,
  onRemove,
}: {
  file: ExecutionFile;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <View style={styles.fileChip}>
      <MaterialCommunityIcons
        name={iconForMime(file.mimeType)}
        size={13}
        color={colors.primary}
      />
      <Text style={styles.fileChipName} numberOfLines={1}>
        {file.name}
      </Text>
      {canRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <MaterialCommunityIcons
            name="close-circle"
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function FileRow({
  file,
  canRemove,
  onRemove,
}: {
  file: ExecutionFile;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileIcon}>
        <MaterialCommunityIcons
          name={iconForMime(file.mimeType)}
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.fileMeta}>
          {formatFileSize(file.size)}
          {file.size ? ' · ' : ''}
          {formatRelative(file.addedAt)}
        </Text>
      </View>
      {canRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.fileRemove}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={colors.danger}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function iconForMime(mime?: string): any {
  if (!mime) return 'file-document-outline';
  if (mime.startsWith('image/')) return 'image-outline';
  if (mime === 'application/pdf') return 'file-pdf-box';
  if (mime.includes('zip')) return 'folder-zip-outline';
  if (mime.includes('dxf') || mime.includes('dwg') || mime.includes('cad'))
    return 'pencil-ruler';
  return 'file-document-outline';
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return 'just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

const styles = StyleSheet.create({
  // Compact mode
  compactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.sm,
    paddingRight: 6,
    paddingVertical: 4,
    maxWidth: 220,
  },
  fileChipName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    flexShrink: 1,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  addChipText: {
    ...typography.micro,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  emptyChipText: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 11,
  },

  // Full card mode
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  cardCount: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
  fileList: {
    gap: spacing.sm,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 14,
  },
  fileMeta: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  fileRemove: {
    padding: 4,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  attachBtnText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
