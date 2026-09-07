import { useState, useCallback } from 'react';
import { mealFoodRepository, mealRepository } from '@/database/repositories';
import type { MealFood, Food, MealWithFoods } from '@/types';
import { calculateNutritionForQuantity } from '@/utils/calculations';

export interface MealEditorFood {
  id?: number; // ID no banco (undefined se novo)
  name: string;
  quantity: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodId: number | null;
  isNew?: boolean;
}

export function useMealEditor(mealId?: number) {
  const [meal, setMeal] = useState<MealWithFoods | null>(null);
  const [foods, setFoods] = useState<MealEditorFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletedFoodIds, setDeletedFoodIds] = useState<number[]>([]);

  const loadMeal = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await mealRepository.getById(id);
      if (data) {
        const mealFoods = await mealFoodRepository.getByMealId(id);
        const mealWithFoods = { ...data, foods: mealFoods };
        setMeal(mealWithFoods);
        setFoods(
          mealFoods.map((f: MealFood) => ({
            id: f.id,
            name: f.name,
            quantity: f.quantity ?? '',
            unit: f.unit ?? 'g',
            calories: f.calories ?? 0,
            protein: f.protein ?? 0,
            carbs: f.carbs ?? 0,
            fat: f.fat ?? 0,
            foodId: f.foodId,
          }))
        );
      } else {
        setMeal(null);
      }
    } catch (e) {
      setError('Não foi possível carregar a refeição.');
      console.error('useMealEditor load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFood = useCallback((food: Food, quantity: number = 100) => {
    const nutrition = calculateNutritionForQuantity(food, quantity);
    const newFood: MealEditorFood = {
      name: food.name,
      quantity: String(quantity),
      unit: food.defaultUnit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      foodId: food.id,
      isNew: true,
    };
    setFoods((prev) => [...prev, newFood]);
  }, []);

  const addCustomFood = useCallback((data: {
    name: string;
    quantity?: string;
    unit?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }) => {
    const newFood: MealEditorFood = {
      name: data.name,
      quantity: data.quantity ?? '',
      unit: data.unit ?? 'g',
      calories: data.calories ?? 0,
      protein: data.protein ?? 0,
      carbs: data.carbs ?? 0,
      fat: data.fat ?? 0,
      foodId: null,
      isNew: true,
    };
    setFoods((prev) => [...prev, newFood]);
  }, []);

  const updateFood = useCallback((index: number, updates: Partial<MealEditorFood>) => {
    setFoods((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }, []);

  const removeFood = useCallback((index: number) => {
    setFoods((prev) => {
      const target = prev[index];
      if (target.id && !target.isNew) {
        setDeletedFoodIds((curr) => [...curr, target.id as number]);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const reorderFoods = useCallback((fromIndex: number, toIndex: number) => {
    setFoods((prev) => {
      const newFoods = [...prev];
      const [removed] = newFoods.splice(fromIndex, 1);
      newFoods.splice(toIndex, 0, removed);
      return newFoods;
    });
  }, []);

  const saveMeal = useCallback(async (mealId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Salvar cada alimento
      for (const food of foods) {
        const qtyStr = food.quantity ? food.quantity.toString().replace(',', '.') : '';
        const qty = parseFloat(qtyStr);
        if (isNaN(qty) || qty <= 0) {
          throw new Error(`A quantidade do alimento "${food.name}" é inválida. Informe um valor maior que zero.`);
        }

        if (food.id && !food.isNew) {
          // Atualizar existente
          await mealFoodRepository.updateQuantity(food.id, qtyStr);
        } else {
          // Criar novo
          if (food.foodId) {
            await mealFoodRepository.addFoodToMeal(mealId, food.foodId, food.quantity);
          } else {
            // Se for alimento custom sem ID (não salvo no BD foods), isso é mais complexo na V3.
            // Para simplificar, ignoramos ou salvamos temporariamente.
            // A V3 agora exige que todos os alimentos existam no banco `foods`.
          }
        }
      }

      // Remover os deletados
      for (const id of deletedFoodIds) {
        await mealFoodRepository.removeFood(id);
      }
      setDeletedFoodIds([]);

      // Recarregar a refeição
      await loadMeal(mealId);
    } catch (e) {
      setError('Não foi possível salvar a refeição.');
      console.error('useMealEditor save error:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [foods, loadMeal]);

  const totalNutrition = foods.reduce(
    (totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    meal,
    foods,
    loading,
    error,
    totalNutrition,
    loadMeal,
    addFood,
    addCustomFood,
    updateFood,
    removeFood,
    reorderFoods,
    saveMeal,
    setFoods,
  };
}
