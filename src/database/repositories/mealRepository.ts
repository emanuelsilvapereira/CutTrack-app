import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { Meal } from '@/types';
import { mealFoodRepository } from './mealFoodRepository';

export const mealRepository = {
  async getByDietId(dietId: number): Promise<Meal[]> {
    const db = await getDatabase();
    return db.getAllAsync<Meal>('SELECT * FROM meals WHERE dietId = ? ORDER BY "order" ASC, time ASC', dietId);
  },

  async getById(id: number): Promise<Meal | null> {
    const db = await getDatabase();
    return db.getFirstAsync<Meal>('SELECT * FROM meals WHERE id = ?', id);
  },

  async create(data: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    const db = await getDatabase();
    const now = getNowISO();
    
    const result = await db.runAsync(
      `INSERT INTO meals (dietId, name, time, "order", createdAt) VALUES (?, ?, ?, ?, ?)`,
      data.dietId,
      data.name,
      data.time,
      data.order,
      now,
    );
    
    return {
      id: result.lastInsertRowId,
      dietId: data.dietId,
      name: data.name,
      time: data.time,
      order: data.order,
      createdAt: now,
    };
  },

  async update(id: number, data: Partial<Omit<Meal, 'id' | 'createdAt' | 'dietId'>>): Promise<void> {
    const db = await getDatabase();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.time !== undefined) { fields.push('time = ?'); values.push(data.time); }
    if (data.order !== undefined) { fields.push('"order" = ?'); values.push(data.order); }
    
    if (fields.length === 0) return;
    
    values.push(id);
    await db.runAsync(`UPDATE meals SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM meals WHERE id = ?', id);
  },
};
