import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, WifiOff, Cloud, CheckCircle2 } from 'lucide-react';
import { ElCardalLogo } from './ElCardalLogo.tsx';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRequestReset: () => void;
  occupiedCount: number;
  isConnected: boolean;
  onOpenWaitlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onRequestReset,
  occupiedCount,
  isConnected,
  onOpenWaitlist,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full flex flex-col items-center pt-2 pb-1 px-3">
      {/* Top operational bar - Waitlist button prominently positioned at the very top */}
      <div className="w-full max-w-6xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 text-xs text-neutral-400 mb-2">
        {/* Left: Real-time Status Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 font-bold text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>AO VIVO</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold text-xs">
              <WifiOff className="w-3.5 h-3.5 animate-spin" />
              <span>Conectando...</span>
            </div>
          )}

          {/* Cloud sync indicator */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Nuvem</span>
          </div>

          {currentTime && (
            <span className="text-neutral-400 font-mono hidden md:inline text-xs">
              • {currentTime}
            </span>
          )}
        </div>

        {/* Center: High-contrast Fila de Espera Button at the top of the screen */}
        <div className="order-last sm:order-none w-full sm:w-auto flex justify-center">
          <button
            type="button"
            onClick={onOpenWaitlist}
            title="Abrir Fila de Espera"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-sm sm:text-base shadow-[0_0_20px_rgba(37,99,235,0.65)] hover:scale-102 active:scale-98 transition-all cursor-pointer border-2 border-blue-400"
          >
            <CheckCircle2 className="w-5 h-5 text-white stroke-[2.8]" />
            <span className="tracking-wide uppercase font-black">Fila de Espera</span>
          </button>
        </div>

        {/* Right: Sound & Reset controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar som' : 'Ativar som de toque'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer text-xs"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-orange-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <span className="hidden sm:inline font-medium">{soundEnabled ? 'Som' : 'Mudo'}</span>
          </button>

          {/* Quick reset button */}
          <button
            type="button"
            onClick={onRequestReset}
            disabled={occupiedCount === 0}
            title="Liberar todas as mesas ocupadas"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Liberar Todas</span>
          </button>
        </div>
      </div>

      {/* Restaurant Logo & Brand - Compact */}
      <div className="my-0.5 flex flex-col items-center">
        <ElCardalLogo size="sm" showText={true} />
      </div>

      {/* Section Sub-heading: GESTÃO DE MESAS */}
      <div className="mt-0.5 mb-1 text-center">
        <h1 className="title-fogo text-xl sm:text-2xl font-black uppercase tracking-[2px] text-center select-none">
          GESTÃO DE MESAS
        </h1>
      </div>
    </header>
  );
};
