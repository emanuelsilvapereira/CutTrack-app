import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { User, UserGoal } from '@/types';

export const userRepository = {
  async getUser(): Promise<User | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<User>(`SELECT * FROM users WHERE id = 1`);
    return row ?? null;
  },

  async createUser(data: { 
    name: string; 
    initialWeight: number; 
    goalWeight: number;
    height?: number | null;
    birthDate?: string | null;
    goal?: UserGoal;
    calorieTarget?: number | null;
  }): Promise<User> {
    const db = await getDatabase();
    const now = getNowISO();
    const result = await db.runAsync(
      `INSERT INTO users (name, initialWeight, goalWeight, height, birthDate, goal, calorieTarget, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      data.name,
      data.initialWeight,
      data.goalWeight,
      data.height ?? null,
      data.birthDate ?? null,
      data.goal ?? 'loss',
      data.calorieTarget ?? null,
      now,
    );
    return {
      id: result.lastInsertRowId,
      name: data.name,
      initialWeight: data.initialWeight,
      goalWeight: data.goalWeight,
      weightUnit: 'kg',
      measurementUnit: 'cm',
      height: data.height ?? null,
      birthDate: data.birthDate ?? null,
      goal: data.goal ?? 'loss',
      calorieTarget: data.calorieTarget ?? null,
      onboardingComplete: false,
      createdAt: now,
    };
  },

  async updateUser(data: Partial<User>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.initialWeight !== undefined) { fields.push('initialWeight = ?'); values.push(data.initialWeight); }
    if (data.goalWeight !== undefined) { fields.push('goalWeight = ?'); values.push(data.goalWeight); }
    if (data.weightUnit !== undefined) { fields.push('weightUnit = ?'); values.push(data.weightUnit); }
    if (data.measurementUnit !== undefined) { fields.push('measurementUnit = ?'); values.push(data.measurementUnit); }
    if (data.height !== undefined) { fields.push('height = ?'); values.push(data.height); }
    if (data.birthDate !== undefined) { fields.push('birthDate = ?'); values.push(data.birthDate); }
    if (data.goal !== undefined) { fields.push('goal = ?'); values.push(data.goal); }
    if (data.calorieTarget !== undefined) { fields.push('calorieTarget = ?'); values.push(data.calorieTarget); }
    if (data.onboardingComplete !== undefined) { fields.push('onboardingComplete = ?'); values.push(data.onboardingComplete ? 1 : 0); }

    if (fields.length === 0) return;

    values.push(1);
    await db.runAsync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async completeOnboarding(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE users SET onboardingComplete = 1 WHERE id = 1`);
  },

  async isOnboardingComplete(): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ onboardingComplete: number }>(
      `SELECT onboardingComplete FROM users WHERE id = 1`,
    );
    return result?.onboardingComplete === 1;
  },

  async ensureUser(): Promise<User> {
    const existing = await this.getUser();
    if (existing) return existing;
    return this.createUser({ name: '', initialWeight: 117, goalWeight: 90 });
  },
};
