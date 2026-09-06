import { useState, useCallback } from 'react';
import { dietRepository } from '@/database/repositories';
import type { DietWithMeals, MealWithFoods } from '@/types';
import { calculateMealTotals, calculateDietTotals } from '@/utils/calculations';

export interface DietEditorMeal {
  id?: number;
  name: string;
  time: string;
  order: number;
  foods: Array<{
    id?: number;
    name: string;
    quantity: string;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foodId: number | null;
    isNew?: boolean;
  }>;
  isNew?: boolean;
}

export function useDietEditor(dietId?: number) {
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [meals, setMeals] = useState<DietEditorMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiet = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dietRepository.getDietById(id);
      setDiet(data);
      if (data) {
        setMeals(
          data.meals.map((m) => ({
            id: m.id,
            name: m.name,
            time: m.time,
            order: m.order,
            foods: m.foods.map((f) => ({
              id: f.id,
              name: f.name,
              quantity: f.quantity ?? '',
              unit: f.unit ?? 'g',
              calories: f.calories ?? 0,
              protein: f.protein ?? 0,
              carbs: f.carbs ?? 0,
              fat: f.fat ?? 0,
              foodId: f.foodId,
            })),
          }))
        );
      }
    } catch (e) {
      setError('Não foi possível carregar a dieta.');
      console.error('useDietEditor load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMeal = useCallback((data?: { name?: string; time?: string }) => {
    const newMeal: DietEditorMeal = {
      name: data?.name ?? `Refeição ${meals.length + 1}`,
      time: data?.time ?? '12:00',
      order: meals.length,
      foods: [],
      isNew: true,
    };
    setMeals((prev) => [...prev, newMeal]);
  }, [meals.length]);

  const updateMeal = useCallback((index: number, updates: Partial<DietEditorMeal>) => {
    setMeals((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    );
  }, []);

  const removeMeal = useCallback((index: number) => {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderMeals = useCallback((fromIndex: number, toIndex: number) => {
    setMeals((prev) => {
      const newMeals = [...prev];
      const [removed] = newMeals.splice(fromIndex, 1);
      newMeals.splice(toIndex, 0, removed);
      return newMeals.map((m, i) => ({ ...m, order: i }));
    });
  }, []);

  const addFoodToMeal = useCallback((mealIndex: number, food: {
    name: string;
    quantity: string;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foodId: number | null;
  }) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIndex
          ? { ...m, foods: [...m.foods, { ...food, isNew: true }] }
          : m
      )
    );
  }, []);

  const updateMealFood = useCallback((mealIndex: number, foodIndex: number, updates: Partial<DietEditorMeal['foods'][0]>) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIndex
          ? {
              ...m,
              foods: m.foods.map((f, j) =>
                j === foodIndex ? { ...f, ...updates } : f
              ),
            }
          : m
      )
    );
  }, []);

  const removeMealFood = useCallback((mealIndex: number, foodIndex: number) => {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIndex
          ? { ...m, foods: m.foods.filter((_, j) => j !== foodIndex) }
          : m
      )
    );
  }, []);

  const saveDiet = useCallback(async (data: {
    name: string;
    calories: number | null;
    notes?: string | null;
    startDate: string;
  }): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      if (dietId) {
        // Atualizar dieta existente
        await dietRepository.updateDiet(dietId, {
          name: data.name,
          calories: data.calories,
          notes: data.notes,
        });
        return dietId;
      } else {
        // Criar nova dieta
        const dietData = {
          ...data,
          meals: meals.map((m) => ({
            name: m.name,
            time: m.time,
            order: m.order,
            foods: m.foods.map((f) => ({
              name: f.name,
              quantity: f.quantity,
              unit: f.unit,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              foodId: f.foodId,
            })),
          })),
        };
        const newId = await dietRepository.createDiet(dietData);
        return newId;
      }
    } catch (e) {
      setError('Não foi possível salvar a dieta.');
      console.error('useDietEditor save error:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [dietId, meals]);

  const totalNutrition = calculateDietTotals(
    meals.map((m) => ({
      foods: m.foods.map((f) => ({
        id: 0,
        mealId: 0,
        name: f.name,
        quantity: f.quantity,
        unit: f.unit,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        foodId: f.foodId,
        caloriesSnapshot: null,
        proteinSnapshot: null,
        carbsSnapshot: null,
        fatSnapshot: null,
      })),
    }))
  );

  return {
    diet,
    meals,
    loading,
    error,
    totalNutrition,
    loadDiet,
    addMeal,
    updateMeal,
    removeMeal,
    reorderMeals,
    addFoodToMeal,
    updateMealFood,
    removeMealFood,
    saveDiet,
    setMeals,
  };
}
