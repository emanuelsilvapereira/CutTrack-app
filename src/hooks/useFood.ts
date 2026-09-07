import { useState, useCallback, useEffect } from 'react';
import { foodRepository } from '@/database/repositories';
import type { Food } from '@/types';

export function useFood(initialSearch: string = '') {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const load = useCallback(async (query: string = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const data = await foodRepository.getAll(query);
      setFoods(data);
    } catch (e) {
      setError('Não foi possível carregar os alimentos.');
      console.error('useFood error:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const addFood = useCallback(async (data: Omit<Food, 'id' | 'createdAt' | 'updatedAt' | 'isUserCreated'> & { isUserCreated?: boolean }) => {
    try {
      const newFood = await foodRepository.create(data);
      await load();
      return newFood;
    } catch (e) {
      console.error('addFood error:', e);
      throw e;
    }
  }, [load]);

  const updateFood = useCallback(async (id: number, data: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await foodRepository.update(id, data);
      await load();
    } catch (e) {
      console.error('updateFood error:', e);
      throw e;
    }
  }, [load]);

  const deleteFood = useCallback(async (id: number) => {
    try {
      await foodRepository.delete(id);
      await load();
    } catch (e) {
      console.error('deleteFood error:', e);
      throw e;
    }
  }, [load]);

  const getFoodById = useCallback(async (id: number) => {
    try {
      return await foodRepository.getById(id);
    } catch (e) {
      console.error('getFoodById error:', e);
      return null;
    }
  }, []);

  return { 
    foods, 
    loading, 
    error, 
    searchQuery,
    search,
    reload: load, 
    addFood, 
    updateFood,
    deleteFood,
    getFoodById
  };
}
