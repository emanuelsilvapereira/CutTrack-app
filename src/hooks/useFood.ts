import { useState, useEffect, useCallback } from 'react';
import { foodRepository } from '@/database/repositories';
import type { Food } from '@/types';

export function useFood() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await foodRepository.getAll();
      setFoods(data);
    } catch (e) {
      setError('Não foi possível carregar os alimentos.');
      console.error('useFood error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const search = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        await load();
        return;
      }
      const results = await foodRepository.search(query);
      setFoods(results);
    } catch (e) {
      console.error('useFood search error:', e);
    }
  }, [load]);

  const createFood = useCallback(async (data: {
    name: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    defaultUnit?: string;
  }): Promise<number> => {
    const id = await foodRepository.create(data);
    await load();
    return id;
  }, [load]);

  const updateFood = useCallback(async (id: number, data: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await foodRepository.update(id, data);
    await load();
  }, [load]);

  const deleteFood = useCallback(async (id: number): Promise<boolean> => {
    const success = await foodRepository.delete(id);
    if (success) {
      await load();
    }
    return success;
  }, [load]);

  const getFoodById = useCallback(async (id: number): Promise<Food | null> => {
    return foodRepository.getById(id);
  }, []);

  return {
    foods,
    loading,
    error,
    reload: load,
    search,
    createFood,
    updateFood,
    deleteFood,
    getFoodById,
  };
}
