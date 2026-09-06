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

  return { activeDiet, allDiets, loading, error, reload: load };
}
