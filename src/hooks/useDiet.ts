import { useState, useEffect, useCallback } from 'react';
import { dietRepository } from '@/database/repositories';
import type { DietWithMeals, Diet } from '@/types';

export function useDiet() {
  const [activeDiet, setActiveDiet] = useState<DietWithMeals | null>(null);
  const [allDiets, setAllDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [active, all] = await Promise.all([
        dietRepository.getActiveDiet(),
        dietRepository.getAllDiets(),
      ]);
      setActiveDiet(active);
      setAllDiets(all);
    } catch (e) {
      setError('Não foi possível carregar a dieta.');
      console.error('useDiet error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createDiet = useCallback(async (data: {
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
  }): Promise<number> => {
    const id = await dietRepository.createDiet(data);
    await load();
    return id;
  }, [load]);

  const updateDiet = useCallback(async (id: number, data: {
    name?: string;
    calories?: number | null;
    notes?: string | null;
  }) => {
    await dietRepository.updateDiet(id, data);
    await load();
  }, [load]);

  const deleteDiet = useCallback(async (id: number) => {
    await dietRepository.deleteDiet(id);
    await load();
  }, [load]);

  const duplicateDiet = useCallback(async (id: number, newName: string): Promise<number> => {
    const newId = await dietRepository.duplicateDiet(id, newName);
    await load();
    return newId;
  }, [load]);

  const closeDiet = useCallback(async (dietId: number, endDate: string) => {
    await dietRepository.closeDiet(dietId, endDate);
    await load();
  }, [load]);

  return { 
    activeDiet, 
    allDiets, 
    loading, 
    error, 
    reload: load,
    createDiet,
    updateDiet,
    deleteDiet,
    duplicateDiet,
    closeDiet,
  };
}
