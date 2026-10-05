import { TableData } from '../types.ts';

// 3 Lugares: mesas especificadas pelo usuário (incluindo mesa 50)
export const MESAS_3_LUGARES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  20, 22, 23, 25, 26,
  31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44,
  46, 47, 49, 50, 52
];

// 6 Lugares: 12 mesas especificadas pelo usuário
export const MESAS_6_LUGARES = [
  11, 12, 14, 15, 16, 17, 18, 19,
  27, 28, 29, 30
];

// Mesas não existentes no El Cardal (totalizando 51 mesas de 1 a 53)
export const MESAS_EXCLUIDAS = [13, 24];

export function getChairsCount(tableNumber: number): number {
  if (MESAS_3_LUGARES.includes(tableNumber)) return 3;
  if (MESAS_6_LUGARES.includes(tableNumber)) return 6;
  if (tableNumber === 21) return 4;
  if (tableNumber === 53) return 7;
  // Demais mesas (ex: 45, 48, 51) possuem 2 lugares
  return 2;
}

export function generateInitialTables(): TableData[] {
  const tables: TableData[] = [];
  for (let i = 1; i <= 53; i++) {
    if (MESAS_EXCLUIDAS.includes(i)) continue;
    tables.push({
      id: i,
      chairs: getChairsCount(i),
      isOccupied: false,
      occupiedAt: null,
      note: '',
    });
  }
  return tables;
}
