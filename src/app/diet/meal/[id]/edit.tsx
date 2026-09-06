import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useMealEditor, MealEditorFood } from '@/hooks/useMealEditor';
import { useFood } from '@/hooks/useFood';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { FoodCard } from '@/components/cards/FoodCard';
import type { Food } from '@/types';

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

  const { foods: availableFoods, search: searchFoods } = useFood();

  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      searchFoods(query);
    },
    [searchFoods],
  );

  const handleAddFood = useCallback(
    (food: Food) => {
      addFood(food, 100);
      setShowFoodSearch(false);
      setSearchQuery('');
    },
    [addFood],
  );

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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Dados da refeição */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>Nome</Text>
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
            <Pressable onPress={() => setShowFoodSearch(!showFoodSearch)}>
              <Text style={[styles.addButton, { color: colors.primary }]}>
                {showFoodSearch ? 'Cancelar' : '+ Adicionar'}
              </Text>
            </Pressable>
          </View>

          {/* Busca de alimentos */}
          {showFoodSearch && (
            <View style={styles.searchContainer}>
              <SearchInput
                placeholder="Buscar alimento..."
                value={searchQuery}
                onChangeText={handleSearch}
                onSearch={handleSearch}
              />
              <View style={styles.foodResults}>
                {availableFoods.slice(0, 5).map((food) => (
                  <Pressable key={food.id} onPress={() => handleAddFood(food)}>
                    <FoodCard food={food} compact />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Alimentos na refeição */}
          {foods.map((food, index) => (
            <View
              key={`${food.id}-${index}`}
              style={[styles.foodItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.foodInfo}>
                <Text style={[styles.foodName, { color: colors.primaryText }]}>{food.name}</Text>
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
        </View>

        <PrimaryButton
          title="Salvar Alterações"
          onPress={handleSave}
          disabled={!mealName.trim() || saving}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
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
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
  },
  foodResults: {
    marginTop: 8,
    gap: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  foodMacro: {
    fontSize: 12,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 8,
  },
});
