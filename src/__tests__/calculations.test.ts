import { describe, expect, test } from '@jest/globals';
import {
  calculateWeightLoss,
  calculateRemainingWeight,
  calculateGoalProgress,
  calculateWeightChange,
  calculateWeeklyAverage,
  calculateMovingAverage,
  calculatePeriodChange,
  calculateAdherence,
  getLowestWeight,
  getHighestWeight,
  formatWeight,
  formatWeightChange,
  formatPercentage,
  calculateNutritionForQuantity,
  calculateEquivalentQuantity,
  calculateMealTotals,
  calculateDietTotals,
  calculateBMI,
  getBMICategory,
  calculateBMR,
  formatNutrition,
} from '../utils/calculations';
import type { WeightRecord, MealLog, Food, MealFood } from '../types';

// Helper to create a WeightRecord
function makeWeight(weight: number, date: string): WeightRecord {
  return {
    id: Math.random(),
    userId: 1,
    weight,
    recordedAt: date,
    createdAt: new Date().toISOString(),
  };
}

// Helper to create a MealLog
function makeLog(mealId: number, date: string, completed: boolean): MealLog {
  return {
    id: Math.random(),
    mealId,
    date,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  };
}

// ==========================================
// Weight Loss
// ==========================================
describe('calculateWeightLoss', () => {
  test('positive loss', () => {
    expect(calculateWeightLoss(117, 114)).toBe(3);
  });

  test('no loss', () => {
    expect(calculateWeightLoss(117, 117)).toBe(0);
  });

  test('weight gain (negative loss)', () => {
    expect(calculateWeightLoss(114, 117)).toBe(-3);
  });

  test('decimal precision', () => {
    expect(calculateWeightLoss(117.5, 114.3)).toBe(3.2);
  });
});

// ==========================================
// Remaining Weight
// ==========================================
describe('calculateRemainingWeight', () => {
  test('positive remaining', () => {
    expect(calculateRemainingWeight(114, 90)).toBe(24);
  });

  test('goal reached', () => {
    expect(calculateRemainingWeight(90, 90)).toBe(0);
  });

  test('past goal (negative remaining)', () => {
    expect(calculateRemainingWeight(88, 90)).toBe(-2);
  });
});

// ==========================================
// Goal Progress
// ==========================================
describe('calculateGoalProgress', () => {
  test('correct formula: (initial - current) / (initial - goal)', () => {
    // 117 -> 114, goal 90 => (117-114)/(117-90) = 3/27 ≈ 0.111
    const result = calculateGoalProgress(117, 114, 90);
    expect(result).toBeCloseTo(3 / 27, 2);
  });

  test('no progress', () => {
    expect(calculateGoalProgress(117, 117, 90)).toBe(0);
  });

  test('goal reached', () => {
    expect(calculateGoalProgress(117, 90, 90)).toBe(1);
  });

  test('past goal (capped at 1)', () => {
    expect(calculateGoalProgress(117, 85, 90)).toBe(1);
  });

  test('weight gained (capped at 0)', () => {
    expect(calculateGoalProgress(117, 120, 90)).toBe(0);
  });

  test('initial equals goal (edge case)', () => {
    expect(calculateGoalProgress(90, 90, 90)).toBe(0);
  });

  test('goal higher than initial (gaining weight goal)', () => {
    expect(calculateGoalProgress(80, 80, 90)).toBe(0);
  });
});

// ==========================================
// Weight Change
// ==========================================
describe('calculateWeightChange', () => {
  test('loss', () => {
    expect(calculateWeightChange(115, 114)).toBe(-1);
  });

  test('gain', () => {
    expect(calculateWeightChange(114, 115)).toBe(1);
  });

  test('no change', () => {
    expect(calculateWeightChange(114, 114)).toBe(0);
  });
});

// ==========================================
// Weekly Average
// ==========================================
describe('calculateWeeklyAverage', () => {
  test('returns null for empty records', () => {
    expect(calculateWeeklyAverage([])).toBeNull();
  });

  test('returns null for single record', () => {
    expect(calculateWeeklyAverage([makeWeight(114, '2026-09-05')])).toBeNull();
  });

  test('calculates average over multiple weeks', () => {
    const records = [
      makeWeight(117, '2026-08-01'),
      makeWeight(114, '2026-08-29'),
    ];
    const result = calculateWeeklyAverage(records);
    expect(result).not.toBeNull();
    // 3 kg lost over 28 days = 4 weeks = 0.75 kg/week
    expect(result!).toBeCloseTo(0.75, 1);
  });
});

// ==========================================
// Moving Average
// ==========================================
describe('calculateMovingAverage', () => {
  test('returns empty for empty records', () => {
    expect(calculateMovingAverage([])).toEqual([]);
  });

  test('returns values for each record', () => {
    const records = [
      makeWeight(117, '2026-08-28'),
      makeWeight(116, '2026-08-29'),
      makeWeight(115, '2026-08-30'),
    ];
    const result = calculateMovingAverage(records, 3);
    expect(result).toHaveLength(3);
    // Last point should be average of all 3
    expect(result[2].value).toBeCloseTo((117 + 116 + 115) / 3, 1);
  });
});

// ==========================================
// Period Change
// ==========================================
describe('calculatePeriodChange', () => {
  test('returns null for insufficient records', () => {
    expect(calculatePeriodChange([], 7)).toBeNull();
    expect(calculatePeriodChange([makeWeight(114, '2026-09-05')], 7)).toBeNull();
  });

  test('calculates change over period', () => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const records = [
      makeWeight(117, tenDaysAgo.toISOString().split('T')[0]),
      makeWeight(114, today.toISOString().split('T')[0]),
    ];
    const result = calculatePeriodChange(records, 7);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(-3, 1);
  });
});

// ==========================================
// Adherence
// ==========================================
describe('calculateAdherence', () => {
  test('perfect adherence', () => {
    const today = new Date();
    const logs: MealLog[] = [];

    // 7 days, 4 meals each, all completed
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      for (let m = 1; m <= 4; m++) {
        logs.push(makeLog(m, dateStr, true));
      }
    }

    const result = calculateAdherence(logs, 4, 7);
    expect(result.daysCompleted).toBe(7);
    expect(result.daysTotal).toBe(7);
    expect(result.daysPercentage).toBe(100);
    expect(result.mealsCompleted).toBe(28);
    expect(result.mealsTotal).toBe(28);
    expect(result.mealsPercentage).toBe(100);
  });

  test('no adherence', () => {
    const result = calculateAdherence([], 4, 7);
    expect(result.daysCompleted).toBe(0);
    expect(result.mealsCompleted).toBe(0);
    expect(result.daysPercentage).toBe(0);
    expect(result.mealsPercentage).toBe(0);
  });

  test('partial adherence', () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const logs = [
      makeLog(1, dateStr, true),
      makeLog(2, dateStr, true),
    ];

    const result = calculateAdherence(logs, 4, 7);
    expect(result.mealsCompleted).toBe(2);
    expect(result.mealsTotal).toBe(28);
    expect(result.daysCompleted).toBe(0); // only 2 of 4 meals, not a full day
  });
});

// ==========================================
// Lowest/Highest Weight
// ==========================================
describe('getLowestWeight / getHighestWeight', () => {
  test('returns null for empty records', () => {
    expect(getLowestWeight([])).toBeNull();
    expect(getHighestWeight([])).toBeNull();
  });

  test('finds extremes', () => {
    const records = [
      makeWeight(117, '2026-08-01'),
      makeWeight(114, '2026-08-15'),
      makeWeight(113.5, '2026-08-20'),
      makeWeight(115, '2026-08-25'),
    ];
    expect(getLowestWeight(records)).toBe(113.5);
    expect(getHighestWeight(records)).toBe(117);
  });
});

// ==========================================
// Formatting
// ==========================================
describe('formatWeight', () => {
  test('formats weight with unit', () => {
    expect(formatWeight(114)).toBe('114.0 kg');
    expect(formatWeight(114.5, 'lb')).toBe('114.5 lb');
  });
});

describe('formatWeightChange', () => {
  test('formats negative change', () => {
    expect(formatWeightChange(-3)).toBe('-3.0 kg');
  });

  test('formats positive change', () => {
    expect(formatWeightChange(1.5)).toBe('+1.5 kg');
  });

  test('formats zero change', () => {
    expect(formatWeightChange(0)).toBe('0.0 kg');
  });
});

describe('formatPercentage', () => {
  test('rounds percentage', () => {
    expect(formatPercentage(85.7)).toBe('86%');
    expect(formatPercentage(100)).toBe('100%');
    expect(formatPercentage(0)).toBe('0%');
  });
});

// ==========================================
// Nutrition Calculations (V2)
// ==========================================

// Helper to create a Food
function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 1,
    name: 'Test Food',
    calories: 100,
    protein: 20,
    carbs: 10,
    fat: 5,
    defaultUnit: 'g',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as unknown as Food;
}

// Helper to create a MealFood
function makeMealFood(overrides: Partial<MealFood> = {}): MealFood {
  return {
    id: 1,
    mealId: 1,
    name: 'Test Food',
    quantity: '100',
    unit: 'g',
    calories: 100,
    protein: 20,
    carbs: 10,
    fat: 5,
    foodId: 1,
    caloriesSnapshot: 100,
    proteinSnapshot: 20,
    carbsSnapshot: 10,
    fatSnapshot: 5,
    ...overrides,
  };
}

describe('calculateNutritionForQuantity', () => {
  test('calculates nutrition for 100g (same as base)', () => {
    const food = makeFood();
    const result = calculateNutritionForQuantity(food, 100);
    expect(result.calories).toBe(100);
    expect(result.protein).toBe(20);
    expect(result.carbs).toBe(10);
    expect(result.fat).toBe(5);
  });

  test('calculates nutrition for 50g (half)', () => {
    const food = makeFood();
    const result = calculateNutritionForQuantity(food, 50);
    expect(result.calories).toBe(50);
    expect(result.protein).toBe(10);
    expect(result.carbs).toBe(5);
    expect(result.fat).toBe(2.5);
  });

  test('calculates nutrition for 200g (double)', () => {
    const food = makeFood();
    const result = calculateNutritionForQuantity(food, 200);
    expect(result.calories).toBe(200);
    expect(result.protein).toBe(40);
    expect(result.carbs).toBe(20);
    expect(result.fat).toBe(10);
  });

  test('handles null values', () => {
    const food = makeFood({ calories: null, protein: null });
    const result = calculateNutritionForQuantity(food, 100);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });
});

describe('calculateEquivalentQuantity', () => {
  test('equivalent calories (same food)', () => {
    const food = makeFood();
    const result = calculateEquivalentQuantity(food, 100, food, 'calories');
    expect(result).toBe(100);
  });

  test('equivalent protein between different foods', () => {
    const chicken = makeFood({ protein: 21, calories: 165 });
    const beef = makeFood({ protein: 26, calories: 250 });
    const result = calculateEquivalentQuantity(chicken, 200, beef, 'protein');
    // 200g chicken has 42g protein
    // To get 42g protein from beef (26g/100g): (42/26)*100 ≈ 161.5
    expect(result).toBeCloseTo(161.5, 0);
  });

  test('returns 0 when target has 0 for criterion', () => {
    const food1 = makeFood({ calories: 100 });
    const food2 = makeFood({ calories: 0 });
    const result = calculateEquivalentQuantity(food1, 100, food2, 'calories');
    expect(result).toBe(0);
  });
});

describe('calculateMealTotals', () => {
  test('sums all foods in a meal', () => {
    const foods = [
      makeMealFood({ calories: 100, protein: 20, carbs: 10, fat: 5 }),
      makeMealFood({ id: 2, calories: 200, protein: 30, carbs: 25, fat: 8 }),
    ];
    const result = calculateMealTotals(foods);
    expect(result.calories).toBe(300);
    expect(result.protein).toBe(50);
    expect(result.carbs).toBe(35);
    expect(result.fat).toBe(13);
  });

  test('returns zeros for empty array', () => {
    const result = calculateMealTotals([]);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });

  test('handles null values', () => {
    const foods = [
      makeMealFood({ calories: null, protein: null, carbs: null, fat: null }),
    ];
    const result = calculateMealTotals(foods);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });
});

describe('calculateDietTotals', () => {
  test('sums all meals in a diet', () => {
    const meals = [
      { foods: [makeMealFood({ calories: 100, protein: 20 })] },
      { foods: [makeMealFood({ id: 2, calories: 200, protein: 30 })] },
    ];
    const result = calculateDietTotals(meals);
    expect(result.calories).toBe(300);
    expect(result.protein).toBe(50);
  });

  test('returns zeros for empty meals', () => {
    const result = calculateDietTotals([]);
    expect(result.calories).toBe(0);
  });
});

describe('calculateBMI', () => {
  test('calculates BMI correctly', () => {
    // 80kg, 180cm => 80 / (1.8^2) = 24.7
    expect(calculateBMI(80, 180)).toBeCloseTo(24.7, 1);
  });

  test('returns 0 for zero height', () => {
    expect(calculateBMI(80, 0)).toBe(0);
  });
});

describe('getBMICategory', () => {
  test('returns correct categories', () => {
    expect(getBMICategory(17)).toBe('Abaixo do peso');
    expect(getBMICategory(22)).toBe('Peso normal');
    expect(getBMICategory(27)).toBe('Sobrepeso');
    expect(getBMICategory(32)).toBe('Obesidade');
  });
});

describe('calculateBMR', () => {
  test('calculates BMR for male', () => {
    // 80kg, 180cm, 30 years male
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calculateBMR(80, 180, 30, 'male')).toBe(1780);
  });

  test('calculates BMR for female', () => {
    // 60kg, 165cm, 25 years female
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345
    expect(calculateBMR(60, 165, 25, 'female')).toBe(1345);
  });
});

describe('formatNutrition', () => {
  test('formats calories', () => {
    expect(formatNutrition(1500, 'calories')).toBe('1500 kcal');
    expect(formatNutrition(1500.5, 'calories')).toBe('1501 kcal');
  });

  test('formats macros', () => {
    expect(formatNutrition(20.5, 'macros')).toBe('20.5g');
    expect(formatNutrition(0, 'macros')).toBe('0.0g');
  });
});
