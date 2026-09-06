import { useState, useEffect, useCallback } from 'react';
import { measurementRepository } from '@/database/repositories';
import type { BodyMeasurement, MeasurementType } from '@/types';

export function useMeasurements(type?: MeasurementType) {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [latestByType, setLatestByType] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, latest] = await Promise.all([
        measurementRepository.getAll(type),
        measurementRepository.getLatestOfEachType(),
      ]);
      setMeasurements(data);
      setLatestByType(latest);
    } catch (e) {
      setError('Não foi possível carregar as medidas.');
      console.error('useMeasurements error:', e);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const addMeasurement = useCallback(async (data: {
    type: MeasurementType;
    value: number;
    unit: string;
    recordedAt: string;
  }) => {
    try {
      await measurementRepository.create(data);
      await load();
    } catch (e) {
      console.error('addMeasurement error:', e);
      throw e;
    }
  }, [load]);

  const deleteMeasurement = useCallback(async (id: number) => {
    try {
      await measurementRepository.delete(id);
      await load();
    } catch (e) {
      console.error('deleteMeasurement error:', e);
      throw e;
    }
  }, [load]);

  return { measurements, latestByType, loading, error, reload: load, addMeasurement, deleteMeasurement };
}
