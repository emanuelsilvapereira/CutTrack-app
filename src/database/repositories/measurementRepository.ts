import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { BodyMeasurement, MeasurementType } from '@/types';

export const measurementRepository = {
  async getAll(type?: MeasurementType): Promise<BodyMeasurement[]> {
    const db = await getDatabase();
    if (type) {
      return db.getAllAsync<BodyMeasurement>(
        `SELECT * FROM body_measurements WHERE type = ? ORDER BY recordedAt DESC`,
        type,
      );
    }
    return db.getAllAsync<BodyMeasurement>(
      `SELECT * FROM body_measurements ORDER BY recordedAt DESC`,
    );
  },

  async getLatestByType(type: MeasurementType): Promise<BodyMeasurement | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BodyMeasurement>(
      `SELECT * FROM body_measurements WHERE type = ? ORDER BY recordedAt DESC LIMIT 1`,
      type,
    );
    return row ?? null;
  },

  async getLatestOfEachType(): Promise<BodyMeasurement[]> {
    const db = await getDatabase();
    return db.getAllAsync<BodyMeasurement>(
      `SELECT bm.* FROM body_measurements bm
       INNER JOIN (
         SELECT type, MAX(recordedAt) as maxDate
         FROM body_measurements
         GROUP BY type
       ) latest ON bm.type = latest.type AND bm.recordedAt = latest.maxDate
       ORDER BY bm.type`,
    );
  },

  async getFirstByType(type: MeasurementType): Promise<BodyMeasurement | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BodyMeasurement>(
      `SELECT * FROM body_measurements WHERE type = ? ORDER BY recordedAt ASC LIMIT 1`,
      type,
    );
    return row ?? null;
  },

  async create(data: {
    type: MeasurementType;
    value: number;
    unit: string;
    recordedAt: string;
  }): Promise<BodyMeasurement> {
    const db = await getDatabase();
    const now = getNowISO();
    const result = await db.runAsync(
      `INSERT INTO body_measurements (userId, type, value, unit, recordedAt, createdAt) VALUES (1, ?, ?, ?, ?, ?)`,
      data.type, data.value, data.unit, data.recordedAt, now,
    );
    return {
      id: result.lastInsertRowId,
      userId: 1,
      type: data.type,
      value: data.value,
      unit: data.unit,
      recordedAt: data.recordedAt,
      createdAt: now,
    };
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM body_measurements WHERE id = ?`, id);
  },
};
