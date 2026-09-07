// ==========================================
// CutTrack — Pure Calculation Functions
// ==========================================

import type { WeightRecord, MealLog, ChartDataPoint, Food, MealFood, NutritionInfo, SubstitutionCriterion } from '@/types';

/**
 * Calculate total weight loss from initial weight to current.
 * Positive = lost weight; negative = gained weight.
 */
export function calculateWeightLoss(initialWeight: number, currentWeight: number): number {
  return Number((initialWeight - currentWeight).toFixed(1));
}

/**
 * Calculate remaining weight to reach goal.
 * Positive = still need to lose; negative = already past goal.
 */
export function calculateRemainingWeight(currentWeight: number, goalWeight: number): number {
  return Number((currentWeight - goalWeight).toFixed(1));
}

/**
 * Calculate goal progress as 0-1.
 * Formula: (initialWeight - currentWeight) / (initialWeight - goalWeight)
 */
export function calculateGoalProgress(
  initialWeight: number,
  currentWeight: number,
  goalWeight: number,
): number {
  const totalToLose = initialWeight - goalWeight;
  if (totalToLose <= 0) return 0;
  
  const lost = initialWeight - currentWeight;
  const progress = lost / totalToLose;
  
  return Math.max(0, Math.min(1, progress));
}

/**
 * Calculate weight change between two records.
 * Positive = gained; negative = lost.
 */
export function calculateWeightChange(previousWeight: number, currentWeight: number): number {
  return Number((currentWeight - previousWeight).toFixed(1));
}

/**
 * Calculate weekly average weight loss from records.
 */
export function calculateWeeklyAverage(records: WeightRecord[]): number | null {
  if (records.length < 2) return null;

  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  const firstDate = new Date(sorted[0].recordedAt);
  const lastDate = new Date(sorted[sorted.length - 1].recordedAt);
  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 1) return null;

  const weightDiff = sorted[0].weight - sorted[sorted.length - 1].weight;
  const weeks = daysDiff / 7;
  
  if (weeks < 0.5) return null;

  return weightDiff / weeks;
}

/**
 * Calculate 7-day moving average for weight records.
 */
export function calculateMovingAverage(
  records: WeightRecord[],
  windowDays: number = 7,
): ChartDataPoint[] {
  if (records.length === 0) return [];

  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  const result: ChartDataPoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].recordedAt);
    const windowStart = new Date(currentDate);
    windowStart.setDate(windowStart.getDate() - windowDays + 1);

    const windowRecords = sorted.filter((r) => {
      const date = new Date(r.recordedAt);
      return date >= windowStart && date <= currentDate;
    });

    const avg = windowRecords.reduce((sum, r) => sum + r.weight, 0) / windowRecords.length;

    result.push({
      date: sorted[i].recordedAt,
      value: Number(avg.toFixed(1)),
    });
  }

  return result;
}

/**
 * Calculate weight change over last N days.
 */
export function calculatePeriodChange(
  records: WeightRecord[],
  days: number,
): number | null {
  if (records.length < 2) return null;

  const sorted = [...records].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recent = sorted[0];
  const older = sorted.find((r) => new Date(r.recordedAt) <= cutoff);

  if (!older) return null;

  return Number((recent.weight - older.weight).toFixed(1));
}

/**
 * Calculate adherence metrics.
 */
export function calculateAdherence(
  logs: MealLog[],
  totalMealsPerDay: number,
  daysToCheck: number = 7,
): { daysCompleted: number; daysTotal: number; daysPercentage: number; mealsCompleted: number; mealsTotal: number; mealsPercentage: number } {
  const today = new Date();
  const dates: string[] = [];

  for (let i = 0; i < daysToCheck; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  let daysCompleted = 0;
  let mealsCompleted = 0;
  const mealsTotal = daysToCheck * totalMealsPerDay;

  for (const date of dates) {
    const dayLogs = logs.filter((l) => l.date === date);
    const completedInDay = dayLogs.filter((l) => l.completed).length;
    mealsCompleted += completedInDay;

    if (completedInDay >= totalMealsPerDay) {
      daysCompleted++;
    }
  }

  return {
    daysCompleted,
    daysTotal: daysToCheck,
    daysPercentage: daysToCheck > 0 ? Math.round((daysCompleted / daysToCheck) * 100) : 0,
    mealsCompleted,
    mealsTotal,
    mealsPercentage: mealsTotal > 0 ? Math.round((mealsCompleted / mealsTotal) * 100) : 0,
  };
}

/**
 * Get lowest weight from records.
 */
export function getLowestWeight(records: WeightRecord[]): number | null {
  if (records.length === 0) return null;
  return Math.min(...records.map((r) => r.weight));
}

/**
 * Get highest weight from records.
 */
export function getHighestWeight(records: WeightRecord[]): number | null {
  if (records.length === 0) return null;
  return Math.max(...records.map((r) => r.weight));
}

/**
 * Format weight with one decimal place.
 */
export function formatWeight(weight: number, unit: string = 'kg'): string {
  return `${weight.toFixed(1)} ${unit}`;
}

/**
 * Format weight change with sign.
 */
export function formatWeightChange(change: number, unit: string = 'kg'): string {
  const sign = change > 0 ? '+' : change < 0 ? '' : '';
  return `${sign}${change.toFixed(1)} ${unit}`;
}

/**
 * Format a percentage.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

// ==========================================
// CutTrack V2 — Nutrition Calculations
// ==========================================

/**
 * Calculate nutrition for a specific quantity based on food reference values.
 * Uses rule of three (proportion) from per-100g values.
 */
export function calculateNutritionForQuantity(
  food: Food,
  quantity: number,
): NutritionInfo {
  const factor = quantity / 100;
  return {
    calories: (food.calories ?? 0) * factor,
    protein: (food.protein ?? 0) * factor,
    carbs: (food.carbs ?? 0) * factor,
    fat: (food.fat ?? 0) * factor,
  };
}

/**
 * Calculate equivalent quantity of target food based on original food and criterion.
 * Used for food substitution (e.g., "how much chicken equals 150g of beef in protein?").
 */
export function calculateEquivalentQuantity(
  originalFood: Food,
  originalQuantity: number,
  targetFood: Food,
  criterion: SubstitutionCriterion = 'calories',
): number | null {
  const originalNutrition = calculateNutritionForQuantity(originalFood, originalQuantity);
  const targetNutritionPer100g = {
    calories: targetFood.calories ?? 0,
    protein: targetFood.protein ?? 0,
    carbs: targetFood.carbs ?? 0,
    fat: targetFood.fat ?? 0,
  };

  const originalValue = originalNutrition[criterion];
  const targetPerUnit = targetNutritionPer100g[criterion];

  // If the target food has 0 of this nutrient, it's mathematically impossible to substitute
  // based on this criterion without requiring an infinite amount of food.
  if (!targetPerUnit || targetPerUnit <= 0) return null;

  return (originalValue / targetPerUnit) * 100;
}

/**
 * Calculate total nutrition for a list of meal foods.
 */
export function calculateMealTotals(foods: MealFood[]): NutritionInfo {
  return foods.reduce(
    (totals, food) => ({
      calories: totals.calories + (food.calories ?? 0),
      protein: totals.protein + (food.protein ?? 0),
      carbs: totals.carbs + (food.carbs ?? 0),
      fat: totals.fat + (food.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/**
 * Calculate total nutrition for all meals in a diet.
 */
export function calculateDietTotals(
  meals: Array<{ foods: MealFood[] }>,
): NutritionInfo {
  return meals.reduce(
    (totals, meal) => {
      const mealTotals = calculateMealTotals(meal.foods);
      return {
        calories: totals.calories + mealTotals.calories,
        protein: totals.protein + mealTotals.protein,
        carbs: totals.carbs + mealTotals.carbs,
        fat: totals.fat + mealTotals.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/**
 * Calculate BMI (Body Mass Index).
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI category in Portuguese.
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidade';
}

/**
 * Calculate basal metabolic rate (BMR) using Mifflin-St Jeor equation.
 * weight in kg, height in cm, age in years.
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' = 'male',
): number {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

/**
 * Format nutrition value with appropriate unit.
 */
export function formatNutrition(value: number, type: 'calories' | 'macros'): string {
  if (type === 'calories') {
    return `${Math.round(value)} kcal`;
  }
  return `${value.toFixed(1)}g`;
}
