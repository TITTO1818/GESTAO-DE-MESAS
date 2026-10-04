import React, { useState } from 'react';
import { WaitlistItem } from '../types.ts';
import { X, Check, CheckCircle2, Plus, Trash2 } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WaitlistItem[];
  onAddItem: (name: string, places: number) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearCompleted: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onClearCompleted,
}) => {
  const [name, setName] = useState('');
  const [places, setPlaces] = useState<number | ''>(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const numPlaces = typeof places === 'number' && places > 0 ? places : 2;
    onAddItem(name.trim(), numPlaces);
    setName('');
    setPlaces(2);
  };

  const hasCompleted = items.some((item) => item.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#1c1c1e] text-white border border-[#2c2c2e] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
      >
        {/* Apple Notes Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2c2c2e] bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <h2 id="waitlist-title" className="text-xl font-black tracking-tight text-white">
              Fila de Espera
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simple Add Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-[#242426] border-b border-[#2c2c2e]">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Nome da pessoa */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da pessoa"
              className="w-full sm:flex-1 px-3.5 py-2.5 bg-[#161618] border border-neutral-700/80 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-400 transition-colors"
              autoFocus
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Quantidade de lugares */}
              <div className="relative w-28 sm:w-24">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={places}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlaces(val === '' ? '' : parseInt(val, 10) || 1);
                  }}
                  placeholder="Lugares"
                  className="w-full px-3 py-2.5 bg-[#161618] border border-neutral-700/80 rounded-xl text-sm text-white text-center placeholder-neutral-500 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-semibold pointer-events-none">
                  lug
                </span>
              </div>

              {/* Botão Adicionar */}
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1 shadow-md border border-blue-400/50"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </form>

        {/* iPhone Notes Style Interactive Checklist */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-neutral-800/40">
          {items.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm font-medium">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-neutral-600 opacity-60 stroke-[1.5]" />
              <p>Nenhuma pessoa na fila de espera.</p>
              <p className="text-xs text-neutral-600 mt-1">
                Adicione um nome acima para iniciar o checklist.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 py-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 ${
                    item.completed
                      ? 'bg-black/15 opacity-60'
                      : 'hover:bg-neutral-800/50 bg-neutral-900/30'
                  }`}
                >
                  {/* Circular checklist button and Name - X lugares */}
                  <div
                    onClick={() => onToggleItem(item.id)}
                    className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                  >
                    {/* iPhone Notes Checklist Circle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleItem(item.id);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer ${
                        item.completed
                          ? 'bg-blue-600 border-2 border-blue-400 text-white shadow-xs'
                          : 'border-2 border-neutral-500 hover:border-blue-400 bg-transparent'
                      }`}
                      aria-label={
                        item.completed ? 'Desmarcar da fila' : 'Marcar como atendido'
                      }
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                    </button>

                    {/* Name - X lugares */}
                    <span
                      className={`text-base font-semibold transition-all ${
                        item.completed
                          ? 'line-through text-neutral-400 font-normal'
                          : 'text-neutral-100'
                      }`}
                    >
                      {item.name} - {item.places} {item.places === 1 ? 'lugar' : 'lugares'}
                    </span>
                  </div>

                  {/* Discreet delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    title="Remover da lista"
                    className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with optional Clear Completed */}
        {hasCompleted && (
          <div className="px-5 py-3 border-t border-[#2c2c2e] bg-[#161618] flex items-center justify-end">
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Limpar concluídos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
