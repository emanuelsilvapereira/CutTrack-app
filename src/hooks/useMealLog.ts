import { useState, useEffect, useCallback, useMemo } from 'react';
import { mealLogRepository } from '@/database/repositories';
import type { MealLog, MealWithStatus, MealWithFoods, AdherenceStats } from '@/types';
import { getLocalDateString, getDaysAgo } from '@/utils/dates';
import { calculateAdherence } from '@/utils/calculations';

const EMPTY_MEALS: MealWithFoods[] = [];

export function useMealLog(meals: MealWithFoods[] = EMPTY_MEALS) {
  const [todayLogs, setTodayLogs] = useState<MealLog[]>([]);
  const [weekLogs, setWeekLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = getLocalDateString();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [logs, wLogs] = await Promise.all([
        mealLogRepository.getByDate(today),
        mealLogRepository.getByDateRange(getDaysAgo(6), today),
      ]);
      setTodayLogs(logs);
      setWeekLogs(wLogs);
    } catch (e) {
      setError('Não foi possível carregar o estado das refeições.');
      console.error('useMealLog error:', e);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleMeal = useCallback(async (mealId: number) => {
    try {
      await mealLogRepository.toggleMeal(mealId, today);
      await load();
    } catch (e) {
      console.error('toggleMeal error:', e);
      throw e;
    }
  }, [today, load]);

  const mealsWithStatus = useMemo<MealWithStatus[]>(() => {
    return meals.map((meal) => {
      const log = todayLogs.find((l) => l.mealId === meal.id);
      return {
        ...meal,
        log: log ? { ...log, completed: !!log.completed } : null,
      };
    });
  }, [meals, todayLogs]);

  const adherence = useMemo<AdherenceStats | null>(() => {
    if (meals.length === 0) return null;
    const normalizedLogs = weekLogs.map((l) => ({ ...l, completed: !!l.completed }));
    return calculateAdherence(normalizedLogs, meals.length, 7);
  }, [meals.length, weekLogs]);

  const nextMeal = useMemo(() => {
    return mealsWithStatus.find((m) => !m.log?.completed) ?? null;
  }, [mealsWithStatus]);

  const allCompleted = useMemo(() => {
    return mealsWithStatus.length > 0 && mealsWithStatus.every((m) => m.log?.completed);
  }, [mealsWithStatus]);

  return {
    mealsWithStatus,
    todayLogs,
    adherence,
    nextMeal,
    allCompleted,
    loading,
    error,
    reload: load,
    toggleMeal,
  };
}

