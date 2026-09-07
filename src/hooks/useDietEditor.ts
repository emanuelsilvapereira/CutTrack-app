import { useState, useCallback } from 'react';
import { dietRepository, mealRepository, mealFoodRepository } from '@/database/repositories';
import type { DietWithMeals, MealWithFoods, MealFood } from '@/types';

export function useDietEditor() {
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiet = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dietRepository.getDietById(id);
      setDiet(data);
    } catch (e) {
      setError('Erro ao carregar a dieta.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDietDetails = useCallback(async (dietId: number, data: { name?: string; calories?: number | null; notes?: string | null }) => {
    try {
      await dietRepository.updateDiet(dietId, data);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const addMeal = useCallback(async (dietId: number, name: string, time: string, order: number) => {
    try {
      await mealRepository.create({ dietId, name, time, order });
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const updateMeal = useCallback(async (dietId: number, mealId: number, data: { name?: string; time?: string; order?: number }) => {
    try {
      await mealRepository.update(mealId, data);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const removeMeal = useCallback(async (dietId: number, mealId: number) => {
    try {
      await mealRepository.delete(mealId);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const addFoodToMeal = useCallback(async (dietId: number, mealId: number, foodId: number, quantity: string) => {
    try {
      await mealFoodRepository.addFoodToMeal(mealId, foodId, quantity);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const updateFoodQuantity = useCallback(async (dietId: number, mealFoodId: number, quantity: string) => {
    try {
      await mealFoodRepository.updateQuantity(mealFoodId, quantity);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const removeFood = useCallback(async (dietId: number, mealFoodId: number) => {
    try {
      await mealFoodRepository.removeFood(mealFoodId);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  const substituteFood = useCallback(async (dietId: number, mealFoodId: number, targetFoodId: number, quantity: number) => {
    try {
      await mealFoodRepository.applySubstitution(mealFoodId, targetFoodId, quantity);
      await loadDiet(dietId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [loadDiet]);

  return {
    diet,
    loading,
    error,
    loadDiet,
    updateDietDetails,
    addMeal,
    updateMeal,
    removeMeal,
    addFoodToMeal,
    updateFoodQuantity,
    removeFood,
    substituteFood
  };
}
