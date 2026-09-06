import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { Food } from '@/types';

export const foodRepository = {
  async getAll(): Promise<Food[]> {
    const db = await getDatabase();
    return db.getAllAsync<Food>(`SELECT * FROM foods ORDER BY name ASC`);
  },

  async search(query: string): Promise<Food[]> {
    const db = await getDatabase();
    return db.getAllAsync<Food>(
      `SELECT * FROM foods WHERE name LIKE ? ORDER BY name ASC`,
      `%${query}%`,
    );
  },

  async getById(id: number): Promise<Food | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Food>(`SELECT * FROM foods WHERE id = ?`, id);
    return row ?? null;
  },

  async create(data: {
    name: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    defaultUnit?: string;
  }): Promise<number> {
    const db = await getDatabase();
    const now = getNowISO();
    const result = await db.runAsync(
      `INSERT INTO foods (name, calories, protein, carbs, fat, defaultUnit, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      data.name,
      data.calories ?? null,
      data.protein ?? null,
      data.carbs ?? null,
      data.fat ?? null,
      data.defaultUnit ?? 'g',
      now,
      now,
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.calories !== undefined) { fields.push('calories = ?'); values.push(data.calories); }
    if (data.protein !== undefined) { fields.push('protein = ?'); values.push(data.protein); }
    if (data.carbs !== undefined) { fields.push('carbs = ?'); values.push(data.carbs); }
    if (data.fat !== undefined) { fields.push('fat = ?'); values.push(data.fat); }
    if (data.defaultUnit !== undefined) { fields.push('defaultUnit = ?'); values.push(data.defaultUnit); }

    if (fields.length === 0) return;

    fields.push('updatedAt = ?');
    values.push(getNowISO());
    values.push(id);

    await db.runAsync(`UPDATE foods SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async delete(id: number): Promise<boolean> {
    const db = await getDatabase();
    
    // Verificar se o alimento está sendo usado em alguma refeição
    const usage = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM meal_foods WHERE foodId = ?`,
      id,
    );
    
    if (usage && usage.count > 0) {
      return false; // Não pode excluir, está em uso
    }

    await db.runAsync(`DELETE FROM foods WHERE id = ?`, id);
    return true;
  },

  async isUsed(id: number): Promise<boolean> {
    const db = await getDatabase();
    const usage = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM meal_foods WHERE foodId = ?`,
      id,
    );
    return (usage?.count ?? 0) > 0;
  },
};
