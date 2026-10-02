export interface TableData {
  id: number;
  chairs: number;
  isOccupied: boolean;
  occupiedAt?: number | null; // timestamp
  note?: string;
}

export type FilterStatus = 'todas' | 'livres' | 'ocupadas';
