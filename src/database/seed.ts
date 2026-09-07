// ==========================================
// CutTrack — Seed Data
// ==========================================

import { getDatabase } from './database';
import { getNowISO } from '@/utils/dates';

/**
 * Seeds the database with default foods.
 * Only runs if the foods table has no default foods (isUserCreated = 0).
 */
export async function seedDatabase(): Promise<void> {
  const db = await getDatabase();
  
  // Check if default foods already exist
  const existingFood = await db.getFirstAsync('SELECT id FROM foods WHERE isUserCreated = 0 LIMIT 1');
  if (existingFood) return; // Already seeded

  const now = getNowISO();

  // Create foods in the foods table
  const foodsForDatabase = [
    // Carboidratos
    { name: 'Arroz, branco, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '1', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6, sodium: 1, defaultUnit: 'g' },
    { name: 'Arroz, integral, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '101', calories: 124, protein: 2.6, carbs: 25.8, fat: 1, fiber: 2.7, sodium: 1, defaultUnit: 'g' },
    { name: 'Aveia, flocos crua', category: 'Carboidratos', source: 'TACO', sourceId: '8', calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1, sodium: 5, defaultUnit: 'g' },
    { name: 'Batata, inglesa, cozida', category: 'Carboidratos', source: 'TACO', sourceId: '102', calories: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3, sodium: 2, defaultUnit: 'g' },
    { name: 'Batata, doce, cozida', category: 'Carboidratos', source: 'TACO', sourceId: '7', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, fiber: 2.2, sodium: 3, defaultUnit: 'g' },
    { name: 'Mandioca, cozida', category: 'Carboidratos', source: 'TACO', sourceId: '103', calories: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.9, sodium: 2, defaultUnit: 'g' },
    { name: 'Tapioca', category: 'Carboidratos', source: 'TACO', sourceId: '11', calories: 336, protein: 0, carbs: 83.1, fat: 0, fiber: 0.3, sodium: 1, defaultUnit: 'g' },
    { name: 'Macarrão, trigo, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '104', calories: 137, protein: 4.8, carbs: 28, fat: 0.6, fiber: 1.3, sodium: 2, defaultUnit: 'g' },
    { name: 'Pão, francês', category: 'Carboidratos', source: 'TACO', sourceId: '9', calories: 300, protein: 8, carbs: 58.6, fat: 3.1, fiber: 2.3, sodium: 648, defaultUnit: 'g' },
    { name: 'Pão, de forma, integral', category: 'Carboidratos', source: 'TACO', sourceId: '105', calories: 253, protein: 9.4, carbs: 49.9, fat: 3.7, fiber: 6.9, sodium: 400, defaultUnit: 'g' },
    { name: 'Cuscuz, de milho, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '106', calories: 113, protein: 2.2, carbs: 25.3, fat: 0.7, fiber: 2.4, sodium: 1, defaultUnit: 'g' },
    { name: 'Feijão, carioca, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '2', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5, sodium: 2, defaultUnit: 'g' },
    { name: 'Feijão, preto, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '107', calories: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.4, sodium: 2, defaultUnit: 'g' },
    { name: 'Lentilha, cozida', category: 'Carboidratos', source: 'TACO', sourceId: '108', calories: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9, sodium: 1, defaultUnit: 'g' },
    { name: 'Grão-de-bico, cozido', category: 'Carboidratos', source: 'TACO', sourceId: '109', calories: 116, protein: 6.6, carbs: 19.3, fat: 2.1, fiber: 6.3, sodium: 2, defaultUnit: 'g' },
    { name: 'Banana, prata, crua', category: 'Carboidratos', source: 'TACO', sourceId: '6', calories: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2, sodium: 0, defaultUnit: 'g' },
    { name: 'Banana, nanica, crua', category: 'Carboidratos', source: 'TACO', sourceId: '121', calories: 92, protein: 1.4, carbs: 23.8, fat: 0.1, fiber: 1.9, sodium: 0, defaultUnit: 'g' },
    { name: 'Maçã, Fuji, crua', category: 'Carboidratos', source: 'TACO', sourceId: '15', calories: 52, protein: 0.3, carbs: 15.2, fat: 0, fiber: 1.3, sodium: 0, defaultUnit: 'g' },
    { name: 'Mamão, Formosa, cru', category: 'Carboidratos', source: 'TACO', sourceId: '16', calories: 45, protein: 0.8, carbs: 11.6, fat: 0.1, fiber: 1.8, sodium: 3, defaultUnit: 'g' },
    { name: 'Melancia, crua', category: 'Carboidratos', source: 'TACO', sourceId: '126', calories: 30, protein: 0.6, carbs: 7.5, fat: 0.2, fiber: 0.4, sodium: 1, defaultUnit: 'g' },
    { name: 'Abacaxi, cru', category: 'Carboidratos', source: 'TACO', sourceId: '132', calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1, fiber: 1, sodium: 1, defaultUnit: 'g' },

    // Proteínas
    { name: 'Frango, peito, sem pele, grelhado', category: 'Proteínas', source: 'TACO', sourceId: '3', calories: 159, protein: 32, carbs: 0, fat: 2.5, fiber: 0, sodium: 50, defaultUnit: 'g' },
    { name: 'Carne bovina, patinho, grelhado', category: 'Proteínas', source: 'TACO', sourceId: '4', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, fiber: 0, sodium: 58, defaultUnit: 'g' },
    { name: 'Carne bovina, alcatra, grelhada', category: 'Proteínas', source: 'TACO', sourceId: '111', calories: 241, protein: 31.9, carbs: 0, fat: 11.6, fiber: 0, sodium: 60, defaultUnit: 'g' },
    { name: 'Carne bovina, acém, moído', category: 'Proteínas', source: 'TACO', sourceId: '201', calories: 212, protein: 26.7, carbs: 0, fat: 10.9, fiber: 0, sodium: 60, defaultUnit: 'g' },
    { name: 'Carne suína, lombo, assado', category: 'Proteínas', source: 'TACO', sourceId: '112', calories: 210, protein: 35.7, carbs: 0, fat: 6.1, fiber: 0, sodium: 55, defaultUnit: 'g' },
    { name: 'Peixe, tilápia, filé, assado', category: 'Proteínas', source: 'TACO', sourceId: '113', calories: 128, protein: 26.1, carbs: 0, fat: 2.6, fiber: 0, sodium: 50, defaultUnit: 'g' },
    { name: 'Peixe, salmão, grelhado', category: 'Proteínas', source: 'TACO', sourceId: '114', calories: 206, protein: 22.1, carbs: 0, fat: 13.1, fiber: 0, sodium: 59, defaultUnit: 'g' },
    { name: 'Peixe, atum em conserva (água)', category: 'Proteínas', source: 'IBGE', sourceId: '202', calories: 116, protein: 25.5, carbs: 0, fat: 0.9, fiber: 0, sodium: 338, defaultUnit: 'g' },
    { name: 'Ovo, de galinha, cozido', category: 'Proteínas', source: 'TACO', sourceId: '5', calories: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0, sodium: 146, defaultUnit: 'g' },
    { name: 'Ovo, de galinha, frito', category: 'Proteínas', source: 'TACO', sourceId: '115', calories: 240, protein: 15.6, carbs: 1.2, fat: 18.9, fiber: 0, sodium: 168, defaultUnit: 'g' },
    { name: 'Peito de peru, defumado', category: 'Proteínas', source: 'TACO', sourceId: '13', calories: 98, protein: 16.5, carbs: 0.9, fat: 3.1, fiber: 0, sodium: 1105, defaultUnit: 'g' },
    { name: 'Soja, cozida', category: 'Proteínas', source: 'TACO', sourceId: '110', calories: 173, protein: 16.6, carbs: 9.9, fat: 9, fiber: 6, sodium: 1, defaultUnit: 'g' },
    { name: 'Whey Protein Concentrado 80%', category: 'Proteínas', source: 'Genérico', sourceId: '168', calories: 400, protein: 80, carbs: 6, fat: 6, fiber: 0, sodium: 150, defaultUnit: 'g' },
    { name: 'Whey Protein Isolado 90%', category: 'Proteínas', source: 'Genérico', sourceId: '169', calories: 370, protein: 90, carbs: 2, fat: 1, fiber: 0, sodium: 150, defaultUnit: 'g' },

    // Laticínios
    { name: 'Leite, vaca, integral', category: 'Laticínios', source: 'TACO', sourceId: '10', calories: 62, protein: 3.3, carbs: 4.5, fat: 3.3, fiber: 0, sodium: 61, defaultUnit: 'ml' },
    { name: 'Leite, vaca, desnatado', category: 'Laticínios', source: 'TACO', sourceId: '116', calories: 35, protein: 3.4, carbs: 5.1, fat: 0.1, fiber: 0, sodium: 52, defaultUnit: 'ml' },
    { name: 'Queijo, mussarela', category: 'Laticínios', source: 'TACO', sourceId: '12', calories: 330, protein: 22.6, carbs: 3, fat: 25.2, fiber: 0, sodium: 580, defaultUnit: 'g' },
    { name: 'Queijo, minas frescal', category: 'Laticínios', source: 'TACO', sourceId: '117', calories: 264, protein: 17.4, carbs: 3.2, fat: 20.2, fiber: 0, sodium: 350, defaultUnit: 'g' },
    { name: 'Queijo, parmesão', category: 'Laticínios', source: 'TACO', sourceId: '118', calories: 431, protein: 35.6, carbs: 3.2, fat: 30.6, fiber: 0, sodium: 1528, defaultUnit: 'g' },
    { name: 'Requeijão, cremoso', category: 'Laticínios', source: 'IBGE', sourceId: '203', calories: 257, protein: 9.6, carbs: 2.4, fat: 23.4, fiber: 0, sodium: 550, defaultUnit: 'g' },
    { name: 'Iogurte, natural, integral', category: 'Laticínios', source: 'TACO', sourceId: '119', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sodium: 46, defaultUnit: 'g' },
    { name: 'Iogurte, natural, desnatado', category: 'Laticínios', source: 'TACO', sourceId: '120', calories: 41, protein: 3.8, carbs: 6.1, fat: 0.2, fiber: 0, sodium: 50, defaultUnit: 'g' },

    // Gorduras
    { name: 'Azeite, de oliva, extra virgem', category: 'Gorduras', source: 'TACO', sourceId: '17', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 2, defaultUnit: 'ml' },
    { name: 'Óleo, de soja', category: 'Gorduras', source: 'TACO', sourceId: '148', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 0, defaultUnit: 'ml' },
    { name: 'Manteiga, sem sal', category: 'Gorduras', source: 'TACO', sourceId: '149', calories: 726, protein: 0.4, carbs: 0.1, fat: 81.1, fiber: 0, sodium: 11, defaultUnit: 'g' },
    { name: 'Margarina, com sal', category: 'Gorduras', source: 'TACO', sourceId: '151', calories: 717, protein: 0.2, carbs: 0.9, fat: 80, fiber: 0, sodium: 800, defaultUnit: 'g' },
    { name: 'Pasta de amendoim', category: 'Gorduras', source: 'TACO', sourceId: '14', calories: 597, protein: 28.5, carbs: 19.3, fat: 49.4, fiber: 7.2, sodium: 17, defaultUnit: 'g' },
    { name: 'Amendoim, torrado', category: 'Gorduras', source: 'TACO', sourceId: '152', calories: 606, protein: 22.5, carbs: 18.7, fat: 54, fiber: 8, sodium: 5, defaultUnit: 'g' },
    { name: 'Castanha de caju, torrada', category: 'Gorduras', source: 'TACO', sourceId: '153', calories: 570, protein: 18.5, carbs: 29, fat: 46.3, fiber: 3, sodium: 14, defaultUnit: 'g' },
    { name: 'Castanha do pará, crua', category: 'Gorduras', source: 'TACO', sourceId: '154', calories: 656, protein: 14.5, carbs: 15.1, fat: 63.5, fiber: 7.9, sodium: 3, defaultUnit: 'g' },
    { name: 'Abacate, cru', category: 'Gorduras', source: 'TACO', sourceId: '128', calories: 96, protein: 1.2, carbs: 6, fat: 8.4, fiber: 3, sodium: 0, defaultUnit: 'g' },

    // Vegetais
    { name: 'Alface, lisa, crua', category: 'Vegetais', source: 'TACO', sourceId: '134', calories: 14, protein: 1.7, carbs: 2.4, fat: 0.1, fiber: 1.3, sodium: 4, defaultUnit: 'g' },
    { name: 'Tomate, com semente, cru', category: 'Vegetais', source: 'TACO', sourceId: '135', calories: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2, sodium: 1, defaultUnit: 'g' },
    { name: 'Cenoura, crua', category: 'Vegetais', source: 'TACO', sourceId: '136', calories: 41, protein: 1.3, carbs: 9.7, fat: 0.2, fiber: 3.2, sodium: 69, defaultUnit: 'g' },
    { name: 'Cebola, crua', category: 'Vegetais', source: 'TACO', sourceId: '138', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sodium: 4, defaultUnit: 'g' },
    { name: 'Brócolis, cozido', category: 'Vegetais', source: 'TACO', sourceId: '139', calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5, fiber: 3.4, sodium: 33, defaultUnit: 'g' },
    { name: 'Couve, manteiga, refogada', category: 'Vegetais', source: 'TACO', sourceId: '140', calories: 90, protein: 2.8, carbs: 7.9, fat: 5.8, fiber: 5.7, sodium: 11, defaultUnit: 'g' },
    { name: 'Abobrinha, italiana, cozida', category: 'Vegetais', source: 'TACO', sourceId: '141', calories: 15, protein: 1.1, carbs: 3, fat: 0.2, fiber: 1.6, sodium: 1, defaultUnit: 'g' },
    { name: 'Abóbora, cabotian, cozida', category: 'Vegetais', source: 'TACO', sourceId: '142', calories: 48, protein: 1.4, carbs: 10.8, fat: 0.7, fiber: 2.5, sodium: 1, defaultUnit: 'g' },
    { name: 'Pepino, cru', category: 'Vegetais', source: 'TACO', sourceId: '143', calories: 10, protein: 0.9, carbs: 2, fat: 0, fiber: 1.1, sodium: 2, defaultUnit: 'g' },
    { name: 'Pimentão, verde, cru', category: 'Vegetais', source: 'TACO', sourceId: '144', calories: 21, protein: 1.1, carbs: 4.9, fat: 0.2, fiber: 2.6, sodium: 2, defaultUnit: 'g' },
    { name: 'Beterraba, cozida', category: 'Vegetais', source: 'TACO', sourceId: '145', calories: 32, protein: 1.3, carbs: 7.2, fat: 0.1, fiber: 1.9, sodium: 41, defaultUnit: 'g' },

    // Doces e Extras
    { name: 'Açúcar, cristal', category: 'Doces e Extras', source: 'TACO', sourceId: '157', calories: 387, protein: 0.3, carbs: 99.6, fat: 0, fiber: 0, sodium: 2, defaultUnit: 'g' },
    { name: 'Açúcar, mascavo', category: 'Doces e Extras', source: 'TACO', sourceId: '158', calories: 369, protein: 0.8, carbs: 94.5, fat: 0.1, fiber: 0, sodium: 22, defaultUnit: 'g' },
    { name: 'Mel, de abelha', category: 'Doces e Extras', source: 'TACO', sourceId: '159', calories: 312, protein: 0.3, carbs: 84, fat: 0, fiber: 0, sodium: 4, defaultUnit: 'g' },
    { name: 'Chocolate ao leite', category: 'Doces e Extras', source: 'TACO', sourceId: '160', calories: 540, protein: 6.8, carbs: 58.7, fat: 32.2, fiber: 2.1, sodium: 120, defaultUnit: 'g' },
    { name: 'Doce de leite, cremoso', category: 'Doces e Extras', source: 'IBGE', sourceId: '204', calories: 315, protein: 6.2, carbs: 57, fat: 6.8, fiber: 0, sodium: 125, defaultUnit: 'g' },
    { name: 'Leite condensado', category: 'Doces e Extras', source: 'IBGE', sourceId: '205', calories: 321, protein: 7.7, carbs: 54.3, fat: 8.2, fiber: 0, sodium: 127, defaultUnit: 'g' },
    { name: 'Biscoito, recheado, chocolate', category: 'Doces e Extras', source: 'TACO', sourceId: '161', calories: 472, protein: 5.7, carbs: 70.5, fat: 19.6, fiber: 3.1, sodium: 350, defaultUnit: 'g' },
    { name: 'Laranja, suco', category: 'Doces e Extras', source: 'TACO', sourceId: '125', calories: 42, protein: 0.7, carbs: 10, fat: 0.1, fiber: 0.2, sodium: 0, defaultUnit: 'ml' },
    { name: 'Suco de uva, integral', category: 'Doces e Extras', source: 'IBGE', sourceId: '206', calories: 60, protein: 0, carbs: 15, fat: 0, fiber: 0, sodium: 5, defaultUnit: 'ml' },
    { name: 'Refrigerante, tipo cola', category: 'Doces e Extras', source: 'TACO', sourceId: '164', calories: 43, protein: 0, carbs: 11, fat: 0, fiber: 0, sodium: 5, defaultUnit: 'ml' },
    { name: 'Refrigerante, tipo cola, zero', category: 'Doces e Extras', source: 'Genérico', sourceId: '165', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 10, defaultUnit: 'ml' },
    { name: 'Cerveja, pilsen', category: 'Doces e Extras', source: 'TACO', sourceId: '166', calories: 41, protein: 0.4, carbs: 3.3, fat: 0, fiber: 0, sodium: 3, defaultUnit: 'ml' },
  ];

  for (const food of foodsForDatabase) {
    await db.runAsync(
      `INSERT INTO foods (name, category, source, sourceId, calories, protein, carbs, fat, fiber, sodium, defaultUnit, isUserCreated, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      food.name, food.category, food.source, food.sourceId, food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sodium, food.defaultUnit, 0, now, now,
    );
  }
}
