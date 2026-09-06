// ==========================================
// CutTrack — Seed Data
// ==========================================

import { getDatabase } from './database';
import { userRepository } from './repositories/userRepository';
import { getNowISO, getLocalDateString } from '@/utils/dates';

/**
 * Seeds the database with initial mock data if empty.
 * Only runs once — checks if user already exists.
 */
export async function seedDatabase(): Promise<void> {
  const existingUser = await userRepository.getUser();
  if (existingUser) return; // Already seeded

  const db = await getDatabase();
  const now = getNowISO();
  const today = getLocalDateString();

  // Create user
  await db.runAsync(
    `INSERT INTO users (name, initialWeight, goalWeight, createdAt) VALUES (?, ?, ?, ?)`,
    'Emanuel', 117.0, 90.0, now,
  );

  // Create weight records (last 30 days of simulated data)
  const weights = [
    117.0, 116.8, 117.1, 116.5, 116.3, 116.6, 116.0,
    115.8, 115.5, 115.7, 115.3, 115.0, 115.2, 114.8,
    114.5, 114.7, 114.3, 114.5, 114.2, 114.0, 114.3,
    114.1, 113.9, 114.2, 114.0, 113.8, 114.0, 113.7,
    113.9, 114.0,
  ];

  for (let i = 0; i < weights.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (weights.length - 1 - i));
    const dateStr = getLocalDateString(date);
    await db.runAsync(
      `INSERT INTO weight_records (userId, weight, recordedAt, createdAt) VALUES (1, ?, ?, ?)`,
      weights[i], dateStr, now,
    );
  }

  // Create active diet
  const dietStartDate = new Date();
  dietStartDate.setDate(dietStartDate.getDate() - 35);
  const dietStartStr = getLocalDateString(dietStartDate);

  const dietResult = await db.runAsync(
    `INSERT INTO diets (userId, name, calories, startDate, createdAt) VALUES (1, ?, ?, ?, ?)`,
    'Dieta atual', 2200, dietStartStr, now,
  );
  const dietId = dietResult.lastInsertRowId;

  // Create meals
  const mealsData = [
    { name: 'Café da manhã', time: '09:45', order: 1 },
    { name: 'Almoço', time: '12:15', order: 2 },
    { name: 'Lanche', time: '15:45', order: 3 },
    { name: 'Jantar', time: '20:30', order: 4 },
  ];

  const mealIds: number[] = [];
  for (const meal of mealsData) {
    const result = await db.runAsync(
      `INSERT INTO meals (dietId, name, time, "order", createdAt) VALUES (?, ?, ?, ?, ?)`,
      dietId, meal.name, meal.time, meal.order, now,
    );
    mealIds.push(result.lastInsertRowId);
  }

  // Meal foods
  const foodsData: Record<number, Array<{ name: string; quantity: string | null; unit: string | null; calories: number | null; protein: number | null; carbs: number | null; fat: number | null }>> = {
    0: [
      { name: 'Pão francês', quantity: '1', unit: 'unidade', calories: 150, protein: 5, carbs: 28, fat: 2 },
      { name: 'Ovos', quantity: '3', unit: 'unidades', calories: 210, protein: 18, carbs: 1, fat: 15 },
      { name: 'Cream cheese light', quantity: '20', unit: 'g', calories: 30, protein: 2, carbs: 1, fat: 2 },
    ],
    1: [
      { name: 'Arroz', quantity: '250', unit: 'g', calories: 325, protein: 6, carbs: 72, fat: 1 },
      { name: 'Feijão', quantity: '150', unit: 'g', calories: 115, protein: 8, carbs: 21, fat: 0.5 },
      { name: 'Acém', quantity: '200', unit: 'g', calories: 360, protein: 40, carbs: 0, fat: 22 },
      { name: 'Vegetais', quantity: null, unit: null, calories: 50, protein: 2, carbs: 10, fat: 0.5 },
    ],
    2: [
      { name: 'Whey Protein', quantity: '30', unit: 'g', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
      { name: 'Banana', quantity: '1', unit: 'unidade', calories: 90, protein: 1, carbs: 23, fat: 0 },
      { name: 'Aveia', quantity: '30', unit: 'g', calories: 115, protein: 4, carbs: 20, fat: 2.5 },
    ],
    3: [
      { name: 'Frango grelhado', quantity: '200', unit: 'g', calories: 330, protein: 42, carbs: 0, fat: 18 },
      { name: 'Batata doce', quantity: '200', unit: 'g', calories: 180, protein: 3, carbs: 42, fat: 0 },
      { name: 'Salada', quantity: null, unit: null, calories: 30, protein: 1, carbs: 5, fat: 1 },
    ],
  };

  for (let i = 0; i < mealIds.length; i++) {
    const foods = foodsData[i] ?? [];
    for (const food of foods) {
      await db.runAsync(
        `INSERT INTO meal_foods (mealId, name, quantity, unit, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        mealIds[i], food.name, food.quantity, food.unit, food.calories, food.protein, food.carbs, food.fat,
      );
    }
  }

  // Create some meal logs for the last 7 days
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dateStr = getLocalDateString(date);

    for (let i = 0; i < mealIds.length; i++) {
      // Today: first 2 meals completed
      // Previous days: all or most completed
      let completed = false;
      if (dayOffset === 0) {
        completed = i < 2;
      } else if (dayOffset === 3) {
        completed = i < 3; // missed dinner one day
      } else {
        completed = true;
      }

      if (completed) {
        await db.runAsync(
          `INSERT OR IGNORE INTO meal_logs (mealId, date, completed, completedAt) VALUES (?, ?, 1, ?)`,
          mealIds[i], dateStr, now,
        );
      }
    }
  }

  // Create some body measurements
  const measurementsData = [
    { type: 'waist', values: [105, 104, 103, 102] },
    { type: 'chest', values: [110, 109.5, 109, 108.5] },
    { type: 'arm', values: [38, 37.5, 37, 37] },
    { type: 'thigh', values: [65, 64.5, 64, 63.5] },
    { type: 'hip', values: [108, 107, 106.5, 106] },
  ];

  for (const m of measurementsData) {
    for (let i = 0; i < m.values.length; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (m.values.length - 1 - i) * 7);
      const dateStr = getLocalDateString(date);
      await db.runAsync(
        `INSERT INTO body_measurements (userId, type, value, unit, recordedAt, createdAt) VALUES (1, ?, ?, 'cm', ?, ?)`,
        m.type, m.values[i], dateStr, now,
      );
    }
  }

  // Create an older diet (for history)
  const oldDietStart = new Date();
  oldDietStart.setDate(oldDietStart.getDate() - 66);
  const oldDietEnd = new Date();
  oldDietEnd.setDate(oldDietEnd.getDate() - 36);

  await db.runAsync(
    `INSERT INTO diets (userId, name, calories, startDate, endDate, createdAt) VALUES (1, ?, ?, ?, ?, ?)`,
    'Dieta anterior', 2500, getLocalDateString(oldDietStart), getLocalDateString(oldDietEnd), now,
  );
}
