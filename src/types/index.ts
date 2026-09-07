// ==========================================
// CutTrack — Core Types
// ==========================================

export type UserGoal = 'loss' | 'maintain' | 'gain';

export const USER_GOAL_LABELS: Record<UserGoal, string> = {
  loss: 'Perder peso',
  maintain: 'Manter peso',
  gain: 'Ganhar peso',
};

export interface User {
  id: number;
  name: string;
  initialWeight: number;
  goalWeight: number;
  weightUnit: 'kg' | 'lb';
  measurementUnit: 'cm' | 'in';
  height: number | null;
  birthDate: string | null;
  goal: UserGoal;
  calorieTarget: number | null;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface WeightRecord {
  id: number;
  userId: number;
  weight: number;
  recordedAt: string; // YYYY-MM-DD
  createdAt: string;
}

export interface BodyMeasurement {
  id: number;
  userId: number;
  type: MeasurementType;
  value: number;
  unit: string;
  recordedAt: string; // YYYY-MM-DD
  createdAt: string;
}

export type MeasurementType = 
  | 'waist'
  | 'chest'
  | 'arm'
  | 'thigh'
  | 'hip'
  | 'custom';

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  waist: 'Cintura',
  chest: 'Peito',
  arm: 'Braço',
  thigh: 'Coxa',
  hip: 'Quadril',
  custom: 'Personalizada',
};

export interface Food {
  id: number;
  name: string;
  category: string | null;
  source: string | null;
  sourceId: string | null;
  sourceVersion: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  defaultUnit: string;
  isUserCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Diet {
  id: number;
  userId: number;
  name: string;
  calories: number | null;
  notes: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  createdAt: string;
}

export interface Meal {
  id: number;
  dietId: number;
  name: string;
  time: string; // HH:mm
  order: number;
  createdAt: string;
}

export interface MealFood {
  id: number;
  mealId: number;
  name: string;
  quantity: string | null;
  unit: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  foodId: number | null;
  caloriesSnapshot: number | null;
  proteinSnapshot: number | null;
  carbsSnapshot: number | null;
  fatSnapshot: number | null;
}

export interface FoodSubstitution {
  id: number;
  mealFoodId: number;
  alternativeFoodId: number;
  quantity: number | null;
  unit: string | null;
  createdAt: string;
}

export interface DietChangeLog {
  id: number;
  dietId: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface MealLog {
  id: number;
  mealId: number;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null;
}

export interface MealWithFoods extends Meal {
  foods: MealFood[];
}

export interface MealWithStatus extends Meal {
  foods: MealFood[];
  log: MealLog | null;
}

export interface DietWithMeals extends Diet {
  meals: MealWithFoods[];
}

export interface WeightStats {
  current: number | null;
  initial: number;
  goal: number;
  totalLoss: number;
  remaining: number;
  progress: number; // 0-1
  weeklyAverage: number | null;
  lowestWeight: number | null;
  highestWeight: number | null;
  weeklyChange: number | null;
}

export interface AdherenceStats {
  daysTotal: number;
  daysCompleted: number;
  daysPercentage: number;
  mealsTotal: number;
  mealsCompleted: number;
  mealsPercentage: number;
}

export type TimeFilter = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface Note {
  id: number;
  userId: number;
  content: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type SubstitutionCriterion = 'calories' | 'protein' | 'carbs' | 'fat';
