import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { User } from '@/types';

export const userRepository = {
  async getUser(): Promise<User | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<User>(`SELECT * FROM users WHERE id = 1`);
    return row ?? null;
  },

  async createUser(data: { name: string; initialWeight: number; goalWeight: number }): Promise<User> {
    const db = await getDatabase();
    const now = getNowISO();
    const result = await db.runAsync(
      `INSERT INTO users (name, initialWeight, goalWeight, createdAt) VALUES (?, ?, ?, ?)`,
      data.name, data.initialWeight, data.goalWeight, now,
    );
    return {
      id: result.lastInsertRowId,
      name: data.name,
      initialWeight: data.initialWeight,
      goalWeight: data.goalWeight,
      weightUnit: 'kg',
      measurementUnit: 'cm',
      createdAt: now,
    };
  },

  async updateUser(data: Partial<User>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.initialWeight !== undefined) { fields.push('initialWeight = ?'); values.push(data.initialWeight); }
    if (data.goalWeight !== undefined) { fields.push('goalWeight = ?'); values.push(data.goalWeight); }
    if (data.weightUnit !== undefined) { fields.push('weightUnit = ?'); values.push(data.weightUnit); }
    if (data.measurementUnit !== undefined) { fields.push('measurementUnit = ?'); values.push(data.measurementUnit); }

    if (fields.length === 0) return;

    values.push(1);
    await db.runAsync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async ensureUser(): Promise<User> {
    const existing = await this.getUser();
    if (existing) return existing;
    return this.createUser({ name: '', initialWeight: 117, goalWeight: 90 });
  },
};
