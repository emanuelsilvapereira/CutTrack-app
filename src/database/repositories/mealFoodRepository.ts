import { getDatabase } from '../database';
import { foodRepository } from './foodRepository';
import { calculateNutritionForQuantity } from '@/utils/calculations';
import type { MealFood, FoodSubstitution } from '@/types';

export const mealFoodRepository = {
  async getByMealId(mealId: number): Promise<MealFood[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealFood>('SELECT * FROM meal_foods WHERE mealId = ? ORDER BY id ASC', mealId);
  },

  async addFoodToMeal(mealId: number, foodId: number, quantityStr: string): Promise<MealFood> {
    const db = await getDatabase();
    const food = await foodRepository.getById(foodId);
    if (!food) throw new Error('Food not found');

    const qty = parseFloat(quantityStr.replace(',', '.'));
    if (isNaN(qty) || qty <= 0) throw new Error('Invalid quantity');

    const nutrition = calculateNutritionForQuantity(food, qty);

    const result = await db.runAsync(
      `INSERT INTO meal_foods (
        mealId, name, quantity, unit, 
        calories, protein, carbs, fat,
        foodId, caloriesSnapshot, proteinSnapshot, carbsSnapshot, fatSnapshot
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      mealId,
      food.name,
      quantityStr,
      food.defaultUnit,
      nutrition.calories,
      nutrition.protein,
      nutrition.carbs,
      nutrition.fat,
      food.id,
      nutrition.calories,
      nutrition.protein,
      nutrition.carbs,
      nutrition.fat,
    );

    return {
      id: result.lastInsertRowId,
      mealId,
      name: food.name,
      quantity: quantityStr,
      unit: food.defaultUnit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      foodId: food.id,
      caloriesSnapshot: nutrition.calories,
      proteinSnapshot: nutrition.protein,
      carbsSnapshot: nutrition.carbs,
      fatSnapshot: nutrition.fat,
    };
  },

  async updateQuantity(mealFoodId: number, quantityStr: string): Promise<void> {
    const db = await getDatabase();
    
    // To update correctly, we need the original food per 100g.
    const mealFood = await db.getFirstAsync<MealFood>('SELECT * FROM meal_foods WHERE id = ?', mealFoodId);
    if (!mealFood) throw new Error('MealFood not found');

    let nutrition = {
      calories: mealFood.caloriesSnapshot ?? mealFood.calories ?? 0,
      protein: mealFood.proteinSnapshot ?? mealFood.protein ?? 0,
      carbs: mealFood.carbsSnapshot ?? mealFood.carbs ?? 0,
      fat: mealFood.fatSnapshot ?? mealFood.fat ?? 0,
    };

    const qty = parseFloat(quantityStr.replace(',', '.'));
    if (isNaN(qty) || qty <= 0) throw new Error('Invalid quantity');

    // If we have a foodId, use it for recalculation to ensure precision.
    if (mealFood.foodId) {
      const food = await foodRepository.getById(mealFood.foodId);
      if (food) {
        nutrition = calculateNutritionForQuantity(food, qty);
      }
    } else {
      // If no foodId, recalculate based on the old quantity and snapshot
      const oldQty = parseFloat(mealFood.quantity?.replace(',', '.') ?? '100');
      if (oldQty > 0) {
        const factor = qty / oldQty;
        nutrition = {
          calories: (mealFood.caloriesSnapshot ?? mealFood.calories ?? 0) * factor,
          protein: (mealFood.proteinSnapshot ?? mealFood.protein ?? 0) * factor,
          carbs: (mealFood.carbsSnapshot ?? mealFood.carbs ?? 0) * factor,
          fat: (mealFood.fatSnapshot ?? mealFood.fat ?? 0) * factor,
        };
      }
    }

    await db.runAsync(
      `UPDATE meal_foods SET 
        quantity = ?, 
        calories = ?, protein = ?, carbs = ?, fat = ?,
        caloriesSnapshot = ?, proteinSnapshot = ?, carbsSnapshot = ?, fatSnapshot = ?
       WHERE id = ?`,
      quantityStr,
      nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat,
      nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat,
      mealFoodId,
    );
  },

  async removeFood(mealFoodId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM meal_foods WHERE id = ?', mealFoodId);
  },

  async getSubstitutions(mealFoodId: number): Promise<FoodSubstitution[]> {
    const db = await getDatabase();
    return db.getAllAsync<FoodSubstitution>(
      'SELECT * FROM food_substitutions WHERE mealFoodId = ? ORDER BY createdAt DESC',
      mealFoodId,
    );
  },

  async addSubstitution(mealFoodId: number, alternativeFoodId: number, quantity: number, unit: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO food_substitutions (mealFoodId, alternativeFoodId, quantity, unit, createdAt) VALUES (?, ?, ?, ?, datetime('now'))`,
      mealFoodId, alternativeFoodId, quantity, unit,
    );
  },
  
  async applySubstitution(mealFoodId: number, alternativeFoodId: number, quantity: number): Promise<void> {
    const db = await getDatabase();
    const food = await foodRepository.getById(alternativeFoodId);
    if (!food) throw new Error('Alternative food not found');

    const nutrition = calculateNutritionForQuantity(food, quantity);
    
    // We update the meal_food with the new food, BUT wait... 
    // Is substitution a replacement of the original? The spec says "A dieta histórica deve continuar preservando os dados que foram utilizados. Para isso, utilizar snapshots no MealFood quando apropriado."
    // Actually, if you substitute a food inside a meal of the ACTIVE diet, you are editing the meal.
    // The history of what they ate today is in MealLog, but MealLog just says "completed".
    // Wait, "Uma dieta histórica não pode mudar automaticamente porque o alimento original foi alterado." 
    // It means if the `foods` table is updated, `meal_foods` shouldn't change, which we handle with `snapshots`.
    
    await db.runAsync(
      `UPDATE meal_foods SET 
        name = ?, quantity = ?, unit = ?, foodId = ?,
        calories = ?, protein = ?, carbs = ?, fat = ?,
        caloriesSnapshot = ?, proteinSnapshot = ?, carbsSnapshot = ?, fatSnapshot = ?
       WHERE id = ?`,
      food.name, String(quantity), food.defaultUnit, food.id,
      nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat,
      nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat,
      mealFoodId,
    );
    
    // Register the substitution in the substitutions table for history/favorites
    await this.addSubstitution(mealFoodId, alternativeFoodId, quantity, food.defaultUnit);
  }
};
