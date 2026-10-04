export interface TableData {
  id: number;
  chairs: number;
  isOccupied: boolean;
  occupiedAt?: number | null; // timestamp
  note?: string;
}

export type FilterStatus = 'todas' | 'livres' | 'ocupadas';

export interface WaitlistItem {
  id: string;
  name: string;
  places: number;
  completed: boolean;
  order: number;
  completedAt?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
