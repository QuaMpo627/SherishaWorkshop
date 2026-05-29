// Powered by OnSpace.AI
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { THICKNESS_OPTIONS } from '@/constants/config';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { ShapeEditor } from '@/components/feature/ShapeEditor';
import { SheetVisualizer } from '@/components/feature/SheetVisualizer';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { Shape } from '@/services/types';
import { genId } from '@/services/orderService';
import { estimateSheets, totalAreaCm2, totalPieces } from '@/services/nestingService';

const STEPS = [
  { key: 'info', label: 'Info' },
  { key: 'shapes', label: 'Shapes' },
  { key: 'review', label: 'Review' },
];

export default function NewOrderScreen() {
  const router = useRouter();
  const { createOrder, user } = useOrders();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [thickness, setThickness] = useState(THICKNESS_OPTIONS[3]);
  const [notes, setNotes] = useState('');
  const [shapes, setShapes] = useState<Shape[]>([buildShape()]);

  const estimated = useMemo(() => estimateSheets(shapes), [shapes]);
  const pieces = useMemo(() => totalPieces(shapes), [shapes]);
  const area = useMemo(() => totalAreaCm2(shapes), [shapes]);

  const updateShape = (index: number, next: Shape) => {
    setShapes((prev) => prev.map((s, i) => (i === index ? next : s)));
  };

  const addShape = () => setShapes((prev) => [...prev, buildShape()]);

  const removeShape = (index: number) => {
    if (shapes.length === 1) return;
    setShapes((prev) => prev.filter((_, i) => i !== index));
  };

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0 && thickness;
    if (step === 1) {
      return shapes.every((s) =>
        s.dimensions.every((d) => d.width > 0 && d.height > 0 && d.quantity > 0),
      );
    }
    return true;
  };

  const next = () => {
    if (!canAdvance()) {
      showAlert(
        'Missing details',
        step === 0
          ? 'Please add an order name and pick a material thickness.'
          : 'Each dimension needs width, height and quantity greater than zero.',
      );
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    const order = createOrder({ name, thickness, notes, shapes });
    showAlert(
      'Order submitted',
      `${order.name} added to this week's queue. Estimated ${order.estimatedSheets} sheet(s).`,
      [
        {
          text: 'View order',
          onPress: () => router.replace(`/order/${order.id}`),
        },
        {
          text: 'Back to dashboard',
          style: 'cancel',
          onPress: () => {
            resetForm();
            router.replace('/');
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setStep(0);
    setName('');
    setThickness(THICKNESS_OPTIONS[3]);
    setNotes('');
    setShapes([buildShape()]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Step {step + 1} of {STEPS.length}</Text>
            <Text style={styles.title}>{STEPS[step].label}</Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <StepIndicator steps={STEPS} current={step} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 0 ? (
            <View style={{ gap: spacing.lg }}>
              <FieldGroup label="Order / Project Name">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Salon Cabinet Doors"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </FieldGroup>

              <FieldGroup label="Material Thickness">
                <ChipSelector
                  options={THICKNESS_OPTIONS}
                  value={thickness}
                  onChange={setThickness}
                />
              </FieldGroup>

              <FieldGroup label="Notes (optional)">
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Anything the workshop should know"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={[styles.input, styles.textarea]}
                />
              </FieldGroup>

              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="information-outline" size={18} color={colors.accent} />
                <Text style={styles.tipText}>
                  Logged as <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{user.name}</Text>. Switch role from the dashboard if needed.
                </Text>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={{ gap: spacing.lg }}>
              {shapes.map((shape, i) => (
                <ShapeEditor
                  key={shape.id}
                  shape={shape}
                  index={i}
                  onChange={(next) => updateShape(i, next)}
                  onRemove={shapes.length > 1 ? () => removeShape(i) : undefined}
                />
              ))}

              <Pressable
                onPress={addShape}
                style={({ pressed }) => [styles.addShape, pressed && { opacity: 0.85 }]}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color={colors.primary} />
                <Text style={styles.addShapeText}>Add new shape</Text>
              </Pressable>

              <SheetVisualizer
                estimatedSheets={estimated}
                totalPieces={pieces}
                totalAreaCm2={area}
              />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={{ gap: spacing.lg }}>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewKicker}>Order summary</Text>
                <Text style={styles.reviewTitle}>{name || 'Untitled order'}</Text>
                <View style={styles.reviewMetaRow}>
                  <ReviewMeta icon="layers-triple" label={thickness} />
                  <ReviewMeta icon="shape" label={`${shapes.length} shape${shapes.length === 1 ? '' : 's'}`} />
                  <ReviewMeta icon="counter" label={`${pieces} pcs`} />
                </View>
                {notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{notes}</Text>
                  </View>
                ) : null}
              </View>

              <SheetVisualizer
                estimatedSheets={estimated}
                totalPieces={pieces}
                totalAreaCm2={area}
              />

              <View style={styles.shapeList}>
                {shapes.map((shape, i) => (
                  <View key={shape.id} style={styles.shapeSummary}>
                    <Text style={styles.shapeSummaryTitle}>Shape {i + 1}</Text>
                    {shape.dimensions.map((d, j) => (
                      <Text key={d.id} style={styles.shapeSummaryLine}>
                        {j + 1}. {d.width} × {d.height} cm  ·  ×{d.quantity}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <Button label="Back" variant="secondary" onPress={back} style={{ flex: 1 }} />
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button label="Continue" onPress={next} style={{ flex: 2 }} />
          ) : (
            <Button label="Submit Order" onPress={submit} style={{ flex: 2 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function buildShape(): Shape {
  return {
    id: genId('sh'),
    dimensions: [{ id: genId('d'), width: 0, height: 0, quantity: 1 }],
  };
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={{ marginTop: 6 }}>{children}</View>
    </View>
  );
}

function ReviewMeta({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.reviewMeta}>
      <MaterialCommunityIcons name={icon} size={14} color={colors.primary} />
      <Text style={styles.reviewMetaText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  kicker: {
    ...typography.micro,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tipText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addShape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
  addShapeText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  reviewKicker: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  reviewTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: 4,
  },
  reviewMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  reviewMetaText: {
    ...typography.caption,
    color: colors.primary,
  },
  notesBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  shapeList: {
    gap: spacing.md,
  },
  shapeSummary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  shapeSummaryTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  shapeSummaryLine: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
