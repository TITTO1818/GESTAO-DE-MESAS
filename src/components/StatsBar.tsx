import React from 'react';

interface StatsBarProps {
  freeTablesCount: number;
  occupiedTablesCount: number;
  totalTables: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  freeTablesCount,
  occupiedTablesCount,
  totalTables,
}) => {
  return (
    <div className="w-full max-w-4xl flex items-center justify-center mb-2 px-3">
      {/* Clean Legend and Counts */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-black/60 px-4 py-2 rounded-xl border border-[#ff6a00]/30 shadow-md backdrop-blur-sm">
        {/* LIVRE */}
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm select-none">
          <div
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded shadow-xs"
            style={{ backgroundColor: 'var(--cor-livre)' }}
          />
          <span className="tracking-wide text-neutral-200">LIVRES:</span>
          <span className="text-xs sm:text-sm font-black px-2 py-0.2 rounded-full bg-emerald-950/90 text-[#44eb87] border border-emerald-700/50">
            {freeTablesCount}
          </span>
        </div>

        <div className="w-px h-4 bg-neutral-800 hidden sm:block" />

        {/* OCUPADA */}
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm select-none">
          <div
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded shadow-xs"
            style={{ backgroundColor: 'var(--cor-ocupada)' }}
          />
          <span className="tracking-wide text-neutral-200">OCUPADAS:</span>
          <span className="text-xs sm:text-sm font-black px-2 py-0.2 rounded-full bg-red-950/90 text-[#ff6a6a] border border-red-700/50">
            {occupiedTablesCount}
          </span>
        </div>

        <div className="w-px h-4 bg-neutral-800 hidden sm:block" />

        {/* TOTAL */}
        <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-400 select-none">
          <span>TOTAL:</span>
          <span className="font-bold text-white px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800">
            {totalTables}
          </span>
        </div>
      </div>
    </div>
  );
};
