import { TableData } from '../types.ts';

export const MESAS_3_CADEIRAS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  20, 22, 23, 25, 26,
  31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
  46, 48, 50, 52
];

export const MESAS_2_CADEIRAS = [45, 47, 49, 51];

export const MESAS_EXCLUIDAS = [13, 24];

export function getChairsCount(tableNumber: number): number {
  if (MESAS_3_CADEIRAS.includes(tableNumber)) return 3;
  if (MESAS_2_CADEIRAS.includes(tableNumber)) return 2;
  if (tableNumber === 21) return 4;
  if (tableNumber === 53) return 7;
  return 6;
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
