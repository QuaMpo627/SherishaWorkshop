import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Dimension, Shape } from '@/services/types';

interface Props {
  shape: Shape;
  index: number;
  onChange: (next: Shape) => void;
  onRemove?: () => void;
}

export function ShapeEditor({ shape, index, onChange, onRemove }: Props) {
  const updateDim = (id: string, patch: Partial<Dimension>) => {
    onChange({
      ...shape,
      dimensions: shape.dimensions.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  };

  const addDim = () => {
    onChange({
      ...shape,
      dimensions: [
        ...shape.dimensions,
        { id: `d_${Date.now().toString(36)}`, width: 0, height: 0, quantity: 1 },
      ],
    });
  };

  const removeDim = (id: string) => {
    if (shape.dimensions.length === 1) return;
    onChange({
      ...shape,
      dimensions: shape.dimensions.filter((d) => d.id !== id),
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <Text style={styles.title}>Shape {index + 1}</Text>
        {onRemove ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>

      <Pressable style={styles.imageDrop}>
        <MaterialCommunityIcons name="image-plus" size={26} color={colors.textMuted} />
        <Text style={styles.dropHint}>Sketch / image upload (optional)</Text>
      </Pressable>

      <Text style={styles.subtitle}>Dimensions</Text>

      {shape.dimensions.map((dim, i) => (
        <View key={dim.id} style={styles.dimRow}>
          <Text style={styles.dimIndex}>#{i + 1}</Text>
          <DimField
            label="W cm"
            value={dim.width}
            onChange={(v) => updateDim(dim.id, { width: v })}
          />
          <Text style={styles.timesSign}>×</Text>
          <DimField
            label="H cm"
            value={dim.height}
            onChange={(v) => updateDim(dim.id, { height: v })}
          />
          <DimField
            label="Qty"
            value={dim.quantity}
            onChange={(v) => updateDim(dim.id, { quantity: v })}
            highlight
          />
          {shape.dimensions.length > 1 ? (
            <Pressable onPress={() => removeDim(dim.id)} hitSlop={8} style={{ paddingLeft: 4 }}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      ))}

      <Pressable
        onPress={addDim}
        style={({ pressed }) => [styles.addDim, pressed && { opacity: 0.85 }]}
      >
        <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
        <Text style={styles.addDimText}>Add dimensions</Text>
      </Pressable>
    </View>
  );
}

interface DimFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  highlight?: boolean;
}

function DimField({ label, value, onChange, highlight }: DimFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value ? String(value) : ''}
        onChangeText={(t) => {
          const num = parseFloat(t.replace(',', '.'));
          onChange(isNaN(num) ? 0 : num);
        }}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        style={[styles.fieldInput, highlight && styles.fieldHighlight]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    ...typography.heading,
    color: colors.textPrimary,
  },
  imageDrop: {
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dropHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  dimIndex: {
    ...typography.caption,
    color: colors.textMuted,
    width: 22,
    paddingBottom: spacing.md,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },
  timesSign: {
    fontSize: 18,
    color: colors.textMuted,
    paddingBottom: spacing.md,
  },
  addDim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  addDimText: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 14,
  },
});
