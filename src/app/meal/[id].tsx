import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { getDatabase } from '@/database/database';
import { FoodDetailsSheet } from '@/components/ui/FoodDetailsSheet';
import { mealFoodRepository, mealLogRepository } from '@/database/repositories';
import { getLocalDateString, formatTime } from '@/utils/dates';
import type { Meal, MealFood, MealLog } from '@/types';

export default function MealDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, radius, shadows } = useTheme();

  const [meal, setMeal] = useState<(Meal & { foods: MealFood[] }) | null>(null);
  const [log, setLog] = useState<MealLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  
  // Sheet states
  const [selectedFood, setSelectedFood] = useState<MealFood | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const today = getLocalDateString();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const mealId = parseInt(id, 10);
      
      const mealRow = await db.getFirstAsync<Meal>(
        `SELECT * FROM meals WHERE id = ?`,
        mealId,
      );

      if (mealRow) {
        const foods = await db.getAllAsync<MealFood>(
          `SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC`,
          mealId,
        );
        setMeal({ ...mealRow, foods });

        const logRow = await mealLogRepository.getByMealAndDate(mealId, today);
        setLog(logRow);
      }
    } catch (e) {
      console.error('Load meal error:', e);
    } finally {
      setLoading(false);
    }
  }, [id, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async () => {
    if (!meal) return;
    try {
      setToggling(true);
      const newLog = await mealLogRepository.toggleMeal(meal.id, today);
      setLog(newLog);
    } catch (e) {
      console.error('Toggle meal error:', e);
    } finally {
      setToggling(false);
    }
  };

  const handleFoodPress = (food: MealFood) => {
    setSelectedFood(food);
    setSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setSelectedFood(null);
  };

  const handleRemoveFood = async (food: MealFood) => {
    try {
      await mealFoodRepository.removeFood(food.id);
      handleCloseSheet();
      await loadData();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover o alimento.');
    }
  };

  const handleEditQuantity = async (food: MealFood, newQuantity: string) => {
    try {
      await mealFoodRepository.updateQuantity(food.id, newQuantity);
      handleCloseSheet();
      await loadData();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível atualizar a quantidade.');
    }
  };

  const handleSubstituteFood = (food: MealFood) => {
    handleCloseSheet();
    router.push({
      pathname: '/food/substitute',
      params: {
        mealFoodId: food.id,
        currentName: food.name,
        currentCalories: food.calories,
        currentProtein: food.protein,
        currentCarbs: food.carbs,
        currentFat: food.fat,
        currentQuantity: food.quantity,
      },
    });
  };

  if (loading) {
    return <LoadingState fullScreen />;
  }

  if (!meal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[typography.bodyLarge, { color: colors.secondaryText, textAlign: 'center', marginTop: 100 }]}>
          Refeição não encontrada.
        </Text>
      </View>
    );
  }

  const isCompleted = log?.completed ?? false;
  const totalCalories = meal.foods.reduce((sum, f) => sum + (f.calories ?? 0), 0);
  const totalProtein = meal.foods.reduce((sum, f) => sum + (f.protein ?? 0), 0);
  const totalCarbs = meal.foods.reduce((sum, f) => sum + (f.carbs ?? 0), 0);
  const totalFat = meal.foods.reduce((sum, f) => sum + (f.fat ?? 0), 0);
  const hasNutrition = totalCalories > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['5xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
            <Text style={[typography.titleLarge, { color: colors.primaryText, marginLeft: spacing.sm }]}>
              {meal.name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time & status */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'] }}>
          <Text style={[typography.bodyMedium, { color: colors.secondaryText }]}>
            {formatTime(meal.time)}
          </Text>

          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: colors.successLight, borderRadius: radius.sm, marginTop: spacing.md }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[typography.labelMedium, { color: colors.success, marginLeft: 4 }]}>
                Refeição concluída
              </Text>
            </View>
          )}
        </View>

        {/* Foods list */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
          {meal.foods.map((food) => (
            <TouchableOpacity
              key={food.id}
              onPress={() => handleFoodPress(food)}
              activeOpacity={0.7}
              style={[
                styles.foodRow,
                {
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.foodInfo}>
                {food.quantity && (
                  <Text style={[typography.titleMedium, { color: colors.primary, marginRight: spacing.sm, minWidth: 50 }]}>
                    {food.quantity}{food.unit ? ` ${food.unit}` : ''}
                  </Text>
                )}
                <Text style={[typography.bodyLarge, { color: colors.primaryText, flex: 1 }]}>
                  {food.name}
                </Text>
              </View>
              <View style={styles.foodRight}>
                {food.calories && (
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>
                    {food.calories} kcal
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.muted} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nutrition summary */}
        {hasNutrition && (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['3xl'] }}>
            <Text style={[typography.labelSmall, { color: colors.muted, marginBottom: spacing.md }]}>
              INFORMAÇÕES NUTRICIONAIS
            </Text>
            <View style={[styles.nutritionCard, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, ...shadows.sm }]}>
              <View style={styles.nutritionMain}>
                <Text style={[typography.numberMedium, { color: colors.primaryText }]}>
                  {totalCalories}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.secondaryText }]}>
                  kcal
                </Text>
              </View>
              <View style={[styles.macrosRow, { marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.lg }]}>
                <View style={styles.macroItem}>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
                    {totalProtein.toFixed(0)}g
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>proteína</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
                    {totalCarbs.toFixed(0)}g
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>carboidratos</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[typography.titleMedium, { color: colors.primaryText }]}>
                    {totalFat.toFixed(0)}g
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.muted }]}>gordura</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Toggle button */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['4xl'] }}>
          <PrimaryButton
            title={isCompleted ? 'Refeição concluída ✓' : 'Marcar como concluída'}
            onPress={handleToggle}
            loading={toggling}
            variant={isCompleted ? 'outline' : 'filled'}
          />
          {isCompleted && (
            <Text
              style={[
                typography.bodySmall,
                { color: colors.secondaryText, textAlign: 'center', marginTop: spacing.md },
              ]}
            >
              Toque para desfazer
            </Text>
          )}
        </View>
      </ScrollView>

      <FoodDetailsSheet
        visible={sheetVisible}
        food={selectedFood}
        onClose={handleCloseSheet}
        onRemove={handleRemoveFood}
        onEditQuantity={handleEditQuantity}
        onSubstitute={handleSubstituteFood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionCard: {},
  nutritionMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
});
