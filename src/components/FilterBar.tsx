import React from 'react';
import { FilterStatus } from '../types.ts';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  statusFilter: FilterStatus;
  onChangeStatusFilter: (status: FilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onChangeStatusFilter,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="w-full max-w-4xl px-3 mb-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
      {/* Status Segmented Buttons */}
      <div className="flex items-center bg-black/60 p-1 rounded-lg border border-neutral-800 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onChangeStatusFilter('todas')}
          className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
            statusFilter === 'todas'
              ? 'bg-[#ff6a00] text-black shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => onChangeStatusFilter('livres')}
          className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
            statusFilter === 'livres'
              ? 'bg-[#44eb87] text-black shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Apenas Livres
        </button>
        <button
          type="button"
          onClick={() => onChangeStatusFilter('ocupadas')}
          className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
            statusFilter === 'ocupadas'
              ? 'bg-[#ff4d4d] text-black shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Apenas Ocupadas
        </button>
      </div>

      {/* Search by Table Number */}
      <div className="relative w-full sm:w-44">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          inputMode="numeric"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar mesa..."
          className="w-full pl-8 pr-7 py-1 bg-black/60 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff6a00]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
