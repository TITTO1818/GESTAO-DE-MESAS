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
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const elapsedTime = getOccupiedElapsed();

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => onToggle(table.id)}
        className={`mesa-btn w-full rounded-[18px] cursor-pointer flex flex-col justify-center items-center relative overflow-hidden transition-all duration-100 ${
          table.isOccupied ? 'mesa-ocupada' : 'mesa-livre'
        }`}
        style={{ color: 'var(--cor-texto-mesa)' }}
        aria-label={`Mesa ${table.id}, status: ${table.isOccupied ? 'Ocupada' : 'Livre'}`}
      >
        {/* Table Number with large, bold font */}
        <span
          className="font-black tracking-tight leading-none select-none text-[3.2rem] sm:text-[3.8rem]"
          style={{ color: '#000000' }}
        >
          {table.id}
        </span>

        {/* Clean Status Badge: LIVRE / OCUPADA */}
        <span
          className="text-xs sm:text-[1.05rem] font-black tracking-wider mt-1 px-3 py-0.5 rounded-lg select-none uppercase"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.16)',
            color: '#000000',
          }}
        >
          {table.isOccupied ? 'OCUPADA' : 'LIVRE'}
        </span>

        {/* Elapsed time indicator when occupied */}
        {table.isOccupied && elapsedTime && (
          <div className="absolute top-2 left-2 flex items-center text-[10px] font-bold text-black/80 pointer-events-none">
            <span className="flex items-center gap-1 bg-black/15 backdrop-blur-xs px-1.5 py-0.5 rounded-md font-bold">
              <Clock className="w-3 h-3" />
              {elapsedTime}
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
