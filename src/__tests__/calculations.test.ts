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
} from '../utils/calculations';
import type { WeightRecord, MealLog } from '../types';

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
