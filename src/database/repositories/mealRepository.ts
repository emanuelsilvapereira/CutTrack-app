import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { Meal, MealFood, MealWithFoods } from '@/types';

export const mealRepository = {
  async getById(id: number): Promise<MealWithFoods | null> {
    const db = await getDatabase();
    const meal = await db.getFirstAsync<Meal>(`SELECT * FROM meals WHERE id = ?`, id);
    if (!meal) return null;

    const foods = await db.getAllAsync<MealFood>(
      `SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC`,
      meal.id,
    );

    return { ...meal, foods };
  },

  async getByDiet(dietId: number): Promise<MealWithFoods[]> {
    const db = await getDatabase();
    const meals = await db.getAllAsync<Meal>(
      `SELECT * FROM meals WHERE dietId = ? ORDER BY "order" ASC`,
      dietId,
    );

    const mealsWithFoods: MealWithFoods[] = [];
    for (const meal of meals) {
      const foods = await db.getAllAsync<MealFood>(
        `SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC`,
        meal.id,
      );
      mealsWithFoods.push({ ...meal, foods });
    }

    return mealsWithFoods;
  },

  async create(dietId: number, data: {
    name: string;
    time: string;
    order: number;
    foods?: Array<{
      name: string;
      quantity?: string | null;
      unit?: string | null;
      calories?: number | null;
      protein?: number | null;
      carbs?: number | null;
      fat?: number | null;
      foodId?: number | null;
    }>;
  }): Promise<number> {
    const db = await getDatabase();
    const now = getNowISO();

    const mealResult = await db.runAsync(
      `INSERT INTO meals (dietId, name, time, "order", createdAt) VALUES (?, ?, ?, ?, ?)`,
      dietId,
      data.name,
      data.time,
      data.order,
      now,
    );

    const mealId = mealResult.lastInsertRowId;

    if (data.foods && data.foods.length > 0) {
      for (const food of data.foods) {
        await db.runAsync(
          `INSERT INTO meal_foods (mealId, name, quantity, unit, calories, protein, carbs, fat, foodId, caloriesSnapshot, proteinSnapshot, carbsSnapshot, fatSnapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          mealId,
          food.name,
          food.quantity ?? null,
          food.unit ?? null,
          food.calories ?? null,
          food.protein ?? null,
          food.carbs ?? null,
          food.fat ?? null,
          food.foodId ?? null,
          food.calories ?? null,
          food.protein ?? null,
          food.carbs ?? null,
          food.fat ?? null,
        );
      }
    }

    return mealId;
  },

  async update(id: number, data: {
    name?: string;
    time?: string;
    order?: number;
  }): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.time !== undefined) { fields.push('time = ?'); values.push(data.time); }
    if (data.order !== undefined) { fields.push('"order" = ?'); values.push(data.order); }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(`UPDATE meals SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM meals WHERE id = ?`, id);
  },

  async reorder(meals: Array<{ id: number; order: number }>): Promise<void> {
    const db = await getDatabase();
    for (const meal of meals) {
      await db.runAsync(
        `UPDATE meals SET "order" = ? WHERE id = ?`,
        meal.order,
        meal.id,
      );
    }
  },
};
