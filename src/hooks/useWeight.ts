import { useState, useEffect, useCallback, useMemo } from 'react';
import { weightRepository } from '@/database/repositories';
import type { WeightRecord, WeightStats, TimeFilter } from '@/types';
import {
  calculateWeightLoss,
  calculateRemainingWeight,
  calculateGoalProgress,
  calculateWeeklyAverage,
  calculatePeriodChange,
  getLowestWeight,
  getHighestWeight,
} from '@/utils/calculations';
import { getFilterStartDate } from '@/utils/dates';

export function useWeight(initialWeight: number = 117, goalWeight: number = 90) {
  const [allRecords, setAllRecords] = useState<WeightRecord[]>([]);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimeFilter>('30d');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startDate = getFilterStartDate(filter);
      const all = await weightRepository.getAll();
      setAllRecords(all);

      const filteredRecords = startDate
        ? all.filter((r) => r.recordedAt >= startDate)
        : all;
      setRecords(filteredRecords);
    } catch (e) {
      setError('Não foi possível carregar os registros de peso.');
      console.error('useWeight error:', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const stats = useMemo<WeightStats | null>(() => {
    if (allRecords.length === 0) return null;
    const latest = allRecords[0];
    const currentWeight = latest?.weight ?? null;

    return {
      current: currentWeight,
      initial: initialWeight,
      goal: goalWeight,
      totalLoss: currentWeight ? calculateWeightLoss(initialWeight, currentWeight) : 0,
      remaining: currentWeight ? calculateRemainingWeight(currentWeight, goalWeight) : initialWeight - goalWeight,
      progress: currentWeight ? calculateGoalProgress(initialWeight, currentWeight, goalWeight) : 0,
      weeklyAverage: calculateWeeklyAverage(allRecords),
      lowestWeight: getLowestWeight(allRecords),
      highestWeight: getHighestWeight(allRecords),
      weeklyChange: calculatePeriodChange(allRecords, 7),
    };
  }, [allRecords, initialWeight, goalWeight]);

  useEffect(() => {
    load();
  }, [load]);

  const addWeight = useCallback(async (weight: number, date: string) => {
    try {
      await weightRepository.create({ weight, recordedAt: date });
      await load();
    } catch (e) {
      console.error('addWeight error:', e);
      throw e;
    }
  }, [load]);

  const deleteWeight = useCallback(async (id: number) => {
    try {
      await weightRepository.delete(id);
      await load();
    } catch (e) {
      console.error('deleteWeight error:', e);
      throw e;
    }
  }, [load]);

  return { records, stats, loading, error, filter, setFilter, reload: load, addWeight, deleteWeight };
}
