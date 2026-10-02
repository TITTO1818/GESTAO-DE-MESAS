import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#141414] border border-neutral-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-500 mb-3">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-950/50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
