import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { Diet, Meal, MealFood, MealWithFoods, DietWithMeals } from '@/types';

export const dietRepository = {
  async getActiveDiet(): Promise<DietWithMeals | null> {
    const db = await getDatabase();
    const diet = await db.getFirstAsync<Diet>(
      `SELECT * FROM diets WHERE endDate IS NULL ORDER BY startDate DESC LIMIT 1`,
    );
    if (!diet) return null;

    const meals = await db.getAllAsync<Meal>(
      `SELECT * FROM meals WHERE dietId = ? ORDER BY "order" ASC`,
      diet.id,
    );

    const mealsWithFoods: MealWithFoods[] = [];
    for (const meal of meals) {
      const foods = await db.getAllAsync<MealFood>(
        `SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC`,
        meal.id,
      );
      mealsWithFoods.push({ ...meal, foods });
    }

    return { ...diet, meals: mealsWithFoods };
  },

  async getAllDiets(): Promise<Diet[]> {
    const db = await getDatabase();
    return db.getAllAsync<Diet>(`SELECT * FROM diets ORDER BY startDate DESC`);
  },

  async getDietById(id: number): Promise<DietWithMeals | null> {
    const db = await getDatabase();
    const diet = await db.getFirstAsync<Diet>(`SELECT * FROM diets WHERE id = ?`, id);
    if (!diet) return null;

    const meals = await db.getAllAsync<Meal>(
      `SELECT * FROM meals WHERE dietId = ? ORDER BY "order" ASC`,
      diet.id,
    );

    const mealsWithFoods: MealWithFoods[] = [];
    for (const meal of meals) {
      const foods = await db.getAllAsync<MealFood>(
        `SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC`,
        meal.id,
      );
      mealsWithFoods.push({ ...meal, foods });
    }

    return { ...diet, meals: mealsWithFoods };
  },

  async createDiet(data: {
    name: string;
    calories: number | null;
    startDate: string;
    meals: Array<{
      name: string;
      time: string;
      order: number;
      foods: Array<{
        name: string;
        quantity: string | null;
        unit: string | null;
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
      }>;
    }>;
  }): Promise<number> {
    const db = await getDatabase();
    const now = getNowISO();

    // Close any active diet
    await db.runAsync(
      `UPDATE diets SET endDate = ? WHERE endDate IS NULL`,
      data.startDate,
    );

    const dietResult = await db.runAsync(
      `INSERT INTO diets (userId, name, calories, startDate, createdAt) VALUES (1, ?, ?, ?, ?)`,
      data.name, data.calories ?? null, data.startDate, now,
    );

    const dietId = dietResult.lastInsertRowId;

    for (const meal of data.meals) {
      const mealResult = await db.runAsync(
        `INSERT INTO meals (dietId, name, time, "order", createdAt) VALUES (?, ?, ?, ?, ?)`,
        dietId, meal.name, meal.time, meal.order, now,
      );

      const mealId = mealResult.lastInsertRowId;

      for (const food of meal.foods) {
        await db.runAsync(
          `INSERT INTO meal_foods (mealId, name, quantity, unit, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          mealId, food.name, food.quantity, food.unit, food.calories, food.protein, food.carbs, food.fat,
        );
      }
    }

    return dietId;
  },

  async closeDiet(dietId: number, endDate: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE diets SET endDate = ? WHERE id = ?`,
      endDate, dietId,
    );
  },
};
