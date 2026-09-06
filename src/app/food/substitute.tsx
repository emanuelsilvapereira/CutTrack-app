import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useFood } from '@/hooks/useFood';
import { SearchInput } from '@/components/ui/SearchInput';
import { FoodCard } from '@/components/cards/FoodCard';
import { mealFoodRepository } from '@/database/repositories';
import type { Food, SubstitutionCriterion } from '@/types';
import { calculateEquivalentQuantity } from '@/utils/calculations';

export default function SubstituteFoodScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { mealFoodId, currentName, currentCalories, currentProtein, currentCarbs, currentFat } = useLocalSearchParams<{
    mealFoodId: string;
    currentName: string;
    currentCalories: string;
    currentProtein: string;
    currentCarbs: string;
    currentFat: string;
  }>();

  const { foods, search, loading } = useFood();

  const [searchQuery, setSearchQuery] = useState('');
  const [criterion, setCriterion] = useState<SubstitutionCriterion>('calories');
  const [substituting, setSubstituting] = useState(false);

  const currentFood = {
    id: 0,
    name: currentName || '',
    calories: (parseFloat(currentCalories || '0') || 0) as number,
    protein: (parseFloat(currentProtein || '0') || 0) as number,
    carbs: (parseFloat(currentCarbs || '0') || 0) as number,
    fat: (parseFloat(currentFat || '0') || 0) as number,
    defaultUnit: 'g',
    createdAt: '',
    updatedAt: '',
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      search(query);
    },
    [search],
  );

  const handleSubstitute = useCallback(
    async (targetFood: Food) => {
      if (!mealFoodId) return;

      try {
        setSubstituting(true);
        
        const equivalentQty = calculateEquivalentQuantity(
          currentFood,
          100,
          targetFood,
          criterion,
        );

        await mealFoodRepository.substitute(
          parseInt(mealFoodId),
          targetFood,
          equivalentQty,
          targetFood.defaultUnit,
        );

        Alert.alert('Sucesso', 'Alimento substituído com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível substituir o alimento.');
        console.error('Substitute error:', e);
      } finally {
        setSubstituting(false);
      }
    },
    [mealFoodId, currentFood, criterion, router],
  );

  const CRITERIA: { value: SubstitutionCriterion; label: string }[] = [
    { value: 'calories', label: 'Calorias' },
    { value: 'protein', label: 'Proteína' },
    { value: 'carbs', label: 'Carboidratos' },
    { value: 'fat', label: 'Gordura' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Substituir Alimento',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Alimento atual */}
        <View style={[styles.currentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.currentTitle, { color: colors.muted }]}>Alimento Atual</Text>
          <Text style={[styles.currentName, { color: colors.primary }]}>{currentFood.name}</Text>
          <View style={styles.currentMacros}>
            <Text style={[styles.currentMacro, { color: colors.secondaryText }]}>
              {Math.round(currentFood.calories)} kcal
            </Text>
            <Text style={[styles.currentMacro, { color: colors.secondaryText }]}>
              P: {(currentFood.protein ?? 0).toFixed(1)}g
            </Text>
            <Text style={[styles.currentMacro, { color: colors.secondaryText }]}>
              C: {(currentFood.carbs ?? 0).toFixed(1)}g
            </Text>
          </View>
        </View>

        {/* Critério de substituição */}
        <View style={styles.criteriaContainer}>
          <Text style={[styles.criteriaTitle, { color: colors.primaryText }]}>Substituir por:</Text>
          <View style={styles.criteriaRow}>
            {CRITERIA.map((c) => (
              <Pressable
                key={c.value}
                style={[
                  styles.criteriaButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  criterion === c.value && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setCriterion(c.value)}
              >
                <Text
                  style={[
                    styles.criteriaText,
                    { color: criterion === c.value ? colors.primary : colors.primaryText },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Busca */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Buscar alimento para substituir..."
            onSearch={handleSearch}
          />
        </View>

        {/* Lista de alternativas */}
        <FlatList
          data={foods}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.foodItem}>
              <FoodCard food={item} compact />
              <Pressable
                style={[styles.substituteButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSubstitute(item)}
                disabled={substituting}
              >
                <Text style={[styles.substituteText, { color: colors.white }]}>
                  Usar
                </Text>
              </Pressable>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {loading ? 'Carregando...' : 'Nenhum alimento encontrado'}
            </Text>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  currentName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  currentMacros: {
    flexDirection: 'row',
    gap: 16,
  },
  currentMacro: {
    fontSize: 14,
  },
  criteriaContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  criteriaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  criteriaButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  criteriaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  substituteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  substituteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});
