import type { Food, SubstitutionCriterion, NutritionInfo } from '@/types';
import { calculateNutritionForQuantity } from '@/utils/calculations';

export type PrimaryClass = 'CARBOIDRATO' | 'PROTEÍNA' | 'GORDURA' | 'MISTO';

/**
 * Derives the primary nutritional class of a food based on caloric contribution.
 * Carbs = 4 kcal/g, Protein = 4 kcal/g, Fat = 9 kcal/g.
 */
export function getFoodPrimaryClass(food: Partial<Food>): PrimaryClass {
  const carbs = food.carbs ?? 0;
  const protein = food.protein ?? 0;
  const fat = food.fat ?? 0;

  const carbsKcal = carbs * 4;
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;

  const total = carbsKcal + proteinKcal + fatKcal;

  if (total === 0) return 'MISTO';

  // Find the max contributor
  if (carbsKcal > proteinKcal && carbsKcal > fatKcal) return 'CARBOIDRATO';
  if (proteinKcal > carbsKcal && proteinKcal > fatKcal) return 'PROTEÍNA';
  if (fatKcal > carbsKcal && fatKcal > proteinKcal) return 'GORDURA';

  return 'MISTO';
}

export interface ReplacementResult {
  originalNutrientAmount: number;
  replacementQuantity: number;
  replacementCalories: number;
  replacementProtein: number;
  replacementCarbs: number;
  replacementFat: number;
  criterion: SubstitutionCriterion;
}

/**
 * Calculates the exact quantity of a replacement food needed to match a specific nutritional criterion
 * of the original food, and returns all recalculated macros.
 */
export function calculateFoodReplacement(
  originalFood: Partial<Food>,
  originalQuantity: number,
  replacementFood: Partial<Food>,
  criterion: SubstitutionCriterion
): ReplacementResult | null {
  // We compute the nutrition for the original food at the specified quantity
  const factorOriginal = originalQuantity / 100;
  const originalCalories = (originalFood.calories ?? 0) * factorOriginal;
  const originalProtein = (originalFood.protein ?? 0) * factorOriginal;
  const originalCarbs = (originalFood.carbs ?? 0) * factorOriginal;
  const originalFat = (originalFood.fat ?? 0) * factorOriginal;

  const originalStats = {
    calories: originalCalories,
    protein: originalProtein,
    carbs: originalCarbs,
    fat: originalFat,
  };

  const originalNutrientAmount = originalStats[criterion];

  // We find how much of the criterion nutrient the replacement has per 100g
  const replacementStatsPer100g = {
    calories: replacementFood.calories ?? 0,
    protein: replacementFood.protein ?? 0,
    carbs: replacementFood.carbs ?? 0,
    fat: replacementFood.fat ?? 0,
  };

  const replacementPer100g = replacementStatsPer100g[criterion];

  // If replacement has 0 of that nutrient, mathematically impossible to match
  if (!replacementPer100g || replacementPer100g <= 0) {
    return null;
  }

  // Calculate replacement quantity
  const replacementQuantity = (originalNutrientAmount / replacementPer100g) * 100;

  // Calculate the new macros for the calculated quantity
  const replacementFactor = replacementQuantity / 100;
  const replacementCalories = (replacementFood.calories ?? 0) * replacementFactor;
  const replacementProtein = (replacementFood.protein ?? 0) * replacementFactor;
  const replacementCarbs = (replacementFood.carbs ?? 0) * replacementFactor;
  const replacementFat = (replacementFood.fat ?? 0) * replacementFactor;

  return {
    originalNutrientAmount,
    replacementQuantity,
    replacementCalories,
    replacementProtein,
    replacementCarbs,
    replacementFat,
    criterion,
  };
}
