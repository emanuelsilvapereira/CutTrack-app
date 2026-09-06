import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { Diet, Meal, MealFood, MealWithFoods, DietWithMeals, DietChangeLog } from '@/types';

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
    notes?: string | null;
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
        foodId?: number | null;
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
      `INSERT INTO diets (userId, name, calories, notes, startDate, createdAt) VALUES (1, ?, ?, ?, ?, ?)`,
      data.name,
      data.calories ?? null,
      data.notes ?? null,
      data.startDate,
      now,
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
          `INSERT INTO meal_foods (mealId, name, quantity, unit, calories, protein, carbs, fat, foodId, caloriesSnapshot, proteinSnapshot, carbsSnapshot, fatSnapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          mealId, food.name, food.quantity, food.unit, food.calories, food.protein, food.carbs, food.fat,
          food.foodId ?? null, food.calories, food.protein, food.carbs, food.fat,
        );
      }
    }

    return dietId;
  },

  async updateDiet(id: number, data: {
    name?: string;
    calories?: number | null;
    notes?: string | null;
  }): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.calories !== undefined) { fields.push('calories = ?'); values.push(data.calories); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(`UPDATE diets SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async deleteDiet(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM diets WHERE id = ?`, id);
  },

  async duplicateDiet(id: number, newName: string): Promise<number> {
    const db = await getDatabase();
    const now = getNowISO();

    // Buscar a dieta original
    const originalDiet = await this.getDietById(id);
    if (!originalDiet) throw new Error('Dieta não encontrada');

    // Criar nova dieta
    const dietResult = await db.runAsync(
      `INSERT INTO diets (userId, name, calories, notes, startDate, createdAt) VALUES (1, ?, ?, ?, ?, ?)`,
      newName,
      originalDiet.calories,
      originalDiet.notes,
      now.split('T')[0],
      now,
    );

    const newDietId = dietResult.lastInsertRowId;

    // Copiar refeições e alimentos
    for (const meal of originalDiet.meals) {
      const mealResult = await db.runAsync(
        `INSERT INTO meals (dietId, name, time, "order", createdAt) VALUES (?, ?, ?, ?, ?)`,
        newDietId, meal.name, meal.time, meal.order, now,
      );

      const newMealId = mealResult.lastInsertRowId;

      for (const food of meal.foods) {
        await db.runAsync(
          `INSERT INTO meal_foods (mealId, name, quantity, unit, calories, protein, carbs, fat, foodId, caloriesSnapshot, proteinSnapshot, carbsSnapshot, fatSnapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          newMealId, food.name, food.quantity, food.unit, food.calories, food.protein, food.carbs, food.fat,
          food.foodId, food.caloriesSnapshot, food.proteinSnapshot, food.carbsSnapshot, food.fatSnapshot,
        );
      }
    }

    return newDietId;
  },

  async closeDiet(dietId: number, endDate: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE diets SET endDate = ? WHERE id = ?`,
      endDate, dietId,
    );
  },

  async getDietChangeLogs(dietId: number): Promise<DietChangeLog[]> {
    const db = await getDatabase();
    return db.getAllAsync<DietChangeLog>(
      `SELECT * FROM diet_change_logs WHERE dietId = ? ORDER BY createdAt DESC`,
      dietId,
    );
  },

  async addChangeLog(dietId: number, type: string, description: string): Promise<void> {
    const db = await getDatabase();
    const now = getNowISO();
    await db.runAsync(
      `INSERT INTO diet_change_logs (dietId, type, description, createdAt) VALUES (?, ?, ?, ?)`,
      dietId,
      type,
      description,
      now,
    );
  },
};
