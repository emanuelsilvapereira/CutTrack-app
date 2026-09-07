import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useMealEditor } from '@/hooks/useMealEditor';
import { useFood } from '@/hooks/useFood';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FoodSelector } from '@/components/ui/FoodSelector';
import { FoodEditor } from '@/components/ui/FoodEditor';
import type { Food } from '@/types';
import { calculateNutritionForQuantity } from '@/utils/calculations';

export default function EditMealScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = parseInt(id || '0');

  const {
    meal,
    foods,
    loading,
    totalNutrition,
    loadMeal,
    addFood,
    removeFood,
    saveMeal,
  } = useMealEditor(mealId);

  const { addFood: createFood } = useFood();

  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [saving, setSaving] = useState(false);

  // Modals state
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [showFoodEditor, setShowFoodEditor] = useState(false);

  // Quantity modal state
  const [foodToSpecifyQuantity, setFoodToSpecifyQuantity] = useState<Food | null>(null);
  const [quantityInput, setQuantityInput] = useState('100');

  useEffect(() => {
    if (mealId) {
      loadMeal(mealId);
    }
  }, [mealId, loadMeal]);

  useEffect(() => {
    if (meal) {
      setMealName(meal.name);
      setMealTime(meal.time);
    }
  }, [meal]);

  const handleSave = async () => {
    if (!mealName.trim() || !mealId) return;

    try {
      setSaving(true);
      const { mealRepository } = await import('@/database/repositories');
      await mealRepository.update(mealId, {
        name: mealName.trim(),
        time: mealTime,
      });
      await saveMeal(mealId);
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a refeição.');
      console.error('EditMeal error:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    setShowFoodSelector(false);
    setQuantityInput(food.defaultUnit === 'g' || food.defaultUnit === 'ml' ? '100' : '1');
    setFoodToSpecifyQuantity(food);
  };

  const handleConfirmQuantity = () => {
    if (!foodToSpecifyQuantity) return;
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Quantidade inválida', 'Por favor, insira uma quantidade válida.');
      return;
    }
    
    addFood(foodToSpecifyQuantity, qty);
    setFoodToSpecifyQuantity(null);
  };

  const handleCreateCustomFood = async (data: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newFood = await createFood(data as Omit<Food, 'id' | 'createdAt' | 'updatedAt' | 'isUserCreated'>);
      setShowFoodEditor(false);
      handleSelectFood(newFood);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar o alimento.');
    }
  };

  if (loading && !meal) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Refeição',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Dados da refeição */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Nome da Refeição</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
              placeholder="Ex: Almoço"
              placeholderTextColor={colors.muted}
              value={mealName}
              onChangeText={setMealName}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>Horário</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
              placeholder="12:00"
              placeholderTextColor={colors.muted}
              value={mealTime}
              onChangeText={setMealTime}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Resumo nutricional */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.primaryText }]}>Total da Refeição</Text>
            <View style={styles.summaryRow}>
              <SummaryItem label="Calorias" value={`${Math.round(totalNutrition.calories)} kcal`} color={colors.primary} />
              <SummaryItem label="Proteína" value={`${totalNutrition.protein.toFixed(1)}g`} color={colors.success} />
              <SummaryItem label="Carbos" value={`${totalNutrition.carbs.toFixed(1)}g`} color={colors.warning} />
              <SummaryItem label="Gordura" value={`${totalNutrition.fat.toFixed(1)}g`} color={colors.error} />
            </View>
          </View>

          {/* Lista de alimentos */}
          <View style={styles.foodsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Alimentos ({foods.length})</Text>
            </View>

            {foods.map((food, index) => (
              <View
                key={`${food.id || 'new'}-${index}`}
                style={[styles.foodItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.foodInfo}>
                  <Text style={[styles.foodName, { color: colors.primaryText }]}>{food.name}</Text>
                  <Text style={[styles.foodQty, { color: colors.secondaryText }]}>
                    {food.quantity} {food.unit}
                  </Text>
                  <View style={styles.foodMacros}>
                    <Text style={[styles.foodMacro, { color: colors.primary }]}>
                      {Math.round(food.calories)} kcal
                    </Text>
                    <Text style={[styles.foodMacro, { color: colors.success }]}>
                      P: {food.protein.toFixed(1)}g
                    </Text>
                    <Text style={[styles.foodMacro, { color: colors.warning }]}>
                      C: {food.carbs.toFixed(1)}g
                    </Text>
                    <Text style={[styles.foodMacro, { color: colors.error }]}>
                      G: {food.fat.toFixed(1)}g
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => removeFood(index)}
                  style={[styles.removeButton, { backgroundColor: colors.error }]}
                >
                  <Text style={[styles.removeText, { color: colors.white }]}>×</Text>
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={() => setShowFoodSelector(true)}
              style={[styles.addFoodButton, { borderColor: colors.primary }]}
            >
              <Text style={[styles.addFoodText, { color: colors.primary }]}>+ Adicionar Alimento</Text>
            </Pressable>
          </View>

          <PrimaryButton
            title="Salvar Alterações"
            onPress={handleSave}
            disabled={!mealName.trim() || saving}
            loading={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>

      {/* Modals */}
      <FoodSelector
        visible={showFoodSelector}
        onClose={() => setShowFoodSelector(false)}
        onSelect={handleSelectFood}
        onCreateNew={() => {
          setShowFoodSelector(false);
          setShowFoodEditor(true);
        }}
      />

      <FoodEditor
        visible={showFoodEditor}
        onClose={() => setShowFoodEditor(false)}
        onSave={handleCreateCustomFood}
      />

      {/* Quantity Modal */}
      <Modal
        visible={!!foodToSpecifyQuantity}
        transparent
        animationType="fade"
        onRequestClose={() => setFoodToSpecifyQuantity(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.quantityModal, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.primaryText }]}>Quantidade</Text>
            <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
              {foodToSpecifyQuantity?.name}
            </Text>

            <View style={styles.quantityInputContainer}>
              <TextInput
                style={[styles.quantityInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.primaryText }]}
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
              />
              <Text style={[styles.quantityUnit, { color: colors.secondaryText }]}>
                {foodToSpecifyQuantity?.defaultUnit}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setFoodToSpecifyQuantity(null)}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '600' }}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirmQuantity}
              >
                <Text style={{ color: colors.white, fontWeight: '600' }}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  foodsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addFoodButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addFoodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  foodQty: {
    fontSize: 14,
    marginBottom: 8,
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  foodMacro: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  quantityModal: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  quantityInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  quantityUnit: {
    fontSize: 16,
    fontWeight: '600',
    width: 40,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
