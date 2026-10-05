import React from 'react';
import { TableData } from '../types.ts';
import { Clock } from 'lucide-react';

interface TableCardProps {
  table: TableData;
  onToggle: (id: number) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  onToggle,
}) => {
  // Format occupied elapsed time if table is occupied
  const getOccupiedElapsed = () => {
    if (!table.isOccupied || !table.occupiedAt) return null;
    const elapsedMinutes = Math.floor((Date.now() - table.occupiedAt) / (1000 * 60));
    if (elapsedMinutes < 1) return 'Agora';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
    const hours = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    return `${hours}h${mins > 0 ? `${mins}m` : ''}`;
  };

  const elapsedTime = getOccupiedElapsed();

  return (
    <div className="relative group w-full">
      <button
        type="button"
        onClick={() => onToggle(table.id)}
        className={`mesa-btn w-full rounded-lg sm:rounded-xl cursor-pointer flex flex-col justify-center items-center relative overflow-hidden transition-all duration-100 p-0.5 ${
          table.isOccupied ? 'mesa-ocupada' : 'mesa-livre'
        }`}
        style={{ color: 'var(--cor-texto-mesa)' }}
        aria-label={`Mesa ${table.id} (${table.chairs} lugares), status: ${table.isOccupied ? 'Ocupada' : 'Livre'}`}
      >
        {/* Table Number */}
        <span
          className="font-black tracking-tight leading-none select-none text-xl sm:text-2xl md:text-3xl"
          style={{ color: '#000000' }}
        >
          {table.id}
        </span>

        {/* Clean Status Badge: LIVRE / OCUPADA */}
        <span
          className="text-[8px] sm:text-[9.5px] font-black tracking-tight mt-0.5 px-1 py-0.2 rounded select-none uppercase leading-tight"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.16)',
            color: '#000000',
          }}
        >
          {table.isOccupied ? 'OCUPADA' : 'LIVRE'}
        </span>

        {/* Chair Capacity badge at top-right */}
        <div
          title={`${table.chairs} lugares`}
          className="absolute top-0.5 right-0.5 flex items-center text-[7.5px] sm:text-[8.5px] font-black text-black/85 bg-black/15 backdrop-blur-xs px-0.5 py-0.2 rounded pointer-events-none"
        >
          {table.chairs}L
        </div>

        {/* Elapsed time indicator when occupied */}
        {table.isOccupied && elapsedTime && (
          <div className="absolute top-0.5 left-0.5 flex items-center text-[7.5px] sm:text-[8.5px] font-bold text-black/85 pointer-events-none">
            <span className="flex items-center gap-0.5 bg-black/15 backdrop-blur-xs px-0.5 py-0.2 rounded font-bold">
              <Clock className="w-2 h-2" />
              {elapsedTime}
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
