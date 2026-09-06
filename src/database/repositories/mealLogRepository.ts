import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { MealLog } from '@/types';

export const mealLogRepository = {
  async getByDate(date: string): Promise<MealLog[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealLog>(
      `SELECT * FROM meal_logs WHERE date = ?`,
      date,
    );
  },

  async getByDateRange(startDate: string, endDate: string): Promise<MealLog[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealLog>(
      `SELECT * FROM meal_logs WHERE date >= ? AND date <= ? ORDER BY date DESC`,
      startDate, endDate,
    );
  },

  async getByMealAndDate(mealId: number, date: string): Promise<MealLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MealLog>(
      `SELECT * FROM meal_logs WHERE mealId = ? AND date = ?`,
      mealId, date,
    );
    return row ? { ...row, completed: !!row.completed } : null;
  },

  async toggleMeal(mealId: number, date: string): Promise<MealLog> {
    const db = await getDatabase();
    const existing = await this.getByMealAndDate(mealId, date);

    if (existing) {
      const newCompleted = !existing.completed;
      const completedAt = newCompleted ? getNowISO() : null;
      await db.runAsync(
        `UPDATE meal_logs SET completed = ?, completedAt = ? WHERE id = ?`,
        newCompleted ? 1 : 0, completedAt, existing.id,
      );
      return { ...existing, completed: newCompleted, completedAt };
    }

    const now = getNowISO();
    const result = await db.runAsync(
      `INSERT INTO meal_logs (mealId, date, completed, completedAt) VALUES (?, ?, 1, ?)`,
      mealId, date, now,
    );

    return {
      id: result.lastInsertRowId,
      mealId,
      date,
      completed: true,
      completedAt: now,
    };
  },

  async completeMeal(mealId: number, date: string): Promise<MealLog> {
    const db = await getDatabase();
    const existing = await this.getByMealAndDate(mealId, date);
    const now = getNowISO();

    if (existing) {
      await db.runAsync(
        `UPDATE meal_logs SET completed = 1, completedAt = ? WHERE id = ?`,
        now, existing.id,
      );
      return { ...existing, completed: true, completedAt: now };
    }

    const result = await db.runAsync(
      `INSERT INTO meal_logs (mealId, date, completed, completedAt) VALUES (?, ?, 1, ?)`,
      mealId, date, now,
    );

    return { id: result.lastInsertRowId, mealId, date, completed: true, completedAt: now };
  },

  async uncompleteMeal(mealId: number, date: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE meal_logs SET completed = 0, completedAt = NULL WHERE mealId = ? AND date = ?`,
      mealId, date,
    );
  },
};
