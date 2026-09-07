import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { Food, SubstitutionCriterion } from '@/types';
import { PrimaryButton } from './PrimaryButton';
import type { ReplacementResult } from '@/services/nutritionService';

interface ReplacementComparisonSheetProps {
  visible: boolean;
  originalFood: { name: string; quantity: number };
  targetFood: Food | null;
  result: ReplacementResult | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const CRITERION_LABELS: Record<SubstitutionCriterion, string> = {
  calories: 'calorias',
  protein: 'proteína',
  carbs: 'carboidratos',
  fat: 'gorduras',
};

export function ReplacementComparisonSheet({
  visible,
  originalFood,
  targetFood,
  result,
  onConfirm,
  onCancel,
}: ReplacementComparisonSheetProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();

  if (!targetFood || !result) return null;

  const targetQty = result.replacementQuantity;
  // If it's a very exact number, we show 1 decimal
  const displayQty = targetQty % 1 === 0 ? targetQty.toFixed(0) : targetQty.toFixed(1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onCancel}
      >
        <TouchableWithoutFeedback>
          <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: spacing['4xl'] }]}>
            
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.header}>
              <Text style={[typography.headlineMedium, { color: colors.primaryText }]}>
                Confirmar Substituição
              </Text>
              <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.comparisonContainer}>
              {/* ORIGINAL */}
              <View style={[styles.foodCard, { backgroundColor: colors.surface, borderColor: colors.borderLight, borderRadius: radius.md }]}>
                <Text style={[typography.labelSmall, { color: colors.secondaryText, marginBottom: 4 }]}>ATUAL</Text>
                <Text style={[typography.titleMedium, { color: colors.primaryText }]} numberOfLines={1}>
                  {originalFood.name}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.primary, marginTop: 2 }]}>
                  {originalFood.quantity} g
                </Text>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={24} color={colors.primary} />
              </View>

              {/* NEW */}
              <View style={[styles.foodCard, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1, borderRadius: radius.md, ...shadows.sm }]}>
                <Text style={[typography.labelSmall, { color: colors.primary, marginBottom: 4 }]}>NOVO</Text>
                <Text style={[typography.titleMedium, { color: colors.primaryText }]} numberOfLines={1}>
                  {targetFood.name}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.primary, marginTop: 2, fontWeight: '700' }]}>
                  ≈ {displayQty} {targetFood.defaultUnit || 'g'}
                </Text>
              </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
              <Text style={[typography.bodyMedium, { color: colors.primaryText, textAlign: 'center' }]}>
                Quantidade calculada para aproximar o teor de <Text style={{ fontWeight: '700' }}>{CRITERION_LABELS[result.criterion]}</Text> ({result.originalNutrientAmount.toFixed(1)}{result.criterion === 'calories' ? ' kcal' : 'g'}).
              </Text>
            </View>

            <View style={styles.actions}>
              <PrimaryButton 
                title="Confirmar substituição" 
                onPress={onConfirm}
                variant="filled"
              />
              <View style={{ height: spacing.sm }} />
              <PrimaryButton 
                title="Cancelar" 
                onPress={onCancel}
                variant="outline"
              />
            </View>

          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  comparisonContainer: {
    marginBottom: 16,
  },
  foodCard: {
    padding: 16,
    borderWidth: 1,
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  infoBox: {
    padding: 16,
    marginBottom: 24,
  },
  actions: {
    marginTop: 8,
  },
});
