import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { MealFood, FoodSubstitution, Food } from '@/types';

export const mealFoodRepository = {
  async getByMeal(mealId: number): Promise<MealFood[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealFood>(
      `SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC`,
      mealId,
    );
  },

  async getById(id: number): Promise<MealFood | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MealFood>(
      `SELECT * FROM meal_foods WHERE id = ?`,
      id,
    );
    return row ?? null;
  },

  async addToMeal(mealId: number, data: {
    name: string;
    quantity?: string | null;
    unit?: string | null;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    foodId?: number | null;
  }): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO meal_foods (mealId, name, quantity, unit, calories, protein, carbs, fat, foodId, caloriesSnapshot, proteinSnapshot, carbsSnapshot, fatSnapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      mealId,
      data.name,
      data.quantity ?? null,
      data.unit ?? null,
      data.calories ?? null,
      data.protein ?? null,
      data.carbs ?? null,
      data.fat ?? null,
      data.foodId ?? null,
      data.calories ?? null,
      data.protein ?? null,
      data.carbs ?? null,
      data.fat ?? null,
    );
    return result.lastInsertRowId;
  },

  async updateQuantity(id: number, data: {
    quantity?: string | null;
    unit?: string | null;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  }): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.quantity !== undefined) { fields.push('quantity = ?'); values.push(data.quantity); }
    if (data.unit !== undefined) { fields.push('unit = ?'); values.push(data.unit); }
    if (data.calories !== undefined) { 
      fields.push('calories = ?'); values.push(data.calories);
      fields.push('caloriesSnapshot = ?'); values.push(data.calories);
    }
    if (data.protein !== undefined) { 
      fields.push('protein = ?'); values.push(data.protein);
      fields.push('proteinSnapshot = ?'); values.push(data.protein);
    }
    if (data.carbs !== undefined) { 
      fields.push('carbs = ?'); values.push(data.carbs);
      fields.push('carbsSnapshot = ?'); values.push(data.carbs);
    }
    if (data.fat !== undefined) { 
      fields.push('fat = ?'); values.push(data.fat);
      fields.push('fatSnapshot = ?'); values.push(data.fat);
    }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(`UPDATE meal_foods SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM meal_foods WHERE id = ?`, id);
  },

  async substitute(mealFoodId: number, alternativeFood: Food, quantity?: number, unit?: string): Promise<void> {
    const db = await getDatabase();
    const now = getNowISO();

    // Registrar a substituição
    await db.runAsync(
      `INSERT INTO food_substitutions (mealFoodId, alternativeFoodId, quantity, unit, createdAt) VALUES (?, ?, ?, ?, ?)`,
      mealFoodId,
      alternativeFood.id,
      quantity ?? null,
      unit ?? alternativeFood.defaultUnit,
      now,
    );

    // Atualizar o alimento na refeição
    await db.runAsync(
      `UPDATE meal_foods SET name = ?, foodId = ?, calories = ?, protein = ?, carbs = ?, fat = ?, caloriesSnapshot = ?, proteinSnapshot = ?, carbsSnapshot = ?, fatSnapshot = ? WHERE id = ?`,
      alternativeFood.name,
      alternativeFood.id,
      alternativeFood.calories,
      alternativeFood.protein,
      alternativeFood.carbs,
      alternativeFood.fat,
      alternativeFood.calories,
      alternativeFood.protein,
      alternativeFood.carbs,
      alternativeFood.fat,
      mealFoodId,
    );
  },

  async getSubstitutions(mealFoodId: number): Promise<(FoodSubstitution & { alternativeFood: Food })[]> {
    const db = await getDatabase();
    return db.getAllAsync<FoodSubstitution & { alternativeFood: Food }>(
      `SELECT fs.*, f.* FROM food_substitutions fs 
       JOIN foods f ON fs.alternativeFoodId = f.id 
       WHERE fs.mealFoodId = ? 
       ORDER BY fs.createdAt DESC`,
      mealFoodId,
    );
  },
};
