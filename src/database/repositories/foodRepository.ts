import { getDatabase } from '../database';
import { getNowISO } from '@/utils/dates';
import type { Food } from '@/types';

export const foodRepository = {
  async getAll(searchQuery: string = ''): Promise<Food[]> {
    const db = await getDatabase();
    if (searchQuery.trim() === '') {
      return db.getAllAsync<Food>('SELECT * FROM foods ORDER BY name ASC LIMIT 100');
    }
    const query = `%${searchQuery.trim()}%`;
    return db.getAllAsync<Food>(
      'SELECT * FROM foods WHERE name LIKE ? ORDER BY name ASC LIMIT 50',
      query,
    );
  },

  async getUserFoods(): Promise<Food[]> {
    const db = await getDatabase();
    return db.getAllAsync<Food>('SELECT * FROM foods WHERE isUserCreated = 1 ORDER BY name ASC');
  },

  async getById(id: number): Promise<Food | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Food>('SELECT * FROM foods WHERE id = ?', id);
    return row ?? null;
  },

  async create(data: Omit<Food, 'id' | 'createdAt' | 'updatedAt' | 'isUserCreated'> & { isUserCreated?: boolean }): Promise<Food> {
    const db = await getDatabase();
    const now = getNowISO();
    
    const result = await db.runAsync(
      `INSERT INTO foods (
        name, category, source, sourceId, sourceVersion,
        calories, protein, carbs, fat, fiber, sodium, defaultUnit,
        isUserCreated, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.name,
      data.category ?? null,
      data.source ?? null,
      data.sourceId ?? null,
      data.sourceVersion ?? null,
      data.calories ?? null,
      data.protein ?? null,
      data.carbs ?? null,
      data.fat ?? null,
      data.fiber ?? null,
      data.sodium ?? null,
      data.defaultUnit ?? 'g',
      data.isUserCreated ? 1 : 0,
      now,
      now,
    );
    
    return {
      ...data,
      id: result.lastInsertRowId,
      category: data.category ?? null,
      source: data.source ?? null,
      sourceId: data.sourceId ?? null,
      sourceVersion: data.sourceVersion ?? null,
      calories: data.calories ?? null,
      protein: data.protein ?? null,
      carbs: data.carbs ?? null,
      fat: data.fat ?? null,
      fiber: data.fiber ?? null,
      sodium: data.sodium ?? null,
      defaultUnit: data.defaultUnit ?? 'g',
      isUserCreated: data.isUserCreated ?? false,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: number, data: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const db = await getDatabase();
    const now = getNowISO();
    
    const fields: string[] = ['updatedAt = ?'];
    const values: any[] = [now];
    
    const updatableFields = [
      'name', 'category', 'source', 'sourceId', 'sourceVersion',
      'calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'defaultUnit', 'isUserCreated'
    ];
    
    for (const field of updatableFields) {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = ?`);
        let value = data[field as keyof typeof data];
        if (field === 'isUserCreated' && typeof value === 'boolean') {
          value = value ? 1 : 0;
        }
        values.push(value);
      }
    }
    
    if (fields.length === 1) return;
    
    values.push(id);
    await db.runAsync(`UPDATE foods SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    
    // Check if food is used in any meal_foods before hard deleting. 
    // Wait, the prompt says "tratar corretamente os relacionamentos e preservar snapshots históricos".
    // We will update meal_foods to remove the link, relying on the snapshot.
    await db.runAsync(`UPDATE meal_foods SET foodId = NULL WHERE foodId = ?`, id);
    
    await db.runAsync('DELETE FROM foods WHERE id = ? AND isUserCreated = 1', id);
  },
};
