import React, { useState, useEffect } from 'react';
import { WaitlistItem } from '../types.ts';
import { X, Check, CheckCircle2, Plus, Minus, Trash2, Clock } from 'lucide-react';

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
  const [places, setPlaces] = useState<number>(2);
  const [, setTick] = useState(0);

  // Live timer tick to keep waiting times updated
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 20000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddItem(name.trim(), places || 2);
    setName('');
    setPlaces(2);
  };

  const hasCompleted = items.some((item) => item.completed);

  // Calculate elapsed time the person has been waiting
  const getWaitingTime = (item: WaitlistItem) => {
    let createdMs: number | null = null;
    if (item.createdAt) {
      const parsed = new Date(item.createdAt).getTime();
      if (!isNaN(parsed) && parsed > 0) {
        createdMs = parsed;
      }
    }
    if (!createdMs && item.order && item.order > 1000000000000) {
      createdMs = item.order;
    }
    if (!createdMs) return 'Agora';

    const diffMs = Math.max(0, Date.now() - createdMs);
    const elapsedMinutes = Math.floor(diffMs / 60000);

    if (elapsedMinutes < 1) return 'Agora (< 1m)';
    if (elapsedMinutes < 60) return `${elapsedMinutes} min`;
    const hours = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

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

        {/* Simple Add Form with Stepper [-] / [+] */}
        <form onSubmit={handleSubmit} className="p-3.5 bg-[#242426] border-b border-[#2c2c2e]">
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

            <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
              {/* Quantidade de lugares com botões [-] e [+] */}
              <div className="flex items-center bg-[#161618] border border-neutral-700/80 rounded-xl p-1 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlaces((prev) => Math.max(1, prev - 1))}
                  disabled={places <= 1}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer select-none"
                  title="Diminuir lugares (-)"
                  aria-label="Diminuir lugares"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="px-2 text-center min-w-[50px] flex items-center justify-center select-none">
                  <span className="text-white font-black text-sm">
                    {places} <span className="text-[10px] text-neutral-400 font-semibold">{places === 1 ? 'lug' : 'lug'}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPlaces((prev) => Math.min(30, prev + 1))}
                  disabled={places >= 30}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white flex items-center justify-center transition-colors cursor-pointer select-none"
                  title="Aumentar lugares (+)"
                  aria-label="Aumentar lugares"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
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

        {/* iPhone Notes Style Interactive Checklist with Waiting Time */}
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
                  {/* Circular checklist button and Name - X lugares + Waiting Time */}
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

                    {/* Name, Places & Waiting Time */}
                    <div className="flex flex-col">
                      <span
                        className={`text-base font-semibold leading-tight transition-all ${
                          item.completed
                            ? 'line-through text-neutral-400 font-normal'
                            : 'text-neutral-100'
                        }`}
                      >
                        {item.name} - {item.places} {item.places === 1 ? 'lugar' : 'lugares'}
                      </span>

                      {/* Tempo de espera */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {!item.completed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Espera: {getWaitingTime(item)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-normal text-neutral-500">
                            <Clock className="w-2.5 h-2.5 text-neutral-500" />
                            <span>Atendido</span>
                          </span>
                        )}
                      </div>
                    </div>
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
