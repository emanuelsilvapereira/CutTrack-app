import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/theme';
import { useFood } from '@/hooks/useFood';
import { SearchInput } from '@/components/ui/SearchInput';
import { FoodCard } from '@/components/cards/FoodCard';
import { ReplacementComparisonSheet } from '@/components/ui/ReplacementComparisonSheet';
import { mealFoodRepository } from '@/database/repositories';
import type { Food, SubstitutionCriterion } from '@/types';
import { getFoodPrimaryClass, calculateFoodReplacement, type PrimaryClass, type ReplacementResult } from '@/services/nutritionService';

export default function SubstituteFoodScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const router = useRouter();
  
  const { mealFoodId, currentName, currentCalories, currentProtein, currentCarbs, currentFat, currentQuantity } = useLocalSearchParams<{
    mealFoodId: string;
    currentName: string;
    currentCalories: string;
    currentProtein: string;
    currentCarbs: string;
    currentFat: string;
    currentQuantity: string;
  }>();

  const { foods, search, loading } = useFood();

  const [searchQuery, setSearchQuery] = useState('');
  const [criterion, setCriterion] = useState<SubstitutionCriterion>('calories');
  const [substituting, setSubstituting] = useState(false);
  const [activeTab, setActiveTab] = useState<PrimaryClass | 'TODOS'>('TODOS');
  
  // Sheet states
  const [comparisonVisible, setComparisonVisible] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Food | null>(null);
  const [replacementResult, setReplacementResult] = useState<ReplacementResult | null>(null);

  const currentFood = useMemo(() => ({
    id: 0,
    name: currentName || '',
    calories: parseFloat(currentCalories || '0') || 0,
    protein: parseFloat(currentProtein || '0') || 0,
    carbs: parseFloat(currentCarbs || '0') || 0,
    fat: parseFloat(currentFat || '0') || 0,
    defaultUnit: 'g',
    createdAt: '',
    updatedAt: '',
  } as Food), [currentName, currentCalories, currentProtein, currentCarbs, currentFat]);

  const originalQty = parseFloat(currentQuantity?.replace(',', '.') || '100');

  // Detect initial class to set the active tab
  useEffect(() => {
    const pClass = getFoodPrimaryClass(currentFood);
    setActiveTab(pClass);
    
    // Set default criterion based on primary class
    if (pClass === 'CARBOIDRATO') setCriterion('carbs');
    else if (pClass === 'PROTEÍNA') setCriterion('protein');
    else if (pClass === 'GORDURA') setCriterion('fat');
    else setCriterion('calories');
  }, [currentFood]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      search(query);
    },
    [search],
  );

  const handleSelectSubstitute = useCallback(
    (targetFood: Food) => {
      if (!mealFoodId) return;

      const result = calculateFoodReplacement(
        currentFood,
        originalQty,
        targetFood,
        criterion,
      );

      if (result === null) {
        Alert.alert('Erro', `O alimento "${targetFood.name}" possui 0 g/kcal de ${criterion}, não é possível usar este critério.`);
        return;
      }

      setSelectedTarget(targetFood);
      setReplacementResult(result);
      setComparisonVisible(true);
    },
    [mealFoodId, currentFood, originalQty, criterion],
  );

  const confirmSubstitution = useCallback(async () => {
    if (!mealFoodId || !selectedTarget || !replacementResult) return;

    try {
      setSubstituting(true);
      await mealFoodRepository.applySubstitution(
        parseInt(mealFoodId),
        selectedTarget.id,
        replacementResult.replacementQuantity,
      );

      setComparisonVisible(false);
      Alert.alert('Sucesso', 'Alimento substituído com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível substituir o alimento.');
      console.error('Substitute error:', e);
      setSubstituting(false);
    }
  }, [mealFoodId, selectedTarget, replacementResult, router]);

  const filteredFoods = useMemo(() => {
    if (activeTab === 'TODOS') return foods;
    return foods.filter(f => getFoodPrimaryClass(f) === activeTab);
  }, [foods, activeTab]);

  const CRITERIA: { value: SubstitutionCriterion; label: string }[] = [
    { value: 'calories', label: 'Calorias' },
    { value: 'protein', label: 'Proteína' },
    { value: 'carbs', label: 'Carboidratos' },
    { value: 'fat', label: 'Gordura' },
  ];

  const TABS: { value: PrimaryClass | 'TODOS'; label: string }[] = [
    { value: 'CARBOIDRATO', label: 'CARBOS' },
    { value: 'PROTEÍNA', label: 'PROTEÍNAS' },
    { value: 'GORDURA', label: 'GORDURAS' },
    { value: 'TODOS', label: 'TODOS' },
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
        
        {/* Critério de substituição */}
        <View style={styles.criteriaContainer}>
          <Text style={[styles.criteriaTitle, { color: colors.primaryText }]}>Objetivo de Equivalência:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.criteriaRow}>
            {CRITERIA.map((c) => (
              <Pressable
                key={c.value}
                style={[
                  styles.criteriaButton,
                  { backgroundColor: colors.surface, borderColor: colors.borderLight },
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
          </ScrollView>
        </View>

        {/* Busca */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Buscar alimento para substituir..."
            onSearch={handleSearch}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable
                key={t.value}
                style={[
                  styles.tabButton,
                  activeTab === t.value && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
                ]}
                onPress={() => setActiveTab(t.value)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === t.value ? colors.primary : colors.secondaryText },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Lista de alternativas */}
        <FlatList
          data={filteredFoods}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.foodItem}>
              <FoodCard food={item} compact />
              <Pressable
                style={[styles.substituteButton, { backgroundColor: colors.primary, opacity: substituting ? 0.7 : 1 }]}
                onPress={() => handleSelectSubstitute(item)}
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
              {loading ? 'Carregando...' : 'Nenhum alimento encontrado nesta categoria.'}
            </Text>
          }
        />

        <ReplacementComparisonSheet
          visible={comparisonVisible}
          originalFood={{ name: currentFood.name, quantity: originalQty }}
          targetFood={selectedTarget}
          result={replacementResult}
          onConfirm={confirmSubstitution}
          onCancel={() => setComparisonVisible(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  criteriaContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  criteriaRow: {
    gap: 8,
    paddingRight: 16,
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 24,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
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
