// ==========================================
// CutTrack — Database Initialization & Migrations
// ==========================================

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cuttrack.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`PRAGMA journal_mode = WAL;`);
  await database.execAsync(`PRAGMA foreign_keys = ON;`);

  // Migration version tracking
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const result = await database.getFirstAsync<{ version: number }>(
    `SELECT MAX(version) as version FROM migrations`,
  );
  const currentVersion = result?.version ?? 0;

  if (currentVersion < 1) {
    await applyMigration1(database);
  }
  if (currentVersion < 2) {
    await applyMigration2(database);
  }
}

async function applyMigration1(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      initialWeight REAL NOT NULL DEFAULT 0,
      goalWeight REAL NOT NULL DEFAULT 0,
      weightUnit TEXT NOT NULL DEFAULT 'kg',
      measurementUnit TEXT NOT NULL DEFAULT 'cm',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weight_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL DEFAULT 1,
      weight REAL NOT NULL,
      recordedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_weight_records_date ON weight_records(recordedAt);

    CREATE TABLE IF NOT EXISTS body_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL DEFAULT 1,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'cm',
      recordedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_body_measurements_type_date ON body_measurements(type, recordedAt);

    CREATE TABLE IF NOT EXISTS diets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      calories INTEGER,
      startDate TEXT NOT NULL,
      endDate TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dietId INTEGER NOT NULL,
      name TEXT NOT NULL,
      time TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (dietId) REFERENCES diets(id)
    );

    CREATE TABLE IF NOT EXISTS meal_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mealId INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      FOREIGN KEY (mealId) REFERENCES meals(id)
    );

    CREATE TABLE IF NOT EXISTS meal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mealId INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT,
      FOREIGN KEY (mealId) REFERENCES meals(id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_logs_meal_date ON meal_logs(mealId, date);

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    INSERT INTO migrations (version, appliedAt) VALUES (1, datetime('now'));
  `);
}

async function applyMigration2(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    -- Novos campos no user
    ALTER TABLE users ADD COLUMN height REAL;
    ALTER TABLE users ADD COLUMN birthDate TEXT;
    ALTER TABLE users ADD COLUMN goal TEXT NOT NULL DEFAULT 'loss';
    ALTER TABLE users ADD COLUMN calorieTarget INTEGER;
    ALTER TABLE users ADD COLUMN onboardingComplete INTEGER NOT NULL DEFAULT 0;

    -- Banco de alimentos reutilizáveis
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      defaultUnit TEXT NOT NULL DEFAULT 'g',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    -- Adicionar foodId + snapshots no meal_foods
    ALTER TABLE meal_foods ADD COLUMN foodId INTEGER REFERENCES foods(id);
    ALTER TABLE meal_foods ADD COLUMN caloriesSnapshot REAL;
    ALTER TABLE meal_foods ADD COLUMN proteinSnapshot REAL;
    ALTER TABLE meal_foods ADD COLUMN carbsSnapshot REAL;
    ALTER TABLE meal_foods ADD COLUMN fatSnapshot REAL;

    -- Copiar valores existentes para snapshots
    UPDATE meal_foods SET
      caloriesSnapshot = calories,
      proteinSnapshot = protein,
      carbsSnapshot = carbs,
      fatSnapshot = fat;

    -- Substituições
    CREATE TABLE IF NOT EXISTS food_substitutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mealFoodId INTEGER NOT NULL,
      alternativeFoodId INTEGER NOT NULL,
      quantity REAL,
      unit TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (mealFoodId) REFERENCES meal_foods(id) ON DELETE CASCADE,
      FOREIGN KEY (alternativeFoodId) REFERENCES foods(id)
    );

    -- Notas da dieta (observações)
    ALTER TABLE diets ADD COLUMN notes TEXT;

    -- Histórico de alterações
    CREATE TABLE IF NOT EXISTS diet_change_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dietId INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (dietId) REFERENCES diets(id) ON DELETE CASCADE
    );

    INSERT INTO migrations (version, appliedAt) VALUES (2, datetime('now'));
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
