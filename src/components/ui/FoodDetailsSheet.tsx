import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { MealFood } from '@/types';
import { PrimaryButton } from './PrimaryButton';
import { getFoodPrimaryClass } from '@/services/nutritionService';

interface FoodDetailsSheetProps {
  visible: boolean;
  food: MealFood | null;
  onClose: () => void;
  onSubstitute: (food: MealFood) => void;
  onRemove: (food: MealFood) => void;
  onEditQuantity: (food: MealFood, newQuantity: string) => void;
}

export function FoodDetailsSheet({
  visible,
  food,
  onClose,
  onSubstitute,
  onRemove,
  onEditQuantity,
}: FoodDetailsSheetProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempQty, setTempQty] = useState('');

  // Reset temp state when modal opens
  React.useEffect(() => {
    if (visible && food) {
      setTempQty(food.quantity ?? '');
      setIsEditing(false);
    }
  }, [visible, food]);

  if (!food) return null;

  const primaryClass = getFoodPrimaryClass(food as any);
  
  // Format macros safely
  const cal = food.calories ?? 0;
  const pro = food.protein ?? 0;
  const car = food.carbs ?? 0;
  const fat = food.fat ?? 0;

  const handleSaveQuantity = () => {
    onEditQuantity(food, tempQty);
    setIsEditing(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: spacing['4xl'] }]}>
            
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.headlineMedium, { color: colors.primaryText }]} numberOfLines={2}>
                  {food.name}
                </Text>
                <Text style={[typography.labelSmall, { color: colors.primary, marginTop: 4 }]}>
                  FONTE PRINCIPAL: {primaryClass}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            {/* Quantity */}
            <View style={[styles.quantitySection, { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadows.sm }]}>
              <Text style={[typography.labelMedium, { color: colors.secondaryText, marginBottom: spacing.sm }]}>
                QUANTIDADE ATUAL
              </Text>
              
              {isEditing ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={[styles.input, { color: colors.primaryText, backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md }]}
                    value={tempQty}
                    onChangeText={setTempQty}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <Text style={[typography.bodyLarge, { color: colors.secondaryText, marginHorizontal: spacing.sm }]}>
                    {food.unit || 'g'}
                  </Text>
                  <TouchableOpacity onPress={handleSaveQuantity} style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}>
                    <Text style={[typography.labelMedium, { color: colors.white }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.qtyRow}>
                  <Text style={[typography.displaySmall, { color: colors.primary }]}>
                    {food.quantity}
                    <Text style={[typography.headlineMedium, { color: colors.secondaryText }]}> {food.unit || 'g'}</Text>
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={[typography.labelMedium, { color: colors.primary }]}>Editar quantidade</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Nutrition Details */}
            <View style={[styles.nutritionSection, { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadows.sm }]}>
              <Text style={[typography.labelMedium, { color: colors.secondaryText, marginBottom: spacing.md }]}>
                VALORES NUTRICIONAIS ({food.quantity}{food.unit || 'g'})
              </Text>
              
              <View style={styles.macroGrid}>
                <View style={styles.macroBox}>
                  <Text style={[typography.headlineMedium, { color: colors.primaryText }]}>{Math.round(cal)}</Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>kcal</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>{car.toFixed(1)}g</Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>carbo</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>{pro.toFixed(1)}g</Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>prot</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>{fat.toFixed(1)}g</Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>gord</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <PrimaryButton 
                title="Substituir alimento" 
                onPress={() => onSubstitute(food)}
                variant="filled"
                icon={<Ionicons name="swap-horizontal" size={20} color={colors.white} />}
              />
              <View style={{ height: spacing.md }} />
              <PrimaryButton 
                title="Remover da refeição" 
                onPress={() => onRemove(food)}
                variant="outline"
                icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
                textColor={colors.error}
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  quantitySection: {
    padding: 16,
    marginBottom: 16,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  saveBtn: {
    height: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionSection: {
    padding: 16,
    marginBottom: 24,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBox: {
    alignItems: 'center',
  },
  actions: {
    marginTop: 8,
  },
});
