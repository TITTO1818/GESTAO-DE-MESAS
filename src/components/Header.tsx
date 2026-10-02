import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, QrCode, WifiOff, Cloud } from 'lucide-react';
import { ElCardalLogo } from './ElCardalLogo.tsx';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRequestReset: () => void;
  occupiedCount: number;
  isConnected: boolean;
  connectedClients: number;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onRequestReset,
  occupiedCount,
  isConnected,
  connectedClients,
  onOpenShareModal,
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
    <header className="w-full flex flex-col items-center pt-5 pb-3 px-4">
      {/* Top operational bar */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 mb-3">
        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-bold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>AO VIVO</span>
              <span className="text-emerald-400/80 font-normal">
                ({connectedClients} {connectedClients === 1 ? 'dispositivo' : 'dispositivos'})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold">
              <WifiOff className="w-3.5 h-3.5 animate-spin" />
              <span>Conectando...</span>
            </div>
          )}

          {/* Cloud sync indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300">
            <Cloud className="w-3.5 h-3.5 text-orange-400" />
            <span>Firestore Nuvem</span>
          </div>

          {currentTime && (
            <span className="text-neutral-400 font-mono hidden md:inline">
              • {currentTime}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Share / QR Code button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            title="Conectar outro celular via QR Code ou Link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-900/60 border border-orange-700/50 text-orange-200 transition-colors cursor-pointer font-semibold shadow-xs"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Conectar Celular</span>
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar som' : 'Ativar som de toque'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Som</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-neutral-500" />
                <span className="hidden sm:inline">Mudo</span>
              </>
            )}
          </button>

          {/* Quick reset button */}
          <button
            type="button"
            onClick={onRequestReset}
            disabled={occupiedCount === 0}
            title="Liberar todas as mesas ocupadas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Liberar Todas</span>
          </button>
        </div>
      </div>

      {/* Restaurant Logo & Brand */}
      <div className="my-2 flex flex-col items-center">
        <ElCardalLogo size="md" showText={true} />
      </div>

      {/* Section Sub-heading: GESTÃO DE MESAS */}
      <div className="mt-3 mb-1 text-center">
        <div className="inline-block px-4 py-1 rounded-full bg-orange-950/40 border border-orange-600/30 backdrop-blur-xs mb-1">
          <span className="text-[10px] sm:text-xs font-black tracking-[2px] uppercase text-orange-400">
            Painel Operacional em Tempo Real
          </span>
        </div>
        <h1 className="title-fogo text-2xl sm:text-4xl font-black uppercase tracking-[3px] text-center select-none">
          GESTÃO DE MESAS
        </h1>
      </div>
    </header>
  );
};
