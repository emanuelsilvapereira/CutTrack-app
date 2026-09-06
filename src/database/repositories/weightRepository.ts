import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { WeightRecord } from '@/types';

export const weightRepository = {
  async getAll(startDate?: string | null): Promise<WeightRecord[]> {
    const db = await getDatabase();
    if (startDate) {
      return db.getAllAsync<WeightRecord>(
        `SELECT * FROM weight_records WHERE recordedAt >= ? ORDER BY recordedAt DESC`,
        startDate,
      );
    }
    return db.getAllAsync<WeightRecord>(
      `SELECT * FROM weight_records ORDER BY recordedAt DESC`,
    );
  },

  async getLatest(): Promise<WeightRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WeightRecord>(
      `SELECT * FROM weight_records ORDER BY recordedAt DESC, id DESC LIMIT 1`,
    );
    return row ?? null;
  },

  async getByDate(date: string): Promise<WeightRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WeightRecord>(
      `SELECT * FROM weight_records WHERE recordedAt = ? ORDER BY id DESC LIMIT 1`,
      date,
    );
    return row ?? null;
  },

  async create(data: { weight: number; recordedAt: string }): Promise<WeightRecord> {
    const db = await getDatabase();
    const now = getNowISO();
    const result = await db.runAsync(
      `INSERT INTO weight_records (userId, weight, recordedAt, createdAt) VALUES (1, ?, ?, ?)`,
      data.weight, data.recordedAt, now,
    );
    return {
      id: result.lastInsertRowId,
      userId: 1,
      weight: data.weight,
      recordedAt: data.recordedAt,
      createdAt: now,
    };
  },

  async update(id: number, data: { weight: number; recordedAt: string }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE weight_records SET weight = ?, recordedAt = ? WHERE id = ?`,
      data.weight, data.recordedAt, id,
    );
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM weight_records WHERE id = ?`, id);
  },
};
