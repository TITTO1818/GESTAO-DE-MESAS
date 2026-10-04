/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { FilterStatus } from './types.ts';
import { useRealtimeTables } from './hooks/useRealtimeTables.ts';
import { useRealtimeWaitlist } from './hooks/useRealtimeWaitlist.ts';
import { Header } from './components/Header.tsx';
import { StatsBar } from './components/StatsBar.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { TableCard } from './components/TableCard.tsx';
import { ConfirmModal } from './components/ConfirmModal.tsx';
import { WaitlistModal } from './components/WaitlistModal.tsx';

export default function App() {
  const {
    tables,
    isConnected,
    soundEnabled,
    toggleSound,
    toggleTable,
    resetAllTables,
  } = useRealtimeTables();

  const {
    items: waitlistItems,
    addItem: addWaitlistItem,
    toggleItem: toggleWaitlistItem,
    deleteItem: deleteWaitlistItem,
    clearCompleted: clearCompletedWaitlist,
  } = useRealtimeWaitlist();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  // Clean table statistics: Free vs Occupied
  const stats = useMemo(() => {
    let freeTables = 0;
    let occupiedTables = 0;

    tables.forEach((t) => {
      if (t.isOccupied) {
        occupiedTables++;
      } else {
        freeTables++;
      }
    });

    return {
      freeTables,
      occupiedTables,
      totalTables: tables.length,
    };
  }, [tables]);

  // Filtered tables list
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      // Status filter
      if (statusFilter === 'livres' && t.isOccupied) return false;
      if (statusFilter === 'ocupadas' && !t.isOccupied) return false;

      // Search query (table number)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesNumber = t.id.toString().includes(query);
        if (!matchesNumber) return false;
      }

      return true;
    });
  }, [tables, statusFilter, searchQuery]);

  const handleConfirmReset = useCallback(() => {
    resetAllTables();
    setIsResetConfirmOpen(false);
  }, [resetAllTables]);

  return (
    <div className="min-h-screen flex flex-col items-center pb-8 selection:bg-orange-500 selection:text-black">
      {/* Header with real-time status and prominent Fila de Espera button */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onRequestReset={() => setIsResetConfirmOpen(true)}
        occupiedCount={stats.occupiedTables}
        isConnected={isConnected}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />

      {/* Clean Stats Bar (Livres e Ocupadas) */}
      <StatsBar
        freeTablesCount={stats.freeTables}
        occupiedTablesCount={stats.occupiedTables}
        totalTables={stats.totalTables}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        statusFilter={statusFilter}
        onChangeStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Tables Grid */}
      <main className="w-full max-w-[1100px] px-2 sm:px-4 flex-1">
        {filteredTables.length === 0 ? (
          <div className="text-center py-16 bg-black/40 rounded-2xl border border-neutral-800 my-6">
            <p className="text-neutral-400 font-semibold text-lg">
              Nenhuma mesa encontrada com os filtros selecionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('todas');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#ff6a00] text-black text-sm font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2 w-full">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onToggle={toggleTable}
              />
            ))}
          </div>
        )}
      </main>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Liberar Todas as Mesas?"
        message={`Esta ação marcará todas as ${stats.occupiedTables} mesa(s) ocupada(s) como LIVRE imediatamente em todos os celulares conectados.`}
        confirmLabel="Sim, Liberar Todas"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Fila de Espera Modal (iPhone Notes Style Checklist) */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        items={waitlistItems}
        onAddItem={addWaitlistItem}
        onToggleItem={toggleWaitlistItem}
        onDeleteItem={deleteWaitlistItem}
        onClearCompleted={clearCompletedWaitlist}
      />
    </div>
  );
}
